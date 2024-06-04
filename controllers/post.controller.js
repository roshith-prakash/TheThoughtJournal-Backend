import { prisma } from "../utils/prismaClient.js"
import cloudinary from "../utils/cloudinary.cjs";

// Create a new post.
export const createPost = async (req, res) => {
    try {

        // cloudinary.uploader.upload(req.file.path, function (err, result) {
        //     if (err) {
        //         console.log(err);
        //         return res.status(500).json({
        //             message: "Something went wrong! Please try again."
        //         })
        //     }
        //     else {
        //         console.log("Test")
        //     }
        //     console.log(req.body)
        // })

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