import {
  Faction,
  Action,
  Phase,
  LandType,
  ResourceType,
  ROBBER_ROLL,
  GUIDE_LOG,
  LAND_RESOURCE,
  YOU_DIDNT_ROLLED,
  SETTLEMENT,
  ROAD,
  PERSONNAL_LOG_LIMIT,
  ROBBER_NAME,
  ROLLED_A,
  ZGEG_DEV,
  PlayerPublicDto,
} from 'shared';
import {
  GameBoard,
  GameBoardGraph,
  GameData,
  GameDataDto,
  SettlementData,
  Player,
  BuildPayload,
  TradePayload,
  PlayerDto,
  SettingsData,
  DiceRoll,
  NotifColor,
} from 'shared';
import { updateValue, funnyRollLog } from './game.utils';
import { buildCheck, BuildingsInGame } from './calculation/handleBuilds';
import { createGameBoard } from './calculation/createGameBoard';
import { tradeCheck } from './calculation/handleTrade';
import {
  addStartingResources,
  produceResources,
} from './calculation/handleResources';
import {
  randomizeFirstSettlement,
  randomizeRobber,
} from './calculation/randomizeGameBoard';

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
  public abstract dice(username: string | void): void;
  public abstract skip(username: string | void): void;
  public abstract build(
    username: string | void,
    payload: BuildPayload | void,
  ): void;
  public abstract trade(
    username: string | void,
    payload: TradePayload | void,
  ): void;
  public abstract phaseCheck(): void;
}

/**
 * @brief define the fonction signature
 *
 * PlayerNotifier is a callback function that is called when the player turn expires
 */
export type PlayerNotifier = (id: string, username: string) => void;

/**
 * The Context defines the interface of interest to clients. It also maintains a
 * reference to an instance of a State subclass, which represents the current
 * state of the Context.
 */
class GameStateContext {
  private state!: State;
  protected data!: GameData;
  protected graph!: GameBoardGraph;
  protected settings!: SettingsData;
  protected buildings: BuildingsInGame = new Map();
  private readonly notify: PlayerNotifier;
  private turnTimeoutId: NodeJS.Timeout | null = null;
  private logId: number = 0;
  private rollId: number = 0;
  private factionSwitch: number = 0;
  private roundCount: number = 0;
  private turnCount: number = 0;
  private turnStart: number = 0;

  constructor(
    gameId: string,
    settings: SettingsData,
    state: State,
    notify: PlayerNotifier,
  ) {
    this.notify = notify;
    this.settings = settings;
    const { board, graph } = createGameBoard(this.settings.gameboardLayout);
    this.graph = graph;
    this.data = {
      gameId: gameId,
      board: board,
      players: new Map<string, Player>(),
      startingRolls: new Map<string, number>(),
      currentPhase: Phase.PENDING,
      turnIndex: 0,
      turnOrder: [],
      masterLog: `${Phase.START}: roll the dices`,
      dicesSum: 0,
      whosTurn: '',
      winner: null,
      winCondition: null,
      gameTerminated: false,
    };
    this.transitionTo(state);
  }

  public initPlayer(id: string, username: string): Player {
    const newPlayer: Player = {
      id: id,
      username: username,
      victoryPoints: 0,
      timeToPlay: 0,
      level: 1, //⚠️ For testing only
      firstDice: 0,
      secondDice: 0,
      settlementsBuilt: new Map<string, SettlementData>(),
      avatarURL: null,
      faction: this.pickFaction(),
      guideLog: `${GUIDE_LOG[Phase.START]}`,
      personalLog: [],
      currentRoll: {
        id: this.rollId++,
        val: null,
      },
      resources: {
        wood: this.settings.woodBonus,
        brick: this.settings.brickBonus,
        wheat: this.settings.wheatBonus,
        sheep: this.settings.sheepBonus,
        ore: this.settings.oreBonus,
      },
      firstSettlementPlaced: false,
    };
    this.setPersonalLog(
      newPlayer,
      `Welcome to ${this.settings.gameboardLayout} ${username}`,
      NotifColor.GREEN,
    );
    return newPlayer;
  }

  public transitionTo(newState: State): void {
    this.state = newState;
    this.state.setGameState(this);
  }

