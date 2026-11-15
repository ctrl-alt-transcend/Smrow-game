import {
  Faction,
  Action,
  Phase,
  LandType,
  ResourceType,
  ROBBER_ROLL,
  FACTION_COLORS,
  GUIDE_LOG,
  LAND_RESOURCE,
  YOU_ROLLED,
  YOU_DIDNT_ROLLED,
  SETTLEMENT,
  ROAD,
} from 'shared';
import type {
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
} from 'shared';
import { updateValue, funnyRollLog } from './game.utils';
import { buildCheck, BuildingsInGame } from './calculation/handleBuilds';
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
  public abstract dice(playerId: string): void;
  public abstract skip(playerId: string): void;
  public abstract phaseCheck(): void;
  public abstract build(playerId: string, payload: BuildPayload | null): void;
  public abstract trade(playerId: string, payload: TradePayload | null): void;
}

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
  private logId: number = 0;
  private rollId: number = 0;
  private factionSwitch: number = 0;

  constructor(gameId: string, settings: SettingsData, state: State) {
    this.settings = settings;
    const { board, graph } = createGameBoard(this.settings.gameboardLayout);
    this.graph = graph;
    this.data = {
      gameId: gameId,
      board: board,
      players: new Map<string, Player>(),
      startingRolls: new Map<string, number>(),
      currentPhase: Phase.START,
      currentTurnIndex: 0,
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
      username: playerId,
      victoryPoints: 0,
      //victoryPoints: 6, //⚠️ For testing only
      level: 1, //⚠️ For testing only
      stats: {
        roadsBuilt: 0,
        // ....
      },
      firstDice: 0,
      secondDice: 0,
      settlementsBuilt: new Map<string, SettlementData>(),
      avatarURL: null,
      faction: this.assignFaction(),
      personalLog: {
        id: this.logId++,
        message: `Welcome to ${this.settings.gameboardLayout} ${playerId}`,
      },
      guideLog: `${GUIDE_LOG[Phase.START]}`,
      currentRoll: {
        id: this.rollId++,
        val: null,
      },
      DEVMOD: false,
      resources: {
        wood: this.settings.woodBonus,
        brick: this.settings.brickBonus,
        wheat: this.settings.wheatBonus,
        sheep: this.settings.sheepBonus,
        ore: this.settings.oreBonus,
      },
    };
    return newPlayer;
  }

  public transitionTo(newState: State): void {
    this.state = newState;
    this.state.setGameState(this);
  }

  /***********************************
   * Requests
   **********************************/
  public diceRequest(playerId: string) {
    return this.state.dice(playerId);
  }
  public skipRequest(playerId: string) {
    this.state.skip(playerId);
  }
  public phaseCheckRequest(): void {
    return this.state.phaseCheck();
  }
  public tradeRequest(playerId: string, payload: TradePayload | null) {
    return this.state.trade(playerId, payload);
  }
  public buildRequest(playerId: string, payload: BuildPayload | null) {
    this.state.build(playerId, payload);
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
  public getSettings(): SettingsData {
    return this.settings;
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
  public isGameTerminated(): boolean {
    return this.data.gameTerminated;
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
      stats: p.stats,
      victoryPoints: p.victoryPoints,
      firstDice: p.firstDice,
      secondDice: p.secondDice,
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
      throw new NotFoundException(`Unknown playerId: ${playerId}`);
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
      gameTerminated: gameData.gameTerminated,
      settings: this.settings,
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
      this.setPersonalLog(player, "It's not you turn !");
      return null;
    }
    return player;
  }

  /***********************************
   * Setters
   **********************************/
  /** @description used in DEV: allow player to play for others */
  public setDEVMOD(playerId: string) {
    const p = this.getPlayerById(playerId);
    if (!p) return;
    p.DEVMOD = true;
  }
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
  public setPersonalLog(p: Player, message: string) {
    p.personalLog = {
      id: this.logId++,
      message: message,
    };
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
  public setCurrentTurnIndex(index?: number) {
    this.data.currentTurnIndex = updateValue(
      this.data.currentTurnIndex,
      this.data.players.size + 1,
      index,
    );
    this.data.whosTurn = this.data.turnOrder[this.data.currentTurnIndex];
  }

  /** @argument winCondition: explain why the player won  */
  public setVictory(winner: string, winCondition: string) {
    this.data.winner = winner;
    this.data.winCondition = winCondition;
  }

  /***********************************
   * Methods
   **********************************/
  /** @description Generates: "You can't ${Action} during ${Phase}" */
  public forbiddenActionLog(action: Action, phase: Phase): string {
    return `You can't ${action} during ${phase}`;
  }

  public rollDice(p: Player): DiceRoll {
    const roll: DiceRoll = { val: null, id: 0 };
    roll.val = Math.floor(Math.random() * 6) + 1;
    roll.id = this.rollId++;
    if (p.firstDice === 0) {
      p.firstDice = roll.val;
      this.setPersonalLog(p, `${YOU_ROLLED} ${roll.val}`);
      //console.log(`${p.playerId} #1 rolll: ${roll.val}`);
    } else if (p.secondDice === 0) {
      p.secondDice = roll.val;
      this.setPersonalLog(p, `${YOU_ROLLED} ${roll.val}`);
      //console.log(`${p.playerId} #2 rolll: ${roll.val}`);
    } else {
      roll.val = null;
      this.setPersonalLog(p, `${YOU_DIDNT_ROLLED}`);
    }
    return roll;
  }

  public setupNextPhase(nextPhase: Phase) {
    this.setCurrentTurnIndex(0);
    this.setCurrentPhase(nextPhase);
    this.setMasterLog(
      `${nextPhase}: ${this.getCurrentPlayer()?.playerId} is playing ...`,
    );
    this.setAllGuideLogs(`${GUIDE_LOG[nextPhase]}`);
    this.resetAllDices();
  }

  public isVictory(): boolean {
    if (this.isGameTerminated()) return true;
    this.data.players.forEach((player) => {
      if (this.data.players.size <= 1) {
        this.setVictory(
          player.playerId,
          `is the only player left in game ! You won congrats !`,
        );
        this.setGameTerminated(true);
        return;
      }
      if (player.victoryPoints >= this.getSettings().pointsToWin) {
        this.setVictory(
          player.playerId,
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
        if (prod > 0 && !placementPhase) {
          this.setPersonalLog(
            player,
            `You produced ${prod} ${LAND_RESOURCE[tile.land]}`,
          );
          //console.log(`⚖️ressoucesProduction: ${player.playerId} produced ${prod} ${LAND_RESOURCE[tile.land]}`);
        } else if (tile.hasRobber && !placementPhase) {
          this.setPersonalLog(
            player,
            `Robert the Robber stole your ${LAND_RESOURCE[tile.land]} production !`,
          );
          //console.log(`⚖️ressoucesProduction: ${player.playerId} has been stolen by Robert the Robber !`);
        } else if (tile.land == LandType.DESERT && !placementPhase) {
          this.setPersonalLog(
            player,
            `You didn't produce anything with your ${LAND_RESOURCE[tile.land]} ...`,
          );
          //console.log(`⚖️ressoucesProduction: ${player.playerId} can't produce anything in the ${LandType.DESERT}`);
        } else if (placementPhase) {
          this.setPersonalLog(player, `You produced your first resources !`);
        }
      });
    }
  }

  public robberRule(): void {
    const DISCARD_THRESHOLD = 7;
    this.data.players.forEach((player) => {
      const totalCount = Object.values(player.resources).reduce(
        (sum, count) => sum + count,
        0,
      );
      if (totalCount <= DISCARD_THRESHOLD) return;
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
        `Robert the Robber robbed you ${toDiscard} resources !`,
      );
    });
    randomizeRobber(this.data.board.layout);
  }
}

/***********************************
 * Start Phase
 **********************************/
class StartPhase extends State {
  public dice(playerId: string) {
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    p.currentRoll = this.state.rollDice(p);
    if (this.state.hasRolledBothDices(p) && p.currentRoll) {
      this.state.setPersonalLog(
        p,
        `You ${funnyRollLog(p.firstDice + p.secondDice)}`,
      );
      this.state.getStartingRolls().set(playerId, p.firstDice + p.secondDice);
    }
  }

  public build(playerId: string) {
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.BUILD, Phase.START),
    );
  }

  public trade(playerId: string) {
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.TRADE, Phase.START),
    );
  }

  public skip(playerId: string) {
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.SKIP, Phase.START),
    );
  }

  public computeTurnOrder() {
    const entries = Array.from(this.state.getStartingRolls().entries());
    entries.sort(([, a], [, b]) => b - a);
    this.state.setTurnOrder(entries.map(([playerId]) => playerId));
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
  private settlementBuilt: boolean = false;

  public dice(playerId: string) {
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.DICE, Phase.PLACEMENT),
    );
  }

  public build(playerId: string, payload: BuildPayload) {
    const p = this.state.isPlayersTurn(playerId);
    if (!p) return;
    if (payload.kind === SETTLEMENT && this.settlementBuilt) {
      this.state.setPersonalLog(
        p,
        'You already built a settlement, build a road now ...',
      );
      return;
    } else if (payload.kind === ROAD && !this.settlementBuilt) {
      this.state.setPersonalLog(p, 'You must build a settlement first ...');
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
      this.state.setPersonalLog(p, `${response.message}`);
      return;
    }
    if (payload.kind == SETTLEMENT && this.settlementBuilt == false) {
      this.settlementBuilt = true;
      this.state.setPersonalLog(
        p,
        'You built your first settlement, pick a road now.',
      );
      return;
    }
    this.settlementBuilt = false;
    this.state.setCurrentTurnIndex();
    this.state.setMasterLog(
      `${Phase.PLACEMENT}: ${this.state.getCurrentPlayer()?.playerId} is playing ...`,
    );
    this.state.setPersonalLog(
      p,
      'You finshied your placement, wait for the other players to play ...',
    );
  }

  public trade(playerId: string) {
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.TRADE, Phase.PLACEMENT),
    );
  }

  public skip(playerId: string) {
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.SKIP, Phase.PLACEMENT),
    );
  }

  public phaseCheck(): void {
    if (this.state.getCurrentTurnIndex() !== this.state.getPlayers().size)
      return;
    this.state.resourcesProduction(true);
    this.state.setupNextPhase(Phase.RESOURCES);
    this.state.transitionTo(new ResourcesPhase());
  }
}

