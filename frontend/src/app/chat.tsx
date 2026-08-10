import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useLocalSearchParams } from "expo-router";

import ChatInput from "../components/ChatInput";
import MessageBubble from "../components/MessageBubble";

import { getMessages } from "../services/api";

import socket, {
  connectSocket,
  disconnectSocket,
  joinChat,
  messageDelivered,
  messageRead,
  onMessageError,
  onOnlineUsers,
  onReceiveMessage,
  onSocketConnectError,
  onSocketError,
  onUserJoined,
  onUserLeft,
  onUserStoppedTyping,
  onUserTyping,
  removeSocketListeners,
  sendSocketMessage,
  startTyping,
  stopTyping,
} from "../services/socket";

export default function ChatScreen() {
  const params = useLocalSearchParams();

  const username = String(params.username || "");

  const [messages, setMessages] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [isConnected, setIsConnected] = useState(false);

  const [typingUser, setTypingUser] = useState("");

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const [errorMessage, setErrorMessage] = useState("");

  const [showUsers, setShowUsers] = useState(false);

  const flatListRef = useRef<FlatList<any>>(null);

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --------------------------------
  // LOAD HISTORY
  // --------------------------------

  const loadMessages = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const response = await getMessages();

      const loadedMessages = Array.isArray(response?.data) ? response.data : [];

      setMessages(loadedMessages);
    } catch (error: any) {
      console.error("History error:", error);

      setErrorMessage(error?.message || "Unable to load messages");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --------------------------------
  // SOCKET
  // --------------------------------

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    loadMessages();

    connectSocket();

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);

      setIsConnected(true);
      setErrorMessage("");

      joinChat(username);
    };

    const handleDisconnect = (reason: string) => {
      console.log("Socket disconnected:", reason);

      setIsConnected(false);
    };

    socket.on("connect", handleConnect);

    socket.on("disconnect", handleDisconnect);

    // --------------------------------
    // NEW MESSAGE
    // --------------------------------

    onReceiveMessage((newMessage) => {
      console.log("New message:", newMessage);

      setMessages((previousMessages) => {
        const exists = previousMessages.some(
          (message) => String(message?._id) === String(newMessage?._id),
        );

        if (exists) {
          return previousMessages;
        }

        return [...previousMessages, newMessage];
      });

      // Automatically mark received
      // messages as delivered/read.

      if (newMessage?._id && newMessage?.username !== username) {
        messageDelivered(newMessage._id);

        messageRead(newMessage._id);
      }
    });

    // --------------------------------
    // ONLINE USERS
    // --------------------------------

    onOnlineUsers((users) => {
      setOnlineUsers(Array.isArray(users) ? users : []);
    });

    // --------------------------------
    // USER JOINED
    // --------------------------------

    onUserJoined((data) => {
      console.log("User joined:", data?.username);
    });

    // --------------------------------
    // USER LEFT
    // --------------------------------

    onUserLeft((data) => {
      console.log("User left:", data?.username);

      if (data?.username === typingUser) {
        setTypingUser("");
      }
    });

    // --------------------------------
    // TYPING
    // --------------------------------

    onUserTyping((data) => {
      if (data?.username && data.username !== username) {
        setTypingUser(`${data.username} is typing...`);
      }
    });

    onUserStoppedTyping((data) => {
      if (!data?.username || data.username !== username) {
        setTypingUser("");
      }
    });

    // --------------------------------
    // MESSAGE ERROR
    // --------------------------------

    onMessageError((data) => {
      Alert.alert("Message Error", data?.message || "Failed to send message");
    });

    // --------------------------------
    // SOCKET ERROR
    // --------------------------------

    onSocketError((data) => {
      setIsConnected(false);

      setErrorMessage(data?.message || "Socket error occurred");
    });

    // --------------------------------
    // CONNECTION ERROR
    // --------------------------------

    onSocketConnectError((error) => {
      console.error("Connection error:", error);

      setIsConnected(false);

      setErrorMessage("Unable to connect to chat server");
    });

    // --------------------------------
    // MESSAGE STATUS UPDATE
    // --------------------------------

    const handleStatusUpdate = (data: {
      messageId: string;
      status: "sent" | "delivered" | "read";
    }) => {
      setMessages((previousMessages) =>
        previousMessages.map((message) =>
          String(message?._id) === String(data.messageId)
            ? {
                ...message,
                status: data.status,
              }
            : message,
        ),
      );
    };

    socket.on("message_status_updated", handleStatusUpdate);

    // --------------------------------
    // CLEANUP
    // --------------------------------

    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      socket.off("connect", handleConnect);

      socket.off("disconnect", handleDisconnect);

      socket.off("message_status_updated", handleStatusUpdate);

      removeSocketListeners();

      disconnectSocket();
    };
  }, [username]);

  // --------------------------------
  // SEND
  // --------------------------------

  const handleSend = (message: string) => {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return;
    }

    if (!isConnected) {
      Alert.alert("Offline", "You are not connected to the server.");

      return;
    }

    if (cleanMessage.length > 500) {
      Alert.alert("Message too long", "Maximum 500 characters allowed.");

      return;
    }

    stopTyping(username);

    sendSocketMessage(username, cleanMessage);
  };

  // --------------------------------
  // TYPING
  // --------------------------------

  const handleTyping = () => {
    if (!username || !isConnected) {
      return;
    }

    startTyping(username);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      stopTyping(username);
    }, 1200);
  };

  // --------------------------------
  // AUTO SCROLL
  // --------------------------------

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [messages]);

  // --------------------------------
  // REFRESH
  // --------------------------------

  const handleRefresh = () => {
    loadMessages(true);
  };

  // --------------------------------
  // INVALID USER
  // --------------------------------

  if (!username) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Invalid username</Text>

        <Text style={styles.errorText}>
          Please go back and enter a username.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Real-Time Chat</Text>

          <Text style={styles.headerUsername}>{username}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowUsers(!showUsers)}
            style={styles.usersButton}
          >
            <Text style={styles.usersButtonText}>👥 {onlineUsers.length}</Text>
          </TouchableOpacity>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isConnected ? "#22C55E" : "#9CA3AF",
                },
              ]}
            />

            <Text style={styles.statusText}>
              {isConnected ? "Online" : "Offline"}
            </Text>
          </View>
        </View>
      </View>

      {/* ONLINE USERS */}

      {showUsers && (
        <View style={styles.onlineUsersBox}>
          <Text style={styles.onlineTitle}>Online Users</Text>

          {onlineUsers.length === 0 ? (
            <Text style={styles.noUsers}>No users online</Text>
          ) : (
            onlineUsers.map((user) => (
              <View key={user} style={styles.userRow}>
                <View style={styles.greenDot} />

                <Text style={styles.userName}>
                  {user}
                  {user === username && " (You)"}
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* ERROR */}

      {errorMessage !== "" && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
        </View>
      )}

      {/* TYPING */}

      {typingUser !== "" && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{typingUser}</Text>
        </View>
      )}

      {/* MESSAGES */}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) =>
            String(item?._id || `${item?.createdAt}-${index}`)
          }
          renderItem={({ item }) => (
            <MessageBubble item={item} currentUsername={username} />
          )}
          contentContainerStyle={[
            styles.messageList,
            messages.length === 0 && styles.emptyList,
          ]}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No messages yet</Text>

              <Text style={styles.emptyText}>
                Start the conversation by sending a message.
              </Text>
            </View>
          }
        />
      )}

      {/* INPUT */}

      <ChatInput onSend={handleSend} onTyping={handleTyping} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  headerUsername: {
    marginTop: 3,
    fontSize: 14,
    color: "#6B7280",
  },

  headerRight: {
    alignItems: "flex-end",
  },

  usersButton: {
    marginBottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },

  usersButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 5,
  },

  statusText: {
    fontSize: 11,
    color: "#6B7280",
  },

  onlineUsersBox: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  onlineTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },

  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 8,
  },

  userName: {
    fontSize: 13,
    color: "#374151",
  },

  noUsers: {
    color: "#9CA3AF",
    fontSize: 13,
  },

  errorBanner: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    backgroundColor: "#FEE2E2",
  },

  errorBannerText: {
    color: "#B91C1C",
    fontSize: 13,
  },

  typingContainer: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },

  typingText: {
    color: "#6B7280",
    fontStyle: "italic",
    fontSize: 13,
  },

  messageList: {
    padding: 15,
    paddingBottom: 10,
  },

  emptyList: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingText: {
    marginTop: 10,
    color: "#6B7280",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },

  errorText: {
    color: "#6B7280",
    textAlign: "center",
  },
});
