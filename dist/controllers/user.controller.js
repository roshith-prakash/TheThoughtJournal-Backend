import { prisma } from "../utils/prismaClient.js";
export const followUser = async (req, res) => {
    var _a, _b;
    try {
        const userId = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.userId;
        const currentUser = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.currentUser;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { followers: true },
        });
        if (user && user.followers.includes(currentUser)) {
            res.status(409).send("Already following the user.");
            return;
        }
        else {
            await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    followerCount: { increment: 1 },
                    followers: { push: currentUser },
                },
            });
            await prisma.user.update({
                where: {
                    id: currentUser,
                },
                data: {
                    followingCount: { increment: 1 },
                    following: { push: userId },
                },
            });
            res.status(200).send("Followed user successfully.");
            return;
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const unfollowUser = async (req, res) => {
    var _a, _b;
    try {
        const userId = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.userId;
        const currentUser = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.currentUser;
        const usertobeFollowed = await prisma.user.findUnique({
            where: { id: userId },
            select: { followers: true },
        });
        if (usertobeFollowed && !usertobeFollowed.followers.includes(currentUser)) {
            res.status(409).send("Not following the user.");
            return;
        }
        else {
            const user = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    followers: true,
                },
            });
            await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    followerCount: { decrement: 1 },
                    followers: {
                        set: user === null || user === void 0 ? void 0 : user.followers.filter((user) => user != currentUser),
                    },
                },
            });
            const dbUser = await prisma.user.findUnique({
                where: {
                    id: currentUser,
                },
                select: {
                    following: true,
                },
            });
            await prisma.user.update({
                where: {
                    id: currentUser,
                },
                data: {
                    followingCount: { decrement: 1 },
                    following: {
                        set: dbUser === null || dbUser === void 0 ? void 0 : dbUser.following.filter((user) => user != userId),
                    },
                },
            });
            res.status(200).send("Unfollowed user successfully.");
            return;
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const getFollowers = async (req, res) => {
    try {
        const username = req.body.username;
        const page = req.body.page;
        const currentUser = await prisma.user.findUnique({
            where: { username: username },
        });
        if (currentUser) {
            let followers = currentUser.followers;
            let takeFollowers = followers.slice(page * 4, (page + 1) * 4);
            let nextPage = followers.slice((page + 1) * 4, (page + 2) * 4);
            let users = takeFollowers.map(async (userId) => {
                return await prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                    select: {
                        name: true,
                        username: true,
                        photoURL: true,
                    },
                });
            });
            let awaitedUsers = await Promise.all(users);
            res.status(200).send({
                users: awaitedUsers,
                nextPage: nextPage.length > 0 ? page + 1 : null,
            });
            return;
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const getFollowing = async (req, res) => {
    try {
        const username = req.body.username;
        const page = req.body.page;
        const currentUser = await prisma.user.findUnique({
            where: { username: username },
        });
        if (currentUser) {
            let following = currentUser.following;
            let takeFollowing = following.slice(page * 4, (page + 1) * 4);
            let nextPage = following.slice((page + 1) * 4, (page + 2) * 4);
            let users = takeFollowing.map(async (userId) => {
                return await prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                    select: {
                        name: true,
                        username: true,
                        photoURL: true,
                    },
                });
            });
            let awaitedUsers = await Promise.all(users);
            res.status(200).send({
                users: awaitedUsers,
                nextPage: nextPage.length > 0 ? page + 1 : null,
            });
            return;
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
