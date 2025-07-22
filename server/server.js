import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";

// Import our custom-configured server, app, and io instances
import { app, httpServer, io } from "./socket/socket.js";

// Import other modules
import connectDB from "./config/db.js";
import initializeSocket from "./socket/socketHandler.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

// Initialize our socket event handlers
initializeSocket(io);

// Middleware setup
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json()); // To parse JSON request bodies
app.use(cookieParser()); // To parse cookies

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/stories", storyRoutes);

// Server port configuration
const PORT = process.env.PORT || 5000;

// Start the server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