  /***********************************
   * Requests
   **********************************/
  public diceRequest(username: string) {
    return this.state.dice(username);
  }
  public skipRequest(username: string) {
    this.state.skip(username);
  }
  public phaseCheckRequest(): void {
    return this.state.phaseCheck();
  }
  public tradeRequest(username: string, payload: TradePayload | void) {
    return this.state.trade(username, payload);
  }
  public buildRequest(username: string, payload: BuildPayload | void) {
    this.state.build(username, payload);
  }

  /***********************************
   * Getters
   **********************************/
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
  public getWhosTurn(): string {
    return this.data.whosTurn;
  }
  public getLogId(): number {
    return this.rollId;
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
  public getTurnCount(): number {
    return this.turnCount;
  }
  public getSettings(): SettingsData {
    return this.settings;
  }
  public getCurrentTurnIndex(): number {
    return this.data.turnIndex;
  }
  /** Number of resources + trade and build rounds started */
  public getRoundCount(): number {
    return this.roundCount;
  }
  public getCurrentPhase(): Phase {
    return this.data.currentPhase;
  }
  public getMasterLog(): string {
    return this.data.masterLog;
  }
  public getPlayerByUsername(username: string): Player | undefined {
    return this.data.players.get(username);
  }
  public getCurrentPlayer(): Player | undefined {
    return this.data.players.get(this.data.turnOrder[this.data.turnIndex]);
  }
  public isGameTerminated(): boolean {
    return this.data.gameTerminated;
  }
  public hasRolledBothDices(p: Player): boolean {
    if (p.firstDice !== 0 && p.secondDice !== 0) {
      return true;
    }
    return false;
  }
  public getPlayerPublicDto(player: Player): PlayerPublicDto {
    return {
      id: player.id,
      username: player.username,
      level: player.level,
      victoryPoints: player.victoryPoints,
      timeToPlay: player.timeToPlay,
      firstDice: player.firstDice,
      secondDice: player.secondDice,
      currentRoll: player.currentRoll,
      faction: player.faction,
      avatarURL: player.avatarURL,
    };
  }
  public getPlayerDto(p: Player): PlayerDto {
    return {
      id: p.id,
      username: p.username,
      victoryPoints: p.victoryPoints,
      timeToPlay: this.getTimeLeft(p.username),
      firstDice: p.firstDice,
      secondDice: p.secondDice,
      level: p.level,
      avatarURL: p.avatarURL,
      faction: p.faction,
      currentRoll: p.currentRoll,
      personalLog: p.personalLog,
      guideLog: p.guideLog,
      resources: p.resources,
    };
  }
  public getGameDataDto(username: string): GameDataDto | null {
    const gameData = this.getGameData();
    const me =
      this.getPlayerByUsername(username) ??
      this.getPlayerByUsername(this.getWhosTurn());
    if (!me) return null;

    const playersPublic: PlayerPublicDto[] = [
      ...this.getPlayers().values(),
    ].map((player) => this.getPlayerPublicDto(player));
    return {
      currentPlayer: this.getPlayerDto(me),
      winner: gameData.winner,
      winCondition: gameData.winCondition,
      players: playersPublic,
      gameId: gameData.gameId,
      dicesSum: gameData.dicesSum,
      masterLog: gameData.masterLog,
      board: gameData.board,
      whosTurn: gameData.whosTurn,
      currentPhase: gameData.currentPhase,
      gameTerminated: gameData.gameTerminated,
      settings: this.settings,
    };
  }
  public isPlayersTurn(username: string): Player | null {
    const p = this.getPlayerByUsername(username);
    if (!p) return null;
    if (p.username !== this.data.whosTurn) {
      this.setPersonalLog(p, "It's not you turn !", NotifColor.RED);
      return null;
    }
    return p;
  }
  /***********************************
   * Setters
   **********************************/
  public setDicesSum(roll: number) {
    this.data.dicesSum = roll;
  }
  public setMasterLog(log: string) {
    this.data.masterLog = log;
  }
  public setCurrentPhase(phase: Phase) {
    this.data.currentPhase = phase;
  }
  public setTurnOrder(newTurnOrder: string[]) {
    this.data.turnOrder = newTurnOrder;
  }
  public setGuideLog(p: Player, message: string) {
    p.guideLog = message;
  }
  public setGameTerminated(isTerminated: boolean) {
    this.data.gameTerminated = isTerminated;
  }
  public setAllGuideLogs(message: string) {
    this.getGameData().players.forEach((player) => {
      this.setGuideLog(player, message);
    });
  }
  public setPersonalLog(p: Player, message: string, type: NotifColor) {
    p.personalLog.push({
      id: this.logId++,
      message: message,
      color: type,
    });
    if (p.personalLog.length > PERSONNAL_LOG_LIMIT) {
      p.personalLog.splice(0, p.personalLog.length - PERSONNAL_LOG_LIMIT);
    }
  }
  public setAllPersonnalLog(
    currentusername: string,
    message: string,
    type: NotifColor,
  ) {
    this.data.players.forEach((player) => {
      if (player.username !== currentusername)
        this.setPersonalLog(player, message, type);
    });
  }
  public resetAllDices() {
    this.data.players.forEach((player) => {
      this.resetDices(player);
    });
  }
  public resetDices(p: Player) {
    p.firstDice = 0;
    p.secondDice = 0;
  }
  public setTurnIndex(index?: number) {
    this.data.turnIndex = updateValue(
      this.data.turnIndex,
      this.data.players.size + 1,
      index,
    );
    this.data.whosTurn = this.data.turnOrder[this.data.turnIndex];
  }
  public setTurnCount(count?: number) {
    if (count !== undefined) {
      this.turnCount = count;
    } else {
      this.turnCount++;
    }
  }
  /** Set next player turn, ignore the players that quit the game */
  public setNextPlayer(index?: number) {
    this.stopWatch();
    const p = this.getCurrentPlayer();
    if (p) p.timeToPlay = 0;
    let next: Player | undefined = undefined;
    for (let i = 0; i < this.data.turnOrder.length && next === undefined; i++) {
      this.setTurnIndex(index);
      next = this.getCurrentPlayer();
    }
    this.setTurnCount(index);
    this.setMasterLog(
      `${this.getCurrentPhase()}: ${this.getCurrentPlayer()?.username} is playing ...`,
    );
    this.startWatch();
  }

  /** @argument winCondition: explain why the player won  */
  public setVictory(winner: string, winCondition: string) {
    this.data.winner = winner;
    this.data.winCondition = winCondition;
  }
  private pickFaction(): Faction {
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
  public assignFactions() {
    this.factionSwitch = 0;
    this.data.players.forEach((player) => {
      player.faction = this.pickFaction();
    });
  }

  public removePlayer(username: string) {
    this.data.players.delete(username);
    const idx = this.data.turnOrder.indexOf(username);
    if (idx === -1) return;
    this.data.turnOrder.splice(idx, 1);
    if (this.data.turnOrder.length === 0) return;
    if (this.data.whosTurn === username) {
      this.data.whosTurn = '';
      if (idx % this.data.turnOrder.length === 0) {
        this.setNextPlayer(0);
      } else {
        this.setNextPlayer();
      }
    } else if (idx < this.data.turnIndex) {
      this.data.turnIndex--;
    }
    this.turnCount++;
  }

  /***********************************
   * Methods
   **********************************/
  private notifyAllPlayers() {
    this.data.players.forEach((player) => {
      if (player.username !== ZGEG_DEV) this.notify(player.id, player.username);
    });
  }

  /** To call when the game is ready to start */
  public launchGame() {
    if (this.getPlayers().size === 0) {
      this.data.gameTerminated = true;
      return;
    }
    this.assignFactions();
    this.setCurrentPhase(Phase.START);
    const first = this.getPlayers().values().next().value as Player | undefined;
    if (first) this.data.whosTurn = first.username;
    this.data.players.forEach((player) => {
      this.setPersonalLog(
        player,
        "Everybody's ready! The game starts!",
        NotifColor.PURPLE,
      );
    });
    this.notifyAllPlayers();
    this.transitionTo(new StartPhase());
    this.startWatch();
  }

  /** @description Generates: "You can't ${Action} during ${Phase}" */
  public forbiddenActionLog(action: Action, phase: Phase): string {
    return `You can't ${action} during ${phase}`;
  }
  private everybodyRollDices() {
    this.data.players.forEach((p) => {
      if (p.firstDice === 0) this.diceRequest(p.username);
      if (p.secondDice === 0) {
        this.diceRequest(p.username);
        console.log(
          `GameStateContext.onExpire: game [${this.data.gameId}]: no actions within the elapsed time ` +
            `(${this.settings.turnDurationSeconds} seconds), auto-play for ` +
            `${p.username} during « ${this.getCurrentPhase()} »`,
        );
      }
    });
  }
  public rollDice(p: Player): DiceRoll {
    const roll: DiceRoll = { val: null, id: 0 };
    roll.val = Math.floor(Math.random() * 6) + 1;
    roll.id = this.rollId++;
    if (p.firstDice === 0) {
      p.firstDice = roll.val;
      this.setPersonalLog(p, `You ${ROLLED_A} ${roll.val}`, NotifColor.GREEN);
      this.setAllPersonnalLog(
        p.username,
        `${p.username} ${ROLLED_A} ${roll.val}`,
        NotifColor.PURPLE,
      );
    } else if (p.secondDice === 0) {
      p.secondDice = roll.val;
      this.setPersonalLog(p, `You ${ROLLED_A} ${roll.val}`, NotifColor.GREEN);
      this.setAllPersonnalLog(
        p.username,
        `${p.username} ${ROLLED_A} ${roll.val}`,
        NotifColor.PURPLE,
      );
    } else {
      roll.val = null;
      this.setPersonalLog(p, `${YOU_DIDNT_ROLLED}`, NotifColor.RED);
    }
    return roll;
  }

  public setupNextPhase(nextPhase: Phase) {
    if (nextPhase === Phase.RESOURCES) this.roundCount++;
    this.setNextPlayer(0);
    this.setTurnCount(0);
    this.setCurrentPhase(nextPhase);
    this.setMasterLog(
      `${this.getCurrentPhase()}: ${this.getCurrentPlayer()?.username} is playing ...`,
    );
    this.setAllGuideLogs(`${GUIDE_LOG[nextPhase]}`);
    this.resetAllDices();
  }

  public isVictory(): boolean {
    if (this.isGameTerminated()) return true;
    this.data.players.forEach((player) => {
      if (this.data.players.size <= 1) {
        this.setVictory(
          player.username,
          `is the only player left in game ! You won congrats !`,
        );
        this.setGameTerminated(true);
        return;
      }
      if (player.victoryPoints >= this.getSettings().pointsToWin) {
        this.setVictory(
          player.username,
          `won by earning ${player.victoryPoints} victory points !`,
        );
        this.setAllGuideLogs(`${this.data.winner} ${this.data.winCondition}`);
        this.setGameTerminated(true);
        return;
      }
    });
    return this.isGameTerminated();
  }

  public resourcesProduction(placementPhase: boolean) {
    for (const [settlementId, player] of this.buildings) {
      const graphEntry = this.graph.get(settlementId);
      if (!graphEntry) continue;
      graphEntry.adjacentTiles.forEach((tile) => {
        let prod: number = 0;
        if (placementPhase === true) {
          prod = produceResources(
            tile.land,
            player.resources,
            this.settings.resourcesMultiplier,
          );
        } else if (tile.value === this.data.dicesSum && !tile.hasRobber) {
          const settlement = player.settlementsBuilt.get(settlementId);
          if (settlement)
            prod = produceResources(
              tile.land,
              player.resources,
              this.settings.resourcesMultiplier,
              settlement.isCity,
            );
        }
        if (prod > 0) {
          this.setPersonalLog(
            player,
            `You produced ${prod} ${LAND_RESOURCE[tile.land]}`,
            NotifColor.GREEN,
          );
          //console.log(`⚖️ressoucesProduction: ${player.username} produced ${prod} ${LAND_RESOURCE[tile.land]}`);
        } else if (tile.land == LandType.DESERT && !placementPhase) {
          this.setPersonalLog(
            player,
            `You didn't produce anything with your ${LandType.DESERT} ...`,
            NotifColor.PURPLE,
          );
          //console.log(`⚖️ressoucesProduction: ${player.username} can't produce anything in the ${LandType.DESERT}`);
        } else if (tile.hasRobber && !placementPhase) {
          this.setPersonalLog(
            player,
            `${ROBBER_NAME} stole your ${LAND_RESOURCE[tile.land]} production !`,
            NotifColor.PURPLE,
          );
          //console.log(`⚖️ressoucesProduction: ${player.username} has been stolen by ${ROBBER_NAME} !`);
        }
      });
    }
  }

  public robberRule(threshold: number): void {
    this.data.players.forEach((player) => {
      const totalCount = Object.values(player.resources).reduce(
        (sum, count) => sum + count,
        0,
      );
      if (totalCount <= threshold) return;
      const toDiscard = Math.floor(totalCount / 2);
      const pool: ResourceType[] = [];
      for (const [resource, count] of Object.entries(player.resources)) {
        for (let i = 0; i < count; i++) pool.push(resource as ResourceType);
      }
      for (let i = 0; i < toDiscard; i++) {
        const pickIndex = Math.floor(Math.random() * pool.length);
        const picked = pool.splice(pickIndex, 1)[0];
        if (player.resources[picked] >= 1) player.resources[picked] -= 1;
      }
      this.setPersonalLog(
        player,
        `${ROBBER_NAME} robbed you ${toDiscard} resources !`,
        NotifColor.PURPLE,
      );
    });
    randomizeRobber(this.data.board.layout);
  }
  public afkDuringPlacement(p: Player) {
    addStartingResources(p.resources);
    if (p.firstSettlementPlaced) return;
    let response = { valid: false, message: '' };
    for (let tries = 0; tries < 10; tries++) {
      const buildPayload = randomizeFirstSettlement(this.graph);
      if (!buildPayload) break;
      response = buildCheck(
        buildPayload,
        p,
        this.getBoard(),
        this.getGraph(),
        this.getBuildings(),
        this.getSettings(),
        true,
      );
      if (response.valid === true) break;
    }
    p.firstSettlementPlaced = true;
  }

  /***********************************
   * Turn Watcher
   **********************************/
  private onExpire(): void {
    if (this.getCurrentPhase() === Phase.START) {
      this.everybodyRollDices();
    } else {
      const p = this.getPlayerByUsername(this.data.whosTurn);
      if (!p) return;
      console.log(
        `GameStateContext.onExpire: game [${this.data.gameId}]: no actions within the elapsed time ` +
          `(${this.settings.turnDurationSeconds} seconds), auto-play for ` +
          `${this.data.whosTurn} during « ${this.getCurrentPhase()} »`,
      );
      switch (this.getCurrentPhase()) {
        case Phase.PLACEMENT:
          this.afkDuringPlacement(p);
          break;
        case Phase.START:
        case Phase.RESOURCES:
          if (p.firstDice === 0) this.rollDice(p);
          if (p.secondDice === 0) this.rollDice(p);
          break;
        default:
          break;
      }
    }
    if (this.turnTimeoutId === null) return;
    this.turnTimeoutId = null;
    this.setNextPlayer();
    this.phaseCheckRequest();
    this.notifyAllPlayers();
  }

  private elapsedMs(): number {
    return Date.now() - this.turnStart;
  }

  public startWatch(): void {
    this.turnStart = Date.now();
    this.turnTimeoutId = setTimeout(
      () => this.onExpire(),
      this.settings.turnDurationSeconds * 1000,
    );
  }

  public stopWatch(): void {
    if (this.turnTimeoutId !== null) {
      clearTimeout(this.turnTimeoutId);
      this.turnTimeoutId = null;
    }
  }

  /** Seconds remaining before the forced play, rounded up. */
  public getTimeLeft(username: string): number {
    if (this.getCurrentPhase() === Phase.START)
      return this.settings.turnDurationSeconds;
    if (username !== this.data.whosTurn) return 0;
    const remaining =
      this.settings.turnDurationSeconds * 1000 - this.elapsedMs();
    return Math.max(0, Math.ceil(remaining / 1000));
  }
}

/***********************************
 * Pending Phase
 **********************************/
class PendingPhase extends State {
  public dice() {
    return;
  }
  public build() {
    return;
  }
  public trade() {
    return;
  }
  public skip() {
    return;
  }
  public phaseCheck(): void {
    return;
  }
}

/***********************************
 * Start Phase
 **********************************/
class StartPhase extends State {
  public dice(username: string) {
    const p = this.state.getPlayerByUsername(username);
    if (!p) return;
    p.currentRoll = this.state.rollDice(p);
    if (this.state.hasRolledBothDices(p) && p.currentRoll !== null) {
      this.state.setPersonalLog(
        p,
        `You ${funnyRollLog(p.firstDice + p.secondDice)}`,
        NotifColor.GREEN,
      );
      this.state.getStartingRolls().set(username, p.firstDice + p.secondDice);
    }
  }

  public build(username: string) {
    const p = this.state.getPlayerByUsername(username);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.BUILD, Phase.START),
      NotifColor.RED,
    );
  }

