import {
  GameData,
  Player,
  GameResponse
} from '../../shared/game/game.types';
import { initPlayer } from './game.utils';

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
  private nPlayers: number = 2; //⚠️ HARDCODED


  constructor( state: State ) {
    this.game = {
    whoPlays: 0,
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
    this.game.whoPlays = 0; //⚠️ HARDCODED: will be init in StartingPhase: starting player defined by highest dice roll
    if (!this.game.player[0]) {
      this.game.player[0] = initPlayer('enriquest');
    }
    if (!this.game.player[1]) {
      this.game.player[1] = initPlayer('spagg');
    }
  }

  /** The Context allows changing the State object at runtime. */
  public transitionTo( newState: State ): void {
    console.log(`GamePhase: transition to ${(<any>newState).constructor.name}.`);
    this.state = newState
    this.state.setGameState(this);
  }

  /** The Context delegates part of its behavior to the current State object. */
  public diceRequest(): GameResponse {
      return this.state.dice();
  }
  public buildRequest(): GameResponse | void {
      return this.state.build();
  }

  /** Getters */
  public  getGameData(): GameData { return this.game; }
  public  getWhoPlays(): Player { return this.game.player[this.game.whoPlays]; }
  public  hasRolledDices(): boolean {
    const p: Player = this.getWhoPlays();
    if (p.firstDice !== 0 && p.secondDice !== 0) { return true; }
    return false;
  }

  /** Setters */
  public  setWhoPlays( player: number | null ) {
    if (player) {
      this.game.whoPlays = player
    }
    else {
      if (this.game.whoPlays + 1 <= this.nPlayers - 1) { this.game.whoPlays++; }
      else { this.game.whoPlays = 0;}
    }
    console.log(`setWhoPlays: it's ${this.game.player[this.game.whoPlays].playerId} turn  now !`);
  }

  public  resetDices() {
    const p: Player = this.getWhoPlays();
    p.firstDice = 0;
    p.secondDice = 0;
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
  protected ready: boolean = false;

  public  setGameState( newGameState: GameStateContext ) {
    this.state = newGameState;
  }
  public abstract dice(): GameResponse;
  public abstract build(): GameResponse | void;
}

// Concrete game loop phases
/**
 * Concrete States implement various behaviors, associated with a state of the
 * Context.
 */
class StartingPhase extends State
{

  public dice(): { value: number | null, message: string | null } {
    console.log('StartingPhase handles diceRequest.');
    let value: null = null;
    let message: string = 'StartingPhase:dice: not handled for the moment...';
    return { value, message };
  }

  public build(): void {
    console.log('StartingPhase handles build.');
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
  public dice(): GameResponse {
    console.log('RessourcePhase handles diceRequest.');
    if(this.state.hasRolledDices()) {
      console.log(`RessourcePhase:dice: player rolled both dices and is now ready, firstDice[${this.state.getWhoPlays().firstDice}], secondDice[${this.state.getWhoPlays().secondDice}]`);
      this.state.resetDices(); //⚠️ HARDCODED: dont reset here? (dispatch ressources before)
      this.state.setWhoPlays(null);
      return { value: null, message: `You already rolled both dices.`}
    }
    return this.rollDice(this.state.getWhoPlays())
  }

  public build(): void {
    console.log('RessourcePhase handles buildRequest.');
    console.log('RessourcePhase wants to change the state of the context.');
    this.state.transitionTo(new TradeAndBuildPhase());
  }

  private rollDice( player: Player ): { value: number | null, message: string | null } {
    let value: number | null = Math.floor(Math.random() * 6) + 1;
    let message: string | null = null;

    if (player.firstDice === 0) {
      player.firstDice = value;
      console.log(`RessourcePhase:rollDice: FIRST dice:${player.playerId}'s rolled [${value}]`);
    }
    else if (player.secondDice === 0) {
      player.secondDice = value;
      console.log(`RessourcePhase:rollDice: SECOND dice:${player.playerId}'s rolled [${value}]`);

    }
    else {
      value = null;
      message = `RessourcePhase:rollDice: You (${player.playerId}) already rolled both dices.`;
    }
    return { value, message };
  }
}

class TradeAndBuildPhase extends State
{
  public dice(): { value: number | null, message: string | null } {
    console.log('TradeAndBuildPhase handles diceRequest.');
    let value: null = null;
    let message: string = 'TradeAndBuildPhase:dice: no dice roll allowed.';
    return { value, message };
  }

  public build(): void {
    console.log('TradeAndBuildPhase handles buildRequest.');
    console.log('TradeAndBuildPhase wants to change the state of the context.');
    this.state.transitionTo(new RessourcePhase());
  }
}

export { GameStateContext, StartingPhase, RessourcePhase, TradeAndBuildPhase }
