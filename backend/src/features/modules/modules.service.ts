import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma-client";
import { AppError } from "../../shared/errors/app-error";

export interface UpsertModuleInput {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  order?: number;
  estimatedMinutes?: number;
  isPublished?: boolean;
  resources?: Array<{
    title: string;
    type: "VIDEO" | "LINK" | "DOCUMENT" | "NOTE";
    url?: string;
    content?: string;
    sortOrder?: number;
  }>;
}

type ModuleStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type ModuleResourceType = "VIDEO" | "LINK" | "DOCUMENT" | "NOTE";

interface ProgressUpdateInput {
  userId: string;
  moduleId: string;
  status?: ModuleStatus;
  progressPercent?: number;
}

const RESOURCE_TYPES: ReadonlyArray<ModuleResourceType> = [
  "VIDEO",
  "LINK",
  "DOCUMENT",
  "NOTE"
];

function clampProgress(progress: number): number {
  return Math.max(0, Math.min(100, Math.round(progress)));
}

function isUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function validateResources(resources?: UpsertModuleInput["resources"]): void {
  if (!resources) {
    return;
  }

  resources.forEach((resource, index) => {
    if (!RESOURCE_TYPES.includes(resource.type)) {
      throw new AppError(
        400,
        `resources[${index}].type must be one of: ${RESOURCE_TYPES.join(", ")}.`,
        "VALIDATION_ERROR"
      );
    }

    if (resource.type === "NOTE" && !resource.content?.trim()) {
      throw new AppError(
        400,
        `resources[${index}].content is required for NOTE resources.`,
        "VALIDATION_ERROR"
      );
    }

    if (resource.type !== "NOTE" && !resource.url?.trim() && !resource.content?.trim()) {
      throw new AppError(
        400,
        `resources[${index}] must include either url or content.`,
        "VALIDATION_ERROR"
      );
    }
  });
}

function normalizeResourceCreateInput(resources: UpsertModuleInput["resources"]) {
  if (!resources) {
    return undefined;
  }

  return resources.map((resource, index) => ({
    title: resource.title,
    type: resource.type,
    url: resource.url,
    content: resource.content,
    sortOrder: resource.sortOrder ?? index
  }));
}

function deriveStatusFromProgress(progressPercent: number): ModuleStatus {
  if (progressPercent >= 100) {
    return "COMPLETED";
  }

  if (progressPercent <= 0) {
    return "NOT_STARTED";
  }

  return "IN_PROGRESS";
}

