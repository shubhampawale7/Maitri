import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";

// Import our custom-configured server, app, and io instances
import { app, httpServer } from "./socket/socket.js";

// Import other modules
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

// ✅ Fix CORS setup
const allowedOrigins = [
  "https://maitri-blond.vercel.app",
  "http://localhost:5173", // for dev
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ required to allow cookies
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/stories", storyRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Maitri API is running successfully!");
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
