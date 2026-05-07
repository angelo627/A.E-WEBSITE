import { Request, Response } from "express";
import { communityService } from "./community.service";
import { asyncHandler } from "../../shared/utils/async-handler";

export class CommunityController {
  createPost = asyncHandler(async (req: Request, res: Response) => {
    // req.user is guaranteed to be present because this will be a protected route
    const postData = {
      userId: req.user!.sub,
      title: req.body.title,
      content: req.body.content,
    };

    const post = await communityService.createPost(postData);
    
    res.status(201).json({
      status: "success",
      data: { post }
    });
  });

  getAllPosts = asyncHandler(async (req: Request, res: Response) => {
    const posts = await communityService.getAllPosts();

    res.status(200).json({
      status: "success",
      results: posts.length,
      data: { posts }
    });
  });

  getPostById = asyncHandler(async (req: Request, res: Response) => {
    const post = await communityService.getPostById(req.params.id as string);

    res.status(200).json({
      status: "success",
      data: { post }
    });
  });

  deletePost = asyncHandler(async (req: Request, res: Response) => {
    await communityService.deletePost(req.params.id as string, req.user!.sub, req.user!.role);

    res.status(200).json({
      status: "success",
      data: null
    });
  });

  createComment = asyncHandler(async (req: Request, res: Response) => {
    const commentData = {
      userId: req.user!.sub,
      postId: req.params.postId as string,
      content: req.body.content,
    };

    const comment = await communityService.createComment(commentData);

    res.status(201).json({
      status: "success",
      data: { comment }
    });
  });

  deleteComment = asyncHandler(async (req: Request, res: Response) => {
    await communityService.deleteComment(req.params.commentId as string, req.user!.sub, req.user!.role);

    res.status(200).json({
      status: "success",
      data: null
    });
  });
}

export const communityController = new CommunityController();
