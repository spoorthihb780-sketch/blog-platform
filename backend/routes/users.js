const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// GET MY PROFILE
// ==========================================

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const posts = await Post.find({
      author: req.userId
    })
      .sort({ createdAt: -1 })
      .populate("author", "name email");

    const commentCount = await Comment.countDocuments({
      author: req.userId
    });

    let totalLikes = 0;

    posts.forEach((post) => {
      if (Array.isArray(post.likes)) {
        totalLikes += post.likes.length;
      }
    });

    res.json({
      user,
      posts,
      stats: {
        posts: posts.length,
        comments: commentCount,
        likes: totalLikes
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Server error while fetching profile"
    });
  }
});

// ==========================================
// UPDATE MY PROFILE
// ==========================================

router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, bio } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required"
      });
    }

    if (bio && bio.length > 300) {
      return res.status(400).json({
        message: "Bio cannot exceed 300 characters"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        name: name.trim(),
        bio: bio || ""
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Server error while updating profile"
    });
  }
});

// ==========================================
// GET PUBLIC PROFILE
// ==========================================

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    ).select(
      "name email bio avatar verified badge createdAt"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const posts = await Post.find({
      author: req.params.id
    })
      .sort({ createdAt: -1 })
      .populate("author", "name email");

    let totalLikes = 0;

    posts.forEach((post) => {
      if (Array.isArray(post.likes)) {
        totalLikes += post.likes.length;
      }
    });

    res.json({
      user,
      posts,
      stats: {
        posts: posts.length,
        likes: totalLikes
      }
    });
  } catch (error) {
    console.error("Public profile error:", error);

    res.status(500).json({
      message: "Server error while fetching profile"
    });
  }
});

module.exports = router;