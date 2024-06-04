import upload from "../utils/multer.js";
import { createPost, getPosts } from "../controllers/post.controller.js"
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

// Get posts from DB.
router.get("/get-posts", getPosts)

export default router
