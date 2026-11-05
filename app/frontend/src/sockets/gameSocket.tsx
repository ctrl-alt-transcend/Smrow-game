import { io } from 'socket.io-client';

export const gameSocket = io({path: '/ws/game', autoConnect: false, auth: (cb ) => cb({ token: localStorage.getItem('access_token') ?? '' }), });

