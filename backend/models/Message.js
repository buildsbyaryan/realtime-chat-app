const mongoose = require("mongoose");

const messageSchema =
  new mongoose.Schema(
    {
      username: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
      },

      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
      },

      status: {
        type: String,
        enum: [
          "sent",
          "delivered",
          "read",
        ],
        default: "sent",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Message",
    messageSchema
  );