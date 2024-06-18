import { prisma } from "../utils/prismaClient.js"
import cloudinary from "../utils/cloudinary.cjs";

// Create a new User
export const createUser = async (req, res) => {
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
                    // Get user from request.
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
        // If image is not uploaded / google image used.
        else {
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
            },
            select: {
                id: true,
                name: true,
                bio: true,
                createdAt: true,
                photoURL: true,
                email: true,
                username: true,
                links: true,
                totalLikes: true,
                followerCount: true,
                followers: true,
                followingCount: true,
                following: true
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
                id: true,
                name: true,
                username: true,
                photoURL: true,
                bio: true,
                links: true,
                createdAt: true,
                totalLikes: true,
                followerCount: true,
                followingCount: true
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

// Update the User details - image, name, bio, username updateable0
export const updateUser = async (req, res) => {
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
                    // Get user from request.
                    const updatedUser = JSON.parse(req.body?.updatedUser)

                    //Find if user exists in DB  
                    const checkUser = await prisma.user.findUnique({
                        where: {
                            id: req?.body?.userId
                        }
                    })


                    if (!checkUser) {
                        // Send an error
                        return res.status(404).send({ data: "User Not found" })
                    } else {
                        // Send the user in the DB
                        const user = await prisma.user.update({
                            where: {
                                id: req?.body?.userId
                            }, data: {
                                bio: updatedUser?.bio,
                                username: updatedUser?.username,
                                name: updatedUser?.name,
                                photoURL: result?.secure_url,
                            }
                        })
                        return res.status(200).send({ user: user })
                    }
                }
            })
        }
        // If image is not uploaded / google image used.
        else {
            // Get user from request.
            const updatedUser = JSON.parse(req.body?.updatedUser)

            //Find if user exists in DB  
            const checkUser = await prisma.user.findUnique({
                where: {
                    id: req?.body?.userId
                }
            })


            if (!checkUser) {
                // Send an error
                return res.status(404).send({ data: "User Not found" })
            } else {
                // Send the user in the DB
                const user = await prisma.user.update({
                    where: {
                        id: req?.body?.userId
                    }, data: {
                        bio: updatedUser?.bio,
                        username: updatedUser?.username,
                        name: updatedUser?.name,
                    }
                })
                return res.status(200).send({ user: user })
            }
        }

    } catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
        return
    }
}

// Delete the user & any posts created by the user.
export const deleteUser = async (req, res) => {
    try {

        // Get username from frontend
        const username = req?.body?.username

        // Find the user from frontend
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

        if (!user) {
            return res.status(404).send({ data: "User not found." })
        }

        // Delete all the user's posts
        await prisma.post.deleteMany({
            where: {
                userId: user?.id
            }
        })

        // Remove user from the following list of others
        let removeFollowers = user.followers.map(async (userId) => {
            const followingUser = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: { following: true }
            })

            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    following: { set: followingUser.following.filter(id => id != user?.id) },
                    followingCount: { decrement: 1 }
                }
            })
        })

        // Remove user from the follower list of others
        let removeFollowing = user.following.map(async (userId) => {
            const followerUser = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: { followers: true, id: true }
            })

            await prisma.user.update({
                where: {
                    id: followerUser?.id
                },
                data: {
                    followers: { set: followerUser.followers.filter(id => id != user?.id) },
                    followerCount: { decrement: 1 }
                }
            })
        })

        // Remove like from likedPosts
        let removeLikes = user.likedPosts.map(async (postId) => {
            // Find the post
            const post = await prisma.post.findUnique({
                where: { id: postId }
            })

            // Remove the like from the post
            await prisma.post.update({
                where: { id: post.id },
                data: {
                    likeCount: { decrement: 1 },
                    likes: post.likes.filter(userId => userId != user.id)
                }
            })

            // Decrement a like from the author
            await prisma.user.update({
                where: { id: post.userId },
                data: {
                    totalLikes: { decrement: 1 }
                }
            })
        })

        // Await promises 
        removeFollowers = await Promise.all(removeFollowers)
        removeFollowing = await Promise.all(removeFollowing)
        removeLikes = await Promise.all(removeLikes)

        await prisma.user.delete({
            where: {
                id: user?.id
            }
        })

        return res.status(200).send({ data: "User deleted successfully." })

    } catch (err) {
        console.log(err)
        res.status(500).send({ data: "Something went wrong." })
        return
    }
}

// Search for users
export const searchUsers = async (req, res) => {
    try {
        const searchTerm = req?.body?.searchTerm
        const page = req?.body?.page

        // Get users where name or username contains the searchterm
        // Sort by number of total likes 
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: searchTerm, mode: "insensitive" } },
                    { name: { contains: searchTerm, mode: "insensitive" } },
                ]
            },
            select: {
                name: true,
                username: true,
                photoURL: true
            },
            orderBy: { followerCount: "desc" },
            skip: page * 2,
            take: 2
        })

        // Check if nextpage exists
        const nextPageExists = await prisma.user.count({
            where: {
                OR: [
                    { username: { contains: searchTerm, mode: "insensitive" } },
                    { name: { contains: searchTerm, mode: "insensitive" } },
                ]
            },
            orderBy: { followerCount: "desc" },
            skip: (page + 1) * 2,
            take: 2
        })

        return res.status(200).send({ users: users, nextPage: nextPageExists != 0 ? page + 1 : null })
    } catch {
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}