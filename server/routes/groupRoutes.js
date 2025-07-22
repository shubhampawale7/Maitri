import express from "express";
import multer from "multer";
import {
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from "../controllers/groupController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.route("/").post(protect, createGroupChat);
router.put("/rename", protect, upload.single("groupIcon"), renameGroup);
router.put("/add", protect, addToGroup);
router.put("/remove", protect, removeFromGroup);

export default router;
