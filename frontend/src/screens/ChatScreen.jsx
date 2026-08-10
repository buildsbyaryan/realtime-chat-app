import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";

import ChatInput from "../components/ChatInput";
import MessageBubble from "../components/MessageBubble";

import { getMessages } from "../services/api";

const ChatScreen = ({ route }) => {
  const { username } = route.params;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    try {
      setLoading(true);

      const response = await getMessages();

      setMessages(response.data || []);
    } catch (error) {
      Alert.alert("Error", "Unable to load chat history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSend = async (message) => {
    console.log("Message:", message);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Chat</Text>

          <Text style={styles.username}>{username}</Text>
        </View>

        <View style={styles.online}>
          <View style={styles.dot} />
          <Text>Online</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MessageBubble item={item} currentUsername={username} />
        )}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No messages yet</Text> : null
        }
      />

      <ChatInput onSend={handleSend} />
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  header: {
    padding: 18,
    paddingTop: 50,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  username: {
    color: "#666",
    marginTop: 3,
  },

  online: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "green",
  },

  messageList: {
    padding: 15,
    flexGrow: 1,
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
  },
});
