import express from "express";
import multer from "multer";
import { createStory, getStories } from "../controllers/storyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router
  .route("/")
  .post(protect, upload.single("media"), createStory)
  .get(protect, getStories);

export default router;
