import { Injectable } from '@nestjs/common';

@Injectable()
export class GameMasterService {

  greetingsFromGM() {
    return 'Hello, I am the Game Master';
  }

  itsYourTurn() {
    return 'Now it is your turn';
  }
}