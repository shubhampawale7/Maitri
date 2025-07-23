import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";

dotenv.config();
const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ CORS Setup
const allowedOrigins = [
  "https://maitri-blond.vercel.app", // Vercel Frontend
  "http://localhost:5173", // Local Vite Dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ Allow sending cookies
  })
);

// ✅ Middleware
app.use(express.json()); // Body parser
app.use(cookieParser()); // Parse cookies

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/groups", groupRoutes);

// ✅ Error Handler Middleware (Optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
