import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";

interface ModuleOption {
  id: string;
  title: string;
  slug: string;
}

interface QuizListItem {
  id: string;
  moduleId: string;
  title: string;
  instructions?: string;
  passingScore: number;
  timeLimitMinutes?: number;
  isPublished: boolean;
  questionCount: number;
  attemptCount: number;
  module: ModuleOption;
}

interface QuizOption {
  id: string;
  label: string;
  isCorrect: boolean;
  sortOrder: number;
}

interface QuizQuestion {
  id: string;
  prompt: string;
  explanation?: string;
  sortOrder: number;
  options: QuizOption[];
}

interface QuizDetail extends Omit<QuizListItem, "questionCount" | "attemptCount"> {
  questions: QuizQuestion[];
}

interface OptionFormState {
  key: string;
  label: string;
  isCorrect: boolean;
  sortOrder: string;
}

interface QuestionFormState {
  key: string;
  prompt: string;
  explanation: string;
  sortOrder: string;
  options: OptionFormState[];
}

interface QuizFormState {
  moduleId: string;
  title: string;
  instructions: string;
  passingScore: string;
  timeLimitMinutes: string;
  isPublished: boolean;
  questions: QuestionFormState[];
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};

const isModuleOption = (value: unknown): value is ModuleOption =>
  isObject(value) &&
  typeof value.id === "string" &&
  typeof value.title === "string" &&
  typeof value.slug === "string";

const isQuizListItem = (value: unknown): value is QuizListItem =>
  isObject(value) &&
  typeof value.id === "string" &&
  typeof value.moduleId === "string" &&
  typeof value.title === "string" &&
  (value.instructions === undefined || typeof value.instructions === "string") &&
  typeof value.passingScore === "number" &&
  (value.timeLimitMinutes === undefined || typeof value.timeLimitMinutes === "number") &&
  typeof value.isPublished === "boolean" &&
  typeof value.questionCount === "number" &&
  typeof value.attemptCount === "number" &&
  isModuleOption(value.module);

const isQuizDetail = (value: unknown): value is QuizDetail => {
  if (!isObject(value) || !Array.isArray(value.questions) || !isModuleOption(value.module)) {
    return false;
  }

  const quizBase =
    typeof value.id === "string" &&
    typeof value.moduleId === "string" &&
    typeof value.title === "string" &&
    (value.instructions === undefined || typeof value.instructions === "string") &&
    typeof value.passingScore === "number" &&
    (value.timeLimitMinutes === undefined || typeof value.timeLimitMinutes === "number") &&
    typeof value.isPublished === "boolean";

  if (!quizBase) {
    return false;
  }

  return value.questions.every((question) => {
    if (!isObject(question) || !Array.isArray(question.options)) {
      return false;
    }

    const validQuestion =
      typeof question.id === "string" &&
      typeof question.prompt === "string" &&
      (question.explanation === undefined || typeof question.explanation === "string") &&
      typeof question.sortOrder === "number";

    if (!validQuestion) {
      return false;
    }

    return question.options.every(
      (option) =>
        isObject(option) &&
        typeof option.id === "string" &&
        typeof option.label === "string" &&
        typeof option.isCorrect === "boolean" &&
        typeof option.sortOrder === "number"
    );
  });
};

const makeOptionRow = (index: number): OptionFormState => ({
  key: `${Date.now()}-opt-${Math.random()}`,
  label: "",
  isCorrect: index === 0,
  sortOrder: String(index)
});

const makeQuestionRow = (index: number): QuestionFormState => ({
  key: `${Date.now()}-q-${Math.random()}`,
  prompt: "",
  explanation: "",
  sortOrder: String(index),
  options: [makeOptionRow(0), makeOptionRow(1)]
});

const emptyQuizForm = (): QuizFormState => ({
  moduleId: "",
  title: "",
  instructions: "",
  passingScore: "70",
  timeLimitMinutes: "",
  isPublished: false,
  questions: [makeQuestionRow(0)]
});

const toFormState = (quiz: QuizDetail): QuizFormState => ({
  moduleId: quiz.moduleId,
  title: quiz.title,
  instructions: quiz.instructions ?? "",
  passingScore: String(quiz.passingScore),
  timeLimitMinutes: quiz.timeLimitMinutes ? String(quiz.timeLimitMinutes) : "",
  isPublished: quiz.isPublished,
  questions: quiz.questions.map((question, qIndex) => ({
    key: question.id || `${Date.now()}-q-${qIndex}`,
    prompt: question.prompt,
    explanation: question.explanation ?? "",
    sortOrder: String(question.sortOrder),
    options: question.options.map((option, oIndex) => ({
      key: option.id || `${Date.now()}-o-${qIndex}-${oIndex}`,
      label: option.label,
      isCorrect: option.isCorrect,
      sortOrder: String(option.sortOrder)
    }))
  }))
});

