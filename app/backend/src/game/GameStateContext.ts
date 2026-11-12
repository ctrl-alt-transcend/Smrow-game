import {
  type GameBoard,
  type GameBoardGraph,
  BuildingsInGame,
  Faction,
  Action,
  Phase,
  LandType,
  RessourceType,
  classicLayout,
  POINTS_TO_WIN,
  SettlementData,
  ROBBER_ROLL,
  FACTION_COLORS,
  GUIDE_LOG,
  LAND_RESSOURCE,
  TRADE_LIMIT_DFLT,
  BUILD_LIMIT_DFLT,
} from '@shared/game/gameboard.types';
import type {
  GameData,
  GameDataDto,
  Player,
  BuildRequestPayload,
  TradeRequestPayload,
  PlayerDto,
  SettingsData,
} from '@shared/game/game.types';
import {
  updateValue,
  funnyRollLog,
} from './game.utils';
import { buildCheck } from './calculation/handleBuilds';
import { createGameBoard } from './calculation/createGameBoard';
import { tradeCheck } from './calculation/handleTrade';
import { NotFoundException } from '@nestjs/common';
import { produceResources } from './calculation/handleResources';
import { randomizeRobber } from './calculation/randomizeGameBoard';

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
  public abstract dice( playerId: string ): void;
  public abstract skip( playerId: string ): void;
  public abstract phaseCheck( ): void;
  public abstract build(
    playerId: string,
    payload: BuildRequestPayload | null,
  ): void;
  public abstract trade(
    playerId: string,
    payload: TradeRequestPayload | null,
  ): void;
}

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
  protected settings!: SettingsData;
  protected buildings: BuildingsInGame = new Map();
  private logId: number = 0;
  private factionSwitch: number = 0;

  constructor(gameId: string, state: State) {
    const { board, graph } = createGameBoard(classicLayout);
    this.graph = graph;
    this.data = {
      players: new Map<string, Player>(),
      startingRolls: new Map<string, number>(),
      winner: null,
      winCondition: null,
      turnCount: 0,
      turnOrder: [],
      gameId: gameId,
      masterLog: `${Phase.START}: roll the dices`,
      dicesSum: 0,
      board: board,
      currentTurnIndex: 0,
      currentPhase: Phase.START,
      whosTurn: '',
    };
    this.settings = {
      tradeLimit: TRADE_LIMIT_DFLT,
      buildLimit: BUILD_LIMIT_DFLT,
    };
    // TODO
    /**
     * this.stats {
     *  victoryPointsEarned: X
     *  roadsBuilt: X
     *  dicesRolled: ...
     *  ...
     * }
     */
    this.initGameData(); //⚠️ FOR TESTING WITH MOCKED VALUE
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
      guideLog: `${GUIDE_LOG[Phase.START]}`,
      currentRoll: null,
      // BONUS Resources FOR DEV
      resources: { //⚠️ For testing only
        wood: 10, //⚠️ For testing only
        brick: 10, //⚠️ For testing only
        wheat: 10, //⚠️ For testing only
        sheep: 10, //⚠️ For testing only
        ore: 10, //⚠️ For testing only
      },
      DEVMOD: false,
      //Resources: {
      //  wood: 0,
      //  brick: 0,
      //  wheat: 0,
      //  sheep: 0,
      //  ore: 0,
      //},
    };
    if (playerId == 'zuck') newPlayer.DEVMOD = true;
    return newPlayer;
  }

  protected initGameData() {
    //⚠️ FOR TESTING //TEST: REMOVE THIS IN PROD
    //this.data.players.set('spagg', this.initPlayer('spagg'));
    this.data.players.set('enriquest', this.initPlayer('enriquest'));
  }

  /** The Context allows changing the State object at runtime. */
  public transitionTo(newState: State): void {
    this.state = newState;
    this.state.setGameState(this);
  }

  public diceRequest( playerId: string ) {
    return this.state.dice(playerId);
  }
  public skipRequest ( playerId: string ) {
    this.state.skip(playerId);
  }
  public phaseCheckRequest(): void {
    return this.state.phaseCheck();
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
  public getStartingRolls(): Map<string, number> {
    return this.data.startingRolls;
  }
  public getTurnOrder(): Array<string> {
    return this.data.turnOrder;
  }
  public getSettings(): SettingsData {
    return this.settings;
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
  public getPlayerById(playerId: string): Player | undefined {
    return this.data.players.get(playerId);
  }
  public getCurrentPlayer(): Player | undefined {
    return this.data.players.get(
      this.data.turnOrder[this.data.currentTurnIndex],
    );
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
      currentRoll: p.currentRoll,
      DEVMOD: p.DEVMOD,
    };
  }
  public getGameDataDto(playerId: string): GameDataDto {
    const gameData = this.getGameData();

    const p = this.getPlayerById(playerId);
    if (!p) {
      throw new NotFoundException (`Unknown playerId: ${playerId}`);
    }
    return {
      currentPlayer: this.getPlayerDto(p),
      winner: gameData.winner,
      winCondition: gameData.winCondition,
      players: Array.from(gameData.players.values()),
      gameId: gameData.gameId,
      dicesSum: gameData.dicesSum,
      masterLog: gameData.masterLog,
      board: gameData.board,
      whosTurn: gameData.whosTurn,
      currentPhase: gameData.currentPhase,
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
  public setMasterLog(log: string) {
    this.data.masterLog = log;
  }
  public setCurrentPhase( phase: Phase ) {
    this.data.currentPhase = phase;
  }
  public setTurnOrder(newTurnOrder: string[]) {
    this.data.turnOrder = newTurnOrder;
  }
  public setGuideLog(p: Player, message: string ) {
    p.guideLog = message;
  }
  public setAllGuideLogs( message: string ) {
    this.getGameData().players.forEach(player => {
      this.setGuideLog(player, message);
    });
  }
  public setPersonalLog(p: Player, message: string) {
    p.personalLog = {
      id: this.logId++,
      message: message,
    }
  }
  public resetAllDices() {
    this.data.players.forEach((player) => {
      this.resetDices(player);
    });
  }
  public resetDices(p: Player) {
    p.firstDice = 0;
    p.secondDice = 0;
    p.totalDice = 0;
  }
  public setTurnCount(count?: number) {
    this.data.turnCount = updateValue(
      this.data.turnCount,
      this.data.players.size + 1,
      count,
    );
  }
  public setCurrentTurnIndex(index?: number) {
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
  /** @description Generates: "You can't ${Action} during ${Phase}" */
  public forbiddenActionLog( action: Action , phase: Phase ): string {
    return `You can't ${action} during ${phase}`;
  }

  public rollDice(p: Player): number | null {
    let value: number | null = Math.floor(Math.random() * 6) + 1;
    if (p.firstDice === 0) {
      p.firstDice = value;
      console.log(`${p.playerId} #1 rolll: ${value}`);
    } else if (p.secondDice === 0) {
      p.secondDice = value;
      console.log(`${p.playerId} #2 rolll: ${value}`);
      p.totalDice = p.secondDice + p.firstDice;
    } else {
      value = null;
    }
    return value;
  }

  public setupNextPhase( nextPhase: Phase ) {
    this.setTurnCount(0);
    this.setCurrentTurnIndex(0);
    this.setCurrentPhase(nextPhase);
    this.setMasterLog(
      `${nextPhase}: ${this.getCurrentPlayer()?.playerId} is playing ...`)
    this.setAllGuideLogs(`${GUIDE_LOG[nextPhase]}`);
    this.resetAllDices();
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

  public resourcesProduction( placementPhase: boolean ) {
    for (const [settlementId, player] of this.buildings) {
      const graphEntry = this.graph.get(settlementId);
      if (!graphEntry) continue;
      graphEntry.adjacentTiles.forEach((tile) => {
        let prod: number = 0;
        if (placementPhase === true)
          prod = produceResources(tile.land, player.resources);
        else if (tile.value === this.data.dicesSum && !tile.hasRobber) {
          const settlement = player.settlementsBuilt.get(settlementId);
          if (settlement)
            prod = produceResources(tile.land, player.resources, settlement.isCity);
        }
        if (prod > 0 && !placementPhase) {
          this.setPersonalLog(player,
            `You produced ${prod} ${LAND_RESSOURCE[tile.land]}`);
          //console.log(`⚖️ressoucesProduction: ${player.playerId} produced ${prod} ${LAND_RESSOURCE[tile.land]}`);
        } else if (tile.hasRobber && !placementPhase) {
          this.setPersonalLog(player,
            `Robert the Robber stole your ${LAND_RESSOURCE[tile.land]} production !`);
          //console.log(`⚖️ressoucesProduction: ${player.playerId} has been stolen by Robert the Robber !`);
        } else if (tile.land == LandType.DESERT) {
          this.setPersonalLog(player,
            `You didn't produce anything with your ${LAND_RESSOURCE[tile.land]} ...`);
          //console.log(`⚖️ressoucesProduction: ${player.playerId} can't produce anything in the ${LandType.DESERT}`);
        } else if (placementPhase) {
          this.setPersonalLog(player,
            `You produced your first resources !`);
        }
      });
    }
  };

  public robberRule( ): void {
    const DISCARD_THRESHOLD = 7;
    this.data.players.forEach((player) => {
      const totalCount = Object.values(player.resources).reduce(
        (sum, count) => sum + count,
        0,
      );
      if (totalCount <= DISCARD_THRESHOLD) return;
      const toDiscard = Math.floor(totalCount / 2);
      // Flatten the player's resources into a list of resource keys,
      // then remove randomly from it.
      const pool: RessourceType[] = [];
      for (const [resource, count] of Object.entries(player.resources)) {
        for (let i = 0; i < count; i++) pool.push(resource as RessourceType);
      }
      for (let i = 0; i < toDiscard; i++) {
        const pickIndex = Math.floor(Math.random() * pool.length);
        const picked = pool.splice(pickIndex, 1)[0];
        if (player.resources[picked] >= 1)
          player.resources[picked] -= 1;
      }
      this.setPersonalLog(player,
        `Robert the Robber robbed you ${toDiscard} resources !`
      )
    });
    randomizeRobber(this.data.board.layout);
  };
}

class WhoStartsPhase extends State {
  public dice( playerId: string ) {
    //console.log(
    //  `🏁🎲WhoStartsPhase:dice: handles diceRequest from ${playerId}`,
    //);
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    p.currentRoll = this.state.rollDice(p);
    if (this.state.hasRolledBothDices(p) && p.currentRoll) {
      this.state.setTurnCount();
      this.state.setPersonalLog(p,
        `You ${funnyRollLog(p.firstDice + p.secondDice)}`)
      this.state.getStartingRolls().set(playerId, p.firstDice + p.secondDice);
    }
  }

  public build( playerId: string ) {
    //console.log(`🏁🔨WhoStartsPhase:build: handles buildRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(p,
      this.state.forbiddenActionLog(Action.BUILD, Phase.START));
  }

  public trade( playerId: string ) {
    //console.log(`🏁⚖️WhoStartsPhase:trade: handles tradeRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(p,
      this.state.forbiddenActionLog(Action.TRADE, Phase.START));
  }

  public skip( playerId: string ) {
    //console.log(`🏁⏭️WhoStartsPhase:trade: handles skipRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(p,
      this.state.forbiddenActionLog(Action.SKIP, Phase.START));
  }

  public computeTurnOrder() {
    const entries = Array.from(this.state.getStartingRolls().entries());
    entries.sort(([, a], [, b]) => b - a);
    this.state.setTurnOrder(entries.map(([playerId]) => playerId));
  }

  public phaseCheck(): void {
    if ((this.state.getTurnCount() !==
      this.state.getPlayers().size) ||
        (this.state.getStartingRolls().size !==
          this.state.getPlayers().size)) return;
    this.computeTurnOrder();
    let i = 0;
    this.state.getTurnOrder().forEach(player => {
      console.log(`Player ${++i}: ${player}`);
    });
    this.state.setupNextPhase(Phase.PLACEMENT);
    this.state.transitionTo(new PlacementPhase());
  }
}

class PlacementPhase extends State {
  private settlementBuilt: boolean = false;

  public dice( playerId: string ) {
    //console.log(`🗺️🎲PlacementPhase:dice: handles diceRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(p,
      this.state.forbiddenActionLog(Action.DICE, Phase.PLACEMENT));
  }

  public build( playerId: string, payload: BuildRequestPayload ) {
    //console.log(
    //  `🗺️🔨PlacementPhase:build: handles buildRequest from ${playerId}`,
    //);
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
    this.settlementBuilt = false;
    this.state.setTurnCount();
    this.state.setCurrentTurnIndex();
    this.state.setMasterLog(
      `${Phase.PLACEMENT}: ${this.state.getCurrentPlayer()?.playerId} is playing ...`)
    this.state.setPersonalLog(p,
      'You finshied your placement, wait for the other players to play ...');
  }

  public trade( playerId: string ) {
    //console.log(`🗺️⚖️PlacementPhase:trade: handles tradeRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(p,
      this.state.forbiddenActionLog(Action.TRADE, Phase.PLACEMENT));
  }

  public skip( playerId: string ) {
    //console.log(`🗺️⏭️PlacementPhase:skip: handles skipRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(p,
      this.state.forbiddenActionLog(Action.SKIP, Phase.PLACEMENT));
  }

  public phaseCheck(): void {
    if (this.state.getTurnCount() !==
      this.state.getPlayers().size) return;
    this.state.resourcesProduction(true);
    this.state.setupNextPhase(Phase.RESOURCES);
    this.state.transitionTo(new RessourcePhase());
    //console.log('🗺️🔎PlacementPhase:phaseCheck: everybody is ready!');
  }
}

