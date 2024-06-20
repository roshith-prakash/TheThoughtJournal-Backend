import { prisma } from "../utils/prismaClient.js"

// Follow a user
export const followUser = async (req, res) => {
    try {
        const userId = req?.body?.userId
        const currentUser = req?.body?.currentUser

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { followers: true }
        })

        if (user.followers.includes(currentUser)) {
            return res.status(409).send("Already following the user.")
        }
        else {
            // Updating the user who is followed
            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    followerCount: { increment: 1 },
                    followers: { push: currentUser }
                }
            })

            // Updating the user performing the action
            await prisma.user.update({
                where: {
                    id: currentUser
                },
                data: {
                    followingCount: { increment: 1 },
                    following: { push: userId }
                }
            })

            return res.status(200).send("Followed user successfully.")
        }


    } catch {
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}

// Follow a user
export const unfollowUser = async (req, res) => {
    try {
        const userId = req?.body?.userId
        const currentUser = req?.body?.currentUser

        const usertobeFollowed = await prisma.user.findUnique({
            where: { id: userId },
            select: { followers: true }
        })

        if (!usertobeFollowed.followers.includes(currentUser)) {
            return res.status(409).send("Not following the user.")
        } else {
            // Find the user being unfollowed
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: {
                    followers: true
                }
            })

            // Updating the user who is followed
            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    followerCount: { decrement: 1 },
                    followers: { set: user?.followers.filter(user => user != currentUser) }
                }
            })

            // Find the user performing the action
            const dbUser = await prisma.user.findUnique({
                where: {
                    id: currentUser
                },
                select: {
                    following: true
                }
            })


            // Updating the user performing the action
            await prisma.user.update({
                where: {
                    id: currentUser
                },
                data: {
                    followingCount: { decrement: 1 },
                    following: { set: dbUser?.following.filter(user => user != userId) }
                }
            })

            return res.status(200).send("Unfollowed user successfully.")
        }



    } catch {
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}

// Get Followers of the current user
export const getFollowers = async (req, res) => {
    try {
        const username = req.body.username
        const page = req.body.page

        // Fetch the currentUser
        const currentUser = await prisma.user.findUnique({
            where: { username: username }
        })

        // Get all the followers
        let followers = currentUser.followers

        // Get the followers for the current Page
        let takeFollowers = followers.slice(page * 4, (page + 1) * 4)
        // Check if more users exist
        let nextPage = followers.slice((page + 1) * 4, (page + 2) * 4)

        // fetch the user info from the database
        let users = takeFollowers.map(async userId => {
            return await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: {
                    name: true,
                    username: true,
                    photoURL: true
                },
            })
        })

        // Resolve the promise
        users = await Promise.all(users)

        // Return the users & the 
        return res.status(200).send({ users: users, nextPage: nextPage.length > 0 ? page + 1 : null })
    } catch {
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}

// Get Following list of the current user
export const getFollowing = async (req, res) => {
    try {
        const username = req.body.username
        const page = req.body.page

        // Fetch the currentUser
        const currentUser = await prisma.user.findUnique({
            where: { username: username }
        })

        // Get all the followers
        let following = currentUser.following

        // Get the following for the current Page
        let takeFollowing = following.slice(page * 4, (page + 1) * 4)
        // Check if more users exist
        let nextPage = following.slice((page + 1) * 4, (page + 2) * 4)

        // fetch the user info from the database
        let users = takeFollowing.map(async userId => {
            return await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    name: true,
                    username: true,
                    photoURL: true
                },
            })
        })

        // Resolve the promise
        users = await Promise.all(users)

        // Return the users & the 
        return res.status(200).send({ users: users, nextPage: nextPage.length > 0 ? page + 1 : null })
    } catch {
        console.log(err)
        return res.status(500).send({ data: "Something went wrong." })
    }
}