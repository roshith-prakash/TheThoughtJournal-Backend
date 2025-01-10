import { Router } from "express";
import { followUser, getFollowers, getFollowing, unfollowUser, } from "../controllers/user.controller.js";
const router = Router();
router.get("/", (_, res) => {
    res.status(200).send({ data: "User Route" });
});
router.post("/followUser", followUser);
router.post("/unfollowUser", unfollowUser);
router.post("/get-followers", getFollowers);
router.post("/get-following", getFollowing);
export default router;
