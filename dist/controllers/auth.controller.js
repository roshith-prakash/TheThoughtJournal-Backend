import { prisma } from "../utils/prismaClient.js";
import cloudinary from "../utils/cloudinary.js";
export const createUser = async (req, res) => {
    var _a;
    try {
        if (req === null || req === void 0 ? void 0 : req.file) {
            cloudinary.uploader.upload(req.file.path, async function (err, result) {
                var _a;
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        message: "Something went wrong! Please try again.",
                    });
                }
                else {
                    const user = JSON.parse((_a = req.body) === null || _a === void 0 ? void 0 : _a.user);
                    const checkUser = await prisma.user.findUnique({
                        where: {
                            email: user === null || user === void 0 ? void 0 : user.email,
                        },
                    });
                    if (!checkUser) {
                        const createdUser = await prisma.user.create({
                            data: {
                                firebaseUID: user === null || user === void 0 ? void 0 : user.uid,
                                email: user === null || user === void 0 ? void 0 : user.email,
                                name: user === null || user === void 0 ? void 0 : user.name,
                                photoURL: result === null || result === void 0 ? void 0 : result.secure_url,
                                username: user === null || user === void 0 ? void 0 : user.username.toLowerCase(),
                                bio: user === null || user === void 0 ? void 0 : user.bio,
                            },
                        });
                        res.status(200).send({ user: createdUser });
                        return;
                    }
                    else {
                        res.status(200).send({ user: checkUser });
                        return;
                    }
                }
            });
        }
        else {
            const user = JSON.parse((_a = req.body) === null || _a === void 0 ? void 0 : _a.user);
            const checkUser = await prisma.user.findUnique({
                where: {
                    email: user === null || user === void 0 ? void 0 : user.email,
                },
            });
            if (!checkUser) {
                const createdUser = await prisma.user.create({
                    data: {
                        firebaseUID: user === null || user === void 0 ? void 0 : user.uid,
                        email: user === null || user === void 0 ? void 0 : user.email,
                        name: user === null || user === void 0 ? void 0 : user.name,
                        photoURL: user === null || user === void 0 ? void 0 : user.image,
                        username: user === null || user === void 0 ? void 0 : user.username.toLowerCase(),
                        bio: user === null || user === void 0 ? void 0 : user.bio,
                    },
                });
                res.status(200).send({ user: createdUser });
                return;
            }
            else {
                res.status(200).send({ user: checkUser });
                return;
            }
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const getCurrentUser = async (req, res) => {
    var _a;
    try {
        const user = (_a = req.body) === null || _a === void 0 ? void 0 : _a.user;
        const userInDB = await prisma.user.findUnique({
            where: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
            select: {
                id: true,
                name: true,
                bio: true,
                createdAt: true,
                photoURL: true,
                email: true,
                username: true,
                links: true,
                totalLikes: true,
                followerCount: true,
                followers: true,
                followingCount: true,
                following: true,
            },
        });
        if (!userInDB) {
            res.status(404).send({ data: "User does not exist." });
            return;
        }
        res.status(200).send({ user: userInDB });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const getUserProfile = async (req, res) => {
    var _a;
    try {
        const username = (_a = req.body) === null || _a === void 0 ? void 0 : _a.username;
        const userInDB = await prisma.user.findUnique({
            where: {
                username: username,
            },
            select: {
                id: true,
                name: true,
                username: true,
                photoURL: true,
                bio: true,
                links: true,
                createdAt: true,
                totalLikes: true,
                followerCount: true,
                followingCount: true,
            },
        });
        if (!userInDB) {
            res.status(404).send({ data: "User does not exist." });
            return;
        }
        res.status(200).send({ user: userInDB });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const checkIfUsernameExists = async (req, res) => {
    var _a;
    try {
        const username = (_a = req.body) === null || _a === void 0 ? void 0 : _a.username;
        const userInDB = await prisma.user.findUnique({
            where: {
                username: username,
            },
        });
        if (!userInDB) {
            res.status(200).send({ exists: false });
            return;
        }
        res.status(200).send({ exists: true });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const updateUser = async (req, res) => {
    var _a, _b, _c;
    try {
        if (req === null || req === void 0 ? void 0 : req.file) {
            cloudinary.uploader.upload(req.file.path, async function (err, result) {
                var _a, _b, _c;
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        message: "Something went wrong! Please try again.",
                    });
                }
                else {
                    const updatedUser = JSON.parse((_a = req.body) === null || _a === void 0 ? void 0 : _a.updatedUser);
                    const checkUser = await prisma.user.findUnique({
                        where: {
                            id: (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.userId,
                        },
                    });
                    if (!checkUser) {
                        return res.status(404).send({ data: "User Not found" });
                    }
                    else {
                        const user = await prisma.user.update({
                            where: {
                                id: (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.userId,
                            },
                            data: {
                                bio: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.bio,
                                username: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.username,
                                name: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.name,
                                photoURL: result === null || result === void 0 ? void 0 : result.secure_url,
                            },
                        });
                        return res.status(200).send({ user: user });
                    }
                }
            });
        }
        else {
            const updatedUser = JSON.parse((_a = req.body) === null || _a === void 0 ? void 0 : _a.updatedUser);
            const checkUser = await prisma.user.findUnique({
                where: {
                    id: (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.userId,
                },
            });
            if (!checkUser) {
                res.status(404).send({ data: "User Not found" });
                return;
            }
            else {
                const user = await prisma.user.update({
                    where: {
                        id: (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.userId,
                    },
                    data: {
                        bio: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.bio,
                        username: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.username,
                        name: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.name,
                    },
                });
                res.status(200).send({ user: user });
                return;
            }
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const deleteUser = async (req, res) => {
    var _a;
    try {
        const username = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.username;
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
            include: {
                Comment: { select: { id: true, replyCount: true, postId: true } },
            },
        });
        if (!user) {
            res.status(404).send({ data: "User not found." });
            return;
        }
        await prisma.post.deleteMany({
            where: {
                userId: user === null || user === void 0 ? void 0 : user.id,
            },
        });
        let removeFollowers = user.followers.map(async (userId) => {
            const followingUser = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: { following: true },
            });
            if (followingUser) {
                await prisma.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        following: {
                            set: followingUser.following.filter((id) => id != (user === null || user === void 0 ? void 0 : user.id)),
                        },
                        followingCount: { decrement: 1 },
                    },
                });
            }
        });
        let removeFollowing = user.following.map(async (userId) => {
            const followerUser = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: { followers: true, id: true },
            });
            if (followerUser) {
                await prisma.user.update({
                    where: {
                        id: followerUser === null || followerUser === void 0 ? void 0 : followerUser.id,
                    },
                    data: {
                        followers: {
                            set: followerUser.followers.filter((id) => id != (user === null || user === void 0 ? void 0 : user.id)),
                        },
                        followerCount: { decrement: 1 },
                    },
                });
            }
        });
        let removeLikes = user.likedPosts.map(async (postId) => {
            const post = await prisma.post.findUnique({
                where: { id: postId },
            });
            if (post) {
                await prisma.post.update({
                    where: { id: post === null || post === void 0 ? void 0 : post.id },
                    data: {
                        likeCount: { decrement: 1 },
                        likes: (post === null || post === void 0 ? void 0 : post.likes)
                            ? post.likes.filter((userId) => userId != user.id)
                            : [],
                    },
                });
                await prisma.user.update({
                    where: { id: post.userId },
                    data: {
                        totalLikes: { decrement: 1 },
                    },
                });
            }
        });
        let removeComments = user.Comment.map(async (comment) => {
            if ((comment === null || comment === void 0 ? void 0 : comment.replyCount) > 0) {
                await prisma.comment.deleteMany({
                    where: {
                        parentId: comment === null || comment === void 0 ? void 0 : comment.id,
                    },
                });
            }
            await prisma.comment.delete({
                where: {
                    id: comment === null || comment === void 0 ? void 0 : comment.id,
                },
            });
            await prisma.post.update({
                where: {
                    id: comment === null || comment === void 0 ? void 0 : comment.postId,
                },
                data: {
                    commentCount: { decrement: (comment === null || comment === void 0 ? void 0 : comment.replyCount) + 1 },
                },
            });
        });
        await Promise.all(removeFollowers);
        await Promise.all(removeFollowing);
        await Promise.all(removeLikes);
        await Promise.all(removeComments);
        await prisma.user.delete({
            where: {
                id: user === null || user === void 0 ? void 0 : user.id,
            },
        });
        res.status(200).send({ data: "User deleted successfully." });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const searchUsers = async (req, res) => {
    var _a, _b;
    try {
        const searchTerm = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.searchTerm;
        const page = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.page;
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: searchTerm, mode: "insensitive" } },
                    { name: { contains: searchTerm, mode: "insensitive" } },
                ],
            },
            select: {
                name: true,
                username: true,
                photoURL: true,
            },
            orderBy: { followerCount: "desc" },
            skip: page * 2,
            take: 2,
        });
        const nextPageExists = await prisma.user.count({
            where: {
                OR: [
                    { username: { contains: searchTerm, mode: "insensitive" } },
                    { name: { contains: searchTerm, mode: "insensitive" } },
                ],
            },
            orderBy: { followerCount: "desc" },
            skip: (page + 1) * 2,
            take: 2,
        });
        res
            .status(200)
            .send({ users: users, nextPage: nextPageExists != 0 ? page + 1 : null });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
