import express from "express";
import multer from "multer";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUsers,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single("profilePicture"), updateUserProfile);

// The '/keys' route has been removed.

router.route("/").post(registerUser).get(protect, getUsers);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
