import { prisma } from "../utils/prismaClient.js";
import { Category } from "@prisma/client";
import cloudinary from "../utils/cloudinary.js";
export const createPost = async (req, res) => {
    try {
        if (req === null || req === void 0 ? void 0 : req.file) {
            cloudinary.uploader.upload(req.file.path, async function (err, result) {
                var _a, _b, _c, _d, _e, _f;
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        message: "Something went wrong! Please try again.",
                    });
                }
                else {
                    try {
                        const user = JSON.parse((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.user);
                        const userInDB = await prisma.user.findUnique({
                            where: {
                                email: user === null || user === void 0 ? void 0 : user.email,
                            },
                        });
                        if (!userInDB) {
                            console.log(err);
                            res.status(500).send({ data: "User not present." });
                            return;
                        }
                        const createdPost = await prisma.post.create({
                            data: {
                                userId: userInDB.id,
                                category: (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.category,
                                content: (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.content,
                                thumbnail: result === null || result === void 0 ? void 0 : result.secure_url,
                                title: (_d = req === null || req === void 0 ? void 0 : req.body) === null || _d === void 0 ? void 0 : _d.title,
                                otherCategory: ((_e = req === null || req === void 0 ? void 0 : req.body) === null || _e === void 0 ? void 0 : _e.category) == "OTHER"
                                    ? (_f = req === null || req === void 0 ? void 0 : req.body) === null || _f === void 0 ? void 0 : _f.otherCategory
                                    : null,
                            },
                        });
                        return res.status(200).send({ createdPost: createdPost });
                    }
                    catch (err) {
                        console.log(err);
                        return res.status(500).send({ data: "Something went wrong." });
                    }
                }
            });
        }
        else {
            res.status(500).send({ data: "Something went wrong." });
            return;
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const getAllRecentPosts = async (req, res) => {
    var _a, _b, _c;
    try {
        const posts = await prisma.post.findMany({
            select: {
                id: true,
                title: true,
                thumbnail: true,
                User: {
                    select: {
                        name: true,
                        photoURL: true,
                        username: true,
                    },
                },
                category: true,
                otherCategory: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            skip: ((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.page) * 4,
            take: 4,
        });
        const nextPage = await prisma.post.count({
            orderBy: {
                createdAt: "desc",
            },
            skip: (((_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.page) + 1) * 4,
            take: 4,
        });
        res.status(200).send({
            posts: posts,
            nextPage: nextPage != 0 ? ((_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.page) + 1 : null,
        });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const getPostById = async (req, res) => {
    var _a;
    try {
        const postId = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.postId;
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
            },
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        photoURL: true,
                    },
                },
            },
        });
        res.status(200).send({ post: post });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const getUserPosts = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.username,
            },
            select: {
                id: true,
            },
        });
        const posts = await prisma.post.findMany({
            where: {
                userId: user === null || user === void 0 ? void 0 : user.id,
            },
            select: {
                id: true,
                title: true,
                thumbnail: true,
                User: {
                    select: {
                        name: true,
                        photoURL: true,
                        username: true,
                    },
                },
                category: true,
                otherCategory: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            skip: ((_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.page) * 4,
            take: 4,
        });
        const nextPage = await prisma.post.count({
            where: {
                userId: user === null || user === void 0 ? void 0 : user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            skip: (((_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.page) + 1) * 4,
            take: 4,
        });
        res.status(200).send({
            posts: posts,
            nextPage: nextPage != 0 ? ((_d = req === null || req === void 0 ? void 0 : req.body) === null || _d === void 0 ? void 0 : _d.page) + 1 : null,
        });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const deletePost = async (req, res) => {
    var _a;
    try {
        const postId = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.postId;
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
            },
        });
        if (post) {
            await prisma.user.update({
                where: {
                    id: post === null || post === void 0 ? void 0 : post.userId,
                },
                data: {
                    totalLikes: { decrement: post.likeCount },
                },
            });
            await prisma.post.delete({
                where: {
                    id: postId,
                },
            });
            await prisma.comment.deleteMany({
                where: {
                    postId: post === null || post === void 0 ? void 0 : post.id,
                },
            });
            res.status(200).send({ data: "Post deleted." });
            return;
        }
        else {
            res.status(404).send({ data: "Post does not exist" });
            return;
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const searchPosts = async (req, res) => {
    var _a, _b;
    try {
        const searchTerm = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.searchTerm;
        const page = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.page;
        const matchingCategory = Object.values(Category).filter((category) => category.includes(String(searchTerm).toUpperCase()));
        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    { category: { in: matchingCategory } },
                    { title: { contains: searchTerm, mode: "insensitive" } },
                    { otherCategory: { contains: searchTerm, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                title: true,
                thumbnail: true,
                User: {
                    select: {
                        name: true,
                        photoURL: true,
                        username: true,
                    },
                },
                category: true,
                otherCategory: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            skip: page * 2,
            take: 2,
        });
        const nextPageExists = await prisma.post.count({
            where: {
                OR: [
                    { category: { in: matchingCategory } },
                    { title: { contains: searchTerm, mode: "insensitive" } },
                    { otherCategory: { contains: searchTerm, mode: "insensitive" } },
                ],
            },
            orderBy: { createdAt: "desc" },
            skip: (page + 1) * 2,
            take: 2,
        });
        res
            .status(200)
            .send({ posts: posts, nextPage: nextPageExists != 0 ? page + 1 : null });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const likePost = async (req, res) => {
    var _a, _b;
    try {
        const postId = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.postId;
        const userId = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.userId;
        const foundPost = await prisma.post.findUnique({
            where: {
                id: postId,
            },
            select: {
                id: true,
                likes: true,
            },
        });
        if (!foundPost) {
            res.status(404).send("Post does not exist.");
            return;
        }
        if (!foundPost.likes.includes(userId)) {
            const updatedPost = await prisma.post.update({
                where: {
                    id: postId,
                },
                data: {
                    likeCount: { increment: 1 },
                    likes: { push: userId },
                },
            });
            await prisma.user.update({
                where: {
                    id: updatedPost === null || updatedPost === void 0 ? void 0 : updatedPost.userId,
                },
                data: {
                    totalLikes: { increment: 1 },
                },
            });
            await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    likedPosts: { push: postId },
                },
            });
            res.status(200).send({ post: updatedPost });
            return;
        }
        res.status(200).send("Post already liked by user!");
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const unlikePost = async (req, res) => {
    var _a, _b;
    try {
        const postId = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.postId;
        const userId = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.userId;
        const foundPost = await prisma.post.findUnique({
            where: {
                id: postId,
            },
            select: {
                id: true,
                likes: true,
            },
        });
        if (!foundPost) {
            res.status(404).send("Post does not exist.");
            return;
        }
        if (foundPost.likes.includes(userId)) {
            const updatedPost = await prisma.post.update({
                where: {
                    id: postId,
                },
                data: {
                    likeCount: { decrement: 1 },
                    likes: { set: foundPost === null || foundPost === void 0 ? void 0 : foundPost.likes.filter((user) => user != userId) },
                },
            });
            await prisma.user.update({
                where: {
                    id: updatedPost === null || updatedPost === void 0 ? void 0 : updatedPost.userId,
                },
                data: {
                    totalLikes: { decrement: 1 },
                },
            });
            const user = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    likedPosts: true,
                },
            });
            if (user) {
                await prisma.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        likedPosts: {
                            set: user.likedPosts.filter((post) => post != postId),
                        },
                    },
                });
            }
            res.status(200).send({ post: updatedPost });
            return;
        }
        res.status(200).send("Like was removed by user!");
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const getLikedPosts = async (req, res) => {
    var _a, _b, _c;
    try {
        const username = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.username;
        const page = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.page;
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
        });
        if (!user) {
            res.status(404).send("No user found");
            return;
        }
        const likedPostArr = user === null || user === void 0 ? void 0 : user.likedPosts.reverse();
        const takePosts = likedPostArr.slice(page * 4, (page + 1) * 4);
        const nextPosts = likedPostArr.slice((page + 1) * 4, (page + 2) * 4);
        let posts = takePosts.map(async (postID) => {
            return prisma.post.findUnique({
                where: {
                    id: postID,
                },
                include: {
                    User: true,
                },
            });
        });
        let awaitedPosts = await Promise.all(posts);
        res.status(200).send({
            posts: awaitedPosts,
            nextPage: nextPosts.length != 0 ? ((_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.page) + 1 : null,
        });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const getFollowedPosts = async (req, res) => {
    var _a, _b, _c;
    try {
        const username = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.username;
        const page = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.page;
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
            select: {
                following: true,
            },
        });
        if (!user) {
            res.status(404).send("No user found");
            return;
        }
        const posts = await prisma.post.findMany({
            where: {
                userId: { in: user === null || user === void 0 ? void 0 : user.following },
            },
            include: {
                User: true,
            },
            orderBy: { createdAt: "desc" },
            skip: page * 4,
            take: 4,
        });
        const nextPage = await prisma.post.count({
            where: {
                userId: { in: user === null || user === void 0 ? void 0 : user.following },
            },
            orderBy: { createdAt: "desc" },
            skip: (page + 1) * 4,
            take: 4,
        });
        res.status(200).send({
            posts: posts,
            nextPage: nextPage != 0 ? ((_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.page) + 1 : null,
        });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const updatePost = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        if (req === null || req === void 0 ? void 0 : req.file) {
            cloudinary.uploader.upload(req.file.path, async function (err, result) {
                var _a, _b, _c, _d, _e, _f, _g;
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        message: "Something went wrong! Please try again.",
                    });
                }
                else {
                    const user = JSON.parse((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.user);
                    const userInDB = await prisma.user.findUnique({
                        where: {
                            email: user === null || user === void 0 ? void 0 : user.email,
                        },
                    });
                    if (!userInDB) {
                        console.log(err);
                        res.status(500).send({ data: "User not present." });
                        return;
                    }
                    const updatedPost = await prisma.post.update({
                        where: {
                            id: (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.postId,
                        },
                        data: {
                            category: (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.category,
                            content: (_d = req === null || req === void 0 ? void 0 : req.body) === null || _d === void 0 ? void 0 : _d.content,
                            thumbnail: result === null || result === void 0 ? void 0 : result.secure_url,
                            title: (_e = req === null || req === void 0 ? void 0 : req.body) === null || _e === void 0 ? void 0 : _e.title,
                            otherCategory: ((_f = req === null || req === void 0 ? void 0 : req.body) === null || _f === void 0 ? void 0 : _f.category) == "OTHER"
                                ? (_g = req === null || req === void 0 ? void 0 : req.body) === null || _g === void 0 ? void 0 : _g.otherCategory
                                : null,
                        },
                    });
                    return res.status(200).send({ updatedPost: updatedPost });
                }
            });
        }
        else {
            const user = JSON.parse((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.user);
            const userInDB = await prisma.user.findUnique({
                where: {
                    email: user === null || user === void 0 ? void 0 : user.email,
                },
            });
            if (!userInDB) {
                res.status(500).send({ data: "User not present." });
                return;
            }
            const updatedPost = await prisma.post.update({
                where: {
                    id: (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.postId,
                },
                data: {
                    category: (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.category,
                    content: (_d = req === null || req === void 0 ? void 0 : req.body) === null || _d === void 0 ? void 0 : _d.content,
                    title: (_e = req === null || req === void 0 ? void 0 : req.body) === null || _e === void 0 ? void 0 : _e.title,
                    otherCategory: ((_f = req === null || req === void 0 ? void 0 : req.body) === null || _f === void 0 ? void 0 : _f.category) == "OTHER" ? (_g = req === null || req === void 0 ? void 0 : req.body) === null || _g === void 0 ? void 0 : _g.otherCategory : null,
                },
            });
            res.status(200).send({ updatedPost: updatedPost });
            return;
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const addComment = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const userId = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.userId;
        const postId = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.postId;
        const parentId = (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.parentId;
        const commentContent = (_d = req === null || req === void 0 ? void 0 : req.body) === null || _d === void 0 ? void 0 : _d.content;
        if (parentId) {
            await prisma.comment.update({
                where: {
                    id: parentId,
                },
                data: {
                    replyCount: { increment: 1 },
                },
            });
        }
        const comment = await prisma.comment.create({
            data: {
                content: commentContent,
                postId: postId,
                userId: userId,
                parentId: parentId ? parentId : null,
            },
        });
        await prisma.post.update({
            where: {
                id: postId,
            },
            data: {
                commentCount: { increment: 1 },
            },
        });
        res.status(200).send({ comment: comment, data: "Comment Created!" });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const removeComment = async (req, res) => {
    var _a;
    try {
        const commentId = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.commentId;
        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId,
            },
        });
        if (comment && (comment === null || comment === void 0 ? void 0 : comment.replyCount) > 0) {
            await prisma.comment.deleteMany({
                where: {
                    parentId: commentId,
                },
            });
            await prisma.post.update({
                where: {
                    id: comment.postId,
                },
                data: {
                    commentCount: { decrement: Number(comment.replyCount) + 1 },
                },
            });
        }
        else {
            if (!comment) {
                res.status(404).send({ data: "Comment not found!" });
                return;
            }
            await prisma.post.update({
                where: {
                    id: comment.postId,
                },
                data: {
                    commentCount: { decrement: 1 },
                },
            });
            if (comment === null || comment === void 0 ? void 0 : comment.parentId) {
                await prisma.comment.update({
                    where: {
                        id: comment === null || comment === void 0 ? void 0 : comment.parentId,
                    },
                    data: {
                        replyCount: { decrement: 1 },
                    },
                });
            }
        }
        await prisma.comment.delete({
            where: {
                id: commentId,
            },
        });
        res.status(200).send({ data: "Comment Created!" });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const getComments = async (req, res) => {
    var _a, _b, _c;
    try {
        const postId = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.postId;
        const page = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.page;
        const comments = await prisma.comment.findMany({
            where: {
                postId: postId,
                parentId: null,
            },
            include: {
                User: true,
                replies: {
                    include: { User: true },
                    take: 2,
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: page * 4,
            take: 4,
        });
        const nextPage = await prisma.comment.count({
            where: {
                postId: postId,
                parentId: null,
            },
            orderBy: { createdAt: "desc" },
            skip: (page + 1) * 4,
            take: 4,
        });
        res.status(200).send({
            comments: comments,
            nextPage: nextPage != 0 ? ((_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.page) + 1 : null,
        });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
export const getReplies = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const postId = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.postId;
        const page = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.page;
        const parentId = (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.parentId;
        const replies = await prisma.comment.findMany({
            where: {
                postId: postId,
                parentId: parentId,
            },
            include: {
                User: true,
            },
            orderBy: { createdAt: "asc" },
            skip: page * 2,
            take: 2,
        });
        const nextPage = await prisma.comment.count({
            where: {
                postId: postId,
                parentId: parentId,
            },
            orderBy: { createdAt: "asc" },
            skip: (page + 1) * 2,
            take: 2,
        });
        res.status(200).send({
            replies: replies,
            nextPage: nextPage != 0 ? ((_d = req === null || req === void 0 ? void 0 : req.body) === null || _d === void 0 ? void 0 : _d.page) + 1 : null,
        });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ data: "Something went wrong." });
        return;
    }
};
