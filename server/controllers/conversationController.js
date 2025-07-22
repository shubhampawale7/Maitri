import Conversation from "../models/Conversation.js";

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      // The 'publicKey' is no longer populated.
      .populate("participants", "username profilePicture status lastSeen")
      .populate("groupAdmin", "username profilePicture")
      .populate({
        path: "messages",
        select: "message messageType createdAt senderId",
        populate: { path: "senderId", select: "username" },
        options: { sort: { createdAt: -1 }, limit: 1 },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