class RessourcePhase extends State {
  public dice( playerId: string ) {
    //console.log(
    //  `🪵🎲RessourcePhase:dice: handles diceRequest from ${playerId}`,
    //);
    const p = this.state.isPlayersTurn(playerId);
    if (!p) return;
    p.currentRoll = this.state.rollDice(p);
    if (this.state.hasRolledBothDices(p) && p.currentRoll) {
      this.state.setDicesSum(p.firstDice + p.secondDice);
      console.log(
        `🪵🎲RessourcePhase:dice: ${p.playerId} rolled both dices and got a total of ${this.state.getGameData().dicesSum}`,
      );
      switch (this.state.getGameData().dicesSum) {
        case ROBBER_ROLL:
          this.state.robberRule();
          break;
        default:
          this.state.resourcesProduction(false);
          break;
      }
      this.state.setCurrentTurnIndex();
      this.state.setTurnCount();
      this.state.setMasterLog(
        `${Phase.RESOURCES}: ${this.state.getCurrentPlayer()?.playerId} is playing ...`)
    }
  }

  public build( playerId: string ) {
    //console.log(`🪵🔨RessourcePhase:build: handles buildRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(p,
      this.state.forbiddenActionLog(Action.BUILD, Phase.RESOURCES));
  }

   public trade( playerId: string ) {
    //console.log(`🪵⚖️RessourcePhase:trade: handles tradeRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(p,
      this.state.forbiddenActionLog(Action.TRADE, Phase.RESOURCES));
  }

  public skip( playerId: string ) {
    //console.log(`🪵⏭️RessourcePhase:skip: handles skipRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(p,
      this.state.forbiddenActionLog(Action.SKIP, Phase.RESOURCES));
  }

  public phaseCheck(): void {
    if (this.state.getTurnCount() !==
      this.state.getPlayers().size) return;
    this.state.setupNextPhase(Phase.TRADE_BUILD);
    this.state.transitionTo(new TradeAndBuildPhase());
    //console.log('🪵🔎RessourcePhase:phaseCheck: everybody is ready!');
  }
}

