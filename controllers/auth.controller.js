import { prisma } from "../utils/prismaClient.js"

// Create a new User
export const createUser = async (req, res) => {
    try {
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

        let username
        if (user?.providerData[0]?.displayName) {
            username = String(user?.providerData[0]?.displayName).split(" ")[0] + "_" + user?.uid
        } else {
            username = String(user?.email).split("@")[0] + "_" + user?.uid
        }


        if (!checkUser) {
            // Create a user in DB
            const createdUser = await prisma.user.create({
                data: {
                    firebaseUID: user?.uid,
                    email: user?.email,
                    name: user?.providerData[0]?.displayName,
                    photoURL: user?.providerData[0]?.photoURL,
                    username: username.toLowerCase()
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