import { userSocketMap, getReceiverSocketId, io } from "./socket.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
      userSocketMap.set(userId, socket.id);
    }

    io.emit("get-online-users", Array.from(userSocketMap.keys()));

    socket.on("startTyping", ({ receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit("typing");
    });

    socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit("stopTyping");
    });

    // Listener for real-time "seen" updates
    socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
      try {
        await Message.updateMany(
          { conversationId: conversationId, senderId: userId, seen: false },
          { $set: { seen: true } }
        );

        const senderSocketId = getReceiverSocketId(userId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesSeen", { conversationId });
        }
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log(`🔥 Client disconnected: ${socket.id}`);
      let userToRemove;
      for (let [uid, sid] of userSocketMap.entries()) {
        if (sid === socket.id) {
          userToRemove = uid;
          break;
        }
      }
      if (userToRemove) {
        userSocketMap.delete(userToRemove);
        try {
          await User.findByIdAndUpdate(userToRemove, { lastSeen: new Date() });
        } catch (error) {
          console.error("Error updating lastSeen on disconnect:", error);
        }
      }
      io.emit("get-online-users", Array.from(userSocketMap.keys()));
    });
  });
};

export default initializeSocket;
