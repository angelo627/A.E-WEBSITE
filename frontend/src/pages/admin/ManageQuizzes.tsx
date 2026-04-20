import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Check,
  ListVideo
} from "lucide-react";

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

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
} as const;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
} as const;

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

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        className="max-w-7xl mx-auto relative z-10 pb-20 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section variants={itemVariants} className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-blue-500/30">
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Manage Quizzes
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-2">
              Create assessments, add options, and test your users' knowledge.
            </p>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-3xl p-6 md:p-8 relative">
          <AnimatePresence>
            {submitError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6 shadow-lg shadow-rose-500/5"
              >
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <p className="text-sm font-medium text-rose-200">{submitError}</p>
              </motion.div>
            )}
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 shadow-lg shadow-emerald-500/5"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <p className="text-sm font-medium text-emerald-200">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            {isEditing ? <Edit3 className="w-5 h-5 text-blue-400" /> : <Plus className="w-5 h-5 text-emerald-400" />}
            {isEditing ? "Edit Quiz" : "Create New Quiz"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="quiz-module">
                  Target Module
                </label>
                <select
                  id="quiz-module"
                  value={form.moduleId}
                  onChange={(event) => handleQuizField("moduleId", event.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors text-white appearance-none cursor-pointer"
                  style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="%239CA3AF" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>')`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em', paddingRight: '3rem' }}
                >
                  <option value="" className="text-gray-900 bg-white">
                    Select a module
                  </option>
                  {modules.map((moduleItem) => (
                    <option key={moduleItem.id} value={moduleItem.id} className="text-gray-900 bg-white">
                      {moduleItem.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="quiz-title">
                  Quiz Title
                </label>
                <input
                  id="quiz-title"
                  type="text"
                  value={form.title}
                  onChange={(event) => handleQuizField("title", event.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600"
                  placeholder="e.g. End of Chapter 1 Quiz"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="quiz-instructions">
                Instructions (Optional)
              </label>
              <textarea
                id="quiz-instructions"
                rows={3}
                value={form.instructions}
                onChange={(event) => handleQuizField("instructions", event.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600 resize-none"
                placeholder="Specific instructions for the user..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="quiz-passing-score">
                  Passing Score (%)
                </label>
                <input
                  id="quiz-passing-score"
                  type="number"
                  value={form.passingScore}
                  onChange={(event) => handleQuizField("passingScore", event.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600"
                  placeholder="e.g. 75"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2" htmlFor="quiz-time-limit">
                  Time Limit (Minutes)
                </label>
                <input
                  id="quiz-time-limit"
                  type="number"
                  value={form.timeLimitMinutes}
                  onChange={(event) => handleQuizField("timeLimitMinutes", event.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none px-4 py-3 transition-colors placeholder:text-gray-600"
                  placeholder="e.g. 30"
                />
              </div>
              <div className="flex items-center pt-6">
                 <label className="relative inline-flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(event) => handleQuizField("isPublished", event.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Publish Directly</span>
                </label>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  Quiz Questions
                </h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all font-medium text-sm border border-blue-500/20"
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>

              <AnimatePresence>
                {form.questions.map((question, qIndex) => (
                  <motion.article 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={question.key}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <p className="text-xs uppercase tracking-widest font-bold text-gray-500 flex items-center gap-2">
                        Question #{qIndex + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        disabled={form.questions.length === 1}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white disabled:opacity-30 disabled:hover:bg-rose-500/10 disabled:hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Enter the question prompt here..."
                      value={question.prompt}
                      onChange={(event) => handleQuestionField(qIndex, "prompt", event.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none px-4 py-3 transition-colors placeholder:text-gray-600 font-medium"
                    />

                    <textarea
                      rows={2}
                      placeholder="Optional explanation for the correct answer..."
                      value={question.explanation}
                      onChange={(event) =>
                        handleQuestionField(qIndex, "explanation", event.target.value)
                      }
                      className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none px-4 py-3 transition-colors placeholder:text-gray-600 resize-none text-sm"
                    />

                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        placeholder="Sort Order"
                        value={question.sortOrder}
                        onChange={(event) => handleQuestionField(qIndex, "sortOrder", event.target.value)}
                        className="w-32 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none px-4 py-2 transition-colors placeholder:text-gray-600 text-sm"
                      />
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 bg-black/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs uppercase tracking-wider font-bold text-gray-500">Answer Options</p>
                        <button
                          type="button"
                          onClick={() => addOption(qIndex)}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors text-xs font-bold tracking-wide flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Option
                        </button>
                      </div>

                      <div className="space-y-3">
                        {question.options.map((option, oIndex) => (
                          <div
                            key={option.key}
                            className={`flex flex-col md:flex-row gap-3 items-center rounded-xl p-2 border ${option.isCorrect ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 bg-white/5'}`}
                          >
                            <input
                              type="text"
                              placeholder={`Option ${oIndex + 1}`}
                              value={option.label}
                              onChange={(event) =>
                                handleOptionField(qIndex, oIndex, "label", event.target.value)
                              }
                              className="flex-1 w-full rounded-lg bg-transparent focus:bg-white/5 border border-transparent focus:border-white/10 outline-none px-3 py-1.5 transition-colors placeholder:text-gray-600"
                            />
                            
                            <div className="flex items-center gap-3 w-full md:w-auto shrink-0 px-2 justify-between">
                              <label className="flex items-center gap-2 cursor-pointer group pr-4 md:border-r border-white/10">
                                <div className="relative flex items-center justify-center">
                                  <input
                                    type="radio"
                                    name={`correct-option-${question.key}`}
                                    checked={option.isCorrect}
                                    onChange={() => handleOptionField(qIndex, oIndex, "isCorrect", true)}
                                    className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-500 checked:border-emerald-500 checked:bg-emerald-500 transition-colors cursor-pointer"
                                  />
                                  <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                                <span className={`text-sm font-bold ${option.isCorrect ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}`}>Correct Answer</span>
                              </label>

                              <input
                                type="number"
                                placeholder="Order"
                                value={option.sortOrder}
                                onChange={(event) =>
                                  handleOptionField(qIndex, oIndex, "sortOrder", event.target.value)
                                }
                                className="w-16 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none px-2 py-1.5 transition-colors text-center text-sm placeholder:text-gray-600"
                              />

                              <button
                                type="button"
                                onClick={() => removeOption(qIndex, oIndex)}
                                disabled={question.options.length <= 2}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:shadow-none transition-all font-bold text-white"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-5 h-5" /> {isEditing ? "Update Quiz" : "Create Quiz"}</>
                )}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all font-medium text-white"
                >
                  <X className="w-5 h-5" /> Cancel Edit
                </button>
              )}
            </div>
          </form>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ListVideo className="w-6 h-6 text-indigo-400" />
              Existing Quizzes
            </h2>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
               {quizzes.length} Total
            </span>
          </div>

          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-indigo-200">Loading quizzes...</p>
             </div>
          ) : null}
          {!isLoading && error ? (
            <div className="flex flex-col items-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
              <p className="text-rose-200 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => void loadDependencies()}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 rounded-xl font-medium shadow-lg shadow-rose-500/20"
              >
                Retry Request
              </button>
            </div>
          ) : null}
          {!isLoading && !error && quizzes.length === 0 ? (
            <div className="text-center py-12">
               <HelpCircle className="w-12 h-12 mx-auto text-gray-500 mb-4 opacity-50" />
               <p className="text-gray-400">No quizzes found. Create one above.</p>
            </div>
          ) : null}

          {!isLoading && !error && quizzes.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {quizzes.map((quiz) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    key={quiz.id}
                    className={`group bg-white/[0.02] border border-white/[0.08] hover:border-indigo-500/30 rounded-2xl p-5 transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row gap-6 md:items-center justify-between ${editingQuizId === quiz.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#050020]' : ''}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="flex-1 z-10 w-full min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md ${quiz.isPublished ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {quiz.isPublished ? "Published" : "Draft"}
                        </span>
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap bg-white/5 px-2 py-1 rounded-md">
                           {quiz.questionCount} Questions
                        </span>
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap bg-white/5 px-2 py-1 rounded-md">
                           {quiz.attemptCount} Attempts
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 truncate">
                        Module: {quiz.module.title} • Pass Score: {quiz.passingScore}%
                      </p>
                    </div>

                    <div className="flex gap-3 z-10 shrink-0">
                      <button
                        type="button"
                        onClick={() => void handleEdit(quiz.id)}
                        className="flex items-center justify-center p-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg hover:shadow-blue-500/30 group/btn"
                        title="Edit Quiz"
                      >
                        <Edit3 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(quiz.id)}
                        className="flex items-center justify-center p-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:shadow-rose-500/30 group/btn"
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          ) : null}
        </motion.section>
      </motion.div>
    </div>
  );
}
