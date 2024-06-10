import { prisma } from "../utils/prismaClient.js"
import cloudinary from "../utils/cloudinary.cjs";

// Create a new User
export const createUser = async (req, res) => {
    try {
        console.log(req?.body)

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
                    console.log("Result", result)
                    // Get user from request.
                    const user = req.body?.user

                    //Find if user exists in DB  
                    const checkUser = await prisma.user.findUnique({
                        where: {
                            email: user?.email
                        }
                    })

                    // If user exists - log a message.
                    checkUser && console.log("User exists")


                    if (!checkUser) {
                        // Create a user in DB
                        const createdUser = await prisma.user.create({
                            data: {
                                firebaseUID: user?.uid,
                                email: user?.email,
                                name: user?.name,
                                photoURL: result?.secure_url,
                                username: user?.username.toLowerCase(),
                                bio: user?.bio
                            }
                        })

                        // Send the createdUser
                        res.status(200).send({ user: createdUser })
                        return
                    } else {
                        // Send the user in the DB
                        res.status(200).send({ user: checkUser })
                        return
                    }
                }
            })
        }
        else {
            console.log(req?.body)
            const user = JSON.parse(req.body?.user)

            //Find if user exists in DB  
            const checkUser = await prisma.user.findUnique({
                where: {
                    email: user?.email
                }
            })

            // If user exists - log a message.
            checkUser && console.log("User exists")


            if (!checkUser) {
                // Create a user in DB
                const createdUser = await prisma.user.create({
                    data: {
                        firebaseUID: user?.uid,
                        email: user?.email,
                        name: user?.name,
                        photoURL: user?.image,
                        username: user?.username.toLowerCase(),
                        bio: user?.bio
                    }
                })

                // Send the createdUser
                res.status(200).send({ user: createdUser })
                return
            } else {
                // Send the user in the DB
                res.status(200).send({ user: checkUser })
                return
            }
        }

    } catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
        return
    }
}

// Get Current User from DB
export const getCurrentUser = async (req, res) => {
    try {
        // Get user info from request.
        const user = req.body?.user

        // Get the user from DB
        const userInDB = await prisma.user.findUnique({
            where: {
                email: user?.email
            }
        })

        // If user not present in DB
        if (!userInDB) {
            res.status(404).send({ data: "User does not exist." })
            return
        }

        res.status(200).send({ user: userInDB })
        return
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
        return
    }
}

// Get User information
export const getUserProfile = async (req, res) => {
    try {
        // Get user info from request.
        const username = req.body?.username

        // Get the user from DB
        const userInDB = await prisma.user.findUnique({
            where: {
                username: username
            },
            select: {
                name: true,
                username: true,
                photoURL: true,
                bio: true,
                posts: true,
                links: true,
                createdAt: true
            }
        })

        // If user not present in DB
        if (!userInDB) {
            return res.status(404).send({ data: "User does not exist." })

        }

        // sending user
        return res.status(200).send({ user: userInDB })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}

// Check whether username already exists
export const checkIfUsernameExists = async (req, res) => {
    try {
        // Get user info from request.
        const username = req.body?.username

        // Get the user from DB
        const userInDB = await prisma.user.findUnique({
            where: {
                username: username
            },
        })

        // If user not present in DB
        if (!userInDB) {
            return res.status(200).send({ exists: false })
        }

        // sending user
        return res.status(200).send({ exists: true })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}