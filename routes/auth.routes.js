import { createUser } from "../controllers/auth.controller.js"

import { Router } from "express"
const router = Router()

router.get("/", (req, res) => {
    res.status(200).send({ data: "Auth Route" })
})

router.post("/create-user", createUser)

export default router
