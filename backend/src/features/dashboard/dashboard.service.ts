import { prisma } from "../../config/prisma-client";
import { AppError } from "../../shared/errors/app-error";

type ModuleStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface DashboardModule {
  moduleId: string;
  title: string;
  slug: string;
  status: ModuleStatus;
  progressPercent: number;
  estimatedMinutes?: number;
}

export interface DashboardSummary {
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  notStartedModules: number;
  overallProgressPercent: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  modules: DashboardModule[];
}

function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export const dashboardService = {
  getDashboard: async (input: { userId: string }): Promise<DashboardResponse> => {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: {
        id: true,
        status: true
      }
    });

    if (!user) {
      throw new AppError(404, "User not found.", "USER_NOT_FOUND");
    }

    if (user.status !== "ACTIVE") {
      throw new AppError(403, "Your account is not active.", "ACCOUNT_NOT_ACTIVE");
    }

    const modules = await prisma.module.findMany({
      where: {
        isPublished: true
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        estimatedMinutes: true,
        userProgresses: {
          where: {
            userId: input.userId
          },
          select: {
            status: true,
            progressPercent: true
          },
          take: 1
        }
      }
    });

    const dashboardModules: DashboardModule[] = modules.map((module) => {
      const progress = module.userProgresses[0];
      const status: ModuleStatus = progress?.status ?? "NOT_STARTED";
      const progressPercent = clampProgress(progress?.progressPercent ?? 0);

      return {
        moduleId: module.id,
        title: module.title,
        slug: module.slug,
        status,
        progressPercent,
        ...(typeof module.estimatedMinutes === "number"
          ? { estimatedMinutes: module.estimatedMinutes }
          : {})
      };
    });

    const summary = dashboardModules.reduce<DashboardSummary>(
      (acc, module) => {
        if (module.status === "COMPLETED") {
          acc.completedModules += 1;
        } else if (module.status === "IN_PROGRESS") {
          acc.inProgressModules += 1;
        } else {
          acc.notStartedModules += 1;
        }

        acc.overallProgressPercent += module.progressPercent;
        return acc;
      },
      {
        totalModules: dashboardModules.length,
        completedModules: 0,
        inProgressModules: 0,
        notStartedModules: 0,
        overallProgressPercent: 0
      }
    );

    summary.overallProgressPercent =
      summary.totalModules > 0
        ? Math.round(summary.overallProgressPercent / summary.totalModules)
        : 0;

    return {
      summary,
      modules: dashboardModules
    };
  }
};
