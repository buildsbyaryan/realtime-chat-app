import axios from "axios";

const API_URL =
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,

  headers: {
    "Content-Type":
      "application/json",
  },
});

// -----------------------------
// GET MESSAGES
// -----------------------------

export const getMessages =
  async () => {
    try {
      const response =
        await api.get(
          "/messages"
        );

      return response.data;
    } catch (error: any) {
      console.error(
        "GET messages error:",
        error
      );

      if (
        error.code ===
        "ECONNABORTED"
      ) {
        throw new Error(
          "Request timed out"
        );
      }

      if (
        error.response
      ) {
        throw new Error(
          error.response.data
            ?.message ||
            "Failed to fetch messages"
        );
      }

      if (
        error.request
      ) {
        throw new Error(
          "Unable to connect to server"
        );
      }

      throw new Error(
        "Something went wrong"
      );
    }
  };

// -----------------------------
// POST MESSAGE
// -----------------------------

export const sendMessage =
  async (
    username: string,
    message: string
  ) => {
    try {
      const response =
        await api.post(
          "/messages",
          {
            username,
            message,
          }
        );

      return response.data;
    } catch (error: any) {
      console.error(
        "POST message error:",
        error
      );

      if (
        error.response
      ) {
        throw new Error(
          error.response.data
            ?.message ||
            "Failed to send message"
        );
      }

      if (
        error.request
      ) {
        throw new Error(
          "Unable to connect to server"
        );
      }

      throw new Error(
        "Something went wrong"
      );
    }
  };

export default api;