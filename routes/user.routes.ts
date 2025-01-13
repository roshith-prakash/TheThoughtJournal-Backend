import { Router } from "express";
import {
  followUser,
  getFollowers,
  getFollowing,
  unfollowUser,
} from "../controllers/user.controller.ts";

// Create a router.
const router = Router();

// Default route to check if auth routes are accessible.
router.get("/", (_, res) => {
  res.status(200).send({ data: "User Route" });
});

// Route to follow a User
router.post("/followUser", followUser);

// Route to follow a User
router.post("/unfollowUser", unfollowUser);

// Route to get the user's followers
router.post("/get-followers", getFollowers);

// Route to get the following list of a user
router.post("/get-following", getFollowing);

export default router;
