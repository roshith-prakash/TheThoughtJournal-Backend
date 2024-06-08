import upload from "../utils/multer.js";
import { createPost, getAllRecentPosts, getPostById } from "../controllers/post.controller.js"
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
router.get("/get-recent-posts", getAllRecentPosts)

// Get specific post from DB.
router.post("/get-post", getPostById)

export default router