export const modulesService = {
  listPublicModules: async () => {
    const modules = await prisma.module.findMany({
      where: {
        isPublished: true
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        description: true,
        order: true,
        estimatedMinutes: true,
        _count: {
          select: {
            resources: true
          }
        },
        quiz: {
          select: {
            id: true,
            isPublished: true
          }
        }
      }
    });

    return modules.map((module) => ({
      id: module.id,
      title: module.title,
      slug: module.slug,
      shortDescription: module.shortDescription,
      description: module.description,
      order: module.order,
      estimatedMinutes: module.estimatedMinutes,
      resourceCount: module._count.resources,
      hasPublishedQuiz: Boolean(module.quiz?.isPublished)
    }));
  },

  getPublicModuleBySlug: async (input: { slug: string }) => {
    const moduleItem = await prisma.module.findFirst({
      where: {
        isPublished: true,
        OR: [{ slug: input.slug }, { id: input.slug }]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        description: true,
        order: true,
        estimatedMinutes: true,
        resources: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            title: true,
            type: true,
            url: true,
            content: true,
            sortOrder: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true,
            isPublished: true
          }
        }
      }
    });

    if (!moduleItem) {
      throw new AppError(404, "Module not found.", "MODULE_NOT_FOUND");
    }

    return {
      ...moduleItem,
      quiz: moduleItem.quiz?.isPublished
        ? {
            id: moduleItem.quiz.id,
            title: moduleItem.quiz.title,
            isPublished: moduleItem.quiz.isPublished
          }
        : undefined
    };
  },

  listUserModules: async (input: { userId: string }) => {
    const modules = await prisma.module.findMany({
      where: {
        isPublished: true
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        description: true,
        order: true,
        estimatedMinutes: true,
        userProgresses: {
          where: {
            userId: input.userId
          },
          select: {
            status: true,
            progressPercent: true,
            lastAccessedAt: true
          },
          take: 1
        },
        quiz: {
          select: {
            id: true,
            isPublished: true
          }
        }
      }
    });

    return modules.map((module) => {
      const progress = module.userProgresses[0];
      const progressPercent = clampProgress(progress?.progressPercent ?? 0);
      const status = progress?.status ?? deriveStatusFromProgress(progressPercent);

      return {
        id: module.id,
        title: module.title,
        slug: module.slug,
        shortDescription: module.shortDescription,
        description: module.description,
        order: module.order,
        estimatedMinutes: module.estimatedMinutes,
        status,
        progressPercent,
        lastAccessedAt: progress?.lastAccessedAt ?? null,
        hasPublishedQuiz: Boolean(module.quiz?.isPublished)
      };
    });
  },

  getUserModuleDetail: async (input: { userId: string; slug: string }) => {
    const moduleItem = await prisma.module.findFirst({
      where: {
        isPublished: true,
        OR: [{ slug: input.slug }, { id: input.slug }]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        description: true,
        order: true,
        estimatedMinutes: true,
        resources: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            title: true,
            type: true,
            url: true,
            content: true,
            sortOrder: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true,
            isPublished: true
          }
        },
        userProgresses: {
          where: {
            userId: input.userId
          },
          select: {
            status: true,
            progressPercent: true,
            startedAt: true,
            completedAt: true,
            lastAccessedAt: true
          },
          take: 1
        }
      }
    });

    if (!moduleItem) {
      throw new AppError(404, "Module not found.", "MODULE_NOT_FOUND");
    }

    const progress = moduleItem.userProgresses[0];
    const progressPercent = clampProgress(progress?.progressPercent ?? 0);
    const status = progress?.status ?? deriveStatusFromProgress(progressPercent);

    return {
      id: moduleItem.id,
      title: moduleItem.title,
      slug: moduleItem.slug,
      shortDescription: moduleItem.shortDescription,
      description: moduleItem.description,
      order: moduleItem.order,
      estimatedMinutes: moduleItem.estimatedMinutes,
      resources: moduleItem.resources,
      status,
      progressPercent,
      startedAt: progress?.startedAt ?? null,
      completedAt: progress?.completedAt ?? null,
      lastAccessedAt: progress?.lastAccessedAt ?? null,
      quiz: moduleItem.quiz?.isPublished
        ? {
            id: moduleItem.quiz.id,
            title: moduleItem.quiz.title,
            isPublished: moduleItem.quiz.isPublished
          }
        : undefined
    };
  },

  updateProgress: async (input: ProgressUpdateInput) => {
    if (input.status === undefined && input.progressPercent === undefined) {
      throw new AppError(
        400,
        "At least one of status or progressPercent must be provided.",
        "VALIDATION_ERROR"
      );
    }

    const moduleExists = await prisma.module.findFirst({
      where: {
        id: input.moduleId,
        isPublished: true
      },
      select: {
        id: true
      }
    });

    if (!moduleExists) {
      throw new AppError(404, "Module not found.", "MODULE_NOT_FOUND");
    }

    const existing = await prisma.userModuleProgress.findUnique({
      where: {
        userId_moduleId: {
          userId: input.userId,
          moduleId: input.moduleId
        }
      },
      select: {
        id: true,
        status: true,
        progressPercent: true,
        startedAt: true,
        completedAt: true
      }
    });

    const normalizedProgress =
      input.progressPercent !== undefined
        ? clampProgress(input.progressPercent)
        : existing?.progressPercent ?? 0;

    let normalizedStatus: ModuleStatus =
      input.status ?? existing?.status ?? deriveStatusFromProgress(normalizedProgress);

    if (input.status === undefined && input.progressPercent !== undefined) {
      normalizedStatus = deriveStatusFromProgress(normalizedProgress);
    }

    let finalProgress = normalizedProgress;
    if (normalizedStatus === "COMPLETED") {
      finalProgress = 100;
    } else if (normalizedStatus === "NOT_STARTED") {
      finalProgress = 0;
    }

    const now = new Date();
    const startedAt =
      normalizedStatus === "IN_PROGRESS" || normalizedStatus === "COMPLETED"
        ? existing?.startedAt ?? now
        : null;
    const completedAt = normalizedStatus === "COMPLETED" ? now : null;

    return prisma.userModuleProgress.upsert({
      where: {
        userId_moduleId: {
          userId: input.userId,
          moduleId: input.moduleId
        }
      },
      create: {
        userId: input.userId,
        moduleId: input.moduleId,
        status: normalizedStatus,
        progressPercent: finalProgress,
        startedAt,
        completedAt,
        lastAccessedAt: now
      },
      update: {
        status: normalizedStatus,
        progressPercent: finalProgress,
        startedAt,
        completedAt,
        lastAccessedAt: now
      },
      select: {
        id: true,
        userId: true,
        moduleId: true,
        status: true,
        progressPercent: true,
        startedAt: true,
        completedAt: true,
        lastAccessedAt: true,
        updatedAt: true
      }
    });
  },

  listAdminModules: async () => {
    const modules = await prisma.module.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        description: true,
        order: true,
        estimatedMinutes: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        resources: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            title: true,
            type: true,
            url: true,
            content: true,
            sortOrder: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true,
            isPublished: true
          }
        }
      }
    });

    return modules;
  },

  getAdminModuleById: async (input: { moduleId: string }) => {
    const moduleItem = await prisma.module.findUnique({
      where: {
        id: input.moduleId
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        description: true,
        order: true,
        estimatedMinutes: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        resources: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            title: true,
            type: true,
            url: true,
            content: true,
            sortOrder: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true,
            isPublished: true
          }
        }
      }
    });

    if (!moduleItem) {
      throw new AppError(404, "Module not found.", "MODULE_NOT_FOUND");
    }

    return moduleItem;
  },

  createModule: async (input: UpsertModuleInput) => {
    validateResources(input.resources);

    try {
      return await prisma.module.create({
        data: {
          title: input.title,
          slug: input.slug,
          shortDescription: input.shortDescription,
          description: input.description,
          order: input.order ?? 0,
          estimatedMinutes: input.estimatedMinutes,
          isPublished: input.isPublished ?? false,
          resources: input.resources
            ? {
                create: normalizeResourceCreateInput(input.resources)
              }
            : undefined
        },
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          description: true,
          order: true,
          estimatedMinutes: true,
          isPublished: true,
          resources: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: {
              id: true,
              title: true,
              type: true,
              url: true,
              content: true,
              sortOrder: true
            }
          },
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AppError(409, "Module slug already exists.", "DUPLICATE_SLUG");
      }
      throw error;
    }
  },

  updateModule: async (input: { moduleId: string } & UpsertModuleInput) => {
    validateResources(input.resources);

    const moduleItem = await prisma.module.findUnique({
      where: { id: input.moduleId },
      select: { id: true }
    });

    if (!moduleItem) {
      throw new AppError(404, "Module not found.", "MODULE_NOT_FOUND");
    }

    try {
      return await prisma.$transaction(async (tx) => {
        if (input.resources) {
          await tx.moduleResource.deleteMany({
            where: {
              moduleId: input.moduleId
            }
          });
        }

        return tx.module.update({
          where: {
            id: input.moduleId
          },
          data: {
            title: input.title,
            slug: input.slug,
            shortDescription: input.shortDescription,
            description: input.description,
            order: input.order ?? 0,
            estimatedMinutes: input.estimatedMinutes,
            isPublished: input.isPublished ?? false,
            resources: input.resources
              ? {
                  create: normalizeResourceCreateInput(input.resources)
                }
              : undefined
          },
          select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            description: true,
            order: true,
            estimatedMinutes: true,
            isPublished: true,
            resources: {
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              select: {
                id: true,
                title: true,
                type: true,
                url: true,
                content: true,
                sortOrder: true
              }
            },
            createdAt: true,
            updatedAt: true
          }
        });
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AppError(409, "Module slug already exists.", "DUPLICATE_SLUG");
      }
      throw error;
    }
  },

  deleteModule: async (input: { moduleId: string }) => {
    const moduleItem = await prisma.module.findUnique({
      where: { id: input.moduleId },
      select: { id: true }
    });

    if (!moduleItem) {
      throw new AppError(404, "Module not found.", "MODULE_NOT_FOUND");
    }

    return prisma.module.delete({
      where: { id: input.moduleId }
    });
  }
};
