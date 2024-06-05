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
                }

                // Creating post
                const createdPost = await prisma.post.create({
                    data: {
                        userId: userInDB.id,
                        category: req?.body?.category,
                        content: req?.body?.content,
                        thumbnail: result?.secure_url,
                        title: req?.body?.title,
                    }
                })

                // Sending response
                res.status(200).send({ createdPost: createdPost })
            }
        })

    } catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
    }
}

// Get the most recent posts.
export const getAllRecentPosts = async (req, res) => {
    try {
        // Get posts from DB - 10 most recent posts.
        const posts = await prisma.post.findMany({
            include: {
                User: true
            },
            orderBy: {
                createdAt: "desc"
            },
        })

        res.status(200).send({ posts: posts })
    } catch (err) {
        // Sending error
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
    }
}