import express from "express";
import { getConversations } from "../controllers/conversationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getConversations);

export default router;
