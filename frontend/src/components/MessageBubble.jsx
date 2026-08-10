
import { StyleSheet, Text, View } from "react-native";

export default function MessageBubble({ item, currentUsername }) {
  const isMine = item?.username === currentUsername;

  const formatTime = (timestamp) => {
    if (!timestamp) {
      return "";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatus = () => {
    if (!isMine) {
      return "";
    }

    if (item?.status === "read") {
      return "✓✓";
    }

    if (item?.status === "delivered") {
      return "✓✓";
    }

    return "✓";
  };

  return (
    <View
      style={[
        styles.container,
        isMine ? styles.mineContainer : styles.otherContainer,
      ]}
    >
      <View
        style={[styles.bubble, isMine ? styles.mineBubble : styles.otherBubble]}
      >
        {!isMine && (
          <Text style={styles.username}>{item?.username || "User"}</Text>
        )}

        <Text
          style={[
            styles.message,
            isMine ? styles.mineMessage : styles.otherMessage,
          ]}
        >
          {item?.message || ""}
        </Text>

        <View style={styles.meta}>
          <Text
            style={[styles.time, isMine ? styles.mineTime : styles.otherTime]}
          >
            {formatTime(item?.createdAt)}
          </Text>

          {isMine && (
            <Text
              style={[styles.status, item?.status === "read" && styles.read]}
            >
              {getStatus()}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 4,
    flexDirection: "row",
  },

  mineContainer: {
    justifyContent: "flex-end",
  },

  otherContainer: {
    justifyContent: "flex-start",
  },

  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 17,
  },

  mineBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 5,
  },

  otherBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 1,
  },

  username: {
    fontSize: 12,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 3,
  },

  message: {
    fontSize: 16,
    lineHeight: 21,
  },

  mineMessage: {
    color: "#FFFFFF",
  },

  otherMessage: {
    color: "#111827",
  },

  meta: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },

  time: {
    fontSize: 10,
  },

  mineTime: {
    color: "#DCEBFF",
  },

  otherTime: {
    color: "#9CA3AF",
  },

  status: {
    marginLeft: 4,
    fontSize: 11,
    color: "#DCEBFF",
    fontWeight: "700",
  },

  read: {
    color: "#B9E5FF",
  },
});
