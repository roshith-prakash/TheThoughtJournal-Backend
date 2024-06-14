import upload from "../utils/multer.js";
import { createPost, deletePost, getAllRecentPosts, getPostById, getUserPosts, searchPosts } from "../controllers/post.controller.js"
import { Router } from "express"
import dotenv from "dotenv"
dotenv.config()

// Create a router.
const router = Router()

// Default route to check if auth routes are accessible.
router.get("/", (req, res) => {
    res.status(200).send({ data: "Post Route" })
})

// Create a new post.
router.post("/create-post", upload.single("file"), createPost)

// Get recent posts from DB.
router.post("/get-recent-posts", getAllRecentPosts)

// Get posts from a user.
router.post("/get-user-posts", getUserPosts)

// Get specific post from DB.
router.post("/get-post", getPostById)

// Delete post from DB.
router.post("/delete-post", deletePost)

// Search posts in DB.
router.post("/searchPosts", searchPosts)

export default router
