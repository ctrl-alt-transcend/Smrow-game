import {
  type GameBoard,
  type GameBoardGraph,
  Buildings,
  classicLayout,
  Faction,
  FACTION_COLORS,
} from '@shared/game/gameboard.types';
import type {
  GameData,
  GameDataDto,
  Player,
  GameResponse,
  BuildRequestPayload,
} from '@shared/game/game.types';
import {
  isBuildRequestPayload,
  updateValue,
  funnyLogs,
  printAllPlayers,
  //printPlayer,
} from './game.utils';
import { buildCheck } from './calculation/buildCheck';
import { createGameBoard } from './calculation/createGameBoard';
import { ressoucesCheck } from './calculation/ressourcesCheck';

/**
 * STATE DESIGN PATTERN
 */

/**
 * The Context defines the interface of interest to clients. It also maintains a
 * reference to an instance of a State subclass, which represents the current
 * state of the Context.
 */
class GameStateContext {
  /** @type {State} A reference to the current state of the Context. */
  private state!: State;
  protected data!: GameData;
  protected graph!: GameBoardGraph;
  protected buildings: Buildings = new Map();
  private factionSwitch: number = 0;

  constructor(gameId: string, state: State) {
    const { board, graph } = createGameBoard(classicLayout);
    this.graph = graph;
    this.data = {
      players: new Map<string, Player>(),
      startingRolls: new Map<string, number | null>(),
      turnCount: 0,
      turnOrder: [],
      currentTurnIndex: 0,
      gameId: gameId,
      masterLog: '...',
      diceRoll: 0,
      board: board,
    };
    this.initGameData(); //⚠️ FOR TESTING WITH MOCKED VALUE
    this.initStartingRolls();
    this.transitionTo(state);
  }

  /**
   * TODO
   * assignFaction();
   * Watchout for client disconnection! Must handle that properly later!
   */
  private assignFaction(): Faction {
    switch (this.factionSwitch++) {
      case 0:
        return Faction.BOURSES_BLEUES;
      case 1:
        return Faction.POURPRES_CHYBRES;
      case 2:
        return Faction.ROSES_FIACS;
      case 3:
        return Faction.UREE_JAUNE;
      default:
        return Faction.DEFAULT;
    }
  }

  public initPlayer(playerId: string): Player {
    const newPlayer = {
      playerId: playerId,
      score: 0,
      firstDice: 0,
      secondDice: 0,
      totalDice: 0,
      settlementsBuilt: 0,
      roadsBuilt: 0,
      level: 1,
      username: playerId,
      avatarURL: null,
      faction: this.assignFaction(),
      ressources: {
        wood: 0,
        brick: 0,
        hay: 0,
        sheep: 0,
        rock: 0,
      },
    };
    return newPlayer;
  }

  protected initGameData() {
    //⚠️ FOR TESTING //TEST: REMOVE THIS IN PROD
    this.data.players.set('spagg', this.initPlayer('spagg'));
    this.data.players.set('enriquest', this.initPlayer('enriquest'));
  }

  private initStartingRolls(): void {
    this.data.startingRolls.clear();
    for (const playerId of this.data.players.keys()) {
      this.data.startingRolls.set(playerId, null);
    }
  }

  /** The Context allows changing the State object at runtime. */
  public transitionTo(newState: State): void {
    // console.log(
    //   `➡️ GamePhase: transition to ${(<any>newState).constructor.name}.`,
    // );
    this.state = newState;
    this.state.setGameState(this);
  }

  public diceRequest(playerId: string | null): GameResponse {
    return this.state.dice(playerId);
  }

  public buildRequest(
    playerId: string | null,
    payload: BuildRequestPayload | null,
  ): GameResponse {
    return this.state.build(playerId, payload);
  }

  public skipRequest(playerId: string | null): GameResponse {
    return this.state.skip(playerId);
  }

  public phaseCheckRequest() {
    return this.state.phaseCheck();
  }

  /** Getters */
  public getGameData(): GameData {
    return this.data;
  }
  public getBoard(): GameBoard {
    return this.data.board;
  }
  public getGraph(): GameBoardGraph {
    return this.graph;
  }
  public getBuildings(): Buildings {
    return this.buildings;
  }
  public getGameId(): string {
    return this.data.gameId;
  }
  public getPlayers(): Map<string, Player> {
    return this.data.players;
  }
  public getStartingRolls(): Map<string, number | null> {
    return this.data.startingRolls;
  }
  public getTurnCount(): number {
    return this.data.turnCount;
  }
  public getCurrentTurnIndex(): number {
    return this.data.currentTurnIndex;
  }

  public getCurrentPlayer(): Player | undefined {
    return this.data.players.get(
      this.data.turnOrder[this.data.currentTurnIndex],
    );
  }

