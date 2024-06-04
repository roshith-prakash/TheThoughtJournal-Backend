import { prisma } from "../utils/prismaClient.js"

// Create User
export const createUser = async (req, res) => {
    try {
        // Get user from request.
        const user = req.body?.user

        // console.log(user)

        //Find if user exists in DB  
        const checkUser = await prisma.user.findUnique(
            {
                where: {
                    email: user?.email
                }
            }
        )

        // If user exists - log a message.
        checkUser && console.log("User exists")


        if (!checkUser) {
            // Create a user in DB
            // If photoURL
            const createdUser = await prisma.user.create({
                data: {
                    firebaseUID: user?.uid,
                    email: user?.email,
                    name: user?.providerData[0]?.displayName,
                    photoURL: user?.providerData[0]?.photoURL,
                }
            })

            // Send the createdUser
            res.status(200).send({ user: createdUser })
        } else {
            // Send the user in the DB
            res.status(200).send({ user: checkUser })
        }


    } catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
    }
}

// Get User from DB
export const getUser = async (req, res) => {
    try {
        // Get user info from request.
        const user = req.body?.user

        // Get the user from DB
        const userInDB = await prisma.user.findUnique({
            where: {
                email: user?.email
            }
        })

        if (!userInDB) {
            res.status(500).send({ data: "User does not exist." })
        }

        res.status(200).send({ user: userInDB })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
    }
}