import { useAuthStore } from '@/stores/useAuthStore';
import { io, Socket } from 'socket.io-client';

// Socket.IO connect tới GỐC server (không có /api).
// Ưu tiên SOCKET_URL; nếu thiếu thì suy ra từ API URL bằng cách bỏ đuôi /api.
const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ??
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ??
  '';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    autoConnect: false,
    // RN nên ép websocket; nếu server còn fallback polling thì thêm 'polling'.
    transports: ['websocket'],
    auth: { token: useAuthStore.getState().accessToken },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  if (__DEV__) {
    socket.on('connect', () => console.log('[socket] connected', socket?.id));
    socket.on('disconnect', (reason) => console.log('[socket] disconnected', reason));
    socket.on('connect_error', (err) => console.log('[socket] connect_error', err.message));
  }

  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  // luôn gắn token mới nhất trước khi connect (token có thể đã refresh)
  s.auth = { token: useAuthStore.getState().accessToken };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  socket?.disconnect();
}
