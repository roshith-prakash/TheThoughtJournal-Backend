import upload from "../utils/multer.js";
import { createPost, deletePost, getAllRecentPosts, getFollowedPosts, getLikedPosts, getPostById, getUserPosts, likePost, searchPosts, unlikePost, updatePost } from "../controllers/post.controller.js"
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

// Like a post.
router.post("/likePost", likePost)

// Unlike a post.
router.post("/unlikePost", unlikePost)

// Unlike a post.
router.post("/get-liked-posts", getLikedPosts)

// Unlike a post.
router.post("/get-followed-posts", getFollowedPosts)

router.post("/update-post", upload.single("file"), updatePost)

export default router