  public getPlayerById(playerId: string): Player | undefined {
    return this.data.players.get(playerId);
  }

  public hasRolledBothDices(p: Player): boolean {
    if (p.firstDice !== 0 && p.secondDice !== 0) {
      return true;
    }
    return false;
  }

  public getGameDataDto(): GameDataDto {
    const gameData = this.getGameData();
    return {
      players: Array.from(gameData.players.values()),
      gameId: gameData.gameId,
      diceRoll: gameData.diceRoll,
      masterLog: gameData.masterLog,
      board: gameData.board,
    };
  }

  public getFactionColor(playerId: string): string {
    const player = this.getPlayerById(playerId);
    if (!player) {
      throw new Error(`getFactionColor: Unknown playerId: ${playerId}`);
    }
    return FACTION_COLORS[player.faction];
  }

  public isPlayersTurn(playerId: string): Player | null {
    const player = this.getPlayerById(playerId);
    if (!player) {
      throw new Error(`Unknown playerId: ${playerId}`);
    }
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      return null;
    }
    if (player.playerId !== currentPlayer.playerId) {
      return null;
    }
    return player;
  }

  /** Setters */
  public setDiceRoll(roll: number | null) {
    this.data.diceRoll = roll;
  }
  public setMasterLog(log: string | null) {
    this.data.masterLog = log;
  }
  public setTurnOrder(newTurnOrder: string[]) {
    this.data.turnOrder = newTurnOrder;
  }
  public resetDices(p: Player) {
    p.firstDice = 0;
    p.secondDice = 0;
    p.totalDice = 0;
  }

  public resetAllDices() {
    this.data.players.forEach((player) => {
      this.resetDices(player);
    });
  }

  public setTurnCount(count: number | undefined) {
    this.data.turnCount = updateValue(
      this.data.turnCount,
      this.data.players.size + 1,
      count,
    );
  }

  public setCurrentTurnIndex(index: number | undefined) {
    this.data.currentTurnIndex = updateValue(
      this.data.currentTurnIndex,
      this.data.players.size,
      index,
    );
  }

  /** Methods */
  public rollDice(p: Player): GameResponse {
    let value: number | null = Math.floor(Math.random() * 6) + 1;
    let message: string | null = null;

    if (p.firstDice === 0) {
      p.firstDice = value;
    } else if (p.secondDice === 0) {
      p.secondDice = value;
      p.totalDice = p.secondDice + p.firstDice;
    } else {
      value = null;
      message = `rollDice: you (${p.playerId}) already rolled both dices.`;
    }
    return { value, message, data: null };
  }
}

/**
 * The base State class declares methods that all Concrete State should
 * implement and also provides a backreference to the Context object, associated
 * with the State. This backreference can be used by States to transition the
 * Context to another State.
 */
abstract class State {
  protected state!: GameStateContext;

  public setGameState(newGameState: GameStateContext) {
    this.state = newGameState;
  }
  public abstract dice(playerId: string | null): GameResponse;
  public abstract skip(playerId: string | null): GameResponse;
  public abstract build(
    playerId: string | null,
    payload: BuildRequestPayload | null,
  ): GameResponse;
  public abstract phaseCheck(): void;
}

class WhoStartsPhase extends State {
  public dice(playerId: string): GameResponse {
    //console.log(
    //  `🏁🎲WhoStartsPhase:dice: handles diceRequest from ${playerId}`,
    //);
    const p = this.state.getPlayerById(playerId);
    if (p === undefined) {
      throw new Error(`Unknown playerId: ${playerId}`);
    }
    const roll: GameResponse = this.state.rollDice(p);
    if (this.state.hasRolledBothDices(p) && roll.value) {
      console.log(
        `🏁🎲WhoStartsPhase:dice: ${p.playerId} rolled both dices and got a total of ${p.firstDice + p.secondDice}`,
      );
      this.state.getStartingRolls().set(playerId, p.firstDice + p.secondDice);
      this.state.setCurrentTurnIndex(undefined);
      return {
        value: null,
        message: funnyLogs(p.playerId, p.firstDice + p.secondDice),
        data: null,
      };
    }
    return { value: roll.value, message: roll.message, data: null };
  }

  public build(): GameResponse {
    //console.log('🏁🔨WhoStartsPhase:build: handles buildRequest.');
    return {
      value: null,
      message: `🏁🔨WhoStartsPhase:build: action forbidden during this phase.`,
      data: null,
    };
  }

  public skip(): GameResponse {
    //console.log('🏁⏭️WhoStartsPhase:skip: handles skipRequest.');
    return {
      value: null,
      message: `🏁⏭️WhoStartsPhase:skip: action forbidden during this phase.`,
      data: null,
    };
  }