  public trade(username: string) {
    const p = this.state.getPlayerByUsername(username);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.TRADE, Phase.START),
      NotifColor.RED,
    );
  }

  public skip(username: string) {
    const p = this.state.getPlayerByUsername(username);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.SKIP, Phase.START),
      NotifColor.RED,
    );
  }

  public computeTurnOrder() {
    const entries = Array.from(this.state.getStartingRolls().entries());
    entries.sort(([, a], [, b]) => b - a);
    this.state.setTurnOrder(entries.map(([username]) => username));
  }

  public phaseCheck(): void {
    if (this.state.getStartingRolls().size !== this.state.getPlayers().size)
      return;
    this.computeTurnOrder();
    this.state.setupNextPhase(Phase.PLACEMENT);
    this.state.transitionTo(new PlacementPhase());
  }
}

/***********************************
 * Placement Phase
 **********************************/
class PlacementPhase extends State {
  public dice(username: string) {
    const p = this.state.getPlayerByUsername(username);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.DICE, Phase.PLACEMENT),
      NotifColor.RED,
    );
  }

  public build(username: string, payload: BuildPayload) {
    const p = this.state.isPlayersTurn(username);
    if (!p) return;
    if (payload.kind === SETTLEMENT && p.firstSettlementPlaced) {
      this.state.setPersonalLog(
        p,
        'You already built a settlement, build a road now ...',
        NotifColor.RED,
      );
      return;
    } else if (payload.kind === ROAD && !p.firstSettlementPlaced) {
      this.state.setPersonalLog(
        p,
        'You must build a settlement first ...',
        NotifColor.RED,
      );
      return;
    }
    const response = buildCheck(
      payload,
      p,
      this.state.getBoard(),
      this.state.getGraph(),
      this.state.getBuildings(),
      this.state.getSettings(),
      true,
    );
    if (response.valid === false) {
      this.state.setPersonalLog(p, `${response.message}`, NotifColor.RED);
      return;
    }
    this.state.setPersonalLog(p, `${response.message}`, NotifColor.GREEN);
    if (payload.kind == SETTLEMENT && p.firstSettlementPlaced == false) {
      p.firstSettlementPlaced = true;
      this.state.setPersonalLog(
        p,
        'You built your first settlement, pick a road now.',
        NotifColor.GREEN,
      );
      return;
    }
    this.state.setNextPlayer();
    this.state.setPersonalLog(
      p,
      'You finshied your placement, wait for the other players to play ...',
      NotifColor.GREEN,
    );
  }

  public trade(username: string) {
    const p = this.state.getPlayerByUsername(username);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.TRADE, Phase.PLACEMENT),
      NotifColor.RED,
    );
  }

  public skip(username: string) {
    const p = this.state.getPlayerByUsername(username);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.SKIP, Phase.PLACEMENT),
      NotifColor.RED,
    );
  }

  public phaseCheck(): void {
    if (this.state.getTurnCount() !== this.state.getPlayers().size) return;
    this.state.resourcesProduction(true);
    this.state.setupNextPhase(Phase.RESOURCES);
    this.state.transitionTo(new ResourcesPhase());
  }
}

