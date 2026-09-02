const express = require("express");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==================== GET COMMENTS FOR A POST ====================
router.get("/post/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId
    })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);

    res.status(500).json({
      message: "Server error while fetching comments"
    });
  }
});

// ==================== ADD COMMENT ====================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { text, postId } = req.body;

    if (!text || !postId) {
      return res.status(400).json({
        message: "Comment text and post ID are required"
      });
    }

    // Check if post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const comment = await Comment.create({
      text,
      post: postId,
      author: req.userId
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "name email");

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment
    });
  } catch (error) {
    console.error("Add comment error:", error);

    res.status(500).json({
      message: "Server error while adding comment"
    });
  }
});

// ==================== UPDATE COMMENT ====================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Comment text is required"
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    // Only the comment author can edit it
    if (comment.author.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "You can only edit your own comments"
      });
    }

    comment.text = text;

    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate("author", "name email");

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment
    });
  } catch (error) {
    console.error("Update comment error:", error);

    res.status(500).json({
      message: "Server error while updating comment"
    });
  }
});

// ==================== DELETE COMMENT ====================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    // Only the comment author can delete it
    if (comment.author.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "You can only delete your own comments"
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    res.status(500).json({
      message: "Server error while deleting comment"
    });
  }
});

module.exports = router;