import { prisma } from "../utils/prismaClient.js"
import cloudinary from "../utils/cloudinary.cjs";

// Create a new post.
export const createPost = async (req, res) => {
    try {

        cloudinary.uploader.upload(req.file.path, async function (err, result) {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Something went wrong! Please try again."
                })
            }
            else {
                const user = JSON.parse(req?.body?.user)
                // Get the user from DB
                const userInDB = await prisma.user.findUnique({
                    where: {
                        email: user?.email
                    }
                })

                if (!userInDB) {
                    console.log(err)
                    res.status(500).send({ data: "User not present." })
                }

                const createdPost = await prisma.post.create({
                    data: {
                        userId: userInDB.id,
                        category: req?.body?.category,
                        content: req?.body?.content,
                        thumbnail: result?.secure_url,
                        title: req?.body?.content,
                    }
                })

                res.status(200).send({ createdPost: createdPost })
            }
            console.log(req.body)
        })

    } catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
    }
}

// Get the most recent posts.
export const getPosts = async () => {
    try {
        // Get posts from DB - 10 most recent posts.
        await prisma.post.findMany({
            orderBy: {
                createdAt: "desc"
            },
            take: 10
        })
    } catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
    }
}