import upload from "../utils/multer.js";
import {
  addComment,
  createPost,
  deletePost,
  getAllRecentPosts,
  getComments,
  getFollowedPosts,
  getLikedPosts,
  getPostById,
  getReplies,
  getUserPosts,
  likePost,
  removeComment,
  searchPosts,
  unlikePost,
  updatePost,
} from "../controllers/post.controller.ts";
import { Router } from "express";
import dotenv from "dotenv";
dotenv.config();

// Create a router.
const router = Router();

// Default route to check if auth routes are accessible.
router.get("/", (_, res) => {
  res.status(200).send({ data: "Post Route" });
});

// Create a new post.
router.post("/create-post", upload.single("file"), createPost);

// Get recent posts from DB.
router.post("/get-recent-posts", getAllRecentPosts);

// Get posts from a user.
router.post("/get-user-posts", getUserPosts);

// Get specific post from DB.
router.post("/get-post", getPostById);

// Delete post from DB.
router.post("/delete-post", deletePost);

// Search posts in DB.
router.post("/searchPosts", searchPosts);

// Like a post.
router.post("/likePost", likePost);

// Unlike a post.
router.post("/unlikePost", unlikePost);

// Get liked posts for a user.
router.post("/get-liked-posts", getLikedPosts);

// Get posts by users followed by the current user.
router.post("/get-followed-posts", getFollowedPosts);

// Update a post
router.post("/update-post", upload.single("file"), updatePost);

// Add a comment for a post
router.post("/add-comment", addComment);

// Remove a comment from a post
router.post("/remove-comment", removeComment);

// Get comments for a post
router.post("/get-comments", getComments);

// Get replies for a comment
router.post("/get-replies", getReplies);

export default router;
