import { Server } from "socket.io";
import http from "http";
import express from "express";
import initializeSocket from "./socketHandler.js";

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initializeSocket(io);

export const userSocketMap = new Map();

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap.get(receiverId);
};

export { app, io, httpServer };