/***********************************
 * Resources Phase
 **********************************/
class ResourcesPhase extends State {
  public dice(username: string) {
    const p = this.state.isPlayersTurn(username);
    if (!p) return;
    p.currentRoll = this.state.rollDice(p);
    if (this.state.hasRolledBothDices(p) && p.currentRoll) {
      this.state.setDicesSum(p.firstDice + p.secondDice);
      switch (this.state.getGameData().dicesSum) {
        case ROBBER_ROLL:
          this.state.robberRule(this.state.getSettings().robberThreshold);
          break;
        default:
          this.state.resourcesProduction(false);
          break;
      }
      this.state.setNextPlayer();
    }
  }

  public build(username: string) {
    const p = this.state.getPlayerByUsername(username);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.BUILD, Phase.RESOURCES),
      NotifColor.RED,
    );
  }

  public trade(username: string) {
    const p = this.state.getPlayerByUsername(username);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.TRADE, Phase.RESOURCES),
      NotifColor.RED,
    );
  }

  public skip(username: string) {
    const p = this.state.getPlayerByUsername(username);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.SKIP, Phase.RESOURCES),
      NotifColor.RED,
    );
  }

  public phaseCheck(): void {
    if (this.state.getTurnCount() !== this.state.getPlayers().size) return;
    this.state.setupNextPhase(Phase.TRADE_BUILD);
    this.state.transitionTo(new TradeAndBuildPhase());
  }
}

