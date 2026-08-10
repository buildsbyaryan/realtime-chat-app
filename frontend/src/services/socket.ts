import { io, Socket } from "socket.io-client";

const SOCKET_URL =
   "https://realtime-chat-app-4ne6.onrender.com";

const socket: Socket =
  io(SOCKET_URL, {
    autoConnect: false,

    transports: [
      "websocket",
    ],
  });

// --------------------------------
// CONNECT
// --------------------------------

export const connectSocket =
  () => {
    if (!socket.connected) {
      socket.connect();
    }
  };

// --------------------------------
// DISCONNECT
// --------------------------------

export const disconnectSocket =
  () => {
    if (socket.connected) {
      socket.disconnect();
    }
  };

// --------------------------------
// JOIN CHAT
// --------------------------------

export const joinChat = (
  username: string
) => {
  socket.emit(
    "join_chat",
    username
  );
};

// --------------------------------
// SEND MESSAGE
// --------------------------------

export const sendSocketMessage = (
  username: string,
  message: string
) => {
  socket.emit(
    "send_message",
    {
      username,
      message,
    }
  );
};

// --------------------------------
// TYPING START
// --------------------------------

export const startTyping = (
  username: string
) => {
  socket.emit(
    "typing_start",
    username
  );
};

// --------------------------------
// TYPING STOP
// --------------------------------

export const stopTyping = (
  username: string
) => {
  socket.emit(
    "typing_stop",
    username
  );
};

// --------------------------------
// MESSAGE DELIVERED
// --------------------------------

export const messageDelivered = (
  messageId: string
) => {
  socket.emit(
    "message_delivered",
    messageId
  );
};

// --------------------------------
// MESSAGE READ
// --------------------------------

export const messageRead = (
  messageId: string
) => {
  socket.emit(
    "message_read",
    messageId
  );
};

// --------------------------------
// RECEIVE MESSAGE
// --------------------------------

export const onReceiveMessage =
  (
    callback: (
      message: any
    ) => void
  ) => {
    socket.on(
      "receive_message",
      callback
    );
  };

// --------------------------------
// ONLINE USERS
// --------------------------------

export const onOnlineUsers =
  (
    callback: (
      users: string[]
    ) => void
  ) => {
    socket.on(
      "online_users",
      callback
    );
  };

// --------------------------------
// USER JOINED
// --------------------------------

export const onUserJoined =
  (
    callback: (
      data: any
    ) => void
  ) => {
    socket.on(
      "user_joined",
      callback
    );
  };

// --------------------------------
// USER LEFT
// --------------------------------

export const onUserLeft =
  (
    callback: (
      data: any
    ) => void
  ) => {
    socket.on(
      "user_left",
      callback
    );
  };

// --------------------------------
// USER TYPING
// --------------------------------

export const onUserTyping =
  (
    callback: (
      data: any
    ) => void
  ) => {
    socket.on(
      "user_typing",
      callback
    );
  };

// --------------------------------
// USER STOPPED TYPING
// --------------------------------

export const onUserStoppedTyping =
  (
    callback: (
      data: any
    ) => void
  ) => {
    socket.on(
      "user_stopped_typing",
      callback
    );
  };

// --------------------------------
// MESSAGE ERROR
// --------------------------------

export const onMessageError =
  (
    callback: (
      data: any
    ) => void
  ) => {
    socket.on(
      "message_error",
      callback
    );
  };

// --------------------------------
// SOCKET ERROR
// --------------------------------

export const onSocketError =
  (
    callback: (
      data: any
    ) => void
  ) => {
    socket.on(
      "socket_error",
      callback
    );
  };

// --------------------------------
// CONNECTION ERROR
// --------------------------------

export const onSocketConnectError =
  (
    callback: (
      error: any
    ) => void
  ) => {
    socket.on(
      "connect_error",
      callback
    );
  };

// --------------------------------
// REMOVE LISTENERS
// --------------------------------

export const removeSocketListeners =
  () => {
    socket.removeAllListeners(
      "receive_message"
    );

    socket.removeAllListeners(
      "online_users"
    );

    socket.removeAllListeners(
      "user_joined"
    );

    socket.removeAllListeners(
      "user_left"
    );

    socket.removeAllListeners(
      "user_typing"
    );

    socket.removeAllListeners(
      "user_stopped_typing"
    );

    socket.removeAllListeners(
      "message_error"
    );

    socket.removeAllListeners(
      "socket_error"
    );

    socket.removeAllListeners(
      "connect_error"
    );
  };

export default socket;