class TradeAndBuildPhase extends State {
  private tradeCount: number = 0;
  private buildCount: number = 0;

  private resetTradeBuildCount() {
    this.tradeCount = 0;
    this.buildCount = 0;
  }

  private isTradeBuildLimit(p: Player): boolean {
    if ((this.tradeCount !== this.state.getSettings().tradeLimit)
      && (this.buildCount !== this.state.getSettings().buildLimit))
      return false;
    if ((this.tradeCount === this.state.getSettings().tradeLimit)
      && (this.buildCount !== this.state.getSettings().buildLimit))
      return false;
    if ((this.tradeCount !== this.state.getSettings().tradeLimit)
      && (this.buildCount === this.state.getSettings().buildLimit))
      return false;
    this.state.setPersonalLog(p,
        `You built and traded everything you could during this ${Phase.TRADE_BUILD}`);
    this.resetTradeBuildCount();
    return true;
  }

  public build( playerId: string, payload: BuildRequestPayload ) {
    //console.log(
    //  `🤝🔨TradeAndBuildPhase:build: handles buildRequest from ${playerId}`,
    //);
    const p = this.state.isPlayersTurn(playerId);
    if (!p) return;
    if (this.buildCount === this.state.getSettings().buildLimit) {
      this.state.setPersonalLog(p,
        this.state.forbiddenActionLog(Action.BUILD_LIMIT, Phase.PLACEMENT));
      return;
    }
    const response = buildCheck(
      payload,
      p,
      this.state.getBoard(),
      this.state.getGraph(),
      this.state.getBuildings(),
    );
    this.state.setPersonalLog(p, `${response.message}`);
    if (response.valid === false) return;
    this.buildCount++;
    if (this.isTradeBuildLimit(p)) {
      this.state.setTurnCount();
      this.state.setCurrentTurnIndex();
    }
    this.state.setMasterLog(`${playerId} built something ..`)
  }

