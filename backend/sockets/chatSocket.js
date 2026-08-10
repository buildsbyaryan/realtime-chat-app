const Message = require("../models/Message");

const setupChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(
      "Socket connected:",
      socket.id
    );

    // -----------------------------
    // JOIN CHAT
    // -----------------------------

    socket.on(
      "join_chat",
      (username) => {
        if (
          typeof username !== "string" ||
          !username.trim()
        ) {
          socket.emit("socket_error", {
            message:
              "Invalid username",
          });

          return;
        }

        const cleanUsername =
          username.trim();

        socket.username =
          cleanUsername;

        console.log(
          `${cleanUsername} joined the chat`
        );

        socket.broadcast.emit(
          "user_joined",
          {
            username:
              cleanUsername,
          }
        );
      }
    );

    // -----------------------------
    // TYPING
    // -----------------------------

    socket.on(
      "typing",
      (username) => {
        if (
          typeof username !==
          "string"
        ) {
          return;
        }

        socket.broadcast.emit(
          "user_typing",
          {
            username:
              username.trim(),
          }
        );
      }
    );

    // -----------------------------
    // STOP TYPING
    // -----------------------------

    socket.on(
      "stop_typing",
      (username) => {
        if (
          typeof username !==
          "string"
        ) {
          return;
        }

        socket.broadcast.emit(
          "user_stopped_typing",
          {
            username:
              username.trim(),
          }
        );
      }
    );

    // -----------------------------
    // SEND MESSAGE
    // -----------------------------

    socket.on(
      "send_message",
      async (data) => {
        try {
          if (
            !data ||
            typeof data !==
              "object"
          ) {
            socket.emit(
              "message_error",
              {
                message:
                  "Invalid message data",
              }
            );

            return;
          }

          const {
            username,
            message,
          } = data;

          // Username validation
          if (
            typeof username !==
              "string" ||
            !username.trim()
          ) {
            socket.emit(
              "message_error",
              {
                message:
                  "Username is required",
              }
            );

            return;
          }

          // Message validation
          if (
            typeof message !==
              "string" ||
            !message.trim()
          ) {
            socket.emit(
              "message_error",
              {
                message:
                  "Message cannot be empty",
              }
            );

            return;
          }

          const cleanUsername =
            username.trim();

          const cleanMessage =
            message.trim();

          // Username max length
          if (
            cleanUsername.length >
            50
          ) {
            socket.emit(
              "message_error",
              {
                message:
                  "Username cannot exceed 50 characters",
              }
            );

            return;
          }

          // Message max length
          if (
            cleanMessage.length >
            500
          ) {
            socket.emit(
              "message_error",
              {
                message:
                  "Message cannot exceed 500 characters",
              }
            );

            return;
          }

          // Save to MongoDB
          const newMessage =
            await Message.create({
              username:
                cleanUsername,
              message:
                cleanMessage,
            });

          // Stop typing
          socket.broadcast.emit(
            "user_stopped_typing",
            {
              username:
                cleanUsername,
            }
          );

          // Broadcast to everyone
          io.emit(
            "receive_message",
            newMessage
          );
        } catch (error) {
          console.error(
            "Socket message error:",
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

    // -----------------------------
    // DISCONNECT
    // -----------------------------

    socket.on(
      "disconnect",
      (reason) => {
        console.log(
          "Socket disconnected:",
          socket.id,
          reason
        );

        if (socket.username) {
          socket.broadcast.emit(
            "user_left",
            {
              username:
                socket.username,
            }
          );
        }
      }
    );
  });
};

module.exports =
  setupChatSocket;