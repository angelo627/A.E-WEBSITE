import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

interface QuizOption {
  id: string;
  label: string;
  sortOrder: number;
}

interface QuizQuestion {
  id: string;
  prompt: string;
  sortOrder: number;
  options: QuizOption[];
}

interface QuizData {
  id: string;
  title: string;
  instructions?: string | null;
  passingScore: number;
  timeLimitMinutes?: number | null;
  module: {
    id: string;
    title: string;
    slug: string;
  };
  questions: QuizQuestion[];
  latestAttempt?: {
    id: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    submittedAt: string;
  } | null;
}

interface QuizSubmissionResult {
  attemptId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  passingScore: number;
  submittedAt: string;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isQuizData = (value: unknown): value is QuizData => {
  if (!isObject(value) || !isObject(value.module) || !Array.isArray(value.questions)) {
    return false;
  }

  const baseValid =
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.passingScore === "number" &&
    typeof value.module.id === "string" &&
    typeof value.module.title === "string" &&
    typeof value.module.slug === "string";

  if (!baseValid) {
    return false;
  }

  if (
    value.instructions !== undefined &&
    value.instructions !== null &&
    typeof value.instructions !== "string"
  ) {
    return false;
  }

  if (
    value.timeLimitMinutes !== undefined &&
    value.timeLimitMinutes !== null &&
    typeof value.timeLimitMinutes !== "number"
  ) {
    return false;
  }

  return value.questions.every((question) => {
    if (!isObject(question) || !Array.isArray(question.options)) {
      return false;
    }

    const questionValid =
      typeof question.id === "string" &&
      typeof question.prompt === "string" &&
      typeof question.sortOrder === "number";

    if (!questionValid) {
      return false;
    }

    return question.options.every(
      (option) =>
        isObject(option) &&
        typeof option.id === "string" &&
        typeof option.label === "string" &&
        typeof option.sortOrder === "number"
    );
  });
};

const isQuizSubmissionResult = (value: unknown): value is QuizSubmissionResult => {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.attemptId === "string" &&
    typeof value.score === "number" &&
    typeof value.totalQuestions === "number" &&
    typeof value.correctAnswers === "number" &&
    typeof value.passed === "boolean" &&
    typeof value.passingScore === "number" &&
    typeof value.submittedAt === "string"
  );
};

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadQuiz = useCallback(async () => {
    if (!id) {
      setError("Missing quiz identifier in URL.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/quizzes/${encodeURIComponent(id)}`);
      if (!isQuizData(response)) {
        throw new Error("Unexpected quiz response shape.");
      }

      setQuiz(response);
      setResult(null);
      setSubmitError(null);
      setSelectedAnswers({});
    } catch (fetchError: unknown) {
      const message = fetchError instanceof Error ? fetchError.message : "Failed to load quiz.";
      setError(message);
      setQuiz(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

  const answeredCount = useMemo(
    () => Object.keys(selectedAnswers).length,
    [selectedAnswers]
  );

  const handleSelectAnswer = (questionId: string, optionId: string): void => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!quiz || !id) {
      return;
    }

    if (answeredCount !== quiz.questions.length) {
      setSubmitError("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        answers: quiz.questions.map((question) => ({
          questionId: question.id,
          selectedOptionId: selectedAnswers[question.id]
        }))
      };

      const response = await apiFetch(`/quizzes/${encodeURIComponent(id)}/submit`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (!isQuizSubmissionResult(response)) {
        throw new Error("Unexpected quiz submission response shape.");
      }

      setResult(response);
    } catch (submissionError: unknown) {
      const message =
        submissionError instanceof Error ? submissionError.message : "Failed to submit quiz.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 px-6 min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {isLoading ? (
          <div className="ae-brand-card border border-[var(--ae-border)] rounded-3xl p-12 text-center text-[var(--text-color)]/70 font-medium shadow-sm">Loading quiz...</div>
        ) : null}

        {!isLoading && error ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-1">Failed to load</h3>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void loadQuiz()}
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 transition-colors rounded-xl font-bold text-white shadow-sm"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !error && quiz ? (
          <>
            <section className="ae-brand-card border border-[var(--ae-border)] rounded-3xl p-8 shadow-sm">
              <h1 className="text-3xl font-black text-[var(--text-color)] mb-2">{quiz.title}</h1>
              <p className="text-[var(--text-color)]/70 font-medium mb-4">Module: <span className="font-bold text-[var(--ae-blue)]">{quiz.module.title}</span></p>
              {quiz.instructions ? <p className="text-[var(--text-color)] font-medium mb-6 bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--ae-border)]">{quiz.instructions}</p> : null}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[var(--card-bg)] border border-[var(--ae-border)] rounded-2xl p-4">
                  <p className="text-xs uppercase font-bold tracking-wider text-[var(--text-color)]/50 mb-1">Questions</p>
                  <p className="text-2xl font-black text-[var(--text-color)]">{quiz.questions.length}</p>
                </div>
                <div className="bg-[var(--card-bg)] border border-[var(--ae-border)] rounded-2xl p-4">
                  <p className="text-xs uppercase font-bold tracking-wider text-[var(--text-color)]/50 mb-1">Passing Score</p>
                  <p className="text-2xl font-black text-[var(--text-color)]">{quiz.passingScore}%</p>
                </div>
                <div className="bg-[var(--card-bg)] border border-[var(--ae-border)] rounded-2xl p-4">
                  <p className="text-xs uppercase font-bold tracking-wider text-[var(--text-color)]/50 mb-1">Time Limit</p>
                  <p className="text-2xl font-black text-[var(--text-color)]">
                    {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "No limit"}
                  </p>
                </div>
              </div>

              {quiz.latestAttempt ? (
                <div className="mt-6 app-soft-surface border rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-bold tracking-wider app-muted-text mb-1">Last Attempt</p>
                    <p className="text-lg font-black text-[var(--text-color)]">
                      {quiz.latestAttempt.score}% <span className="app-muted-text font-medium text-base ml-2">({quiz.latestAttempt.correctAnswers}/{quiz.latestAttempt.totalQuestions})</span>
                    </p>
                  </div>
                </div>
              ) : null}
            </section>

            {result ? (
              <section className="ae-brand-card border border-[var(--ae-border)] rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl font-black text-[var(--text-color)] mb-4">Quiz Result</h2>
                
                <div className="bg-[var(--card-bg)] border border-[var(--ae-border)] rounded-2xl p-6 mb-6">
                  <p className="text-lg font-medium text-[var(--text-color)]/70 mb-2">
                    Score: <span className="font-black text-2xl text-[var(--text-color)] ml-2">{result.score}%</span>
                  </p>
                  <p className="text-[var(--text-color)]/60 font-medium mb-4">
                    Correct: <span className="font-bold text-[var(--text-color)]">{result.correctAnswers}</span> / {result.totalQuestions}
                  </p>
                  
                  <div className={`p-4 rounded-xl font-bold flex items-center ${result.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    {result.passed
                      ? "✓ Passed. Great work!"
                      : `⚠ Not passed yet. You need ${result.passingScore}% to pass.`}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => void loadQuiz()}
                    className="flex-1 py-3.5 bg-[var(--ae-blue)] hover:bg-[var(--ae-blue)]/90 rounded-2xl font-bold text-white shadow-md transition-colors text-center"
                  >
                    Retake Quiz
                  </button>
                  <Link
                    to={`/modules/${quiz.module.slug}`}
                    className="flex-1 py-3.5 bg-[var(--card-bg)] border border-[var(--ae-border)] hover:opacity-90 rounded-2xl font-bold text-[var(--text-color)] shadow-sm transition-colors text-center"
                  >
                    Back To Module
                  </Link>
                </div>
              </section>
            ) : (
              <section className="space-y-6">
                {quiz.questions.map((question, index) => (
                  <article key={question.id} className="ae-brand-card border border-[var(--ae-border)] rounded-3xl p-6 shadow-sm">
                    <p className="font-bold text-lg text-[var(--text-color)] mb-4">
                      <span className="text-[var(--ae-blue)] mr-2">{index + 1}.</span> {question.prompt}
                    </p>

                    <div className="space-y-3">
                      {question.options.map((option) => {
                        const isSelected = selectedAnswers[question.id] === option.id;
                        return (
                          <label
                            key={option.id}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? "border-[var(--ae-blue)] bg-[var(--ae-blue)]/5 font-bold text-[var(--ae-blue)] shadow-sm"
                                : "border-[var(--ae-border)] bg-[var(--card-bg)] hover:border-[var(--ae-blue)]/50 font-medium text-[var(--text-color)]/70"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option.id}
                              checked={isSelected}
                              onChange={() => handleSelectAnswer(question.id, option.id)}
                              className="w-5 h-5 accent-[var(--ae-blue)] cursor-pointer"
                            />
                            <span className="text-base">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </article>
                ))}

                <div className="ae-brand-card border border-[var(--ae-border)] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold app-muted-text uppercase tracking-wider mb-1">
                      Progress
                    </p>
                    <p className="font-medium text-[var(--text-color)]/70">
                      Answered <span className="font-bold text-[var(--ae-blue)]">{answeredCount}</span> of {quiz.questions.length}
                    </p>
                    {submitError ? <p className="text-sm font-medium text-red-600 mt-2">{submitError}</p> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={isSubmitting}
                    className="px-8 py-3.5 bg-[var(--ae-plum-deep)] hover:bg-[var(--ae-plum-deep)]/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-white shadow-md transition-all text-center"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                </div>
              </section>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
