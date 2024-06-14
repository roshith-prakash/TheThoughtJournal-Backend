import { prisma } from "../utils/prismaClient.js"
import cloudinary from "../utils/cloudinary.cjs";

// Create a new post.
export const createPost = async (req, res) => {
    try {

        // Uploading image to cloudinary
        cloudinary.uploader.upload(req.file.path, async function (err, result) {
            // If error during image upload
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Something went wrong! Please try again."
                })
            }
            // If image upload was successful
            else {

                try {
                    // Parsing user object
                    const user = JSON.parse(req?.body?.user)

                    // Get the user from DB
                    const userInDB = await prisma.user.findUnique({
                        where: {
                            email: user?.email
                        }
                    })

                    // If user does not exist 
                    if (!userInDB) {
                        console.log(err)
                        res.status(500).send({ data: "User not present." })
                        return
                    }

                    // Creating post
                    const createdPost = await prisma.post.create({
                        data: {
                            userId: userInDB.id,
                            category: req?.body?.category,
                            content: req?.body?.content,
                            thumbnail: result?.secure_url,
                            title: req?.body?.title,
                            otherCategory: req?.body?.category == "OTHER" ? req?.body?.otherCategory : null
                        }
                    })

                    // Sending response
                    res.status(200).send({ createdPost: createdPost })
                    return

                } catch (err) {
                    console.log(err)
                    res.status(500).send({ data: "Something went wrong." })
                    return
                }
            }
        })

    } catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
        return
    }
}

// Get the most recent posts.
export const getAllRecentPosts = async (req, res) => {
    try {
        // Get posts from DB - 10 most recent posts.
        const posts = await prisma.post.findMany({
            select: {
                id: true,
                title: true,
                thumbnail: true,
                User: {
                    select: {
                        name: true,
                        photoURL: true,
                        username: true
                    }
                },
                category: true,
                otherCategory: true,
                createdAt: true
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: req?.body?.page * 4,
            take: 4
        })

        // Check if next page exists.
        const nextPage = await prisma.post.count({
            orderBy: {
                createdAt: "desc"
            },
            skip: (req?.body?.page + 1) * 4,
            take: 4
        })

        // Return the posts
        return res.status(200).send({ posts: posts, nextPage: nextPage != 0 ? req?.body?.page + 1 : null })
    } catch (err) {
        // Sending error
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}

// Get the post by ID.
export const getPostById = async (req, res) => {
    try {
        // Receive the postId from the frontend
        const postId = req?.body?.postId

        // Get the post correlating to the postId passed.
        const post = await prisma.post.findUnique({
            where: {
                id: postId
            },
            include: {
                User: {
                    select: {
                        name: true,
                        username: true,
                        photoURL: true
                    }
                }
            },
        })

        // Return the posts
        return res.status(200).send({ post: post })
    } catch (err) {
        // Sending error
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}

// Get the posts for a user.
export const getUserPosts = async (req, res) => {
    try {

        // Find user from username
        const user = await prisma.user.findUnique({
            where: {
                username: req?.body?.username
            },
            select: {
                id: true
            }
        })

        // Get posts from DB - 4 most recent posts.
        const posts = await prisma.post.findMany({
            where: {
                userId: user?.id
            },
            select: {
                id: true,
                title: true,
                thumbnail: true,
                User: {
                    select: {
                        name: true,
                        photoURL: true,
                        username: true
                    }
                },
                category: true,
                otherCategory: true,
                createdAt: true
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: req?.body?.page * 4,
            take: 4
        })

        // Check if next page exists.
        const nextPage = await prisma.post.count({
            orderBy: {
                createdAt: "desc"
            },
            skip: (req?.body?.page + 1) * 4,
            take: 4
        })

        // Return the posts
        return res.status(200).send({ posts: posts, nextPage: nextPage != 0 ? req?.body?.page + 1 : null })

    } catch (err) {
        // Sending error
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}

// Delete a post.
export const deletePost = async (req, res) => {
    try {
        // Receive the postId from the frontend
        const postId = req?.body?.postId

        // Delete the post correlating to the postId passed.
        await prisma.post.delete({
            where: {
                id: postId
            },
        })

        // Return the posts
        return res.status(200).send({ data: "Post deleted." })
    } catch (err) {
        // Sending error
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}

// Search for Posts
export const searchPosts = async (req, res) => {
    try {
        const searchTerm = req?.body?.searchTerm
        const page = req?.body?.page

        // Find all posts where term is present in title, content or otherCategory.
        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    { title: { contains: searchTerm, mode: "insensitive" } },
                    { otherCategory: { contains: searchTerm, mode: "insensitive" } },
                    { content: { contains: searchTerm, mode: "insensitive" } },
                ]
            },
            select: {
                id: true,
                title: true,
                thumbnail: true,
                User: {
                    select: {
                        name: true,
                        photoURL: true,
                        username: true
                    }
                },
                category: true,
                otherCategory: true,
                createdAt: true
            },
            orderBy: { updatedAt: "desc" },
            skip: page * 2,
            take: 2
        })

        // Check if next page exists.
        const nextPageExists = await prisma.post.count({
            where: {
                OR: [
                    { title: { contains: searchTerm, mode: "insensitive" } },
                    { otherCategory: { contains: searchTerm, mode: "insensitive" } },
                    { content: { contains: searchTerm, mode: "insensitive" } },
                ]
            },
            orderBy: { updatedAt: "desc" },
            skip: (page + 1) * 2,
            take: 2
        })


        return res.status(200).send({ posts: posts, nextPage: nextPageExists != 0 ? page + 1 : null })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}