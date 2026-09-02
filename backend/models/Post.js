const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    content: {
      type: String,
      required: true
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    category: {
      type: String,
      default: "General",
      trim: true
    },

    tags: {
      type: [String],
      default: []
    },

    // ❤️ LIKES
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    // 💬 COMMENTS
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },

        text: {
          type: String,
          required: true
        },

        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model("Post", postSchema);