/***********************************
 * Trade and Build Phase
 **********************************/
class TradeAndBuildPhase extends State {
  private tradeCount: number = 0;
  private buildCount: number = 0;

  private resetTradeBuildCount() {
    this.tradeCount = 0;
    this.buildCount = 0;
  }

  private isTradeBuildLimit(p: Player): boolean {
    if (
      this.tradeCount !== this.state.getSettings().tradeLimit &&
      this.buildCount !== this.state.getSettings().buildLimit
    )
      return false;
    if (
      this.tradeCount === this.state.getSettings().tradeLimit &&
      this.buildCount !== this.state.getSettings().buildLimit
    )
      return false;
    if (
      this.tradeCount !== this.state.getSettings().tradeLimit &&
      this.buildCount === this.state.getSettings().buildLimit
    )
      return false;
    this.state.setPersonalLog(
      p,
      `You built and traded everything you could during this ${Phase.TRADE_BUILD}`,
      NotifColor.PURPLE,
    );
    this.resetTradeBuildCount();
    return true;
  }

  public build(username: string, payload: BuildPayload) {
    const p = this.state.isPlayersTurn(username);
    if (!p) return;
    if (this.buildCount === this.state.getSettings().buildLimit) {
      this.state.setPersonalLog(
        p,
        this.state.forbiddenActionLog(Action.BUILD_LIMIT, Phase.PLACEMENT),
        NotifColor.RED,
      );
      return;
    }
    const response = buildCheck(
      payload,
      p,
      this.state.getBoard(),
      this.state.getGraph(),
      this.state.getBuildings(),
      this.state.getSettings(),
    );
    if (response.valid === false) {
      this.state.setPersonalLog(p, `${response.message}`, NotifColor.RED);
      return;
    }
    this.state.setPersonalLog(p, `${response.message}`, NotifColor.GREEN);
    this.buildCount++;
    if (this.isTradeBuildLimit(p)) this.state.setNextPlayer();
  }

