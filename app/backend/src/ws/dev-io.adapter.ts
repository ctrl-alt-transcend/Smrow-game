import { IoAdapter } from '@nestjs/platform-socket.io';
import type { Server, ServerOptions } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

/**
 * @brief Socket.io adapter used in development only.
 * @details Nest calls createIOServer once per path: every namespace sharing
 *          that path (game, social) is visible in the admin UI.
 */
export class DevIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: ['https://admin.socket.io'],
        credentials: true,
      },
    }) as Server;
    instrument(server, { auth: false, mode: 'development' });
    return server;
  }
}
