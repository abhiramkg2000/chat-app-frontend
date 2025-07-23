import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";

  console.log("protocol", protocol);
  if (!socket) {
    socket = io(`${protocol}://localhost:3001`, {
      transports: ["websocket"],
      withCredentials: true,
      reconnectionAttempts: 5,
      // reconnection: true,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
