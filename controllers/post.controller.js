import { prisma } from "../utils/prismaClient.js"
import { Category } from "@prisma/client";
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

        // To find categories where search term is in enum
        const matchingCategory = Object.values(Category).filter(
            category => category.includes(String(searchTerm).toUpperCase())
        );


        // Find all posts where term is present in title, category or otherCategory.
        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    { category: { in: matchingCategory } },
                    { title: { contains: searchTerm, mode: "insensitive" } },
                    { otherCategory: { contains: searchTerm, mode: "insensitive" } },
                    // { content: { contains: searchTerm, mode: "insensitive" } },
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
            orderBy: { likeCount: "desc" },
            skip: page * 2,
            take: 2
        })

        // Check if next page exists.
        const nextPageExists = await prisma.post.count({
            where: {
                OR: [
                    { category: { in: matchingCategory } },
                    { title: { contains: searchTerm, mode: "insensitive" } },
                    { otherCategory: { contains: searchTerm, mode: "insensitive" } },
                    // { content: { contains: searchTerm, mode: "insensitive" } },
                ]
            },
            orderBy: { likeCount: "desc" },
            skip: (page + 1) * 2,
            take: 2
        })

        // Return the current page posts and next page number
        return res.status(200).send({ posts: posts, nextPage: nextPageExists != 0 ? page + 1 : null })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}

// To like post
export const likePost = async (req, res) => {
    try {
        const postId = req?.body?.postId
        const userId = req?.body?.userId

        // Search for post
        const foundPost = await prisma.post.findUnique({
            where: {
                id: postId
            },
            select: {
                id: true,
                likes: true
            }
        })

        // If post is not found, send a 404 error
        if (!foundPost) {
            return res.status(404).send("Post does not exist.")
        }

        if (!foundPost.likes.includes(userId)) {
            // Add a like and push the user
            const updatedPost = await prisma.post.update({
                where: {
                    id: postId
                },
                data: {
                    likeCount: { increment: 1 },
                    likes: { push: userId }
                }
            })

            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    likedPosts: { push: postId }
                }
            })

            // Return the updated post
            return res.status(200).send({ post: updatedPost })
        }

        return res.status(200).send("Post already liked by user!")
    } catch (err) {
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}

// To unlike post
export const unlikePost = async (req, res) => {
    try {
        const postId = req?.body?.postId
        const userId = req?.body?.userId

        // Search for post
        const foundPost = await prisma.post.findUnique({
            where: {
                id: postId
            },
            select: {
                id: true,
                likes: true
            }
        })

        // If post is not found, send 404 error
        if (!foundPost) {
            return res.status(404).send("Post does not exist.")
        }

        if (foundPost.likes.includes(userId)) {
            // Remove like and update the likes array
            const updatedPost = await prisma.post.update({
                where: {
                    id: postId
                },
                data: {
                    likeCount: { decrement: 1 },
                    likes: { set: foundPost?.likes.filter(user => user != userId) }
                }
            })

            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: {
                    likedPosts: true
                }
            })

            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    likedPosts: { set: user.likedPosts.filter(post => post != postId) }
                }
            })

            // Return the updated post
            return res.status(200).send({ post: updatedPost })
        }

        return res.status(200).send("Post was not liked by user!")
    } catch (err) {
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}

// Get Liked Posts for current User
export const getLikedPosts = async (req, res) => {
    try {
        const username = req?.body?.username
        const page = req?.body?.page

        // Find the user
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

        // If no user is found, send an error
        if (!user) {
            return res.status(404).send("No user found")
        }

        // Reverse the array - to find the most recently liked posts
        const likedPostArr = user?.likedPosts.reverse()

        // Post IDs to be fetched for current page
        const takePosts = likedPostArr.slice(page * 4, (page + 1) * 4)
        // Posts IDs for next page
        const nextPosts = likedPostArr.slice((page + 1) * 4, (page + 2) * 4)

        // Fetch the posts from dB
        let posts = takePosts.map(async (postID) => {
            return prisma.post.findUnique({
                where: {
                    id: postID
                },
                include: {
                    User: true
                }
            })
        })

        // Await the promises returned from above loop
        posts = await Promise.all(posts)

        // Get the liked posts
        // const posts = await prisma.post.findMany({
        //     where: {
        //         id: { in: likedPostArr }
        //     },
        //     include: {
        //         User: true
        //     },
        //     skip: page * 4,
        //     take: 4
        // })

        // // Check if next page exists
        // const nextPage = await prisma.post.count({
        //     where: {
        //         id: { in: likedPostArr }
        //     },
        //     skip: (page + 1) * 4,
        //     take: 4
        // })

        // Return the posts and nextpage param

        return res.status(200).send({ posts: posts, nextPage: nextPosts.length != 0 ? req?.body?.page + 1 : null })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}