  public trade( playerId: string, payload: TradeRequestPayload ) {
    //console.log(`🤝⚖️TradeAndBuildPhase:trade: handles tradeRequest from ${playerId}`);
    const p = this.state.isPlayersTurn(playerId);
    if (!p) return;
    if (this.tradeCount === this.state.getSettings().tradeLimit) {
      this.state.setPersonalLog(p,
        this.state.forbiddenActionLog(Action.TRADE_LIMIT, Phase.PLACEMENT));
      return;
    }
    const response = tradeCheck(payload, p, this.state.getGraph());
    this.state.setPersonalLog(p,`${response.message}`)
    if (response.valid === false) return;
    this.tradeCount++;
    if (this.isTradeBuildLimit(p)) {
      this.state.setTurnCount();
      this.state.setCurrentTurnIndex();
    }
    this.state.setMasterLog(
      `${playerId} traded something with a ${payload.trader} ...`)
  }

  public dice( playerId: string ) {
    //console.log(`🤝🎲TradeAndBuildPhase:dice: handles diceRequest from ${playerId}`);
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(p,
      this.state.forbiddenActionLog(Action.DICE, Phase.TRADE_BUILD));
  }

  public skip( playerId: string ) {
    //console.log(`🤝⏭️TradeAndBuildPhase:skip: handles skipRequest from ${playerId}`);
    const p = this.state.isPlayersTurn(playerId);
    if (!p) return;
    this.state.setTurnCount();
    this.state.setCurrentTurnIndex();
    this.state.setPersonalLog(p, `You skipped your turn !`);
    this.state.setMasterLog(`${playerId} skipped his/her turn !`);
    this.resetTradeBuildCount();
    //console.log(`🤝⏭️TradeAndBuildPhase:skip: ${playerId} skipped his turn !`);
  }

  public phaseCheck(): void {
    if (this.state.isVictory()) return;
    if (this.state.getTurnCount() !==
      this.state.getPlayers().size) return;
    this.state.setupNextPhase(Phase.RESOURCES);
    this.state.transitionTo(new RessourcePhase());
    //console.log('🤝🔎TradeAndBuildPhase:phaseCheck: everybody is ready!');
  }
}

export { GameStateContext, WhoStartsPhase };
