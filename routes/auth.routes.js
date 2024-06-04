import { createUser, getUser } from "../controllers/auth.controller.js"
import { Router } from "express"

// Create a router.
const router = Router()

// Default route to check if auth routes are accessible.
router.get("/", (req, res) => {
    res.status(200).send({ data: "Auth Route" })
})

// Create a new user in the database.
router.post("/create-user", createUser)

// Get the user from the DB.
router.get("/get-user", getUser)

export default router
