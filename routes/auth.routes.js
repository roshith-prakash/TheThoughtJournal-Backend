import { createUser, getCurrentUser, getUserProfile } from "../controllers/auth.controller.js"
import { Router } from "express"

// Create a router.
const router = Router()

// Default route to check if auth routes are accessible.
router.get("/", (req, res) => {
    res.status(200).send({ data: "Auth Route" })
})

// Create a new user in the database.
router.post("/create-user", createUser)

// Get the current user from the DB.
router.post("/get-current-user", getCurrentUser)

// Get the user information from the DB.
router.post("/get-user-info", getUserProfile)

export default router
