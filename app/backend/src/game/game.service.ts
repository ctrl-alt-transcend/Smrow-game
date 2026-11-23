import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { SocketUser } from '../ws/socket.types';
import { StatsService } from '../stats/stats.service';
import { buildGameResult } from './game.result';
import {
  type SettingsData,
  type PlayerProfile,
  type GameList,
  Phase,
} from 'shared';
import {
  GameStateContext,
  PendingPhase,
  type PlayerNotifier,
} from './GameStateContext';
import { SocialGateway } from '../social/social.gateway';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);
  private gameInstances: Map<string, GameStateContext> = new Map();
  private playersMap = new Map<string, string>(); //INFO: link playerId with a gameId
  private notifier: PlayerNotifier = () => {};
  private userIds = new Map<string, string>(); //INFO: link in game playerId (username) with the user ID
  private recordedGames = new Set<string>();

  constructor(
    private readonly statsService: StatsService,
    private readonly socialGateway: SocialGateway,
  ) {}

  /**
   * @brief Save the result of a finished game, only once per game.
   * @details Does nothing while the game has no winner. A failure is logged
   *          and never interrupts the game.
   */
  async recordResultIfOver(game: GameStateContext): Promise<void> {
    const gameData = game.getGameData();
    if (!gameData.winner || this.recordedGames.has(gameData.gameId)) return;
    this.recordedGames.add(gameData.gameId);

    const result = buildGameResult(
      gameData,
      this.userIds,
      game.getRoundCount(),
    );
    if (result.players.length === 0) return;
    try {
      await this.statsService.recordGameResult(result);
    } catch (e) {
      this.logger.error(
        `Could not record the result of game ${gameData.gameId}`,
        e instanceof Error ? e.stack : String(e),
      );
    }
  }

  /**
   * @brief Register the callback used by games to notify when a player turn expires
   * @param notifier - Function called by a GameStateContext when its state changes.
   * The game doesn't know who is notified or how, it only decide when.
   * @details Called by GameGateway in afterInit
   */
  setNotifier(notifier: PlayerNotifier) {
    this.notifier = notifier;
  }

  getGamesList(): GameList[] {
    const arrayOfGames = Array.from(this.gameInstances.values());
    return arrayOfGames.map((game: GameStateContext) => ({
      gameId: game.getGameId(),
      playerCount: game.getPlayers().size,
      state: game.getCurrentPhase(),
    }));
  }

  /**
   * @brief Create a new game and add the player to it
   * @param playerId - The user ID of the player to be added to the game
   */
  createGame(playerProfile: PlayerProfile, settings: SettingsData) {
    if (this.playersMap.has(playerProfile.id)) {
      this.logger.debug(`Player ${playerProfile.id} is already in a game`);
      throw new ConflictException(
        `Player with id ${playerProfile.username} is already in a game`,
      );
    }
    const gameId = randomUUID();

    this.gameInstances.set(
      gameId,
      new GameStateContext(
        gameId,
        settings,
        new PendingPhase(),
        (id, username) => this.notifier(id, username),
      ),
    );
    this.addPlayerToGame(gameId, playerProfile);
    this.logger.log(`Game ${gameId}: created`);
  }

  joinGame(playerProfile: PlayerProfile, gameId: string) {
    const game = this.getGameInstanceByGameId(gameId);
    if (!game) {
      this.logger.debug(
        `Player ${playerProfile.id} cannot join game ${gameId}: game doesn't exists`,
      );
      return;
    }
    const playerId = playerProfile.id;

    if (this.playersMap.has(playerProfile.id)) {
      this.logger.debug(
        `Player ${playerId} cannot join game ${gameId}: already in a game`,
      );
      throw new ConflictException(
        `Player with id ${playerProfile.username} is already in a game`,
      );
    }
    if (game.getPlayers().size >= 4) {
      this.logger.debug(`Game ${gameId}: full`);
      throw new ForbiddenException(
        `Player ${playerId} cannot join game with id ${gameId}: is full`,
      );
    }
    if (game.getCurrentPhase() !== 'Pending Player') {
      this.logger.debug(
        `Player ${playerId} cannot join game ${gameId}: already started`,
      );
      throw new ForbiddenException(
        `Game with id ${gameId} has already started`,
      );
    }
    this.addPlayerToGame(gameId, playerProfile);
  }

  removeGameInstance(gameId: string) {
    this.playersMap.forEach((id, userId) => {
      if (id === gameId) this.playersMap.delete(userId);
    });
    this.gameInstances.delete(gameId);
    this.broadcastGameList();
  }

  removePlayerFromGame(user: SocketUser, gameId: string) {
    this.playersMap.delete(user.id);
    const game = this.getGameInstanceByGameId(gameId);
    if (!game) return;
    game.removePlayer(user.username);
    if (
      game.getPlayers().size === 0 &&
      game.getCurrentPhase() === Phase.PENDING
    ) {
      this.gameInstances.delete(gameId);
      this.logger.log(
        `Game ${gameId}: no player left in lobby creation, instance removed`,
      );
    }
    this.broadcastGameList();
    this.logger.log(`Game ${gameId}: player ${user.username} removed`);
  }

  /**
   * @brief Find the game associated with a given player ID
   * @param playerId - The user ID of the player
   * @returns the Gamestate instance in which the player is located
   */
  getGameInstanceByUserId(playerId: string): GameStateContext | undefined {
    const gameId = this.playersMap.get(playerId);
    if (!gameId) {
      this.logger.debug(`Player ${playerId} is not in a game`);
      return undefined;
    }
    return this.getGameInstanceByGameId(gameId);
  }

  getGameInstanceByGameId(gameId: string): GameStateContext | undefined {
    const game = this.gameInstances.get(gameId);
    if (!game) {
      this.logger.debug(`Game ${gameId} doesn't exist`);
      return undefined;
    }
    return game;
  }

  getGameId(playerId: string): string {
    const gameId = this.playersMap.get(playerId);
    if (!gameId) {
      this.logger.debug(`Player ${playerId} is not in a game`);
      throw new NotFoundException(
        `Player with id ${playerId} is not in a game`,
      );
    }
    return gameId;
  }

  /**
   * @brief Create a new instance of the Player class, initialise it and add it to both maps
   * @param gameId - The ID of the game to which the player will be added
   * @param playerId - The user ID of the player to be added to the game
   * @warning You need to check if the palyer is already in a game before calling this function
   */
  private addPlayerToGame(gameId: string, playerProfile: PlayerProfile) {
    const game = this.getGameInstanceByGameId(gameId);
    if (!game) return;
    this.playersMap.set(playerProfile.id, gameId);
    this.userIds.set(playerProfile.username, playerProfile.id);
    game
      .getPlayers()
      .set(
        playerProfile.username,
        game.initPlayer(playerProfile.id, playerProfile.username),
      );
    this.logger.log(`Game ${gameId}: player ${playerProfile.username} joined`);
    this.broadcastGameList();
  }
  private broadcastGameList() {
    this.socialGateway.handleGameList(this.getGamesList());
  }
}
