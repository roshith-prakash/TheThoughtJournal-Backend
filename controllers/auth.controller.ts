import { prisma } from "../utils/prismaClient.js";
import cloudinary from "../utils/cloudinary.ts";
import { Request, Response } from "express";

// Create a new User
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // If image is uploaded
    if (req?.file) {
      cloudinary.uploader.upload(req.file.path, async function (err, result) {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: "Something went wrong! Please try again.",
          });
        }
        // If image upload was successful
        else {
          // Get user from request.
          const user = JSON.parse(req.body?.user);

          //Find if user exists in DB
          const checkUser = await prisma.user.findUnique({
            where: {
              email: user?.email,
            },
          });

          if (!checkUser) {
            // Create a user in DB
            const createdUser = await prisma.user.create({
              data: {
                firebaseUID: user?.uid,
                email: user?.email,
                name: user?.name,
                photoURL: result?.secure_url,
                username: user?.username.toLowerCase(),
                bio: user?.bio,
              },
            });

            // Send the createdUser
            res.status(200).send({ user: createdUser });
            return;
          } else {
            // Send the user in the DB
            res.status(200).send({ user: checkUser });
            return;
          }
        }
      });
    }
    // If image is not uploaded / google image used.
    else {
      const user = JSON.parse(req.body?.user);

      //Find if user exists in DB
      const checkUser = await prisma.user.findUnique({
        where: {
          email: user?.email,
        },
      });

      if (!checkUser) {
        // Create a user in DB
        const createdUser = await prisma.user.create({
          data: {
            firebaseUID: user?.uid,
            email: user?.email,
            name: user?.name,
            photoURL: user?.image,
            username: user?.username.toLowerCase(),
            bio: user?.bio,
          },
        });

        // Send the createdUser
        res.status(200).send({ user: createdUser });
        return;
      } else {
        // Send the user in the DB
        res.status(200).send({ user: checkUser });
        return;
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ data: "Something went wrong." });
    return;
  }
};

// Get Current User from DB
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get user info from request.
    const user = req.body?.user;

    // Get the user from DB
    const userInDB = await prisma.user.findUnique({
      where: {
        email: user?.email,
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
        following: true,
      },
    });

    // If user not present in DB
    if (!userInDB) {
      res.status(404).send({ data: "User does not exist." });
      return;
    }

    res.status(200).send({ user: userInDB });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send({ data: "Something went wrong." });
    return;
  }
};

// Get User information
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get user info from request.
    const username = req.body?.username;

    // Get the user from DB
    const userInDB = await prisma.user.findUnique({
      where: {
        username: username,
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
        followingCount: true,
      },
    });

    // If user not present in DB
    if (!userInDB) {
      res.status(404).send({ data: "User does not exist." });
      return;
    }

    // sending user
    res.status(200).send({ user: userInDB });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send({ data: "Something went wrong." });
    return;
  }
};

// Search for users
export const searchUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const searchTerm = req?.body?.searchTerm;
    const page = req?.body?.page;

    // Get users where name or username contains the searchterm
    // Sort by number of total likes
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: searchTerm, mode: "insensitive" } },
          { name: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        name: true,
        username: true,
        photoURL: true,
      },
      orderBy: { followerCount: "desc" },
      skip: page * 2,
      take: 2,
    });

    // Check if nextpage exists
    const nextPageExists = await prisma.user.count({
      where: {
        OR: [
          { username: { contains: searchTerm, mode: "insensitive" } },
          { name: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      orderBy: { followerCount: "desc" },
      skip: (page + 1) * 2,
      take: 2,
    });

    res
      .status(200)
      .send({ users: users, nextPage: nextPageExists != 0 ? page + 1 : null });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send({ data: "Something went wrong." });
    return;
  }
};

// Check whether username already exists
export const checkIfUsernameExists = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get user info from request.
    const username = req.body?.username;

    // Get the user from DB
    const userInDB = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    // If user not present in DB
    if (!userInDB) {
      res.status(200).send({ exists: false });
      return;
    }

    // sending user
    res.status(200).send({ exists: true });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send({ data: "Something went wrong." });
    return;
  }
};

