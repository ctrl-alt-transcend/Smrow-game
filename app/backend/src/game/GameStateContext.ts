import { Public } from 'generated/prisma/runtime/client';
import {
  GameData,
  Player,
  GameResponse,
  Score
} from '../../shared/game/game.types';
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
  private   state: State;
  protected game!: GameData;

  constructor( state: State ) {
    this.game = {
      players: new Map<string, Player>(),
      startingRolls: new Map<string, number | null>(),
      turnOrder: [],
      currentTurnIndex: 0,
      gameId: '0101010'
    };
    this.initGameData();
    this.initStartingRolls();
    this.transitionTo(state);
  }

  /** WORK IN PROGRESS: to do:
   * - init every player with their current name
   * - init ressources
   */
  protected initGameData() {
    this.game.players.set('spagg', initPlayer('spagg'));
    this.game.players.set('enriquest', initPlayer('enriquest'));
    //⚠️ ... init from playerId list?
  }

  private initStartingRolls(): void {
    this.game.startingRolls.clear();
    for (const playerId of this.game.players.keys()) {
      this.game.startingRolls.set(playerId, null);
    }
  }

  /** The Context allows changing the State object at runtime. */
  public transitionTo( newState: State ): void {
    console.log(`GamePhase: transition to ${(<any>newState).constructor.name}.`);
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
  public  getPlayers(): Map<string, Player> { return this.game.players; }
  public  getStartingRolls(): Map<string, number | null> { return this.game.startingRolls; }
  public  getCurrentPlayer(): Player { return this.game.players[this.game.turnOrder[this.game.currentTurnIndex]]; }
  public  hasRolledBothDices( p: Player ): boolean {
    if (p.firstDice !== 0 && p.secondDice !== 0) {
      return true;
    }
    return false;
  }

  /** Setters */
  public  setTurnOrder( newTurnOrder: string[] ) { this.game.turnOrder = newTurnOrder; }
  public  resetDices( p: Player ) { p.firstDice = 0; p.secondDice = 0; }
  public  setCurrentTurnIndex( index: number | null ) {
    if(index) {
      this.game.currentTurnIndex = index;
    }
    else if(this.game.currentTurnIndex + 1 ===
      this.game.players.size) {
      this.game.currentTurnIndex = 0;
    }
    else {
      this.game.currentTurnIndex++;
    }
  }


  /** Others */
  public  isPlayersTurn( requestingPlayerId: string ): Player | null {
    if (!this.game.players.has(requestingPlayerId)) {
      return null;;
    }
    const currentPlayer: Player = this.getCurrentPlayer();
    if(currentPlayer.playerId === requestingPlayerId) {
      return currentPlayer;
    }
    return null;;
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
  protected state: GameStateContext;

  public  setGameState( newGameState: GameStateContext ) {
    this.state = newGameState;
  }
  public abstract dice( playerId: string | null ): GameResponse;
  public abstract build(  playerId: string | null ): GameResponse;
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
    console.log('StartingPhase:dice: handles diceRequest.');
    const p: Player | null = this.state.isPlayersTurn(playerId);
    if (!p) {
      throw new Error(`Unknown playerId: ${playerId}`);
    }
    const roll: GameResponse = rollDice(p);
    if(this.state.hasRolledBothDices(p) && roll.value) {
      console.log(`StartingPhase:dice: player rolled both dices and got a total of ${p.firstDice + p.secondDice}`);
      this.state.getStartingRolls().set(playerId, p.firstDice + p.secondDice);
      this.state.setCurrentTurnIndex(null);
      return { value: null,
        message: funnyLogs(p.playerId, p.firstDice + p.secondDice) }
    }
    return { value: null,
      message: `You already rolled both dices (${p.firstDice} and ${p.secondDice})` }
  }

  public build(): GameResponse {
    console.log('StartingPhase:build: handles buildRequest.');
    return { value: null, message: `StartingPhase:build: action forbidden during this phase.`}
  }

  public computeTurnOrder() {
    const rolls = this.state.getStartingRolls();

    // 1. Tout le monde doit avoir lancé
    const size: number = this.state.getPlayers().size;
    if (rolls.size !== size) {
      throw new Error(`Waiting for ${size - rolls.size} player(s) to roll`);
    }

    const entries = Array.from(rolls.entries());
    const pending = entries.filter(([, value]) => value === null);
    if (pending.length > 0) {
      throw new Error(
        `Players who haven't rolled: ${pending.map(([id]) => id).join(', ')}`
      );
    }

    // 2. Tri décroissant. sort() est stable : à valeur égale,
    //    l'ordre d'insertion (= ordre des sièges) est conservé.
    entries.sort(([, a], [, b]) => (b as number) - (a as number));
    this.state.setTurnOrder(entries.map(([playerId]) => playerId));
  }

  public phaseCheck(): void {
    // Todo 🚩
    // - define starting player based on highest dice score
    // - find an efficient way to keep same player order at each turn
    try {
      this.computeTurnOrder();
    } catch(error) {
      console.log('StartingPhase:phaseCheck: ' + error);
      return;
    }
    console.log('StartingPhase:phaseCheck: everybody is ready !');
    console.log(`StartingPhase:phaseCheck: ${this.state.getCurrentPlayer().playerId} is starting !`);
    this.state.transitionTo(new RessourcePhase);
  }
}

class RessourcePhase extends State
{
  public dice( playerId: string ): GameResponse {
    // Todo 🚩
    // - is current player turn check?
    console.log('RessourcePhase:dice: handles diceRequest.');
    if(this.state.hasRolledBothDices(this.state.getCurrentPlayer())) {
      console.log(`RessourcePhase:dice: player rolled both dices and is now ready to collect ressources from terrains #${this.state.getCurrentPlayer().firstDice + this.state.getCurrentPlayer().secondDice}`);
      // Todo 🚩
      // - collect ressources
      this.state.resetDices(this.state.getCurrentPlayer()); //⚠️ HARDCODED: dont reset here? (dispatch ressources before)
      // Todo 🚩
      // - return current player dice rolls
      this.state.setCurrentTurnIndex(null);
      return { value: null, message: `You already rolled both dices.`}
    }
    return rollDice(this.state.getCurrentPlayer())
  }

  public build(): GameResponse {
    console.log('RessourcePhase:build: handles buildRequest.');
    return { value: null, message: `RessourcePhase:build: action forbidden during this phase.`}
  }

  public phaseCheck(): void {
    // Todo 🚩
    // - if everbody played transit to next phase
    console.log('RessourcePhase:phaseCheck: everybody is ready!');
    this.state.transitionTo(new TradeAndBuildPhase);
  }
}

class TradeAndBuildPhase extends State
{
  public build(): GameResponse {
    // Todo 🚩
    // - is current player turn check?
    console.log('TradeAndBuildPhase:build: handles buildRequest.');
    return { value: null, message: `TradeAndBuildPhase:build: not handled for the moment...`}
  }

  public dice( playerId: string ): { value: number | null, message: string | null } {
    console.log('TradeAndBuildPhase:dice: handles diceRequest.');
    return { value: null, message: `TradeAndBuildPhase:dice: action forbidden during this phase.`}
  }

  public phaseCheck(): void {
    // Todo 🚩
    // - if everbody is ready (or played?) transit to next phase
    console.log('TradeAndBuildPhase:phaseCheck: everybody is ready!');
    this.state.transitionTo(new RessourcePhase);
  }
}

export { GameStateContext, StartingPhase, RessourcePhase, TradeAndBuildPhase }
