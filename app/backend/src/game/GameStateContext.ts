import type {
  GameData,
  Player,
  GameResponse
} from '@shared/game/game.types';

import {
  initPlayer,
  rollDice,
  funnyLogs
} from './game.utils';

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
  private   state!: State;
  protected game!: GameData;

  constructor( gameId: string, state: State ) {
    this.game = {
      players: new Map<string, Player>(),
      startingRolls: new Map<string, number | null>(),
      turnCount: 0,
      turnOrder: [],
      currentTurnIndex: 0,
      gameId: gameId,
      masterLog: '...',
      diceRoll: 0
    };
    this.initGameData();
    this.initStartingRolls();
    this.transitionTo(state);
    this.game.players.forEach((value: Player, key: string) => {
      console.log(`GameStateContext:constructor: playerId: ${key}, value: ${value}`);
    });
  }

  /** WORK IN PROGRESS: to do:
   * - init every player with their current name
   * - init ressources
   */
  protected initGameData() {  //⚠️ FOR TESTING //TEST: REMOVE THIS IN PROD
    this.game.players.set('spagg', initPlayer('spagg'));
    this.game.players.set('enriquest', initPlayer('enriquest'));
  }

  private initStartingRolls(): void {
    this.game.startingRolls.clear();
    for (const playerId of this.game.players.keys()) {
      this.game.startingRolls.set(playerId, null);
    }
  }

  /** The Context allows changing the State object at runtime. */
  public transitionTo( newState: State ): void {
    console.log(`➡️ GamePhase: transition to ${(<any>newState).constructor.name}.`);
    this.state = newState
    this.state.setGameState(this);
  }

  /** The Context delegates part of its behavior to the current State object. */
  public diceRequest( playerId: string | null ): GameResponse {
      return this.state.dice(playerId);
  }
  public buildRequest( playerId: string | null ): GameResponse {
      return this.state.build(playerId);
  }
  public phaseCheckRequest() {
      return this.state.phaseCheck();
  }

  /** Getters */
  public  getGameData(): GameData { return this.game; }
  public  getGameId(): string { return this.game.gameId; }
  public  getPlayers(): Map<string, Player> { return this.game.players; }
  public  getStartingRolls(): Map<string, number | null> { return this.game.startingRolls; }
  public  getTurnCount(): number { return this.game.turnCount; }
  public  getCurrentTurnIndex(): number { return this.game.currentTurnIndex; }
  public  getCurrentPlayer(): Player | undefined {
    return this.game.players.get(this.game.turnOrder[this.game.currentTurnIndex]);
  }
  public  getPlayerById(playerId: string): Player | undefined {
    return this.game.players.get(playerId);
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

  public  hasRolledBothDices( p: Player ): boolean {
    if (p.firstDice !== 0 && p.secondDice !== 0) {
      return true;
    }
    return false;
  }

  /** Setters */
  public setDiceRoll( roll: number | null ) { this.game.diceRoll = roll; }
  public setMasterLog( log: string | null ) { this.game.masterLog = log; }
  public  setTurnOrder( newTurnOrder: string[] ) { this.game.turnOrder = newTurnOrder; }
  public  resetDices( p: Player ) { p.firstDice = 0; p.secondDice = 0; }
  public  resetAllDices() {
    for (let [key, value] of this.game.players) {
      this.resetDices(value);
    }
  }

  private updateValue(
    currentValue: number,
    limit: number,
    newValue: number | undefined
  ): number {
    if (newValue !== undefined) { return newValue; }
    else if (currentValue + 1 === limit) { return 0; }
    else { return currentValue + 1; }
  }

  public setTurnCount( count: number | undefined ) {
    this.game.turnCount = this.updateValue(
      this.game.turnCount, this.game.players.size + 1, count);
  }

  public setCurrentTurnIndex( index: number | undefined ) {
    this.game.currentTurnIndex = this.updateValue(
      this.game.currentTurnIndex, this.game.players.size, index);
  }
}

/**
 * The base State class declares methods that all Concrete State should
 * implement and also provides a backreference to the Context object, associated
 * with the State. This backreference can be used by States to transition the
 * Context to another State.
 */
abstract class  State
{
  protected state!: GameStateContext;

  public  setGameState( newGameState: GameStateContext ) {
    this.state = newGameState;
  }
  public abstract dice( playerId: string | null ): GameResponse;
  public abstract build( playerId: string | null ): GameResponse;
  public abstract phaseCheck(): void;
}

// Concrete game loop phases
/**
 * Concrete States implement various behaviors, associated with a state of the
 * Context.
 */
class StartingPhase extends State
{
  public dice( playerId: string ): GameResponse {
    console.log('🏁🎲StartingPhase:dice: handles diceRequest.');
    const p = this.state.getPlayerById(playerId);
    if(p === undefined) {
      throw new Error(`Unknown playerId: ${playerId}`);
    }
    const roll: GameResponse = rollDice(p);
    if(this.state.hasRolledBothDices(p) && roll.value) {
      console.log(`🏁🎲StartingPhase:dice: ${p.playerId} rolled both dices and got a total of ${p.firstDice + p.secondDice}`);
      this.state.getStartingRolls().set(playerId, p.firstDice + p.secondDice);
      this.state.setCurrentTurnIndex(undefined);
      return { value: null,
        message: funnyLogs(p.playerId, p.firstDice + p.secondDice) }
    }
    return { value: roll.value, message: roll.message }
  }