  public computeTurnOrder() {
    const rolls = this.state.getStartingRolls();
    const size: number = this.state.getPlayers().size;
    if (rolls.size !== size) {
      throw new Error(` Waiting for ${size - rolls.size} player(s) to roll`);
    }

    const entries = Array.from(rolls.entries());
    const pending = entries.filter(([, value]) => value === null);
    if (pending.length > 0) {
      throw new Error(
        ` Players who haven't rolled: ${pending.map(([id]) => id).join(', ')}`,
      );
    }
    entries.sort(([, a], [, b]) => (b as number) - (a as number));
    this.state.setTurnOrder(entries.map(([playerId]) => playerId));
  }

  public phaseCheck(): void {
    try {
      this.computeTurnOrder();
    } catch (error) {
      console.log('🏁🔎WhoStartsPhase:phaseCheck: ' + error);
      return;
    }
    this.state.resetAllDices();
    const p = this.state.getCurrentPlayer();
    if (p) {
      console.log(
        `🏁🔎WhoStartsPhase:phaseCheck: everybody is ready and ${p.playerId} is starting!`,
      );
    }
    this.state.transitionTo(new PlacementPhase());
  }
}

class PlacementPhase extends State {
  private settlementBuilt: boolean = false;

  public dice(): GameResponse {
    //console.log('🗺️🎲PlacementPhase:dice: handles diceRequest.');
    return {
      value: null,
      message: `🗺️🎲PlacementPhase:dice: action forbidden during this phase.`,
      data: null,
    };
  }

  public build(playerId: string, payload: BuildRequestPayload): GameResponse {
    //console.log(
    //  `🗺️🔨PlacementPhasee:build: handles buildRequest from ${playerId}`,
    //);
    if (!isBuildRequestPayload(payload)) {
      console.log(`🗺️🔨PlacementPhasee:build: invalid payload !`);
      return {
        value: null,
        message: '🗺️🔨PlacementPhasee:build: invalid payload !',
        data: null,
      };
    }
    const p = this.state.isPlayersTurn(playerId);
    if (!p) {
      return {
        value: null,
        message: "🗺️🔨PlacementPhasee:build: it's not your turn !",
        data: null,
      };
    }
    if (payload.kind == 'settlement' && this.settlementBuilt) {
      return {
        value: null,
        message:
          '🗺️🔨PlacementPhasee:build: first settlement already built... place a road now...',
        data: null,
      };
    }
    const response = buildCheck(
      payload,
      p,
      this.state.getBoard(),
      this.state.getGraph(),
      this.state.getBuildings(),
      true,
    );
    if (response.valid === false) {
      return {
        value: null,
        message: '🗺️🔨PlacementPhasee:build: invalid placement',
        data: null,
      };
    }
    if (payload.kind == 'settlement' && this.settlementBuilt == false) {
      this.settlementBuilt = true;
      return {
        value: null,
        message:
          '🗺️🔨PlacementPhasee:build: you built your first settlement, pick a road now.',
        data: this.state.getGameData(),
      };
    }
    if (p.roadsBuilt !== 1) {
      return {
        value: null,
        message: '🗺️🔨PlacementPhasee:build: you must build a road...',
        data: this.state.getGameData(),
      };
    }
    this.settlementBuilt = false;
    this.state.setTurnCount(undefined);
    this.state.setCurrentTurnIndex(undefined);
    return {
      value: 1,
      message: response.message,
      data: this.state.getGameData(),
    };
  }

  public skip(): GameResponse {
    //console.log('🗺️⏭️PlacementPhase:skip: handles skipRequest.');
    return {
      value: null,
      message: `🗺️⏭️PlacementPhase:skip: action forbidden during this phase.`,
      data: null,
    };
  }

  public phaseCheck(): void {
    if (this.state.getTurnCount() !== this.state.getPlayers().size) {
      //console.log(`🗺️🔎PlacementPhase:phaseCheck: some player didn't't played yet. (turn count: ${this.state.getTurnCount()})`);
      return;
    }
    ressoucesCheck(this.state.getBuildings(), this.state.getGraph(), true);
    printAllPlayers(this.state.getGameData().players); // ⚠️DEBUG: remove in prod
    this.state.setTurnCount(0);
    this.state.setCurrentTurnIndex(0);
    console.log('🗺️🔎PlacementPhase:phaseCheck: everybody is ready!');
    this.state.transitionTo(new RessourcePhase());
  }
}

