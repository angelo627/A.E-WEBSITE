import { prisma } from "../../config/prisma-client";
import { AppError } from "../../shared/errors/app-error";

export interface UpsertTeamMemberInput {
  fullName: string;
  roleTitle: string;
  bio: string;
  imageUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  sortOrder?: number;
  isVisible?: boolean;
}

export const teamService = {
  listPublicTeamMembers: async () => {
    return prisma.teamMember.findMany({
      where: {
        isVisible: true
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        fullName: true,
        roleTitle: true,
        bio: true,
        imageUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        sortOrder: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  listAdminTeamMembers: async () => {
    return prisma.teamMember.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        fullName: true,
        roleTitle: true,
        bio: true,
        imageUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        sortOrder: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  getTeamMemberById: async (input: { teamMemberId: string }) => {
    const member = await prisma.teamMember.findUnique({
      where: {
        id: input.teamMemberId
      },
      select: {
        id: true,
        fullName: true,
        roleTitle: true,
        bio: true,
        imageUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        sortOrder: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!member) {
      throw new AppError(404, "Team member not found.", "TEAM_MEMBER_NOT_FOUND");
    }

    return member;
  },

  createTeamMember: async (input: UpsertTeamMemberInput) => {
    return prisma.teamMember.create({
      data: {
        fullName: input.fullName,
        roleTitle: input.roleTitle,
        bio: input.bio,
        imageUrl: input.imageUrl,
        linkedinUrl: input.linkedinUrl,
        twitterUrl: input.twitterUrl,
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true
      },
      select: {
        id: true,
        fullName: true,
        roleTitle: true,
        bio: true,
        imageUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        sortOrder: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  updateTeamMember: async (input: { teamMemberId: string } & UpsertTeamMemberInput) => {
    const existing = await prisma.teamMember.findUnique({
      where: {
        id: input.teamMemberId
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      throw new AppError(404, "Team member not found.", "TEAM_MEMBER_NOT_FOUND");
    }

    return prisma.teamMember.update({
      where: {
        id: input.teamMemberId
      },
      data: {
        fullName: input.fullName,
        roleTitle: input.roleTitle,
        bio: input.bio,
        imageUrl: input.imageUrl,
        linkedinUrl: input.linkedinUrl,
        twitterUrl: input.twitterUrl,
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true
      },
      select: {
        id: true,
        fullName: true,
        roleTitle: true,
        bio: true,
        imageUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        sortOrder: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  deleteTeamMember: async (input: { teamMemberId: string }) => {
    const existing = await prisma.teamMember.findUnique({
      where: {
        id: input.teamMemberId
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      throw new AppError(404, "Team member not found.", "TEAM_MEMBER_NOT_FOUND");
    }

    await prisma.teamMember.delete({
      where: {
        id: input.teamMemberId
      }
    });
  }
};
