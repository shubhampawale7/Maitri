import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import cloudinary from "../config/cloudinary.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { conversationId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    let mediaUrl = "";
    let messageType = "text";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
      });
      mediaUrl = result.secure_url;
      messageType = result.resource_type === "video" ? "video" : "image";
    }

    const newMessage = new Message({
      senderId,
      conversationId,
      message,
      messageType,
      mediaUrl,
    });

    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "username profilePicture"
    );

    conversation.participants.forEach((participantId) => {
      if (participantId.toString() === senderId.toString()) return;
      const participantSocketId = getReceiverSocketId(participantId.toString());
      if (participantSocketId) {
        io.to(participantSocketId).emit("newMessage", populatedMessage);
      }
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendMessage: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId).populate({
      path: "messages",
      populate: { path: "senderId", select: "username profilePicture" },
    });

    if (!conversation) return res.status(200).json([]);
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "User not authorized" });
    }

    await Message.updateMany(
      {
        conversationId: conversationId,
        senderId: { $ne: userId },
        seen: false,
      },
      { $set: { seen: true } }
    );

    const otherParticipants = conversation.participants.filter(
      (p) => p.toString() !== userId.toString()
    );
    otherParticipants.forEach((participantId) => {
      const socketId = getReceiverSocketId(participantId.toString());
      if (socketId) {
        io.to(socketId).emit("messagesSeen", { conversationId });
      }
    });

    res.status(200).json(conversation.messages);
  } catch (error) {
    console.error("Error in getMessages: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    if (message.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this message" });
    }
    message.message = "This message was deleted";
    message.messageType = "deleted";
    message.mediaUrl = "";
    await message.save();
    const conversation = await Conversation.findById(message.conversationId);
    conversation.participants.forEach((participantId) => {
      const socketId = getReceiverSocketId(participantId.toString());
      if (socketId) {
        io.to(socketId).emit("messageDeleted", {
          conversationId: message.conversationId,
          messageId: message._id,
        });
      }
    });
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