class RessourcePhase extends State {
  public dice(playerId: string): GameResponse {
    //console.log(
    //  `🪵🎲RessourcePhase:dice: handles diceRequest from ${playerId}`,
    //);
    const p = this.state.isPlayersTurn(playerId);
    if (!p) {
      return { value: null, message: "It's not your turn !", data: null };
    }
    const roll: GameResponse = this.state.rollDice(p);
    if (this.state.hasRolledBothDices(p) && roll.value) {
      console.log(
        `🪵🎲RessourcePhase:dice: ${p.playerId} rolled both dices and got a total of ${p.firstDice + p.secondDice}`,
      );
      this.state.getStartingRolls().set(playerId, p.firstDice + p.secondDice);
      this.state.setCurrentTurnIndex(undefined);
      this.state.setTurnCount(undefined);
      return {
        value: null,
        message: funnyLogs(p.playerId, p.firstDice + p.secondDice),
        data: null,
      };
    }
    return { value: roll.value, message: roll.message, data: null };
  }

  public build(): GameResponse {
    //console.log('🪵🔨RessourcePhase:build: handles buildRequest.');
    return {
      value: null,
      message: `🪵RessourcePhase:build: action forbidden during this phase.`,
      data: null,
    };
  }

  public skip(): GameResponse {
    //console.log('🪵⏭️RessourcePhase:skip: handles skipRequest.');
    return {
      value: null,
      message: `🪵⏭️RessourcePhase:skip: action forbidden during this phase.`,
      data: null,
    };
  }

  public phaseCheck(): void {
    if (this.state.getTurnCount() !== this.state.getPlayers().size) {
      //console.log(`🪵🔎RessourcePhase:phaseCheck: some player didn't't played yet. (turn count: ${this.state.getTurnCount()})`);
      return;
    }
    ressoucesCheck(this.state.getBuildings(), this.state.getGraph());
    printAllPlayers(this.state.getGameData().players); // ⚠️DEBUG: remove in prod
    this.state.setTurnCount(0);
    this.state.setCurrentTurnIndex(0);
    this.state.resetAllDices();
    console.log('🪵🔎RessourcePhase:phaseCheck: everybody is ready!');
    this.state.transitionTo(new TradeAndBuildPhase());
  }
}

class TradeAndBuildPhase extends State {
  public build(playerId: string, payload: BuildRequestPayload): GameResponse {
    //console.log(
    //  `🤝🔨TradeAndBuildPhase:build: handles buildRequest from ${playerId}`,
    //);
    if (!isBuildRequestPayload(payload)) {
      console.log(`🤝🔨TradeAndBuildPhase:build: invalid payload !`);
      return {
        value: null,
        message: '🤝🔨TradeAndBuildPhase:build: invalid payload !',
        data: null,
      };
    }
    const p = this.state.isPlayersTurn(playerId);
    if (!p) {
      return {
        value: null,
        message: "🤝🔨TradeAndBuildPhase:build: It's not your turn !",
        data: null,
      };
    }
    const response = buildCheck(
      payload,
      p,
      this.state.getBoard(),
      this.state.getGraph(),
      this.state.getBuildings(),
    );
    if (response.valid === false) {
      return {
        value: null,
        message: '🤝🔨TradeAndBuildPhase:build: Invalid placement',
        data: null,
      };
    }
    console.log(
      `🤝🔨TradeAndBuildPhase:build: ${playerId} built something ...`,
    );
    this.state.setTurnCount(undefined);
    this.state.setCurrentTurnIndex(undefined);
    return {
      value: 1,
      message: response.message,
      data: this.state.getGameData(),
    };
  }

  public dice(): GameResponse {
    //console.log('🤝🎲TradeAndBuildPhase:dice: handles diceRequest.');
    return {
      value: null,
      message: `🤝🎲TradeAndBuildPhase:dice: action forbidden during this phase.`,
      data: null,
    };
  }

  public skip(playerId: string): GameResponse {
    //console.log('🤝⏭️TradeAndBuildPhase:skip: handles skipRequest.');
    const p = this.state.isPlayersTurn(playerId);
    if (!p) {
      return { value: null, message: "It's not your turn !", data: null };
    }
    this.state.setTurnCount(undefined);
    this.state.setCurrentTurnIndex(undefined);
    console.log(`🤝⏭️TradeAndBuildPhase:skip: ${playerId} skipped his turn !`);
    return {
      value: 1,
      message: `🤝⏭️TradeAndBuildPhase:skip: you skipped your turn`,
      data: null,
    };
  }

  public phaseCheck(): void {
    if (this.state.getTurnCount() !== this.state.getPlayers().size) {
      //console.log(`🤝🔎TradeAndBuildPhase:phaseCheck: some player didn't't played yet. (turn count: ${this.state.getTurnCount()})`);
      return;
    }
    this.state.setTurnCount(0);
    this.state.setCurrentTurnIndex(0);
    console.log('🤝🔎TradeAndBuildPhase:phaseCheck: everybody is ready!');
    this.state.transitionTo(new RessourcePhase());
  }
}

export { GameStateContext, WhoStartsPhase };
