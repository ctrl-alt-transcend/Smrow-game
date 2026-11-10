import {
  type GameBoard,
  type GameBoardGraph,
  Action,
  BuildingsInGame,
  classicLayout,
  Faction,
  FACTION_COLORS,
  Phase,
  POINTS_TO_WIN,
  ROBBER_ROLL,
  SettlementData,
} from '@shared/game/gameboard.types';
import type {
  GameData,
  GameDataDto,
  Player,
  GameResponse,
  BuildRequestPayload,
  TradeRequestPayload,
  PlayerDto,
} from '@shared/game/game.types';
import {
  isBuildRequestPayload,
  isTradeRequestPayload,
  updateValue,
  funnyLogs,
  //printAllPlayers,
  //printPlayer,
} from './game.utils';
import { buildCheck } from './calculation/handleBuilds';
import { createGameBoard } from './calculation/createGameBoard';
import { resourcesProduction } from './calculation/handleResources';
import { tradeCheck } from './calculation/handleTrade';
import { NotFoundException } from '@nestjs/common';
import { robberRule } from './calculation/handleGameRules';

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
  protected buildings: BuildingsInGame = new Map();
  private logId: number = 0;
  private factionSwitch: number = 0;

  constructor(gameId: string, state: State) {
    const { board, graph } = createGameBoard(classicLayout);
    this.graph = graph;
    this.data = {
      players: new Map<string, Player>(),
      startingRolls: new Map<string, number | null>(),
      winner: null,
      winCondition: null,
      turnCount: 0,
      turnOrder: [],
      currentTurnIndex: 0,
      gameId: gameId,
      masterLog: `${Phase.START}: roll the dices`,
      dicesSum: 0,
      currentRoll: 0,
      board: board,
      whosTurn: ''
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
    const newPlayer: Player = {
      playerId: playerId,
      //victoryPoints: 0,
      victoryPoints: 6, //⚠️ For testing only
      firstDice: 0,
      secondDice: 0,
      totalDice: 0,
      settlementsBuilt: new Map<string, SettlementData>(),
      roadsBuilt: 0,
      level: 1, //⚠️ For testing only
      username: playerId,
      avatarURL: null,
      faction: this.assignFaction(),
      personalLog: {id: this.logId++, message: `Welcome to the game ${playerId}`},
      guideLog: '',
      // BONUS Resources FOR DEV
      resources: { //⚠️ For testing only
        wood: 10, //⚠️ For testing only
        brick: 10, //⚠️ For testing only
        wheat: 10, //⚠️ For testing only
        sheep: 10, //⚠️ For testing only
        ore: 10, //⚠️ For testing only
      },
      //Resources: {
      //  wood: 0,
      //  brick: 0,
      //  wheat: 0,
      //  sheep: 0,
      //  ore: 0,
      //},
    };
    return newPlayer;
  }

  protected initGameData() {
    //⚠️ FOR TESTING //TEST: REMOVE THIS IN PROD
    //this.data.players.set('spagg', this.initPlayer('spagg'));
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

  public diceRequest(
    playerId: string
  ): GameResponse {
    return this.state.dice(playerId);
  }

  public tradeRequest(
    playerId: string,
    payload: TradeRequestPayload | null,
  ) {
    return this.state.trade(playerId, payload);
  }

  public buildRequest(
    playerId: string,
    payload: BuildRequestPayload | null,
  ) {
    this.state.build(playerId, payload);
  }

  public skipRequest (
    playerId: string
  ) {
    this.state.skip(playerId);
  }

  public phaseCheckRequest(): void {
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
  public getBuildings(): BuildingsInGame {
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
  public getMasterLog(): string {
    return this.data.masterLog;
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

  public getPlayerDto(p: Player): PlayerDto {
    return {
      playerId: p.playerId,
      victoryPoints: p.victoryPoints,
      firstDice: p.firstDice,
      secondDice: p.secondDice,
      totalDice: p.totalDice,
      roadsBuilt: p.roadsBuilt,
      level: p.level,
      username: p.username,
      avatarURL: p.avatarURL,
      faction: p.faction,
      personalLog: p.personalLog,
      guideLog: p.guideLog,
      resources: p.resources,
    };
  }

  public getGameDataDto(playerId: string): GameDataDto {
    const gameData = this.getGameData();

    const p = this.getPlayerById(playerId);
    if (!p) {
      throw new NotFoundException (`Unknown playerId: ${playerId}`);
    }
    console.log(`getGameDataDto:whosTurn:${gameData.whosTurn}`)
    return {
      currentPlayer: this.getPlayerDto(p),
      winner: gameData.winner,
      winCondition: gameData.winCondition,
      players: Array.from(gameData.players.values()),
      gameId: gameData.gameId,
      dicesSum: gameData.dicesSum,
      currentRoll: gameData.currentRoll,
      masterLog: gameData.masterLog,
      board: gameData.board,
      whosTurn: gameData.whosTurn,
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
      this.setPersonalLog(player, "It's not you turn !")
      return null;
    }
    return player;
  }

  /** Setters */
  public setDicesSum(roll: number) {
    this.data.dicesSum = roll;
  }
  public setCurrentRoll(roll: number | null) {
    this.data.currentRoll = roll;
  }
  public setMasterLog(log: string) {
    this.data.masterLog = log;
  }
  public setPersonalLog(p: Player, message: string, action?: boolean ) {
    p.personalLog = {
      id: this.logId++,
      message: message,
    }
  }
  public setGuideLog(p: Player, message: string ) {
    p.guideLog = message;
  }
  public setAllGuideLogs( message: string ) {
    this.getGameData().players.forEach(player => {
      this.setGuideLog(player, message);
    });
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
    this.data.whosTurn =
      this.data.turnOrder.at(this.data.currentTurnIndex) ?? '';
  }

  /** @argument winCondition: explain why the player won  */
  public setVictory(winner: string, winCondition: string) {
    this.data.winner = winner;
    this.data.winCondition = winCondition;
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

  public isVictory(): boolean {
    let endGame: boolean = false;

    this.data.players.forEach(player => {
      if (this.data.players.size === 1) {
        this.setVictory(player.playerId, `is the only player left in game ! You won congrats !`)
        endGame = true;
        return;
      }
      if (player.victoryPoints === POINTS_TO_WIN) {
        this.setVictory(player.playerId, `won by earning ${player.victoryPoints} victory points !`)
        endGame = true;
        return;
      }
    });
    return endGame;
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
  public abstract dice(
    playerId: string
  ): GameResponse;
  public abstract skip(
    playerId: string
  ): void;
  public abstract build(
    playerId: string,
    payload: BuildRequestPayload | null,
  ): void;
  public abstract trade(
    playerId: string,
    payload: TradeRequestPayload | null,
  ): void;
  public abstract phaseCheck(): void;
}

class WhoStartsPhase extends State {
  public dice( playerId: string ): GameResponse {
    console.log(
      `🏁🎲WhoStartsPhase:dice: handles diceRequest from ${playerId}`,
    );
    const p = this.state.getPlayerById(playerId);
    if (p === undefined) {
      throw new Error(`Unknown playerId: ${playerId}`);
    }
    const roll: GameResponse = this.state.rollDice(p);
    if (this.state.hasRolledBothDices(p) && roll.value) {
      this.state.setPersonalLog(p,
        `You rolled both dices and got a total of ${p.firstDice + p.secondDice}`)
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

  public build( playerId: string ) {
    console.log(`🏁🔨WhoStartsPhase:build: handles buildRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (p) {
       this.state.setPersonalLog(p,
        `You can't ${Action.BUILD} during ${Phase.START}`)
    }
  }

  public trade( playerId: string ) {
    console.log(`🏁⚖️WhoStartsPhase:trade: handles tradeRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (p) {
       this.state.setPersonalLog(p,
        `You can't ${Action.TRADE} during ${Phase.START}`)
    }
  }

  public skip( playerId: string ) {
    console.log(`🏁⏭️WhoStartsPhase:trade: handles skipRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (p) {
       this.state.setPersonalLog(p,
        `You can't ${Action.SKIP} during ${Phase.START}`)
    }
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
      return;
    }
    this.state.resetAllDices();
    this.state.setTurnCount(0);
    this.state.setCurrentTurnIndex(0);
    this.state.setMasterLog(
      `${Phase.PLACEMENT}: ${this.state.getCurrentPlayer()?.playerId} is playing ...`)
    this.state.setAllGuideLogs(`${Phase.PLACEMENT}: place a settlement first and then a road`);
    this.state.transitionTo(new PlacementPhase());
  }
}

class PlacementPhase extends State {
  private settlementBuilt: boolean = false;

  public dice( playerId: string ): GameResponse {
    console.log(`🗺️🎲PlacementPhase:dice: handles diceRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (p) {
       this.state.setPersonalLog(p,
        `You can't ${Action.DICE} during ${Phase.PLACEMENT}`)
    }
    return {
      value: null,
      message: `🗺️🎲PlacementPhase:dice: action forbidden during this phase.`,
      data: null,
    };
  }

  public build( playerId: string, payload: BuildRequestPayload ) {
    console.log(
      `🗺️🔨PlacementPhasee:build: handles buildRequest from ${playerId}`,
    );
    if (!isBuildRequestPayload(payload)) {
      console.log(`🗺️🔨PlacementPhasee:build: invalid payload !`);
      return;
    }
    const p = this.state.isPlayersTurn(playerId);
    if (!p) return;
    if (payload.kind === 'settlement' && this.settlementBuilt) {
      this.state.setPersonalLog(p,
        'You already built a settlement, build a road now ...')
      return;
    } else if (payload.kind === 'road' && !this.settlementBuilt) {
      this.state.setPersonalLog(p,
        'You must build a settlement first ...')
      return;
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
      this.state.setPersonalLog(p, `${response.message}`)
      return;
    }
    if (payload.kind == 'settlement' && this.settlementBuilt == false) {
      this.settlementBuilt = true;
      this.state.setPersonalLog(p,
        'You built your first settlement, pick a road now.');
      return;
    }
    console.log(
      `🗺️🔨PlacementPhasee:build: ${playerId} built his/her first settlement and road !`,
    );
    this.settlementBuilt = false;
    this.state.setTurnCount(undefined);
    this.state.setCurrentTurnIndex(undefined);
    this.state.setMasterLog(
      `${Phase.PLACEMENT}: ${this.state.getCurrentPlayer()?.playerId} is playing ...`)
    this.state.setPersonalLog(p,
      'You finshied your placement, wait for the other players to play ...');
  }

  public trade( playerId: string ) {
    console.log(`🗺️⚖️PlacementPhase:trade: handles tradeRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (p) {
       this.state.setPersonalLog(p,
        `You can't ${Action.TRADE} during ${Phase.PLACEMENT}`)
    }
  }

  public skip( playerId: string ) {
    console.log(`🗺️⏭️PlacementPhase:skip: handles skipRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (p) {
       this.state.setPersonalLog(p,
        `You can't ${Action.SKIP} during ${Phase.PLACEMENT}`)
    }
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
    resourcesProduction(this.state.getBuildings(), this.state.getGraph(), this.state.getGameData().dicesSum, true);
    //printAllPlayers(this.state.getGameData().players); // ⚠️DEBUG: remove in prod
    this.state.setTurnCount(0);
    this.state.setCurrentTurnIndex(0);
    //this.state.setMasterLog(`The ${Phase.PLACEMENT} is done, let's move to the ${Phase.RESOURCES} !`)
    this.state.setMasterLog(`${Phase.RESOURCES}: ${this.state.getCurrentPlayer()?.playerId} is playing ...`)
    this.state.setAllGuideLogs(`${Phase.RESOURCES}: roll the dices to produce resources`);
    this.state.transitionTo(new RessourcePhase());
    console.log('🗺️🔎PlacementPhase:phaseCheck: everybody is ready!');
  }
}

class RessourcePhase extends State {
  public dice( playerId: string ): GameResponse {
    console.log(
      `🪵🎲RessourcePhase:dice: handles diceRequest from ${playerId}`,
    );
    const p = this.state.isPlayersTurn(playerId);
    if (!p) {
      return { value: null, message: "It's not your turn !", data: null };
    }
    const roll: GameResponse = this.state.rollDice(p);
    this.state.setCurrentRoll(roll.value);
    if (this.state.hasRolledBothDices(p) && roll.value) {
      this.state.setDicesSum(p.firstDice + p.secondDice);
      //this.state.setDicesSum(7); //⚠️ For testing 'robberRule' only
      //this.state.setDicesSum(5); //⚠️ For testing 'robberRule' only
      console.log(
        `🪵🎲RessourcePhase:dice: ${p.playerId} rolled both dices and got a total of ${this.state.getGameData().dicesSum}`,
      );
      if (this.state.getGameData().dicesSum == ROBBER_ROLL) {
        robberRule(this.state.getGameData().players, this.state.getGameData().board.layout);
        this.state.setPersonalLog(p,
          "You'll earn nothing this turn because you've just got robbed by Robert !");
      } else {
        resourcesProduction(this.state.getBuildings(),
          this.state.getGraph(), this.state.getGameData().dicesSum, false );
        this.state.setPersonalLog(p,
          `You rolled both dices and got a total of ${this.state.getGameData().dicesSum}`);
      }
      this.state.setCurrentTurnIndex(undefined);
      this.state.setTurnCount(undefined);
      this.state.setMasterLog(
        `It's the ${Phase.RESOURCES} now and ${this.state.getCurrentPlayer()?.playerId} is playing ...`)
      return {
        value: null,
        message: funnyLogs(p.playerId, p.firstDice + p.secondDice),
        data: null,
      };
    }
    return { value: roll.value, message: roll.message, data: null };
  }

  public build( playerId: string ) {
    console.log(`🪵🔨RessourcePhase:build: handles buildRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (p) {
      this.state.setPersonalLog(p,
        `You can't ${Action.BUILD} during ${Phase.RESOURCES}`)
    }
  }

   public trade( playerId: string ) {
    console.log(`🪵⚖️RessourcePhase:trade: handles tradeRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (p) {
      this.state.setPersonalLog(p,
        `You can't ${Action.TRADE} during ${Phase.RESOURCES}`)
    }
  }

  public skip( playerId: string ) {
    console.log(`🪵⏭️RessourcePhase:skip: handles skipRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (p) {
      this.state.setPersonalLog(p,
        `You can't ${Action.SKIP} during ${Phase.RESOURCES}`)
    }
  }

  public phaseCheck(): void {
    if (this.state.getTurnCount() !== this.state.getPlayers().size) {
      //console.log(`🪵🔎RessourcePhase:phaseCheck: some player didn't't played yet. (turn count: ${this.state.getTurnCount()})`);
      return;
    }
    //printAllPlayers(this.state.getGameData().players); // ⚠️DEBUG: remove in prod
    this.state.setTurnCount(0);
    this.state.setCurrentTurnIndex(0);
    this.state.resetAllDices();
    this.state.setMasterLog(
      `${Phase.TRADE_BUILD}: ${this.state.getCurrentPlayer()?.playerId} is playing ...`)
    this.state.setAllGuideLogs(`${Phase.TRADE_BUILD}: trade, build, upgrade or skip your turn`);
    this.state.transitionTo(new TradeAndBuildPhase());
    console.log('🪵🔎RessourcePhase:phaseCheck: everybody is ready!');
  }
}

class TradeAndBuildPhase extends State {
  public build( playerId: string, payload: BuildRequestPayload ) {
    console.log(
      `🤝🔨TradeAndBuildPhase:build: handles buildRequest from ${playerId}`,
    );
    if (!isBuildRequestPayload(payload)) {
      console.log(`🤝🔨TradeAndBuildPhase:build: invalid payload !`);
      return;
    }
    const p = this.state.isPlayersTurn(playerId);
    if (!p) return;
    const response = buildCheck(
      payload,
      p,
      this.state.getBoard(),
      this.state.getGraph(),
      this.state.getBuildings(),
    );
    this.state.setPersonalLog(p, `${response.message}`);
    if (response.valid === false) return;
    console.log(
      `🤝🔨TradeAndBuildPhase:build: ${playerId} built something ...`,
    );
    this.state.setTurnCount(undefined);
    this.state.setCurrentTurnIndex(undefined);
    this.state.setMasterLog(`${playerId} built something ..`)
  }

  public trade( playerId: string, payload: TradeRequestPayload ) {
    console.log(`🤝⚖️TradeAndBuildPhase:trade: handles tradeRequest from ${playerId}`);
    //if (!isTradeRequestPayload(payload)) {
    //  console.log(`🤝🔨TradeAndBuildPhase:trade: invalid payload !`);
    //  return {
    //    value: null,
    //    message: '🤝🔨TradeAndBuildPhase:trade: invalid payload !',
    //    data: null,
    //  };
    //}
    const p = this.state.isPlayersTurn(playerId);
    if (!p) return;
    const response = tradeCheck(payload, p, this.state.getGraph());
    this.state.setPersonalLog(p,`${response.message}`)
    if (response.valid === false) return;
    console.log(
      `🤝⚖️TradeAndBuildPhase:trade: ${playerId} traded something ...`,
    );
    this.state.setTurnCount(undefined);
    this.state.setCurrentTurnIndex(undefined);
    this.state.setMasterLog(`${playerId} traded something with a ${payload.trader} ...`)
  }

  public dice( playerId: string ): GameResponse {
    console.log(`🤝🎲TradeAndBuildPhase:dice: handles diceRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (p) {
      this.state.setPersonalLog(p,
        `You can't ${Action.DICE} during ${Phase.TRADE_BUILD}`)
    }
    return {
      value: null,
      message: `🤝🎲TradeAndBuildPhase:dice: action forbidden during this phase.`,
      data: null,
    };
  }

  public skip( playerId: string ) {
    console.log(`🤝⏭️TradeAndBuildPhase:skip: handles skipRequest from ${playerId}`);
    const p = this.state.isPlayersTurn(playerId);
    if (!p) return;
    this.state.setTurnCount(undefined);
    this.state.setCurrentTurnIndex(undefined);
    this.state.setPersonalLog(p, `You skipped your turn !`);
    this.state.setMasterLog(`${playerId} skipped his/her turn !`);
    console.log(`🤝⏭️TradeAndBuildPhase:skip: ${playerId} skipped his turn !`);
  }

  public phaseCheck(): void {
    if (this.state.isVictory()) {
      console.log(`🤝🔎TradeAndBuildPhase:phaseCheck: ${this.state.getGameData().winner} won the game !`);
      return;
    }
    if (this.state.getTurnCount() !== this.state.getPlayers().size) {
      //console.log(`🤝🔎TradeAndBuildPhase:phaseCheck: some player didn't't played yet. (turn count: ${this.state.getTurnCount()})`);
      return;
    }
    this.state.setTurnCount(0);
    this.state.setCurrentTurnIndex(0);
    console.log('🤝🔎TradeAndBuildPhase:phaseCheck: everybody is ready!');
    this.state.setMasterLog(`${Phase.RESOURCES}: ${this.state.getCurrentPlayer()?.playerId} is playing ...`)
    this.state.setAllGuideLogs(`${Phase.RESOURCES}: roll the dices to produce resources`);
    this.state.transitionTo(new RessourcePhase());
  }
}

export { GameStateContext, WhoStartsPhase };
