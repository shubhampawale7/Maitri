import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { app, httpServer } from "./socket/socket.js";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";

dotenv.config();
connectDB();

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/stories", storyRoutes);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
