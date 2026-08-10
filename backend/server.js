const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const messageRoutes = require("./routes/messageRoutes");

dotenv.config();

const app = express();

const server = http.createServer(app);

// -----------------------------
// MIDDLEWARE
// -----------------------------

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// -----------------------------
// DATABASE
// -----------------------------

connectDB();

// -----------------------------
// REST API
// -----------------------------

app.use(
  "/api/messages",
  messageRoutes
);

// -----------------------------
// HEALTH CHECK
// -----------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Real-Time Chat API is running",
  });
});

// -----------------------------
// SOCKET.IO
// -----------------------------

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store online users

const onlineUsers = new Map();

// -----------------------------
// SOCKET CONNECTION
// -----------------------------

io.on("connection", (socket) => {
  console.log(
    "Socket connected:",
    socket.id
  );

  // ---------------------------
  // USER JOIN
  // ---------------------------

  socket.on(
    "join_chat",
    (username) => {
      if (
        !username ||
        typeof username !== "string"
      ) {
        return;
      }

      const cleanUsername =
        username.trim();

      if (!cleanUsername) {
        return;
      }

      socket.username =
        cleanUsername;

      onlineUsers.set(
        cleanUsername,
        socket.id
      );

      socket.join("global_chat");

      console.log(
        `${cleanUsername} joined the chat`
      );

      // Send current online users

      io.emit(
        "online_users",
        Array.from(
          onlineUsers.keys()
        )
      );

      // Notify others

      socket.broadcast.emit(
        "user_joined",
        {
          username:
            cleanUsername,
        }
      );
    }
  );

  // ---------------------------
  // SEND MESSAGE
  // ---------------------------

  socket.on(
    "send_message",
    async (data) => {
      try {
        if (!data) {
          return;
        }

        const username =
          String(
            data.username || ""
          ).trim();

        const message =
          String(
            data.message || ""
          ).trim();

        if (!username) {
          socket.emit(
            "message_error",
            {
              message:
                "Username is required",
            }
          );

          return;
        }

        if (!message) {
          socket.emit(
            "message_error",
            {
              message:
                "Message cannot be empty",
            }
          );

          return;
        }

        if (message.length > 500) {
          socket.emit(
            "message_error",
            {
              message:
                "Message cannot exceed 500 characters",
            }
          );

          return;
        }

        const Message = require(
          "./models/Message"
        );

        const newMessage =
          await Message.create({
            username,
            message,
            status: "sent",
          });

        // Broadcast message

        io.to("global_chat").emit(
          "receive_message",
          newMessage
        );
      } catch (error) {
        console.error(
          "Send message error:",
          error
        );

        socket.emit(
          "message_error",
          {
            message:
              "Failed to send message",
          }
        );
      }
    }
  );

  // ---------------------------
  // TYPING START
  // ---------------------------

  socket.on(
    "typing_start",
    (username) => {
      if (!username) {
        return;
      }

      socket.broadcast
        .to("global_chat")
        .emit(
          "user_typing",
          {
            username,
          }
        );
    }
  );

  // ---------------------------
  // TYPING STOP
  // ---------------------------

  socket.on(
    "typing_stop",
    (username) => {
      socket.broadcast
        .to("global_chat")
        .emit(
          "user_stopped_typing",
          {
            username,
          }
        );
    }
  );

  // ---------------------------
  // MESSAGE DELIVERED
  // ---------------------------

  socket.on(
    "message_delivered",
    async (messageId) => {
      try {
        const Message =
          require(
            "./models/Message"
          );

        const updatedMessage =
          await Message.findByIdAndUpdate(
            messageId,
            {
              status: "delivered",
            },
            {
              new: true,
            }
          );

        if (updatedMessage) {
          io.to("global_chat").emit(
            "message_status_updated",
            {
              messageId:
                updatedMessage._id,
              status:
                updatedMessage.status,
            }
          );
        }
      } catch (error) {
        console.error(
          "Delivery status error:",
          error
        );
      }
    }
  );

  // ---------------------------
  // MESSAGE READ
  // ---------------------------

  socket.on(
    "message_read",
    async (messageId) => {
      try {
        const Message =
          require(
            "./models/Message"
          );

        const updatedMessage =
          await Message.findByIdAndUpdate(
            messageId,
            {
              status: "read",
            },
            {
              new: true,
            }
          );

        if (updatedMessage) {
          io.to("global_chat").emit(
            "message_status_updated",
            {
              messageId:
                updatedMessage._id,
              status:
                updatedMessage.status,
            }
          );
        }
      } catch (error) {
        console.error(
          "Read status error:",
          error
        );
      }
    }
  );

  // ---------------------------
  // DISCONNECT
  // ---------------------------

  socket.on(
    "disconnect",
    () => {
      const username =
        socket.username;

      if (username) {
        onlineUsers.delete(
          username
        );

        socket.broadcast.emit(
          "user_left",
          {
            username,
          }
        );

        io.emit(
          "online_users",
          Array.from(
            onlineUsers.keys()
          )
        );

        console.log(
          `${username} disconnected`
        );
      }

      console.log(
        "Socket disconnected:",
        socket.id
      );
    }
  );
});

// -----------------------------
// ERROR HANDLER
// -----------------------------

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(err);

    res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
);

// -----------------------------
// SERVER
// -----------------------------

const PORT =
  process.env.PORT || 5000;

server.listen(
  PORT,
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);