import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import { app, httpServer } from "./socket/socket.js";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import cors from "cors";

dotenv.config();
connectDB();

// 🌐 CORS Setup with Whitelist
const allowedOrigins = [
  "https://maitri-blond.vercel.app",
  "https://maitri-api.onrender.com",
  "http://localhost:5173", // Keep this for local development
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow mobile apps / curl / Postman
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// 📦 Routes
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/stories", storyRoutes);

// 🚀 Server Start
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