  public build(): GameResponse {
    console.log('🏁🔨StartingPhase:build: handles buildRequest.');
    return { value: null, message: `🏁🔨StartingPhase:build: action forbidden during this phase.`}
  }

  public computeTurnOrder() {
    const rolls = this.state.getStartingRolls();

    // 1. Tout le monde doit avoir lancé
    const size: number = this.state.getPlayers().size;
    if (rolls.size !== size) {
      throw new Error(`🏁StartingPhase:computeTurnOrder: Waiting for ${size - rolls.size} player(s) to roll`);
    }

    const entries = Array.from(rolls.entries());
    const pending = entries.filter(([, value]) => value === null);
    if (pending.length > 0) {
      throw new Error(
        `🏁StartingPhase:computeTurnOrder: Players who haven't rolled: ${pending.map(([id]) => id).join(', ')}`
      );
    }

    // 2. Tri décroissant. sort() est stable : à valeur égale,
    //    l'ordre d'insertion (= ordre des sièges) est conservé.
    entries.sort(([, a], [, b]) => (b as number) - (a as number));
    this.state.setTurnOrder(entries.map(([playerId]) => playerId));
  }

  public phaseCheck(): void {
    try {
      this.computeTurnOrder();
    } catch(error) {
      console.log('🏁🔎StartingPhase:phaseCheck: ' + error);
      return;
    }
    this.state.resetAllDices();
    const p = this.state.getCurrentPlayer();
    if (p) {
      console.log(`🏁🔎StartingPhase:phaseCheck: everybody is ready and ${p.playerId} is starting!`);
    }
    this.state.transitionTo(new RessourcePhase);
  }
}

class RessourcePhase extends State
{
  public dice( playerId: string ): GameResponse {

    console.log('🪵🎲RessourcePhase:dice: handles diceRequest.');
    const p = this.state.isPlayersTurn(playerId);
    if(!p) {
      return { value: null, message: "It's not your turn !" };
    }
    const roll: GameResponse = rollDice(p);
    if(this.state.hasRolledBothDices(p) && roll.value) {
      console.log(`🪵🎲RessourcePhase:dice: ${p.playerId} rolled both dices and got a total of ${p.firstDice + p.secondDice}`);
       // Todo 🚩
      // - collect ressources
      //this.state.resetDices(p); //⚠️ HARDCODED: dont reset here? (dispatch ressources before)
      this.state.setCurrentTurnIndex(undefined);
      this.state.setTurnCount(undefined);
      return { value: null,
        message: funnyLogs(p.playerId, p.firstDice + p.secondDice) }
    }
    return { value: roll.value, message: roll.message }
  }

  public build(): GameResponse {
    console.log('🪵🔨RessourcePhase:build: handles buildRequest.');
    return { value: null, message: `🪵RessourcePhase:build: action forbidden during this phase.`}
  }

  public phaseCheck(): void {
    if(this.state.getTurnCount() !== this.state.getPlayers().size) {
      console.log(`🪵🔎RessourcePhase:phaseCheck: some player didn't't played yet. (turn count: ${this.state.getTurnCount()})`);
      return;
    }
    this.state.setCurrentTurnIndex(0);
    this.state.setTurnCount(0);
    this.state.resetAllDices();
    console.log('🪵🔎RessourcePhase:phaseCheck: everybody is ready!');
    this.state.transitionTo(new TradeAndBuildPhase);
  }
}

class TradeAndBuildPhase extends State
{
  public build( playerId: string ): GameResponse {
    console.log('🤝🔨TradeAndBuildPhase:build: handles buildRequest.');
    const p = this.state.isPlayersTurn(playerId);
    if(!p) {
      return { value: null, message: "🤝🔨TradeAndBuildPhase:build: It's not your turn !" };
    }
    console.log(`🤝🔨TradeAndBuildPhase:build: ${playerId} built something ...`);
    this.state.setCurrentTurnIndex(undefined);
    this.state.setTurnCount(undefined);
    return { value: null, message: `🤝🔨TradeAndBuildPhase:build: not handled for the moment...`}
  }

  public dice(): { value: number | null, message: string | null } {
    console.log('🤝🎲TradeAndBuildPhase:dice: handles diceRequest.');
    return { value: null, message: `🤝🎲TradeAndBuildPhase:dice: action forbidden during this phase.`}
  }

  public phaseCheck(): void {
    if(this.state.getTurnCount() !== this.state.getPlayers().size) {
      console.log(`🤝🔎TradeAndBuildPhase:phaseCheck: some player didn't't played yet. (turn count: ${this.state.getTurnCount()})`);
      return;
    }
    this.state.setCurrentTurnIndex(0);
    this.state.setTurnCount(0);
    console.log('🤝🔎TradeAndBuildPhase:phaseCheck: everybody is ready!');
    this.state.transitionTo(new RessourcePhase);
  }
}

export { GameStateContext, StartingPhase, RessourcePhase, TradeAndBuildPhase }
