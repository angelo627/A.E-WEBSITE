import { Router } from "express";
import { communityController } from "./community.controller";

const router = Router();

router
  .route("/")
  .get(communityController.getAllPosts)
  .post(communityController.createPost);

router
  .route("/:id")
  .get(communityController.getPostById)
  .delete(communityController.deletePost);

router
  .route("/:id/like")
  .post(communityController.toggleLike);

router
  .route("/:id/pin")
  .patch(communityController.togglePin);

router
  .route("/:postId/comments")
  .post(communityController.createComment);

router
  .route("/comments/:commentId")
  .delete(communityController.deleteComment);

export { router as communityRoutes };
