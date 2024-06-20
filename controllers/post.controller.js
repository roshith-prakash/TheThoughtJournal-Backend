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
                    return res.status(200).send({ createdPost: createdPost })


                } catch (err) {
                    console.log(err)
                    return res.status(500).send({ data: "Something went wrong." })

                }
            }
        })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })

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

        const post = await prisma.post.findUnique({
            where: {
                id: postId
            }
        })

        // Remove likes from total likes
        await prisma.user.update({
            where: {
                id: post?.userId
            },
            data: {
                totalLikes: { decrement: post.likeCount }
            }
        })

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
            orderBy: { createdAt: "desc" },
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
            orderBy: { createdAt: "desc" },
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

            // Increment the totalLike count for the author
            await prisma.user.update({
                where: {
                    id: updatedPost?.userId
                },
                data: {
                    totalLikes: { increment: 1 }
                }
            })

            // Add the post Id to the current user's liked posts
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

            // Decrementing author's like count by 1
            await prisma.user.update({
                where: {
                    id: updatedPost?.userId
                },
                data: {
                    totalLikes: { decrement: 1 }
                }
            })

            // Get the user who initiated the action
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: {
                    likedPosts: true
                }
            })

            // Remove the postID from the user's likes
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

// Get posts by people the user has followed
export const getFollowedPosts = async (req, res) => {
    try {
        const username = req?.body?.username
        const page = req?.body?.page

        // Find the user
        const user = await prisma.user.findUnique({
            where: {
                username: username
            },
            select: {
                following: true
            }
        })

        // If no user is found, send an error
        if (!user) {
            return res.status(404).send("No user found")
        }


        // Get the liked posts
        const posts = await prisma.post.findMany({
            where: {
                userId: { in: user?.following }
            },
            include: {
                User: true
            },
            orderBy: { createdAt: "desc" },
            skip: page * 4,
            take: 4
        })

        // Check if next page exists
        const nextPage = await prisma.post.count({
            where: {
                id: { in: user?.following }
            },
            orderBy: { createdAt: "desc" },
            skip: (page + 1) * 4,
            take: 4
        })

        // Return the posts and nextpage param
        return res.status(200).send({ posts: posts, nextPage: nextPage != 0 ? req?.body?.page + 1 : null })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}


// Update the Post - thumbnail, title, category, otherCategory, content
export const updatePost = async (req, res) => {
    try {
        // If image is uploaded
        if (req?.file) {
            cloudinary.uploader.upload(req.file.path, async function (err, result) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        message: "Something went wrong! Please try again."
                    })
                }
                // If image upload was successful
                else {
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

                    // Updating post
                    const updatedPost = await prisma.post.update({
                        where: {
                            id: req?.body?.postId
                        },
                        data: {
                            category: req?.body?.category,
                            content: req?.body?.content,
                            thumbnail: result?.secure_url,
                            title: req?.body?.title,
                            otherCategory: req?.body?.category == "OTHER" ? req?.body?.otherCategory : null
                        }
                    })

                    // Sending response
                    return res.status(200).send({ updatedPost: updatedPost })
                }
            })
        }
        // If image is not uploaded / google image used.
        else {
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

            // Updating post
            const updatedPost = await prisma.post.update({
                where: {
                    id: req?.body?.postId
                },
                data: {
                    category: req?.body?.category,
                    content: req?.body?.content,
                    title: req?.body?.title,
                    otherCategory: req?.body?.category == "OTHER" ? req?.body?.otherCategory : null
                }
            })

            // Sending response
            return res.status(200).send({ updatedPost: updatedPost })
        }

    } catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
        return
    }
}

// Add a comment
export const addComment = async (req, res) => {
    try {
        const userId = req?.body?.userId
        const postId = req?.body?.postId
        const parentId = req?.body?.parentId
        const commentContent = req?.body?.content

        const comment = await prisma.comment.create({
            data: {
                content: commentContent,
                postId: postId,
                userId: userId,
                parentId: parentId ? parentId : null
            }
        })

        return res.status(200).send({ comment: comment, data: "Comment Created!" })

    } catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
        return
    }
}

// Remove a comment
export const removeComment = async (req, res) => {
    try {
        const commentId = req?.body?.commentId

        await prisma.comment.delete({
            where: {
                id: commentId
            }
        })

        return res.status(200).send({ comment: comment, data: "Comment Created!" })

    } catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
        return
    }
}

// Remove a comment
export const getComments = async (req, res) => {
    try {
        const postId = req?.body?.postId
        const page = req?.body?.page

        // Get the liked posts
        const comments = await prisma.comment.findMany({
            where: {
                postId: postId,
                parentId: null
            },
            include: {
                User: true,
                replies: {
                    include: { User: true }, take: 2, orderBy: {
                        createdAt:
                            "asc"
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            skip: page * 4,
            take: 4
        })

        // Check if next page exists
        const nextPage = await prisma.comment.count({
            where: {
                postId: postId,
                parentId: null
            },
            orderBy: { createdAt: "desc" },
            skip: (page + 1) * 4,
            take: 4
        })

        // Return the comments and nextpage param
        return res.status(200).send({ comments: comments, nextPage: nextPage != 0 ? req?.body?.page + 1 : null })
    } catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
        return
    }
}

// Get replies for a comment
export const getReplies = async (req, res) => {
    try {
        const postId = req?.body?.postId
        const page = req?.body?.page
        const parentId = req?.body?.parentId

        // Get the liked posts
        const replies = await prisma.comment.findMany({
            where: {
                postId: postId,
                parentId: parentId
            },
            include: {
                User: true,
            },
            orderBy: { createdAt: "asc" },
            skip: page * 2,
            take: 2
        })

        // Check if next page exists
        const nextPage = await prisma.comment.count({
            where: {
                postId: postId,
                parentId: parentId
            },
            orderBy: { createdAt: "asc" },
            skip: (page + 1) * 2,
            take: 2
        })

        // Return the comments and nextpage param
        return res.status(200).send({ replies: replies, nextPage: nextPage != 0 ? req?.body?.page + 1 : null })
    } catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
        return
    }
}

