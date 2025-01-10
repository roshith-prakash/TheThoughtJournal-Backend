import { Request, Response } from "express";
export declare const createPost: (req: Request, res: Response) => Promise<void>;
export declare const getAllRecentPosts: (req: Request, res: Response) => Promise<void>;
export declare const getPostById: (req: Request, res: Response) => Promise<void>;
export declare const getUserPosts: (req: Request, res: Response) => Promise<void>;
export declare const deletePost: (req: Request, res: Response) => Promise<void>;
export declare const searchPosts: (req: Request, res: Response) => Promise<void>;
export declare const likePost: (req: Request, res: Response) => Promise<void>;
export declare const unlikePost: (req: Request, res: Response) => Promise<void>;
export declare const getLikedPosts: (req: Request, res: Response) => Promise<void>;
export declare const getFollowedPosts: (req: Request, res: Response) => Promise<void>;
export declare const updatePost: (req: Request, res: Response) => Promise<void>;
export declare const addComment: (req: Request, res: Response) => Promise<void>;
export declare const removeComment: (req: Request, res: Response) => Promise<void>;
export declare const getComments: (req: Request, res: Response) => Promise<void>;
export declare const getReplies: (req: Request, res: Response) => Promise<void>;
