const Message = require(
  "../models/Message"
);

// -----------------------------
// GET MESSAGE HISTORY
// -----------------------------

const getMessages =
  async (req, res) => {
    try {
      const messages =
        await Message.find()
          .sort({
            createdAt: 1,
          })
          .limit(100);

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      console.error(
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch messages",
      });
    }
  };

// -----------------------------
// SEND MESSAGE REST API
// -----------------------------

const sendMessage =
  async (req, res) => {
    try {
      const {
        username,
        message,
      } = req.body;

      if (!username) {
        return res.status(400).json({
          success: false,
          message:
            "Username is required",
        });
      }

      if (!message) {
        return res.status(400).json({
          success: false,
          message:
            "Message is required",
        });
      }

      const cleanUsername =
        username.trim();

      const cleanMessage =
        message.trim();

      if (!cleanMessage) {
        return res.status(400).json({
          success: false,
          message:
            "Message cannot be empty",
        });
      }

      if (
        cleanMessage.length > 500
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Message cannot exceed 500 characters",
        });
      }

      const newMessage =
        await Message.create({
          username:
            cleanUsername,
          message:
            cleanMessage,
        });

      res.status(201).json({
        success: true,
        data: newMessage,
      });
    } catch (error) {
      console.error(
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to send message",
      });
    }
  };

module.exports = {
  getMessages,
  sendMessage,
};