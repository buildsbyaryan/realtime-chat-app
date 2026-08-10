const express = require("express");

const {
  getMessages,
  sendMessage,
} = require(
  "../controllers/messageController"
);

const router =
  express.Router();

// GET CHAT HISTORY

router.get(
  "/",
  getMessages
);

// SEND MESSAGE

router.post(
  "/",
  sendMessage
);

module.exports =
  router;