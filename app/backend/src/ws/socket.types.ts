import type { Namespace, Socket, DefaultEventsMap } from 'socket.io';

export interface SocketUser {
  id: string;
  username: string;
}

interface SocketData {
  user: SocketUser;
}

export type SocketServer = Namespace<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;
export type SocketClient = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;
