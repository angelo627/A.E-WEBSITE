import { prisma } from "../../config/prisma-client";
import { AppError } from "../../shared/errors/app-error";

interface CreatePostData {
  userId: string;
  title?: string;
  content: string;
}

interface CreateCommentData {
  userId: string;
  postId: string;
  content: string;
}

export class CommunityService {
  // Post Services
  async createPost(data: CreatePostData) {
    if (!data.content) {
      throw new AppError(400, "Post content is required");
    }
    
    return prisma.communityPost.create({
      data,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
        _count: { select: { comments: true } }
      }
    });
  }

  async getAllPosts() {
    return prisma.communityPost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
        _count: { select: { comments: true } }
      }
    });
  }

  async getPostById(postId: string) {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } }
          }
        }
      }
    });

    if (!post) {
      throw new AppError(404, "Community post not found");
    }

    return post;
  }

  async deletePost(postId: string, userId: string, userRole: string) {
    const post = await prisma.communityPost.findUnique({ where: { id: postId } });

    if (!post) {
      throw new AppError(404, "Community post not found");
    }

    // Only allow author or admin to delete
    if (post.userId !== userId && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      throw new AppError(403, "Not authorized to delete this post");
    }

    await prisma.communityPost.delete({ where: { id: postId } });
    return { message: "Post deleted successfully" };
  }

  // Comment Services
  async createComment(data: CreateCommentData) {
    if (!data.content) {
      throw new AppError(400, "Comment content is required");
    }

    // Ensure post exists
    const postExists = await prisma.communityPost.findUnique({ where: { id: data.postId } });
    if (!postExists) {
      throw new AppError(404, "Post not found");
    }

    return prisma.communityComment.create({
      data,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } }
      }
    });
  }

  async deleteComment(commentId: string, userId: string, userRole: string) {
    const comment = await prisma.communityComment.findUnique({ where: { id: commentId } });

    if (!comment) {
      throw new AppError(404, "Comment not found");
    }

    if (comment.userId !== userId && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      throw new AppError(403, "Not authorized to delete this comment");
    }

    await prisma.communityComment.delete({ where: { id: commentId } });
    return { message: "Comment deleted successfully" };
  }
}

export const communityService = new CommunityService();