export default function ManageQuizzes() {
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [form, setForm] = useState<QuizFormState>(emptyQuizForm());
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isEditing = useMemo(() => editingQuizId !== null, [editingQuizId]);

  const loadDependencies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [quizzesResponse, modulesResponse] = await Promise.all([
        apiFetch("/admin/quizzes"),
        apiFetch("/admin/modules")
      ]);

      if (!Array.isArray(quizzesResponse) || !quizzesResponse.every((item) => isQuizListItem(item))) {
        throw new Error("Unexpected quizzes response shape.");
      }

      const modulesParsed = Array.isArray(modulesResponse)
        ? modulesResponse
            .filter((item): item is Record<string, unknown> => isObject(item))
            .map((item) => ({
              id: item.id,
              title: item.title,
              slug: item.slug
            }))
            .filter((item): item is ModuleOption => isModuleOption(item))
        : [];

      setQuizzes(quizzesResponse);
      setModules(modulesParsed);
    } catch (fetchError: unknown) {
      setError(getErrorMessage(fetchError));
      setQuizzes([]);
      setModules([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDependencies();
  }, [loadDependencies]);

  const resetForm = () => {
    setEditingQuizId(null);
    setForm(emptyQuizForm());
    setSubmitError(null);
    setSuccessMessage(null);
  };

  const handleQuizField = (
    field: keyof Omit<QuizFormState, "questions">,
    value: string | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuestionField = (
    questionIndex: number,
    field: keyof Omit<QuestionFormState, "key" | "options">,
    value: string
  ) => {
    setForm((prev) => {
      const nextQuestions = [...prev.questions];
      nextQuestions[questionIndex] = {
        ...nextQuestions[questionIndex],
        [field]: value
      };
      return { ...prev, questions: nextQuestions };
    });
  };

  const handleOptionField = (
    questionIndex: number,
    optionIndex: number,
    field: keyof Omit<OptionFormState, "key">,
    value: string | boolean
  ) => {
    setForm((prev) => {
      const nextQuestions = [...prev.questions];
      const question = nextQuestions[questionIndex];
      const nextOptions = [...question.options];

      if (field === "isCorrect" && value === true) {
        nextQuestions[questionIndex] = {
          ...question,
          options: nextOptions.map((option, idx) => ({
            ...option,
            isCorrect: idx === optionIndex
          }))
        };
        return { ...prev, questions: nextQuestions };
      }

      nextOptions[optionIndex] = {
        ...nextOptions[optionIndex],
        [field]: value
      };

      nextQuestions[questionIndex] = { ...question, options: nextOptions };
      return { ...prev, questions: nextQuestions };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, makeQuestionRow(prev.questions.length)]
    }));
  };

  const removeQuestion = (questionIndex: number) => {
    setForm((prev) => {
      if (prev.questions.length === 1) {
        return prev;
      }
      return {
        ...prev,
        questions: prev.questions.filter((_, idx) => idx !== questionIndex)
      };
    });
  };

  const addOption = (questionIndex: number) => {
    setForm((prev) => {
      const nextQuestions = [...prev.questions];
      const question = nextQuestions[questionIndex];
      nextQuestions[questionIndex] = {
        ...question,
        options: [...question.options, makeOptionRow(question.options.length)]
      };
      return { ...prev, questions: nextQuestions };
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setForm((prev) => {
      const nextQuestions = [...prev.questions];
      const question = nextQuestions[questionIndex];
      if (question.options.length === 2) {
        return prev;
      }
      const nextOptions = question.options.filter((_, idx) => idx !== optionIndex);
      if (!nextOptions.some((option) => option.isCorrect)) {
        nextOptions[0] = { ...nextOptions[0], isCorrect: true };
      }
      nextQuestions[questionIndex] = { ...question, options: nextOptions };
      return { ...prev, questions: nextQuestions };
    });
  };

  const validateForm = (): string | null => {
    if (!form.moduleId.trim()) {
      return "Please select a module.";
    }
    if (!form.title.trim()) {
      return "Quiz title is required.";
    }
    if (!form.passingScore.trim() || Number.isNaN(Number(form.passingScore))) {
      return "Passing score must be a valid number.";
    }
    if (form.timeLimitMinutes.trim() && Number.isNaN(Number(form.timeLimitMinutes))) {
      return "Time limit must be a valid number.";
    }
    if (form.questions.length === 0) {
      return "At least one question is required.";
    }

    for (let q = 0; q < form.questions.length; q += 1) {
      const question = form.questions[q];
      if (!question.prompt.trim()) {
        return `Question ${q + 1}: prompt is required.`;
      }
      if (question.sortOrder.trim() && Number.isNaN(Number(question.sortOrder))) {
        return `Question ${q + 1}: sort order must be a valid number.`;
      }
      if (question.options.length < 2) {
        return `Question ${q + 1}: at least two options are required.`;
      }
      const correctOptionsCount = question.options.filter((option) => option.isCorrect).length;
      if (correctOptionsCount !== 1) {
        return `Question ${q + 1}: exactly one option must be marked correct.`;
      }

      for (let o = 0; o < question.options.length; o += 1) {
        const option = question.options[o];
        if (!option.label.trim()) {
          return `Question ${q + 1}, Option ${o + 1}: label is required.`;
        }
        if (option.sortOrder.trim() && Number.isNaN(Number(option.sortOrder))) {
          return `Question ${q + 1}, Option ${o + 1}: sort order must be a valid number.`;
        }
      }
    }

    return null;
  };

  const buildPayload = () => ({
    moduleId: form.moduleId.trim(),
    title: form.title.trim(),
    instructions: form.instructions.trim() || undefined,
    passingScore: Number(form.passingScore),
    timeLimitMinutes: form.timeLimitMinutes.trim() ? Number(form.timeLimitMinutes) : undefined,
    isPublished: form.isPublished,
    questions: form.questions.map((question, qIndex) => ({
      prompt: question.prompt.trim(),
      explanation: question.explanation.trim() || undefined,
      sortOrder: question.sortOrder.trim() ? Number(question.sortOrder) : qIndex,
      options: question.options.map((option, oIndex) => ({
        label: option.label.trim(),
        isCorrect: option.isCorrect,
        sortOrder: option.sortOrder.trim() ? Number(option.sortOrder) : oIndex
      }))
    }))
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      if (editingQuizId) {
        await apiFetch(`/admin/quizzes/${editingQuizId}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
        setSuccessMessage("Quiz updated successfully.");
      } else {
        await apiFetch("/admin/quizzes", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setSuccessMessage("Quiz created successfully.");
      }

      await loadDependencies();
      resetForm();
    } catch (submissionError: unknown) {
      setSubmitError(getErrorMessage(submissionError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (quizId: string) => {
    setSubmitError(null);
    setSuccessMessage(null);
    try {
      const response = await apiFetch(`/admin/quizzes/${quizId}`);
      if (!isQuizDetail(response)) {
        throw new Error("Unexpected quiz detail response shape.");
      }
      setEditingQuizId(quizId);
      setForm(toFormState(response));
    } catch (editError: unknown) {
      setSubmitError(getErrorMessage(editError));
    }
  };

  const handleDelete = async (quizId: string) => {
    const confirmed = window.confirm("Delete this quiz permanently?");
    if (!confirmed) {
      return;
    }

    setSubmitError(null);
    setSuccessMessage(null);
    try {
      await apiFetch(`/admin/quizzes/${quizId}`, { method: "DELETE" });
      if (editingQuizId === quizId) {
        resetForm();
      }
      setSuccessMessage("Quiz deleted successfully.");
      await loadDependencies();
    } catch (deleteError: unknown) {
      setSubmitError(getErrorMessage(deleteError));
    }
  };

  return (
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-purple-300 mb-2">Manage Quizzes</h1>
          <p className="text-gray-300">Create quizzes, add questions, and set the correct options.</p>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Quiz" : "Create Quiz"}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="quiz-module">
                  Module
                </label>
                <select
                  id="quiz-module"
                  value={form.moduleId}
                  onChange={(event) => handleQuizField("moduleId", event.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                >
                  <option value="" className="text-black">
                    Select a module
                  </option>
                  {modules.map((moduleItem) => (
                    <option key={moduleItem.id} value={moduleItem.id} className="text-black">
                      {moduleItem.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="quiz-title">
                  Quiz Title
                </label>
                <input
                  id="quiz-title"
                  type="text"
                  value={form.title}
                  onChange={(event) => handleQuizField("title", event.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1" htmlFor="quiz-instructions">
                Instructions
              </label>
              <textarea
                id="quiz-instructions"
                rows={3}
                value={form.instructions}
                onChange={(event) => handleQuizField("instructions", event.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="quiz-passing-score">
                  Passing Score
                </label>
                <input
                  id="quiz-passing-score"
                  type="number"
                  value={form.passingScore}
                  onChange={(event) => handleQuizField("passingScore", event.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="quiz-time-limit">
                  Time Limit (minutes)
                </label>
                <input
                  id="quiz-time-limit"
                  type="number"
                  value={form.timeLimitMinutes}
                  onChange={(event) => handleQuizField("timeLimitMinutes", event.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-200">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(event) => handleQuizField("isPublished", event.target.checked)}
                    className="accent-purple-500"
                  />
                  Published
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Questions</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-medium"
                >
                  Add Question
                </button>
              </div>

              {form.questions.map((question, qIndex) => (
                <article
                  key={question.key}
                  className="rounded-xl border border-white/15 bg-white/5 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">Question #{qIndex + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      disabled={form.questions.length === 1}
                      className="px-2.5 py-1 rounded bg-rose-600/70 hover:bg-rose-500 disabled:bg-rose-900/40 disabled:cursor-not-allowed text-sm"
                    >
                      Remove Question
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Question prompt"
                    value={question.prompt}
                    onChange={(event) => handleQuestionField(qIndex, "prompt", event.target.value)}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                  />

                  <textarea
                    rows={2}
                    placeholder="Explanation (optional)"
                    value={question.explanation}
                    onChange={(event) =>
                      handleQuestionField(qIndex, "explanation", event.target.value)
                    }
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                  />

                  <input
                    type="number"
                    placeholder="Question sort order"
                    value={question.sortOrder}
                    onChange={(event) => handleQuestionField(qIndex, "sortOrder", event.target.value)}
                    className="w-full md:w-56 rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                  />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Options</p>
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="px-2.5 py-1 rounded bg-cyan-600/80 hover:bg-cyan-500 text-sm"
                      >
                        Add Option
                      </button>
                    </div>

                    {question.options.map((option, oIndex) => (
                      <div
                        key={option.key}
                        className="grid grid-cols-1 md:grid-cols-[1fr_140px_120px_40px] gap-2 items-center"
                      >
                        <input
                          type="text"
                          placeholder={`Option ${oIndex + 1}`}
                          value={option.label}
                          onChange={(event) =>
                            handleOptionField(qIndex, oIndex, "label", event.target.value)
                          }
                          className="rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                        />

                        <label className="inline-flex items-center gap-2 text-sm text-gray-200">
                          <input
                            type="radio"
                            name={`correct-option-${question.key}`}
                            checked={option.isCorrect}
                            onChange={() => handleOptionField(qIndex, oIndex, "isCorrect", true)}
                            className="accent-purple-500"
                          />
                          Correct
                        </label>

                        <input
                          type="number"
                          placeholder="Sort order"
                          value={option.sortOrder}
                          onChange={(event) =>
                            handleOptionField(qIndex, oIndex, "sortOrder", event.target.value)
                          }
                          className="rounded-lg bg-white/10 border border-white/20 px-3 py-2"
                        />

                        <button
                          type="button"
                          onClick={() => removeOption(qIndex, oIndex)}
                          disabled={question.options.length <= 2}
                          className="h-10 rounded bg-rose-600/80 hover:bg-rose-500 disabled:bg-rose-900/40 disabled:cursor-not-allowed"
                          aria-label="Remove option"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            {submitError ? (
              <p className="text-sm text-rose-200 bg-rose-500/10 border border-rose-400/30 rounded-lg p-3">
                {submitError}
              </p>
            ) : null}
            {successMessage ? (
              <p className="text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-3">
                {successMessage}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? "Saving..." : isEditing ? "Update Quiz" : "Create Quiz"}
              </button>
              {isEditing ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 font-medium"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Quizzes</h2>

          {isLoading ? <p className="text-gray-300">Loading quizzes...</p> : null}
          {!isLoading && error ? (
            <div className="space-y-3">
              <p className="text-rose-200">{error}</p>
              <button
                type="button"
                onClick={() => void loadDependencies()}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 rounded-lg font-medium"
              >
                Retry
              </button>
            </div>
          ) : null}
          {!isLoading && !error && quizzes.length === 0 ? (
            <p className="text-gray-300">No quizzes found.</p>
          ) : null}

          {!isLoading && !error && quizzes.length > 0 ? (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <article
                  key={quiz.id}
                  className="rounded-xl border border-white/15 bg-white/5 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <h3 className="text-lg font-medium">{quiz.title}</h3>
                    <p className="text-sm text-gray-300">
                      Module: {quiz.module.title} • Questions: {quiz.questionCount} • Attempts: {quiz.attemptCount}
                    </p>
                    <p className="text-sm text-gray-300">
                      Passing score: {quiz.passingScore}% • {quiz.isPublished ? "Published" : "Draft"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void handleEdit(quiz.id)}
                      className="px-3 py-2 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(quiz.id)}
                      className="px-3 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
