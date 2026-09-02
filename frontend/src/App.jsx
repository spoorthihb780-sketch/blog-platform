import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [page, setPage] = useState(
    localStorage.getItem("token") ? "home" : "login"
  );

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [postData, setPostData] = useState({
    title: "",
    content: "",
    category: "Technology",
    tags: ""
  });

  const [commentText, setCommentText] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [editingComment, setEditingComment] = useState(null);

  // SEARCH / FILTERS
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [tag, setTag] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // DARK MODE
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // BOOKMARKS
  const [bookmarkedPosts, setBookmarkedPosts] = useState(
    JSON.parse(localStorage.getItem("bookmarkedPosts")) || []
  );

  const [featuredPost, setFeaturedPost] = useState(null);

  const categories = [
    "Technology",
    "Education",
    "Travel",
    "Lifestyle",
    "Programming",
    "Science",
    "Entertainment",
    "Other"
  ];

  // =====================================================
  // DARK MODE
  // =====================================================

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // =====================================================
  // BOOKMARK STORAGE
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      "bookmarkedPosts",
      JSON.stringify(bookmarkedPosts)
    );
  }, [bookmarkedPosts]);

  // =====================================================
  // FETCH POSTS
  // =====================================================

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/posts`);
      const data = await response.json();

      if (response.ok) {
        setPosts(data);

        if (data.length > 0) {
          setFeaturedPost(data[0]);
        } else {
          setFeaturedPost(null);
        }
      } else {
        setMessage(data.message || "Failed to load posts");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPosts();
    }
  }, [token]);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(loginData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setToken(data.token);
      setUser(data.user);
      setPage("home");

      setLoginData({
        email: "",
        password: ""
      });

      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(registerData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      setMessage(
        "🎉 Registration successful! Please login."
      );

      setRegisterData({
        name: "",
        email: "",
        password: ""
      });

      setPage("login");
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setUser(null);
    setPosts([]);
    setSelectedPost(null);
    setComments([]);
    setPage("login");
  };

  // =====================================================
  // CREATE POST
  // =====================================================

  const createPost = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const tags = postData.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await fetch(
        `${API_URL}/api/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: postData.title,
            content: postData.content,
            category: postData.category,
            tags
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to create post"
        );
        return;
      }

      setPostData({
        title: "",
        content: "",
        category: "Technology",
        tags: ""
      });

      setMessage("🎉 Post published successfully!");

      await fetchPosts();
      setPage("home");
    } catch (error) {
      console.error(error);
      setMessage("Unable to create post");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UPDATE POST
  // =====================================================

  const updatePost = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const tags = Array.isArray(editingPost.tags)
        ? editingPost.tags
        : [];

      const response = await fetch(
        `${API_URL}/api/posts/${editingPost._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: editingPost.title,
            content: editingPost.content,
            category:
              editingPost.category || "Technology",
            tags
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to update post"
        );
        return;
      }

      setEditingPost(null);
      setMessage("✅ Post updated successfully!");

      await fetchPosts();
    } catch (error) {
      console.error(error);
      setMessage("Unable to update post");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE POST
  // =====================================================

  const deletePost = async (postId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to delete post"
        );
        return;
      }

      setMessage("🗑️ Post deleted successfully!");

      setBookmarkedPosts((old) =>
        old.filter((id) => id !== postId)
      );

      if (selectedPost?._id === postId) {
        setSelectedPost(null);
        setComments([]);
      }

      await fetchPosts();
    } catch (error) {
      console.error(error);
      setMessage("Unable to delete post");
    }
  };

  // =====================================================
  // ❤️ LIKE / UNLIKE - DATABASE VERSION
  // =====================================================

  const toggleLike = async (postId) => {
    if (!token) {
      setMessage("🔐 Please login to like a post");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to like post"
        );
        return;
      }

      // Update the post inside React state
      setPosts((oldPosts) =>
        oldPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: data.likesCount
                  ? Array(data.likesCount).fill("like")
                  : []
              }
            : post
        )
      );

      if (data.liked) {
        setMessage("❤️ You liked this post!");
      } else {
        setMessage("🤍 You unliked this post");
      }

      await fetchPosts();
    } catch (error) {
      console.error(error);
      setMessage("Unable to like post");
    }
  };

  // =====================================================
  // BOOKMARK
  // =====================================================

  const toggleBookmark = (postId) => {
    setBookmarkedPosts((old) => {
      if (old.includes(postId)) {
        setMessage("🔖 Removed from bookmarks");

        return old.filter(
          (id) => id !== postId
        );
      }

      setMessage("🔖 Post bookmarked!");

      return [...old, postId];
    });
  };

  // =====================================================
  // SHARE
  // =====================================================

  const sharePost = async (post) => {
    const text =
      `${post.title}\n\n${post.content}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text
        });
      } else {
        await navigator.clipboard.writeText(text);

        setMessage(
          "📋 Post copied to clipboard!"
        );
      }
    } catch {
      setMessage("Share cancelled");
    }
  };

  // =====================================================
  // COMMENTS
  // =====================================================

  const loadComments = async (post) => {
    try {
      setSelectedPost(post);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/comments/post/${post._id}`
      );

      const data = await response.json();

      if (response.ok) {
        setComments(data);
      } else {
        setMessage(
          data.message || "Unable to load comments"
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to load comments");
    }
  };

  const addComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      setMessage("Please enter a comment");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            text: commentText,
            postId: selectedPost._id
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to add comment"
        );
        return;
      }

      setCommentText("");
      setMessage("💬 Comment added!");

      await loadComments(selectedPost);
    } catch (error) {
      console.error(error);
      setMessage("Unable to add comment");
    }
  };

  const updateComment = async (commentId) => {
    if (!editingComment?.text.trim()) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            text: editingComment.text
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to update comment"
        );
        return;
      }

      setEditingComment(null);
      setMessage("✅ Comment updated!");

      await loadComments(selectedPost);
    } catch (error) {
      console.error(error);
      setMessage("Unable to update comment");
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to delete comment"
        );
        return;
      }

      setMessage("🗑️ Comment deleted!");

      await loadComments(selectedPost);
    } catch (error) {
      console.error(error);
      setMessage("Unable to delete comment");
    }
  };

  // =====================================================
  // WORD COUNT
  // =====================================================

  const wordCount = postData.content.trim()
    ? postData.content.trim().split(/\s+/).length
    : 0;

  // =====================================================
  // FILTER POSTS
  // =====================================================

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // SEARCH
    if (search.trim()) {
      const searchValue =
        search.toLowerCase();

      result = result.filter((post) => {
        const title =
          post.title?.toLowerCase() || "";

        const content =
          post.content?.toLowerCase() || "";

        const author =
          post.author?.name?.toLowerCase() || "";

        const tags =
          Array.isArray(post.tags)
            ? post.tags.join(" ").toLowerCase()
            : "";

        return (
          title.includes(searchValue) ||
          content.includes(searchValue) ||
          author.includes(searchValue) ||
          tags.includes(searchValue)
        );
      });
    }

    // CATEGORY
    if (category !== "All") {
      result = result.filter(
        (post) =>
          (post.category || "Other") === category
      );
    }

    // TAG
    if (tag !== "All") {
      result = result.filter(
        (post) =>
          Array.isArray(post.tags) &&
          post.tags.includes(tag)
      );
    }

    // SORT
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      return sortBy === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });

    return result;
  }, [
    posts,
    search,
    category,
    tag,
    sortBy
  ]);

  // =====================================================
  // AVAILABLE TAGS
  // =====================================================

  const availableTags = useMemo(() => {
    const allTags = [];

    posts.forEach((post) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((item) => {
          if (
            item &&
            !allTags.includes(item)
          ) {
            allTags.push(item);
          }
        });
      }
    });

    return ["All", ...allTags];
  }, [posts]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalPosts = posts.length;

  const myPosts = posts.filter(
    (post) =>
      post.author?._id === user?.id
  ).length;

  const totalLikes = posts.reduce(
    (total, post) =>
      total +
      (Array.isArray(post.likes)
        ? post.likes.length
        : 0),
    0
  );

  const totalBookmarks =
    bookmarkedPosts.filter((id) =>
      posts.some(
        (post) => post._id === id
      )
    ).length;

  // =====================================================
  // CHECK WHETHER CURRENT USER LIKED
  // =====================================================

  const hasLiked = (post) => {
    if (!Array.isArray(post.likes)) {
      return false;
    }

    return post.likes.some(
      (like) =>
        like === user?.id ||
        like?._id === user?.id
    );
  };

  // =====================================================
  // LOGIN PAGE
  // =====================================================

  if (!token && page === "login") {
    return (
      <div
        className={`app ${
          darkMode ? "dark" : ""
        }`}
      >
        <div className="auth-page">

          <div className="auth-left">

            <div className="brand-big">
              📝
            </div>

            <h1>BlogVerse</h1>

            <p>
              Share ideas. Inspire people.
              <br />
              Build your blogging community.
            </p>

            <div className="auth-features">
              <span>✍️ Create</span>
              <span>💬 Discuss</span>
              <span>❤️ Connect</span>
            </div>

          </div>

          <div className="auth-card">

            <button
              className="theme-button"
              onClick={() =>
                setDarkMode(!darkMode)
              }
            >
              {darkMode
                ? "☀️ Light"
                : "🌙 Dark"}
            </button>

            <h2>
              Welcome Back 👋
            </h2>

            <p className="auth-subtitle">
              Login to continue your
              blogging journey
            </p>

            <form onSubmit={handleLogin}>

              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    email: e.target.value
                  })
                }
                required
              />

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    password: e.target.value
                  })
                }
                required
              />

              <button
                className="primary-btn"
                type="submit"
              >
                {loading
                  ? "Logging in..."
                  : "🚀 Login"}
              </button>

            </form>

            {message && (
              <div className="auth-message">
                {message}
              </div>
            )}

            <p className="switch-text">
              Don't have an account?
            </p>

            <button
              className="outline-btn"
              onClick={() => {
                setPage("register");
                setMessage("");
              }}
            >
              Create Account
            </button>

          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // REGISTER PAGE
  // =====================================================

  if (!token && page === "register") {
    return (
      <div
        className={`app ${
          darkMode ? "dark" : ""
        }`}
      >
        <div className="auth-page">

          <div className="auth-left register-left">

            <div className="brand-big">
              ✨
            </div>

            <h1>
              Join BlogVerse
            </h1>

            <p>
              Create your account and start
              <br />
              sharing your ideas today.
            </p>

            <div className="auth-features">
              <span>📝 Write</span>
              <span>🌎 Share</span>
              <span>🤝 Engage</span>
            </div>

          </div>

          <div className="auth-card">

            <button
              className="theme-button"
              onClick={() =>
                setDarkMode(!darkMode)
              }
            >
              {darkMode
                ? "☀️ Light"
                : "🌙 Dark"}
            </button>

            <h2>
              Create Account 🚀
            </h2>

            <p className="auth-subtitle">
              Become part of our community
            </p>

            <form onSubmit={handleRegister}>

              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    name: e.target.value
                  })
                }
                required
              />

              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    email: e.target.value
                  })
                }
                required
              />

              <label>Password</label>

              <input
                type="password"
                placeholder="Minimum 6 characters"
                minLength="6"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    password: e.target.value
                  })
                }
                required
              />

              <button
                className="primary-btn"
                type="submit"
              >
                {loading
                  ? "Creating..."
                  : "✨ Create Account"}
              </button>

            </form>

            {message && (
              <div className="auth-message">
                {message}
              </div>
            )}

            <button
              className="outline-btn"
              onClick={() => {
                setPage("login");
                setMessage("");
              }}
            >
              ← Back to Login
            </button>

          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN APP
  // =====================================================

  return (
    <div
      className={`app ${
        darkMode ? "dark" : ""
      }`}
    >

      {/* HEADER */}

      <header className="main-header">

        <div className="logo-area">

          <div className="logo-icon">
            📝
          </div>

          <div>
            <h1>BlogVerse</h1>

            <span>
              Ideas • Stories • Community
            </span>
          </div>

        </div>

        <div className="header-user">

          <div className="user-info">

            <div className="avatar">
              {user?.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {user?.name}
              </strong>

              <small>
                Writer
              </small>
            </div>

          </div>

          <button
            className="theme-toggle"
            onClick={() =>
              setDarkMode(!darkMode)
            }
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <button
            className="logout-btn"
            onClick={logout}
          >
            🚪 Logout
          </button>

        </div>

      </header>

      {/* NAVIGATION */}

      <nav className="main-nav">

        <button
          className={
            page === "home"
              ? "active"
              : ""
          }
          onClick={() => {
            setPage("home");
            setSelectedPost(null);
          }}
        >
          🏠 Home
        </button>

        <button
          className={
            page === "create"
              ? "active"
              : ""
          }
          onClick={() => {
            setPage("create");
            setSelectedPost(null);
            setMessage("");
          }}
        >
          ✨ Create Post
        </button>

        <button
          onClick={() => {
            setSearch("");
            setCategory("All");
            setTag("All");
            setPage("home");
            setMessage(
              "🔖 Showing your bookmarked posts"
            );
          }}
        >
          🔖 Bookmarks ({totalBookmarks})
        </button>

      </nav>

      {/* MAIN */}

      <main className="main-container">

        {message && (
          <div className="success-message">

            {message}

            <button
              onClick={() =>
                setMessage("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* =================================================
            HOME
        ================================================= */}

        {page === "home" && (
          <>

            {/* HERO */}

            <section className="welcome-card">

              <div>

                <span className="eyebrow">
                  👋 Welcome back
                </span>

                <h2>
                  Hello, {user?.name}! 🌟
                </h2>

                <p>
                  Discover amazing ideas,
                  write your own stories
                  and connect with readers.
                </p>

                <button
                  className="hero-btn"
                  onClick={() =>
                    setPage("create")
                  }
                >
                  ✍️ Start Writing
                </button>

              </div>

              <div className="hero-emoji">
                🚀
              </div>

            </section>

            {/* STATISTICS */}

            <section className="stats-grid">

              <div className="stat-card purple">

                <span>📝</span>

                <div>
                  <strong>
                    {totalPosts}
                  </strong>

                  <p>Total Posts</p>
                </div>

              </div>

              <div className="stat-card pink">

                <span>✍️</span>

                <div>
                  <strong>
                    {myPosts}
                  </strong>

                  <p>My Posts</p>
                </div>

              </div>

              <div className="stat-card orange">

                <span>❤️</span>

                <div>
                  <strong>
                    {totalLikes}
                  </strong>

                  <p>Total Likes</p>
                </div>

              </div>

              <div className="stat-card blue">

                <span>🔖</span>

                <div>
                  <strong>
                    {totalBookmarks}
                  </strong>

                  <p>Bookmarks</p>
                </div>

              </div>

            </section>

            {/* FEATURED */}

            {featuredPost && (
              <section className="featured-section">

                <div className="section-heading">

                  <div>
                    <span>
                      ⭐ FEATURED
                    </span>

                    <h2>
                      Post of the Moment
                    </h2>
                  </div>

                </div>

                <div className="featured-card">

                  <div className="featured-content">

                    <span className="featured-label">
                      ✨ Featured Story
                    </span>

                    <h2>
                      {featuredPost.title}
                    </h2>

                    <p>
                      {featuredPost.content}
                    </p>

                    <button
                      className="read-btn"
                      onClick={() =>
                        loadComments(
                          featuredPost
                        )
                      }
                    >
                      📖 Read & Discuss
                    </button>

                  </div>

                  <div className="featured-art">
                    💡
                  </div>

                </div>

              </section>
            )}

            {/* POSTS */}

            <section className="posts-section">

              <div className="section-heading">

                <div>
                  <span>
                    EXPLORE
                  </span>

                  <h2>
                    Latest Blog Posts
                  </h2>
                </div>

                <button
                  className="refresh-btn"
                  onClick={fetchPosts}
                >
                  🔄 Refresh
                </button>

              </div>

              {/* SEARCH */}

              <div className="filters">

                <div className="search-box">

                  <span>🔍</span>

                  <input
                    placeholder="Search title, content, author or tags..."
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* CATEGORY */}

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                >

                  <option value="All">
                    📚 All Categories
                  </option>

                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

                {/* TAG */}

                <select
                  value={tag}
                  onChange={(e) =>
                    setTag(e.target.value)
                  }
                >

                  <option value="All">
                    🏷️ All Tags
                  </option>

                  {availableTags
                    .filter(
                      (item) =>
                        item !== "All"
                    )
                    .map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        #{item}
                      </option>
                    ))}

                </select>

                {/* SORT */}

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value
                    )
                  }
                >

                  <option value="newest">
                    🆕 Newest
                  </option>

                  <option value="oldest">
                    🕐 Oldest
                  </option>

                </select>

              </div>

              {/* CLEAR FILTERS */}

              {(search ||
                category !== "All" ||
                tag !== "All") && (

                <button
                  className="clear-filters"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setTag("All");
                  }}
                >
                  🔄 Clear Filters
                </button>

              )}

              {loading && (
                <div className="loading">
                  <div className="spinner"></div>
                  Loading posts...
                </div>
              )}

              {!loading &&
                filteredPosts.length === 0 && (
                  <div className="empty-state">

                    <div>📭</div>

                    <h2>
                      No posts found
                    </h2>

                    <p>
                      Try another search
                      or create your
                      first post.
                    </p>

                  </div>
                )}

              {/* POST GRID */}

              <div className="posts-grid">

                {filteredPosts.map(
                  (post, index) => {

                    const isLiked =
                      hasLiked(post);

                    const isBookmarked =
                      bookmarkedPosts.includes(
                        post._id
                      );

                    const isOwner =
                      post.author?._id ===
                      user?.id;

                    const likeCount =
                      Array.isArray(
                        post.likes
                      )
                        ? post.likes.length
                        : 0;

                    return (
                      <article
                        className={`post-card ${
                          index === 0
                            ? "top-post"
                            : ""
                        }`}
                        key={post._id}
                      >

                        {index === 0 && (
                          <span className="top-badge">
                            🔥 Latest
                          </span>
                        )}

                        {/* CATEGORY */}

                        <div className="post-category">

                          📚{" "}
                          {post.category ||
                            "General"}

                        </div>

                        <h2>
                          {post.title}
                        </h2>

                        {/* AUTHOR */}

                        <div className="author-row">

                          <div className="small-avatar">

                            {post.author?.name
                              ?.charAt(0)
                              .toUpperCase() ||
                              "U"}

                          </div>

                          <div>

                            <strong>
                              {post.author?.name ||
                                "Unknown"}
                            </strong>

                            <small>
                              {post.createdAt
                                ? new Date(
                                    post.createdAt
                                  ).toLocaleDateString()
                                : ""}
                            </small>

                          </div>

                        </div>

                        {/* TAGS */}

                        {Array.isArray(
                          post.tags
                        ) &&
                          post.tags.length > 0 && (

                            <div className="post-tags">

                              {post.tags.map(
                                (item) => (
                                  <span
                                    className="post-tag"
                                    key={item}
                                    onClick={() =>
                                      setTag(
                                        item
                                      )
                                    }
                                  >
                                    #{item}
                                  </span>
                                )
                              )}

                            </div>

                          )}

                        {/* CONTENT */}

                        <p className="post-preview">
                          {post.content}
                        </p>

                        {/* POST ACTIONS */}

                        <div className="post-footer">

                          {/* LIKE */}

                          <button
                            onClick={() =>
                              toggleLike(
                                post._id
                              )
                            }
                            className={
                              isLiked
                                ? "liked"
                                : ""
                            }
                          >
                            {isLiked
                              ? "❤️ Liked"
                              : "🤍 Like"}{" "}
                            ({likeCount})
                          </button>

                          {/* COMMENT */}

                          <button
                            onClick={() =>
                              loadComments(
                                post
                              )
                            }
                          >
                            💬 Comment
                          </button>

                          {/* BOOKMARK */}

                          <button
                            onClick={() =>
                              toggleBookmark(
                                post._id
                              )
                            }
                            className={
                              isBookmarked
                                ? "bookmarked"
                                : ""
                            }
                          >
                            {isBookmarked
                              ? "🔖 Saved"
                              : "🔖 Save"}
                          </button>

                          {/* SHARE */}

                          <button
                            onClick={() =>
                              sharePost(post)
                            }
                          >
                            📤 Share
                          </button>

                        </div>

                        {/* MANAGEMENT */}

                        {isOwner && (
                          <div className="post-management">

                            <button
                              className="edit-btn"
                              onClick={() =>
                                setEditingPost({
                                  ...post,
                                  tags: Array.isArray(
                                    post.tags
                                  )
                                    ? post.tags
                                    : []
                                })
                              }
                            >
                              ✏️ Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                deletePost(
                                  post._id
                                )
                              }
                            >
                              🗑️ Delete
                            </button>

                          </div>
                        )}

                      </article>
                    );
                  }
                )}

              </div>

            </section>

          </>
        )}

        {/* =================================================
            CREATE POST
        ================================================= */}

        {page === "create" && (
          <section className="editor-card">

            <div className="editor-header">

              <div>

                <span>
                  ✍️ CREATE
                </span>

                <h2>
                  Write Something Amazing
                </h2>

                <p>
                  Share your knowledge,
                  ideas and experiences
                  with the community.
                </p>

              </div>

              <div className="editor-icon">
                ✨
              </div>

            </div>

            <form
              onSubmit={createPost}
              className="post-form"
            >

              <label>
                Post Title
              </label>

              <input
                type="text"
                placeholder="Give your post a catchy title..."
                value={postData.title}
                onChange={(e) =>
                  setPostData({
                    ...postData,
                    title: e.target.value
                  })
                }
                required
              />

              <label>
                Category
              </label>

              <select
                value={postData.category}
                onChange={(e) =>
                  setPostData({
                    ...postData,
                    category:
                      e.target.value
                  })
                }
              >

                {categories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}

              </select>

              <label>
                Tags
              </label>

              <input
                type="text"
                placeholder="react, javascript, coding"
                value={postData.tags}
                onChange={(e) =>
                  setPostData({
                    ...postData,
                    tags: e.target.value
                  })
                }
              />

              <small>
                💡 Separate multiple tags
                with commas
              </small>

              <label>
                Content
              </label>

              <textarea
                rows="14"
                placeholder="Start writing your story..."
                value={postData.content}
                onChange={(e) =>
                  setPostData({
                    ...postData,
                    content:
                      e.target.value
                  })
                }
                required
              />

              <div className="writing-info">

                <span>
                  📝 {wordCount} words
                </span>

                <span>
                  🔤{" "}
                  {postData.content.length}
                  {" "}characters
                </span>

              </div>

              <div className="editor-actions">

                <button
                  type="submit"
                  className="publish-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Publishing..."
                    : "🚀 Publish Post"}
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setPage("home")
                  }
                >
                  Cancel
                </button>

              </div>

            </form>

          </section>
        )}

        {/* =================================================
            EDIT POST
        ================================================= */}

        {editingPost && (
          <section className="editor-card">

            <div className="editor-header">

              <div>

                <span>
                  ✏️ EDIT
                </span>

                <h2>
                  Update Your Post
                </h2>

              </div>

            </div>

            <form
              onSubmit={updatePost}
              className="post-form"
            >

              <label>
                Title
              </label>

              <input
                value={editingPost.title}
                onChange={(e) =>
                  setEditingPost({
                    ...editingPost,
                    title:
                      e.target.value
                  })
                }
                required
              />

              <label>
                Category
              </label>

              <select
                value={
                  editingPost.category ||
                  "Technology"
                }
                onChange={(e) =>
                  setEditingPost({
                    ...editingPost,
                    category:
                      e.target.value
                  })
                }
              >

                {categories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}

              </select>

              <label>
                Tags
              </label>

              <input
                value={
                  Array.isArray(
                    editingPost.tags
                  )
                    ? editingPost.tags.join(
                        ", "
                      )
                    : ""
                }
                onChange={(e) =>
                  setEditingPost({
                    ...editingPost,
                    tags:
                      e.target.value
                        .split(",")
                        .map(
                          (item) =>
                            item.trim()
                        )
                        .filter(Boolean)
                  })
                }
                placeholder="react, coding, web"
              />

              <label>
                Content
              </label>

              <textarea
                rows="14"
                value={
                  editingPost.content
                }
                onChange={(e) =>
                  setEditingPost({
                    ...editingPost,
                    content:
                      e.target.value
                  })
                }
                required
              />

              <div className="editor-actions">

                <button
                  type="submit"
                  className="publish-btn"
                  disabled={loading}
                >
                  💾 Save Changes
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setEditingPost(null)
                  }
                >
                  Cancel
                </button>

              </div>

            </form>

          </section>
        )}

        {/* =================================================
            COMMENTS
        ================================================= */}

        {selectedPost && (
          <section className="comments-section">

            <div className="comments-title">

              <div>

                <span>
                  💬 COMMUNITY
                </span>

                <h2>
                  Discussion
                </h2>

                <p>
                  {selectedPost.title}
                </p>

              </div>

              <button
                className="close-btn"
                onClick={() => {
                  setSelectedPost(null);
                  setComments([]);
                }}
              >
                ✕
              </button>

            </div>

            {/* COMMENT FORM */}

            <form
              onSubmit={addComment}
              className="comment-form"
            >

              <div className="comment-avatar">

                {user?.name
                  ?.charAt(0)
                  .toUpperCase()}

              </div>

              <div className="comment-input-area">

                <textarea
                  placeholder="Share your thoughts..."
                  rows="3"
                  value={commentText}
                  onChange={(e) =>
                    setCommentText(
                      e.target.value
                    )
                  }
                />

                <button type="submit">
                  💬 Post Comment
                </button>

              </div>

            </form>

            {/* COMMENTS LIST */}

            <div className="comments-list">

              {comments.length === 0 ? (

                <div className="no-comments">

                  <div>💭</div>

                  <h3>
                    No comments yet
                  </h3>

                  <p>
                    Be the first to
                    start the conversation!
                  </p>

                </div>

              ) : (

                comments.map(
                  (comment) => (

                    <div
                      className="comment-card"
                      key={comment._id}
                    >

                      <div className="comment-avatar">

                        {comment.author?.name
                          ?.charAt(0)
                          .toUpperCase() ||
                          "U"}

                      </div>

                      <div className="comment-body">

                        <div className="comment-header">

                          <div>

                            <strong>
                              {comment.author?.name ||
                                "User"}
                            </strong>

                            <small>
                              {comment.createdAt
                                ? new Date(
                                    comment.createdAt
                                  ).toLocaleString()
                                : ""}
                            </small>

                          </div>

                        </div>

                        {editingComment?._id ===
                        comment._id ? (

                          <div>

                            <textarea
                              value={
                                editingComment.text
                              }
                              onChange={(e) =>
                                setEditingComment({
                                  ...editingComment,
                                  text:
                                    e.target.value
                                })
                              }
                            />

                            <div className="comment-edit-actions">

                              <button
                                onClick={() =>
                                  updateComment(
                                    comment._id
                                  )
                                }
                              >
                                💾 Save
                              </button>

                              <button
                                onClick={() =>
                                  setEditingComment(
                                    null
                                  )
                                }
                              >
                                Cancel
                              </button>

                            </div>

                          </div>

                        ) : (

                          <p>
                            {comment.text}
                          </p>

                        )}

                        {comment.author?._id ===
                          user?.id &&
                          !editingComment && (

                            <div className="comment-actions">

                              <button
                                onClick={() =>
                                  setEditingComment({
                                    ...comment
                                  })
                                }
                              >
                                ✏️ Edit
                              </button>

                              <button
                                onClick={() =>
                                  deleteComment(
                                    comment._id
                                  )
                                }
                              >
                                🗑️ Delete
                              </button>

                            </div>

                          )}

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </section>
        )}

      </main>

      {/* FOOTER */}

      <footer className="footer">

        <h3>
          📝 BlogVerse
        </h3>

        <p>
          Write • Share • Inspire • Connect
        </p>

        <small>
          © 2026 BlogVerse. Built with
          React, Node.js & MongoDB.
        </small>

      </footer>

    </div>
  );
}

export default App;