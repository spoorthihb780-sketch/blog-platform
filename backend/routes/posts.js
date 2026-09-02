const express = require("express");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// GET ALL POSTS
// =====================================================
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Get posts error:", error);

    res.status(500).json({
      message: "Server error while fetching posts"
    });
  }
});

// =====================================================
// GET SINGLE POST
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email");

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    res.json(post);
  } catch (error) {
    console.error("Get post error:", error);

    res.status(500).json({
      message: "Server error while fetching post"
    });
  }
});

// =====================================================
// LIKE / UNLIKE POST
// =====================================================
router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    // Make sure likes exists
    if (!post.likes) {
      post.likes = [];
    }

    const userId = req.userId.toString();

    // Check whether user already liked
    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      // =========================
      // UNLIKE
      // =========================
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );

      await post.save();

      return res.json({
        message: "Post unliked",
        liked: false,
        likesCount: post.likes.length
      });
    }

    // =========================
    // LIKE
    // =========================
    post.likes.push(req.userId);

    await post.save();

    res.json({
      message: "Post liked",
      liked: true,
      likesCount: post.likes.length
    });

  } catch (error) {
    console.error("Like post error:", error);

    res.status(500).json({
      message: "Server error while liking post"
    });
  }
});

// =====================================================
// CREATE POST
// =====================================================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      tags
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required"
      });
    }

    const post = await Post.create({
      title,
      content,
      author: req.userId,

      // Category
      category: category || "General",

      // Tags
      tags: Array.isArray(tags) ? tags : [],

      // Likes
      likes: []
    });

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name email");

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost
    });

  } catch (error) {
    console.error("Create post error:", error);

    res.status(500).json({
      message: "Server error while creating post"
    });
  }
});

// =====================================================
// UPDATE POST
// =====================================================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      tags
    } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    // Only author can edit
    if (
      post.author.toString() !==
      req.userId.toString()
    ) {
      return res.status(403).json({
        message: "You can only edit your own posts"
      });
    }

    // Update title
    if (title !== undefined && title.trim()) {
      post.title = title.trim();
    }

    // Update content
    if (content !== undefined && content.trim()) {
      post.content = content.trim();
    }

    // Update category
    if (category !== undefined) {
      post.category = category;
    }

    // Update tags
    if (tags !== undefined) {
      post.tags = Array.isArray(tags)
        ? tags
        : [];
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("author", "name email");

    res.json({
      message: "Post updated successfully",
      post: updatedPost
    });

  } catch (error) {
    console.error("Update post error:", error);

    res.status(500).json({
      message: "Server error while updating post"
    });
  }
});

// =====================================================
// DELETE POST
// =====================================================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    // Only author can delete
    if (
      post.author.toString() !==
      req.userId.toString()
    ) {
      return res.status(403).json({
        message: "You can only delete your own posts"
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      message: "Post deleted successfully"
    });

  } catch (error) {
    console.error("Delete post error:", error);

    res.status(500).json({
      message: "Server error while deleting post"
    });
  }
});

module.exports = router;