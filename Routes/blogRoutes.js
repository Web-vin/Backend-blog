const express = require("express");
const Blog = require("../Schema/Blog")
const authMiddleware = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken")
const JWT_SECRET = "vinayakissmart"
const Comment = require("../Schema/Comment")

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    console.log("Received Body:", req.body);

    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Extract user from token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id; // Extract user ID from token

    // Create blog post with author
    const newBlog = new Blog({ title, content, author: userId });
    await newBlog.save();

    res.status(201).json({ message: "Blog created successfully", blog: newBlog });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// Get all blog posts
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "username email");
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs", error });
  }
});

// Get a single blog by ID
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "username email");
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error });
  }
});

// Update a blog post (Protected Route)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this blog" });
    }

    blog.title = req.body.title || blog.title;
    blog.content = req.body.content || blog.content;
    await blog.save();

    res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Error updating blog", error });
  }
});

// Delete a blog post (Protected Route)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this blog" });
    }

    await blog.deleteOne();
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting blog", error });
  }
});

router.post("/:id/comment", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const blogId = req.params.id;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // Check if the blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Create a new comment
    let newComment = await (await Comment.create({ text, blog: blogId, user: userId })).populate("user", "username");

    // Add comment to the blog's comments array
    blog.comments.push(newComment._id);
    await blog.save();

    res.status(201).json(newComment); // Ensure username is included in response
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
