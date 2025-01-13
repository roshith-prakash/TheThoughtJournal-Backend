import { Request, Response } from "express";
export declare const followUser: (req: Request, res: Response) => Promise<void>;
export declare const unfollowUser: (req: Request, res: Response) => Promise<void>;
export declare const getFollowers: (req: Request, res: Response) => Promise<void>;
export declare const getFollowing: (req: Request, res: Response) => Promise<void>;
