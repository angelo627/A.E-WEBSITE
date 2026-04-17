import { Prisma } from "@prisma/client";

import { prisma } from "../../config/prisma-client";
import { AppError } from "../../shared/errors/app-error";

export interface UpsertProductInput {
  name: string;
  slug: string;
  description: string;
  link: string;
  imageUrl?: string;
  isPublished?: boolean;
}

function isUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export const productsService = {
  listPublicProducts: async () => {
    return prisma.product.findMany({
      where: {
        isPublished: true
      },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        link: true,
        imageUrl: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  getPublicProductBySlug: async (input: { slug: string }) => {
    const product = await prisma.product.findFirst({
      where: {
        isPublished: true,
        OR: [{ slug: input.slug }, { id: input.slug }]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        link: true,
        imageUrl: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!product) {
      throw new AppError(404, "Product not found.", "PRODUCT_NOT_FOUND");
    }

    return product;
  },

  listAdminProducts: async () => {
    return prisma.product.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        link: true,
        imageUrl: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  getAdminProductById: async (input: { productId: string }) => {
    const product = await prisma.product.findUnique({
      where: {
        id: input.productId
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        link: true,
        imageUrl: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!product) {
      throw new AppError(404, "Product not found.", "PRODUCT_NOT_FOUND");
    }

    return product;
  },

  createProduct: async (input: UpsertProductInput) => {
    try {
      return await prisma.product.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          link: input.link,
          imageUrl: input.imageUrl,
          isPublished: input.isPublished ?? true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          link: true,
          imageUrl: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AppError(409, "Product slug already exists.", "DUPLICATE_SLUG");
      }
      throw error;
    }
  },

  updateProduct: async (input: { productId: string } & UpsertProductInput) => {
    const existing = await prisma.product.findUnique({
      where: {
        id: input.productId
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      throw new AppError(404, "Product not found.", "PRODUCT_NOT_FOUND");
    }

    try {
      return await prisma.product.update({
        where: {
          id: input.productId
        },
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          link: input.link,
          imageUrl: input.imageUrl,
          isPublished: input.isPublished ?? true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          link: true,
          imageUrl: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AppError(409, "Product slug already exists.", "DUPLICATE_SLUG");
      }
      throw error;
    }
  },

  deleteProduct: async (input: { productId: string }) => {
    const existing = await prisma.product.findUnique({
      where: {
        id: input.productId
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      throw new AppError(404, "Product not found.", "PRODUCT_NOT_FOUND");
    }

    await prisma.product.delete({
      where: {
        id: input.productId
      }
    });
  }
};
