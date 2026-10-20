import { Public } from 'generated/prisma/runtime/client';
import type {
  Player
} from '../../shared/game/game.types';

// State design pattern
/**
 * The Context defines the interface of interest to clients. It also maintains a
 * reference to an instance of a State subclass, which represents the current
 * state of the Context.
 */
class GamePhaseContext {
   /** @type {BasePhase} A reference to the current state of the Context. */
  private state: BasePhase;

  constructor( state: BasePhase ) {
    this.transitionTo(state);
  }

  /** The Context allows changing the State object at runtime. */
  public transitionTo( newState: BasePhase ): void {
    console.log(`GamePhase: transition to ${(<any>newState).constructor.name}.`);
    this.state = newState
    this.state.setGamePhase(this);
  }

  /** The Context delegates part of its behavior to the current State object. */
  public request1(any: any): void {
      this.state.handle1(any);
  }
  public request2(): void {
      this.state.handle2();
  }
}

/**
 * The base State class declares methods that all Concrete State should
 * implement and also provides a backreference to the Context object, associated
 * with the State. This backreference can be used by States to transition the
 * Context to another State.
 */
abstract class  BasePhase {
  protected gamephase: GamePhaseContext;
  protected ready: boolean = false;

  public  setGamePhase( newGamephase: GamePhaseContext ) {
    this.gamephase = newGamephase;
  }
  public abstract handle1(any: any): void;
  public abstract handle2(): void;
}

// Concrete game loop phases
/**
 * Concrete States implement various behaviors, associated with a state of the
 * Context.
 */
class StartingPhase extends BasePhase {
  //private diceRolls: Map<Player.id, Player.firstDice>

  public handle1(p: Player): void {
      console.log('StartingPhase handles request1.');

  }

  public handle2(): void {
      console.log('StartingPhase handles request2.');
      if(this.ready){
        console.log('StartingPhase wants to change the state of the context.');
        this.gamephase.transitionTo(new RessourcePhase());
      }
      else
        console.log('StartingPhase not ready to change state');
  }
}

class RessourcePhase extends BasePhase {
  public handle1(): void {
      console.log('RessourcePhase handles request1.');
  }

  public handle2(): void {
      console.log('RessourcePhase handles request2.');
      console.log('RessourcePhase wants to change the state of the context.');
      this.gamephase.transitionTo(new TradeAndBuildPhase());
  }
}

class TradeAndBuildPhase extends BasePhase {
  public handle1(): void {
      console.log('TradeAndBuildPhase handles request1.');
  }

  public handle2(): void {
      console.log('TradeAndBuildPhase handles request2.');
      console.log('TradeAndBuildPhase wants to change the state of the context.');
      this.gamephase.transitionTo(new RessourcePhase());
  }
}

// Test
//const game = new GamePhase(new StartingPhase());
//game.request1();
//game.request2();
//game.request2();

export { GamePhaseContext, StartingPhase, RessourcePhase, TradeAndBuildPhase }
