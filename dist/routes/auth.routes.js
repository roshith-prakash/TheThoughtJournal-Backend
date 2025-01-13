import upload from "../utils/multer.js";
import { createUser, getCurrentUser, getUserProfile, checkIfUsernameExists, updateUser, deleteUser, searchUsers, } from "../controllers/auth.controller.js";
import { Router } from "express";
const router = Router();
router.get("/", (_, res) => {
    res.status(200).send({ data: "Auth Route" });
});
router.post("/create-user", upload.single("file"), createUser);
router.post("/get-current-user", getCurrentUser);
router.post("/get-user-info", getUserProfile);
router.post("/checkUsername", checkIfUsernameExists);
router.post("/update-user", upload.single("file"), updateUser);
router.post("/delete-user", deleteUser);
router.post("/searchUsers", searchUsers);
export default router;