/***********************************
 * Resources Phase
 **********************************/
class ResourcesPhase extends State {
  public dice(playerId: string) {
    const p = this.state.isPlayersTurn(playerId);
    if (!p) return;
    p.currentRoll = this.state.rollDice(p);
    if (this.state.hasRolledBothDices(p) && p.currentRoll) {
      this.state.setDicesSum(p.firstDice + p.secondDice);
      switch (this.state.getGameData().dicesSum) {
        case ROBBER_ROLL:
          this.state.robberRule();
          break;
        default:
          this.state.resourcesProduction(false);
          break;
      }
      this.state.setCurrentTurnIndex();
      this.state.setMasterLog(
        `${Phase.RESOURCES}: ${this.state.getCurrentPlayer()?.playerId} is playing ...`,
      );
    }
  }

  public build(playerId: string) {
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.BUILD, Phase.RESOURCES),
    );
  }

  public trade(playerId: string) {
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.TRADE, Phase.RESOURCES),
    );
  }

  public skip(playerId: string) {
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.SKIP, Phase.RESOURCES),
    );
  }

  public phaseCheck(): void {
    if (this.state.getCurrentTurnIndex() !== this.state.getPlayers().size)
      return;
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
    );
    this.resetTradeBuildCount();
    return true;
  }

  public build(playerId: string, payload: BuildPayload) {
    const p = this.state.isPlayersTurn(playerId);
    if (!p) return;
    if (this.buildCount === this.state.getSettings().buildLimit) {
      this.state.setPersonalLog(
        p,
        this.state.forbiddenActionLog(Action.BUILD_LIMIT, Phase.PLACEMENT),
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
    this.state.setPersonalLog(p, `${response.message}`);
    if (response.valid === false) return;
    this.buildCount++;
    if (this.isTradeBuildLimit(p)) this.state.setCurrentTurnIndex();
    this.state.setMasterLog(`${playerId} built something ...`);
  }

  public trade(playerId: string, payload: TradePayload) {
    const p = this.state.isPlayersTurn(playerId);
    if (!p) return;
    if (this.tradeCount === this.state.getSettings().tradeLimit) {
      this.state.setPersonalLog(
        p,
        this.state.forbiddenActionLog(Action.TRADE_LIMIT, Phase.PLACEMENT),
      );
      return;
    }
    const response = tradeCheck(
      payload,
      p,
      this.state.getGraph(),
      this.state.getSettings(),
    );
    this.state.setPersonalLog(p, `${response.message}`);
    if (response.valid === false) return;
    this.tradeCount++;
    if (this.isTradeBuildLimit(p)) this.state.setCurrentTurnIndex();
    this.state.setMasterLog(
      `${playerId} traded something with a ${payload.trader} ...`,
    );
  }

  public dice(playerId: string) {
    const p = this.state.getPlayerById(playerId);
    if (!p) return;
    this.state.setPersonalLog(
      p,
      this.state.forbiddenActionLog(Action.DICE, Phase.TRADE_BUILD),
    );
  }

  public skip(playerId: string) {
    const p = this.state.isPlayersTurn(playerId);
    if (!p) return;
    this.state.setCurrentTurnIndex();
    this.state.setPersonalLog(p, `You ended your turn !`);
    this.state.setMasterLog(`${playerId} ended his/her turn !`);
    this.resetTradeBuildCount();
  }

  public phaseCheck(): void {
    if (this.state.isVictory()) return;
    if (this.state.getCurrentTurnIndex() !== this.state.getPlayers().size)
      return;
    this.state.setupNextPhase(Phase.RESOURCES);
    this.state.transitionTo(new ResourcesPhase());
  }
}

export { GameStateContext, StartPhase };
