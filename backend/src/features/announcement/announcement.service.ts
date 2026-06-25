import { prisma } from "../../config/prisma-client";
import { AppError } from "../../shared/errors/app-error";

export const announcementService = {
  createAnnouncement: async (data: { title: string; message: string; expiresAt?: string }) => {
    return prisma.announcement.create({
      data: {
        title: data.title,
        message: data.message,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  },

  getActiveAnnouncement: async () => {
    const now = new Date();
    return prisma.announcement.findFirst({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  getAllAnnouncements: async () => {
    return prisma.announcement.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  updateAnnouncement: async (id: string, data: { title?: string; message?: string; isActive?: boolean; expiresAt?: string | null }) => {
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw new AppError(404, "Announcement not found", "NOT_FOUND");

    return prisma.announcement.update({
      where: { id },
      data: {
        ...data,
        expiresAt: data.expiresAt === null ? null : (data.expiresAt ? new Date(data.expiresAt) : undefined),
      },
    });
  },

  deleteAnnouncement: async (id: string) => {
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw new AppError(404, "Announcement not found", "NOT_FOUND");

    return prisma.announcement.delete({ where: { id } });
  },
};
