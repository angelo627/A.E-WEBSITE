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
  instructions?: string;
  passingScore: number;
  timeLimitMinutes?: number;
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

  if (value.instructions !== undefined && typeof value.instructions !== "string") {
    return false;
  }

  if (value.timeLimitMinutes !== undefined && typeof value.timeLimitMinutes !== "number") {
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
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        {isLoading ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">Loading quiz...</div>
        ) : null}

        {!isLoading && error ? (
          <div className="bg-rose-500/10 border border-rose-400/30 rounded-2xl p-6">
            <p className="text-rose-200 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => void loadQuiz()}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-400 rounded-lg font-medium"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !error && quiz ? (
          <>
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h1 className="text-3xl font-bold text-purple-300 mb-2">{quiz.title}</h1>
              <p className="text-gray-300 mb-2">Module: {quiz.module.title}</p>
              {quiz.instructions ? <p className="text-gray-200 mb-4">{quiz.instructions}</p> : null}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-xs uppercase text-gray-400">Questions</p>
                  <p className="text-xl font-semibold">{quiz.questions.length}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-xs uppercase text-gray-400">Passing Score</p>
                  <p className="text-xl font-semibold">{quiz.passingScore}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-xs uppercase text-gray-400">Time Limit</p>
                  <p className="text-xl font-semibold">
                    {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "No limit"}
                  </p>
                </div>
              </div>

              {quiz.latestAttempt ? (
                <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-sm text-gray-300">
                    Last attempt: {quiz.latestAttempt.score}% ({quiz.latestAttempt.correctAnswers}/
                    {quiz.latestAttempt.totalQuestions})
                  </p>
                </div>
              ) : null}
            </section>

            {result ? (
              <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-2xl font-semibold mb-2">Quiz Result</h2>
                <p className="text-lg mb-2">
                  Score: <span className="font-bold">{result.score}%</span>
                </p>
                <p className="text-gray-300 mb-2">
                  Correct: {result.correctAnswers}/{result.totalQuestions}
                </p>
                <p className={result.passed ? "text-emerald-300" : "text-amber-300"}>
                  {result.passed
                    ? "Passed. Great work."
                    : `Not passed yet. You need ${result.passingScore}% to pass.`}
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => void loadQuiz()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium"
                  >
                    Retake Quiz
                  </button>
                  <Link
                    to={`/modules/${quiz.module.slug}`}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium"
                  >
                    Back To Module
                  </Link>
                </div>
              </section>
            ) : (
              <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                {quiz.questions.map((question, index) => (
                  <article key={question.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="font-medium mb-3">
                      {index + 1}. {question.prompt}
                    </p>

                    <div className="space-y-2">
                      {question.options.map((option) => {
                        const isSelected = selectedAnswers[question.id] === option.id;
                        return (
                          <label
                            key={option.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                              isSelected
                                ? "border-purple-400 bg-purple-500/20"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option.id}
                              checked={isSelected}
                              onChange={() => handleSelectAnswer(question.id, option.id)}
                              className="accent-purple-500"
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </article>
                ))}

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-sm text-gray-300 mb-3">
                    Answered {answeredCount} of {quiz.questions.length}
                  </p>
                  {submitError ? <p className="text-sm text-rose-200 mb-3">{submitError}</p> : null}
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800/70 disabled:cursor-not-allowed rounded-lg font-semibold"
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
