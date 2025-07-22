import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export const userSocketMap = new Map(); // {userId: socketId}

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap.get(receiverId);
};

export { app, io, httpServer };
