import { useEffect, useRef, useState } from "react";

import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  onSend: (message: string) => void;
  onTyping?: () => void;
}

export default function ChatInput({ onSend, onTyping }: Props) {
  const [message, setMessage] = useState("");

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (text: string) => {
    // Maximum 500 characters
    if (text.length > 500) {
      return;
    }

    setMessage(text);

    // Empty message
    if (!text.trim()) {
      return;
    }

    // Tell parent that user is typing
    onTyping?.();

    // Clear previous timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Reset typing after 1 second
    typingTimeout.current = setTimeout(() => {
      typingTimeout.current = null;
    }, 1000);
  };

  const handleSend = () => {
    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    onSend(trimmed);

    setMessage("");

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);

      typingTimeout.current = null;
    }
  };

  // Cleanup timeout when component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, []);

  const isDisabled = !message.trim();

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={handleChange}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          style={styles.input}
          returnKeyType="default"
          textAlignVertical="top"
        />

        <Text style={styles.counter}>{message.length}/500</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isDisabled && styles.disabledButton]}
        onPress={handleSend}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },

  inputContainer: {
    flex: 1,
    position: "relative",
    marginRight: 10,
  },

  input: {
    minHeight: 45,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 50,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },

  counter: {
    position: "absolute",
    right: 12,
    bottom: 5,
    fontSize: 9,
    color: "#999",
  },

  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },

  disabledButton: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