  public trade(username: string, payload: TradePayload) {
    const p = this.state.isPlayersTurn(username);
    if (!p) return;
    if (this.tradeCount === this.state.getSettings().tradeLimit) {
      this.state.setPersonalLog(
        p,
        this.state.forbiddenActionLog(Action.TRADE_LIMIT, Phase.PLACEMENT),
        NotifColor.RED,
      );
      return;
    }
    const response = tradeCheck(
      payload,
      p,
      this.state.getGraph(),
      this.state.getSettings(),
    );
    if (response.valid === false) {
      this.state.setPersonalLog(p, `${response.message}`, NotifColor.RED);
      return;
    }
    this.state.setPersonalLog(p, `${response.message}`, NotifColor.GREEN);
    this.tradeCount++;
    if (this.isTradeBuildLimit(p)) this.state.setNextPlayer();
  }

  public dice(username: string) {
    const p = this.state.getPlayerByUsername(username);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.DICE, Phase.TRADE_BUILD),
      NotifColor.RED,
    );
  }

  public skip(username: string) {
    const p = this.state.isPlayersTurn(username);
    if (!p) return;
    this.state.setNextPlayer();
    this.state.setPersonalLog(p, `You ended your turn !`, NotifColor.GREEN);
    this.resetTradeBuildCount();
  }

  public phaseCheck(): void {
    if (this.state.isVictory()) return;
    if (this.state.getTurnCount() !== this.state.getPlayers().size) return;
    this.state.setupNextPhase(Phase.RESOURCES);
    this.state.transitionTo(new ResourcesPhase());
  }
}

export { GameStateContext, PendingPhase, StartPhase };