// Update the User details - image, name, bio, username updateable0
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // If image is uploaded
    if (req?.file) {
      cloudinary.uploader.upload(req.file.path, async function (err, result) {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: "Something went wrong! Please try again.",
          });
        }
        // If image upload was successful
        else {
          // Get user from request.
          const updatedUser = JSON.parse(req.body?.updatedUser);

          //Find if user exists in DB
          const checkUser = await prisma.user.findUnique({
            where: {
              id: req?.body?.userId,
            },
          });

          if (!checkUser) {
            // Send an error
            return res.status(404).send({ data: "User Not found" });
          } else {
            // Send the user in the DB
            const user = await prisma.user.update({
              where: {
                id: req?.body?.userId,
              },
              data: {
                bio: updatedUser?.bio,
                username: updatedUser?.username,
                name: updatedUser?.name,
                photoURL: result?.secure_url,
              },
            });
            return res.status(200).send({ user: user });
          }
        }
      });
    }
    // If image is not uploaded / google image used.
    else {
      // Get user from request.
      const updatedUser = JSON.parse(req.body?.updatedUser);

      //Find if user exists in DB
      const checkUser = await prisma.user.findUnique({
        where: {
          id: req?.body?.userId,
        },
      });

      if (!checkUser) {
        // Send an error
        res.status(404).send({ data: "User Not found" });
        return;
      } else {
        // Send the user in the DB
        const user = await prisma.user.update({
          where: {
            id: req?.body?.userId,
          },
          data: {
            bio: updatedUser?.bio,
            username: updatedUser?.username,
            name: updatedUser?.name,
          },
        });

        res.status(200).send({ user: user });
        return;
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ data: "Something went wrong." });
    return;
  }
};

// Delete the user & any posts created by the user.
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get username from frontend
    const username = req?.body?.username;

    // Find the user from frontend
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      include: {
        Comment: { select: { id: true, replyCount: true, postId: true } },
      },
    });

    // User does not exist
    if (!user) {
      res.status(404).send({ data: "User not found." });
      return;
    }

    // Delete all the user's posts
    await prisma.post.deleteMany({
      where: {
        userId: user?.id,
      },
    });

    // Remove user from the following list of others
    let removeFollowers = user.followers.map(async (userId) => {
      const followingUser = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: { following: true },
      });

      if (followingUser) {
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            following: {
              set: followingUser.following.filter((id) => id != user?.id),
            },
            followingCount: { decrement: 1 },
          },
        });
      }
    });

    // Remove user from the follower list of others
    let removeFollowing = user.following.map(async (userId) => {
      const followerUser = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: { followers: true, id: true },
      });

      if (followerUser) {
        await prisma.user.update({
          where: {
            id: followerUser?.id,
          },
          data: {
            followers: {
              set: followerUser.followers.filter((id) => id != user?.id),
            },
            followerCount: { decrement: 1 },
          },
        });
      }
    });

    // Remove like from likedPosts
    let removeLikes = user.likedPosts.map(async (postId) => {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (post) {
        // Remove the like from the post
        await prisma.post.update({
          where: { id: post?.id },
          data: {
            likeCount: { decrement: 1 },
            likes: post?.likes
              ? post.likes.filter((userId) => userId != user.id)
              : [],
          },
        });

        // Decrement a like from the author
        await prisma.user.update({
          where: { id: post.userId as string },
          data: {
            totalLikes: { decrement: 1 },
          },
        });
      }
    });

    // Remove comments and replies
    let removeComments = user.Comment.map(async (comment) => {
      // Delete replies
      if (comment?.replyCount > 0) {
        await prisma.comment.deleteMany({
          where: {
            parentId: comment?.id,
          },
        });
      }

      //   Delete Comment
      await prisma.comment.delete({
        where: {
          id: comment?.id,
        },
      });

      //   Update comment Count
      await prisma.post.update({
        where: {
          id: comment?.postId,
        },
        data: {
          commentCount: { decrement: comment?.replyCount + 1 },
        },
      });
    });

    // Await promises
    await Promise.all(removeFollowers);
    await Promise.all(removeFollowing);
    await Promise.all(removeLikes);
    await Promise.all(removeComments);

    await prisma.user.delete({
      where: {
        id: user?.id,
      },
    });

    res.status(200).send({ data: "User deleted successfully." });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send({ data: "Something went wrong." });
    return;
  }
};
