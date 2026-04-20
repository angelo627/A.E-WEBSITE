import { Prisma } from "@prisma/client";

import { prisma } from "../../config/prisma-client";
import { AppError } from "../../shared/errors/app-error";

export interface UpsertQuizInput {
  moduleId: string;
  title: string;
  instructions?: string;
  passingScore?: number;
  timeLimitMinutes?: number;
  isPublished?: boolean;
  questions: Array<{
    prompt: string;
    explanation?: string;
    sortOrder?: number;
    options: Array<{
      label: string;
      isCorrect: boolean;
      sortOrder?: number;
    }>;
  }>;
}

function isUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function normalizePercentage(value: number | undefined, fallback: number): number {
  const raw = value ?? fallback;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function normalizeTimeLimit(value: number | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalized = Math.max(1, Math.round(value));
  return normalized;
}

function validateQuizInput(input: UpsertQuizInput): void {
  if (input.questions.length === 0) {
    throw new AppError(400, "At least one question is required.", "VALIDATION_ERROR");
  }

  input.questions.forEach((question, questionIndex) => {
    if (question.options.length < 2) {
      throw new AppError(
        400,
        `questions[${questionIndex}] must have at least two options.`,
        "VALIDATION_ERROR"
      );
    }

    const correctOptionsCount = question.options.filter((option) => option.isCorrect).length;
    if (correctOptionsCount !== 1) {
      throw new AppError(
        400,
        `questions[${questionIndex}] must have exactly one correct option.`,
        "VALIDATION_ERROR"
      );
    }
  });
}

function mapQuestionCreateData(input: UpsertQuizInput["questions"]) {
  return input.map((question, questionIndex) => ({
    prompt: question.prompt,
    explanation: question.explanation,
    sortOrder: question.sortOrder ?? questionIndex,
    options: {
      create: question.options.map((option, optionIndex) => ({
        label: option.label,
        isCorrect: option.isCorrect,
        sortOrder: option.sortOrder ?? optionIndex
      }))
    }
  }));
}

export const quizzesService = {
  getQuizForLearner: async (input: { quizId: string; userId: string }) => {
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: input.quizId,
        isPublished: true,
        module: {
          isPublished: true
        }
      },
      select: {
        id: true,
        title: true,
        instructions: true,
        passingScore: true,
        timeLimitMinutes: true,
        module: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        questions: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            prompt: true,
            sortOrder: true,
            options: {
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              select: {
                id: true,
                label: true,
                sortOrder: true
              }
            }
          }
        },
        attempts: {
          where: {
            userId: input.userId
          },
          orderBy: {
            submittedAt: "desc"
          },
          take: 1,
          select: {
            id: true,
            score: true,
            correctAnswers: true,
            totalQuestions: true,
            submittedAt: true
          }
        }
      }
    });

    if (!quiz) {
      throw new AppError(404, "Quiz not found.", "QUIZ_NOT_FOUND");
    }

    return {
      id: quiz.id,
      title: quiz.title,
      instructions: quiz.instructions,
      passingScore: quiz.passingScore,
      timeLimitMinutes: quiz.timeLimitMinutes,
      module: quiz.module,
      questions: quiz.questions,
      latestAttempt: quiz.attempts[0] ?? null
    };
  },

  submitQuiz: async (input: {
    quizId: string;
    userId: string;
    answers: Array<{
      questionId: string;
      selectedOptionId?: string;
    }>;
  }) => {
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: input.quizId,
        isPublished: true,
        module: {
          isPublished: true
        }
      },
      select: {
        id: true,
        passingScore: true,
        moduleId: true,
        questions: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            options: {
              select: {
                id: true,
                isCorrect: true
              }
            }
          }
        }
      }
    });

    if (!quiz) {
      throw new AppError(404, "Quiz not found.", "QUIZ_NOT_FOUND");
    }

    if (quiz.questions.length === 0) {
      throw new AppError(400, "Quiz has no questions.", "INVALID_QUIZ");
    }

    const answerMap = new Map<string, string | undefined>();
    input.answers.forEach((answer) => {
      answerMap.set(answer.questionId, answer.selectedOptionId);
    });

    const quizQuestionIds = new Set(quiz.questions.map((question) => question.id));
    input.answers.forEach((answer) => {
      if (!quizQuestionIds.has(answer.questionId)) {
        throw new AppError(
          400,
          `Question ${answer.questionId} does not belong to this quiz.`,
          "VALIDATION_ERROR"
        );
      }
    });

    const evaluatedResponses = quiz.questions.map((question) => {
      const selectedOptionId = answerMap.get(question.id);
      const selectedBelongsToQuestion = selectedOptionId
        ? question.options.some((option) => option.id === selectedOptionId)
        : true;

      if (!selectedBelongsToQuestion) {
        throw new AppError(
          400,
          `Invalid selected option for question ${question.id}.`,
          "VALIDATION_ERROR"
        );
      }

      const correctOption = question.options.find((option) => option.isCorrect);
      const isCorrect = Boolean(correctOption && selectedOptionId === correctOption.id);

      return {
        questionId: question.id,
        selectedOptionId,
        isCorrect
      };
    });

    const totalQuestions = quiz.questions.length;
    const correctAnswers = evaluatedResponses.filter((item) => item.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    const result = await prisma.$transaction(async (tx) => {
      const attempt = await tx.quizAttempt.create({
        data: {
          userId: input.userId,
          quizId: quiz.id,
          score,
          totalQuestions,
          correctAnswers,
          responses: {
            create: evaluatedResponses.map((response) => ({
              questionId: response.questionId,
              selectedOptionId: response.selectedOptionId,
              isCorrect: response.isCorrect
            }))
          }
        },
        select: {
          id: true,
          submittedAt: true
        }
      });

      const now = new Date();
      const progressStatus = passed ? "COMPLETED" : "IN_PROGRESS";
      const progressPercent = passed ? 100 : 50;
      const existingProgress = await tx.userModuleProgress.findUnique({
        where: {
          userId_moduleId: {
            userId: input.userId,
            moduleId: quiz.moduleId
          }
        },
        select: {
          startedAt: true
        }
      });
      const startedAt = existingProgress?.startedAt ?? now;

      await tx.userModuleProgress.upsert({
        where: {
          userId_moduleId: {
            userId: input.userId,
            moduleId: quiz.moduleId
          }
        },
        create: {
          userId: input.userId,
          moduleId: quiz.moduleId,
          status: progressStatus,
          progressPercent,
          startedAt,
          completedAt: passed ? now : null,
          lastAccessedAt: now
        },
        update: {
          status: progressStatus,
          progressPercent,
          startedAt,
          completedAt: passed ? now : null,
          lastAccessedAt: now
        }
      });

      return attempt;
    });

    return {
      attemptId: result.id,
      score,
      totalQuestions,
      correctAnswers,
      passed,
      passingScore: quiz.passingScore,
      submittedAt: result.submittedAt
    };
  },

  listAdminQuizzes: async () => {
    const quizzes = await prisma.quiz.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        moduleId: true,
        title: true,
        instructions: true,
        passingScore: true,
        timeLimitMinutes: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        module: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      }
    });

    return quizzes.map((quiz) => ({
      id: quiz.id,
      moduleId: quiz.moduleId,
      title: quiz.title,
      instructions: quiz.instructions,
      passingScore: quiz.passingScore,
      timeLimitMinutes: quiz.timeLimitMinutes,
      isPublished: quiz.isPublished,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      module: quiz.module,
      questionCount: quiz._count.questions,
      attemptCount: quiz._count.attempts
    }));
  },

  getAdminQuizById: async (input: { quizId: string }) => {
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: input.quizId
      },
      select: {
        id: true,
        moduleId: true,
        title: true,
        instructions: true,
        passingScore: true,
        timeLimitMinutes: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        module: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        questions: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            prompt: true,
            explanation: true,
            sortOrder: true,
            options: {
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              select: {
                id: true,
                label: true,
                isCorrect: true,
                sortOrder: true
              }
            }
          }
        }
      }
    });

    if (!quiz) {
      throw new AppError(404, "Quiz not found.", "QUIZ_NOT_FOUND");
    }

    return quiz;
  },

  createQuiz: async (input: UpsertQuizInput) => {
    validateQuizInput(input);

    const moduleExists = await prisma.module.findUnique({
      where: {
        id: input.moduleId
      },
      select: {
        id: true
      }
    });

    if (!moduleExists) {
      throw new AppError(404, "Module not found.", "MODULE_NOT_FOUND");
    }

    try {
      return await prisma.quiz.create({
        data: {
          moduleId: input.moduleId,
          title: input.title,
          instructions: input.instructions,
          passingScore: normalizePercentage(input.passingScore, 70),
          timeLimitMinutes: normalizeTimeLimit(input.timeLimitMinutes),
          isPublished: input.isPublished ?? false,
          questions: {
            create: mapQuestionCreateData(input.questions)
          }
        },
        select: {
          id: true,
          moduleId: true,
          title: true,
          instructions: true,
          passingScore: true,
          timeLimitMinutes: true,
          isPublished: true,
          questions: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: {
              id: true,
              prompt: true,
              explanation: true,
              sortOrder: true,
              options: {
                orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
                select: {
                  id: true,
                  label: true,
                  isCorrect: true,
                  sortOrder: true
                }
              }
            }
          },
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AppError(
          409,
          "This module already has a quiz. Update it instead.",
          "QUIZ_ALREADY_EXISTS_FOR_MODULE"
        );
      }
      throw error;
    }
  },

  updateQuiz: async (input: { quizId: string } & UpsertQuizInput) => {
    validateQuizInput(input);

    const [existingQuiz, moduleExists] = await Promise.all([
      prisma.quiz.findUnique({
        where: {
          id: input.quizId
        },
        select: {
          id: true
        }
      }),
      prisma.module.findUnique({
        where: {
          id: input.moduleId
        },
        select: {
          id: true
        }
      })
    ]);

    if (!existingQuiz) {
      throw new AppError(404, "Quiz not found.", "QUIZ_NOT_FOUND");
    }

    if (!moduleExists) {
      throw new AppError(404, "Module not found.", "MODULE_NOT_FOUND");
    }

    try {
      return await prisma.$transaction(async (tx) => {
        await tx.quizQuestion.deleteMany({
          where: {
            quizId: input.quizId
          }
        });

        return tx.quiz.update({
          where: {
            id: input.quizId
          },
          data: {
            moduleId: input.moduleId,
            title: input.title,
            instructions: input.instructions,
            passingScore: normalizePercentage(input.passingScore, 70),
            timeLimitMinutes: normalizeTimeLimit(input.timeLimitMinutes),
            isPublished: input.isPublished ?? false,
            questions: {
              create: mapQuestionCreateData(input.questions)
            }
          },
          select: {
            id: true,
            moduleId: true,
            title: true,
            instructions: true,
            passingScore: true,
            timeLimitMinutes: true,
            isPublished: true,
            questions: {
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              select: {
                id: true,
                prompt: true,
                explanation: true,
                sortOrder: true,
                options: {
                  orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
                  select: {
                    id: true,
                    label: true,
                    isCorrect: true,
                    sortOrder: true
                  }
                }
              }
            },
            createdAt: true,
            updatedAt: true
          }
        });
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AppError(
          409,
          "This module already has a quiz. Update that quiz instead.",
          "QUIZ_ALREADY_EXISTS_FOR_MODULE"
        );
      }
      throw error;
    }
  },

  deleteQuiz: async (input: { quizId: string }) => {
    const existingQuiz = await prisma.quiz.findUnique({
      where: {
        id: input.quizId
      },
      select: {
        id: true
      }
    });

    if (!existingQuiz) {
      throw new AppError(404, "Quiz not found.", "QUIZ_NOT_FOUND");
    }

    await prisma.quiz.delete({
      where: {
        id: input.quizId
      }
    });
  }
};
