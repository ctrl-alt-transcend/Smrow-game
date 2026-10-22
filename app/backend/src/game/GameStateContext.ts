import {
  GameData,
  Player,
  RollResponse
} from '@shared/game/game.types';
//import { createPlayer } from './game.utils';

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
    this.game = {              // ✅ Création explicite
    currentPlayer: 0,
    player: [],
    gameId: '0101010'
  };
    this.initGameData();
    this.transitionTo(state);
  }

  /** WORK IN PROGRESS: to do:
   * - init every player with their current name
   * - init ressources
   */
  protected initGameData() {
    this.game.currentPlayer = 0; // will be init in StartingPhase: starting player defined by highest dice roll

    if (!this.game.player[0]) {
    this.game.player[0] = {
      playerId: "enriquest", //TODO: change this for id
      username: "enriquest",
      firstDice: 0,
      secondDice: 0,
      score: 0,
      ressources: null,
      settlementsBuilt: 0,
      roadsBuilt: 0,
      level: 1,
      avatarURL: null
    };
  }
  if (!this.game.player[1]) {
    this.game.player[1] = {
      username: "spagg",
      playerId: "spagg", //TODO: change this for id
      firstDice: 0,
      secondDice: 0,
      score: 0,
      ressources: null,
      settlementsBuilt: 0,
      roadsBuilt: 0,
      level: 1,
      avatarURL: null
    };
  }
  }

  /** The Context allows changing the State object at runtime. */
  public transitionTo( newState: State ): void {
    console.log(`GamePhase: transition to ${(<any>newState).constructor.name}.`);
    this.state = newState
    this.state.setGameState(this);
  }

  /** The Context delegates part of its behavior to the current State object. */
  public request1(): RollResponse | any {
      return this.state.play();
  }
  public request2(): void {
      this.state.handle2();
  }

  /** Getters */
  public  getGameData(): GameData { return this.game; }
  //public  getPhase(): typeof GamePhase { return this.game.phase; }
  public  getCurrentPlayer(): Player { return this.game.player[this.game.currentPlayer]; }

  /** Setters */
  //public  setPhase( newPhase: typeof GamePhase ) { this.game.phase = newPhase; }

  /** Checkers */
  public  hasRolledDices(): boolean {
    const p: Player = this.getCurrentPlayer();
    if (p.firstDice && p.secondDice) {
      console.log(`hasRolledDices: ${p.playerId} already rolled both dices !`);
      return true;
    }
    return false;
  }
}

/**
 * The base State class declares methods that all Concrete State should
 * implement and also provides a backreference to the Context object, associated
 * with the State. This backreference can be used by States to transition the
 * Context to another State.
 */
abstract class  State {
  protected state: GameStateContext;
  protected ready: boolean = false;

  public  setGameState( newGameState: GameStateContext ) {
    this.state = newGameState;
  }
  public abstract play(): RollResponse | any;
  public abstract handle2(): void;
}

// Concrete game loop phases
/**
 * Concrete States implement various behaviors, associated with a state of the
 * Context.
 */
class StartingPhase extends State {
  public play(): boolean {
    console.log('StartingPhase handles request1.');
    return true;
  }
  public handle2(): void {
    console.log('StartingPhase handles request2.');
    if(this.ready){
      console.log('StartingPhase wants to change the state of the context.');
      this.state.transitionTo(new RessourcePhase());
    }
    else
      console.log('StartingPhase not ready to change state');
  }
}

class RessourcePhase extends State
{
  public play(): RollResponse {
    if(this.state.hasRolledDices()) {
      console.log('RessourcePhase: player rolled both dices and is now ready.');
    }
    else {
      console.log(`RessourcePhase: ${this.state.getCurrentPlayer().playerId} just rolled a dice`);
    }
    return this.rollDice(this.state.getCurrentPlayer())
  }

  public handle2(): void {
    console.log('RessourcePhase handles request2.');
    console.log('RessourcePhase wants to change the state of the context.');
    this.state.transitionTo(new TradeAndBuildPhase());
  }

  private resetDices( player: Player ) {
    player.firstDice = 0;
    player.secondDice = 0;
  }

  private rollDice( player: Player ): { value: number | null, message: string | null } {
  //private rollDice( player: Player ): RollResponse {
    let value: number | null = Math.floor(Math.random() * 6) + 1;
    let message: string | null = null;

    if (player.firstDice === 0) player.firstDice = value;
    else if (player.secondDice === 0) player.secondDice = value;
    else {
      value = null;
      message = `You(${player.playerId}) already rolled both dices.`;
    }
    return { value, message };
  }
}

class TradeAndBuildPhase extends State {
  public play(): boolean {
    console.log('TradeAndBuildPhase handles request1.');
    return true;
  }

  public handle2(): void {
    console.log('TradeAndBuildPhase handles request2.');
    console.log('TradeAndBuildPhase wants to change the state of the context.');
    this.state.transitionTo(new RessourcePhase());
  }
}

export { GameStateContext, StartingPhase, RessourcePhase, TradeAndBuildPhase }
