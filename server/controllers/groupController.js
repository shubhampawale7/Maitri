import Conversation from "../models/Conversation.js";
import cloudinary from "../config/cloudinary.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

/**
 * @desc    Create a new group chat
 * @route   POST /api/groups
 * @access  Private
 */
export const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res
      .status(400)
      .json({ message: "Please provide users and a group name." });
  }

  let users = JSON.parse(req.body.users);
  if (users.length < 2) {
    return res.status(400).json({
      message: "More than 2 users are required to form a group chat.",
    });
  }

  users.push(req.user);

  try {
    const groupChat = await Conversation.create({
      groupName: req.body.name,
      participants: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Conversation.findOne({ _id: groupChat._id })
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json(fullGroupChat);
  } catch (error) {
    console.error("Error in createGroupChat controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Rename a group and optionally update its icon
 * @route   PUT /api/groups/rename
 * @access  Private (Admin only)
 */
export const renameGroup = async (req, res) => {
  const { conversationId, groupName } = req.body;
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ message: "Chat not found" });
    if (
      !conversation.groupAdmin ||
      conversation.groupAdmin.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Only the admin can perform this action" });
    }

    conversation.groupName = groupName || conversation.groupName;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      conversation.groupIcon = result.secure_url;
    }

    const updatedChat = await conversation.save();
    const populatedChat = await Conversation.findById(updatedChat._id)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    // --- REAL-TIME LOGIC ---
    populatedChat.participants.forEach((participant) => {
      if (participant._id.toString() !== req.user._id.toString()) {
        const socketId = getReceiverSocketId(participant._id.toString());
        if (socketId) {
          io.to(socketId).emit("groupUpdated", populatedChat);
        }
      }
    });

    res.status(200).json(populatedChat);
  } catch (error) {
    console.error("Error in renameGroup controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Add a user to a group
 * @route   PUT /api/groups/add
 * @access  Private (Admin only)
 */
export const addToGroup = async (req, res) => {
  const { conversationId, userId } = req.body;
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ message: "Chat not found" });
    if (
      !conversation.groupAdmin ||
      conversation.groupAdmin.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Only the admin can add members" });
    }
    if (conversation.participants.includes(userId)) {
      return res.status(400).json({ message: "User is already in the group" });
    }

    conversation.participants.push(userId);
    const updatedChat = await conversation.save();
    const populatedChat = await Conversation.findById(updatedChat._id)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    // --- REAL-TIME LOGIC ---
    populatedChat.participants.forEach((participant) => {
      const socketId = getReceiverSocketId(participant._id.toString());
      if (socketId) {
        io.to(socketId).emit("groupUpdated", populatedChat);
      }
    });

    res.status(200).json(populatedChat);
  } catch (error) {
    console.error("Error in addToGroup controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Remove a user from a group
 * @route   PUT /api/groups/remove
 * @access  Private (Admin only)
 */
export const removeFromGroup = async (req, res) => {
  const { conversationId, userId } = req.body;
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ message: "Chat not found" });
    if (
      !conversation.groupAdmin ||
      conversation.groupAdmin.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Only the admin can remove members" });
    }
    if (req.user._id.toString() === userId) {
      return res
        .status(400)
        .json({ message: "Admin cannot remove themselves" });
    }

    const originalParticipants = [...conversation.participants];
    conversation.participants = conversation.participants.filter(
      (p) => p.toString() !== userId
    );
    const updatedChat = await conversation.save();
    const populatedChat = await Conversation.findById(updatedChat._id)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    // --- REAL-TIME LOGIC ---
    // Notify the remaining members
    populatedChat.participants.forEach((participant) => {
      const socketId = getReceiverSocketId(participant._id.toString());
      if (socketId) {
        io.to(socketId).emit("groupUpdated", populatedChat);
      }
    });

    // Notify the removed member
    const removedUserSocketId = getReceiverSocketId(userId);
    if (removedUserSocketId) {
      io.to(removedUserSocketId).emit("youWereRemoved", {
        conversationId: populatedChat._id,
        groupName: populatedChat.groupName,
      });
    }

    res.status(200).json(populatedChat);
  } catch (error) {
    console.error("Error in removeFromGroup controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};
