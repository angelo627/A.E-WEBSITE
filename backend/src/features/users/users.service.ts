import { prisma } from "../../config/prisma-client";
import { UserRole, UserStatus } from "../../shared/constants/auth";
import { AppError } from "../../shared/errors/app-error";

export interface CreateUserInput {
  name: string;
  email: string;
}

export const usersService = {
  listUsers: async () => {
    return prisma.user.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  getUserById: async (input: { userId: string }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: input.userId
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            moduleProgresses: true,
            quizAttempts: true,
            sessions: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError(404, "User not found.", "USER_NOT_FOUND");
    }

    return user;
  },

  isDuplicateEmailError: (error: unknown) => {
    return (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    );
  },

  updateUserAccess: async (_input: {
    userId: string;
    role?: UserRole;
    status?: UserStatus;
  }) => {
    if (_input.role === undefined && _input.status === undefined) {
      throw new AppError(
        400,
        "At least one of role or status must be provided.",
        "VALIDATION_ERROR"
      );
    }

    const existing = await prisma.user.findUnique({
      where: {
        id: _input.userId
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      throw new AppError(404, "User not found.", "USER_NOT_FOUND");
    }

    return prisma.user.update({
      where: {
        id: _input.userId
      },
      data: {
        role: _input.role,
        status: _input.status
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }
};
