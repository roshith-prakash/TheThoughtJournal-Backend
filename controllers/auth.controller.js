import { prisma } from "../utils/prismaClient.js"

export const createUser = async (req, res) => {
    try {
        const user = req.body?.user

        const checkUser = await prisma.user.findUnique(
            {
                where: {
                    email: user?.email
                }
            }
        )

        checkUser && console.log("User exists")


        if (!checkUser) {
            const createdUser = await prisma.user.create({
                data: {
                    firebaseUID: user?.uid,
                    email: user?.email,
                    name: user?.providerData[0]?.displayName,
                    photoURL: user?.providerData[0]?.photoURL,
                }
            })

            console.log(createdUser)

            res.status(200).send({ user: createdUser })
        } else {
            res.status(200).send({ user: checkUser })
        }


    } catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
    }
}