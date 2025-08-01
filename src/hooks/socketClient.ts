import { io, Socket } from "socket.io-client";

import { API_URL } from "@/constants/commonConstants";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  // const protocol = window.location.protocol === "https:" ? "wss" : "ws";

  // console.log("protocol", protocol);
  if (!socket) {
    socket = io(`${API_URL}`, {
      transports: ["websocket"],
      withCredentials: true,
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
