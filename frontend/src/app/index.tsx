import { useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

export default function HomeScreen() {
  const [username, setUsername] = useState("");

  const [focused, setFocused] = useState(false);

  const handleStartChat = () => {
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      Alert.alert("Username required", "Please enter your username.");

      return;
    }

    if (cleanUsername.length < 2) {
      Alert.alert(
        "Invalid username",
        "Username must contain at least 2 characters.",
      );

      return;
    }

    if (cleanUsername.length > 30) {
      Alert.alert("Invalid username", "Username cannot exceed 30 characters.");

      return;
    }

    const validUsername = /^[a-zA-Z0-9_ ]+$/;

    if (!validUsername.test(cleanUsername)) {
      Alert.alert(
        "Invalid username",
        "Use only letters, numbers, spaces and underscore.",
      );

      return;
    }

    router.push({
      pathname: "/chat",
      params: {
        username: cleanUsername,
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        {/* LOGO */}

        <View style={styles.logo}>
          <Text style={styles.logoText}>💬</Text>
        </View>

        {/* TITLE */}

        <Text style={styles.title}>Real-Time Chat</Text>

        <Text style={styles.subtitle}>
          Connect and chat instantly with other users.
        </Text>

        {/* CARD */}

        <View style={styles.card}>
          <Text style={styles.label}>Choose a username</Text>

          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#9CA3AF"
            maxLength={30}
            autoCapitalize="words"
            autoCorrect={false}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={handleStartChat}
            returnKeyType="done"
            style={[styles.input, focused && styles.inputFocused]}
          />

          <Text style={styles.counter}>{username.length}/30</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleStartChat}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Start Chat</Text>

            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* FEATURES */}

        <View style={styles.features}>
          <Feature icon="⚡" text="Instant messaging" />

          <Feature icon="🟢" text="Online status" />

          <Feature icon="⌨️" text="Typing indicator" />
        </View>
      </View>

      <Text style={styles.footer}>Powered by React Native + Socket.io</Text>
    </KeyboardAvoidingView>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureIcon}>{icon}</Text>

      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logo: {
    alignSelf: "center",
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  logoText: {
    fontSize: 38,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },

  inputFocused: {
    borderColor: "#007AFF",
    backgroundColor: "#FFFFFF",
  },

  counter: {
    textAlign: "right",
    marginTop: 5,
    fontSize: 11,
    color: "#9CA3AF",
  },

  button: {
    height: 52,
    marginTop: 15,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 20,
    marginLeft: 8,
  },

  features: {
    marginTop: 25,
    gap: 10,
  },

  feature: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  featureIcon: {
    fontSize: 15,
    marginRight: 7,
  },

  featureText: {
    fontSize: 13,
    color: "#6B7280",
  },

  footer: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 11,
    paddingBottom: 20,
  },
});
