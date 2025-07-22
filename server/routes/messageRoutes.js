import express from "express";
import multer from "multer";
import {
  sendMessage,
  getMessages,
  deleteMessage,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/:conversationId", protect, getMessages);
router.post(
  "/send/:conversationId",
  protect,
  upload.single("image"),
  sendMessage
);
router.delete("/:messageId", protect, deleteMessage);

export default router;
