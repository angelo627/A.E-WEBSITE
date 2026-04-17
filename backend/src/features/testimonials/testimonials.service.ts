import { prisma } from "../../config/prisma-client";
import { AppError } from "../../shared/errors/app-error";

type TestimonialStatus = "APPROVED" | "REJECTED" | "PENDING";

export const testimonialsService = {
  listApprovedTestimonials: async () => {
    return prisma.testimonial.findMany({
      where: {
        status: "APPROVED"
      },
      orderBy: [{ isFeatured: "desc" }, { approvedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        title: true,
        company: true,
        content: true,
        rating: true,
        status: true,
        isFeatured: true,
        approvedAt: true,
        createdAt: true
      }
    });
  },

  submitTestimonial: async (input: {
    userId?: string;
    name: string;
    title?: string;
    company?: string;
    content: string;
    rating?: number;
  }) => {
    if (input.rating !== undefined) {
      const normalized = Math.round(input.rating);
      if (normalized < 1 || normalized > 5) {
        throw new AppError(400, "rating must be between 1 and 5.", "VALIDATION_ERROR");
      }
    }

    return prisma.testimonial.create({
      data: {
        userId: input.userId,
        name: input.name,
        title: input.title,
        company: input.company,
        content: input.content,
        rating: input.rating !== undefined ? Math.round(input.rating) : undefined,
        status: "PENDING"
      },
      select: {
        id: true,
        userId: true,
        name: true,
        title: true,
        company: true,
        content: true,
        rating: true,
        status: true,
        isFeatured: true,
        approvedById: true,
        approvedAt: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  listAdminTestimonials: async () => {
    return prisma.testimonial.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        userId: true,
        name: true,
        title: true,
        company: true,
        content: true,
        rating: true,
        status: true,
        isFeatured: true,
        approvedById: true,
        approvedAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
  },

  updateTestimonialStatus: async (input: {
    testimonialId: string;
    status: TestimonialStatus;
    isFeatured?: boolean;
    approvedById?: string;
  }) => {
    const existing = await prisma.testimonial.findUnique({
      where: {
        id: input.testimonialId
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      throw new AppError(404, "Testimonial not found.", "TESTIMONIAL_NOT_FOUND");
    }

    const approvedAt = input.status === "APPROVED" ? new Date() : null;
    const approvedById = input.status === "APPROVED" ? input.approvedById : null;

    return prisma.testimonial.update({
      where: {
        id: input.testimonialId
      },
      data: {
        status: input.status,
        isFeatured: input.isFeatured,
        approvedAt,
        approvedById
      },
      select: {
        id: true,
        userId: true,
        name: true,
        title: true,
        company: true,
        content: true,
        rating: true,
        status: true,
        isFeatured: true,
        approvedById: true,
        approvedAt: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  deleteTestimonial: async (input: { testimonialId: string }) => {
    const existing = await prisma.testimonial.findUnique({
      where: {
        id: input.testimonialId
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      throw new AppError(404, "Testimonial not found.", "TESTIMONIAL_NOT_FOUND");
    }

    await prisma.testimonial.delete({
      where: {
        id: input.testimonialId
      }
    });
  }
};
