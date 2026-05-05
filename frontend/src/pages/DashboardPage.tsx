import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/useAuth";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  TrendingUp, 
  ChevronRight,
  Loader2,
  AlertCircle
} from "lucide-react";

type ModuleStatus = "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED";

interface DashboardModule {
  moduleId: string;
  title: string;
  slug: string;
  status: ModuleStatus;
  progressPercent: number;
  estimatedMinutes?: number;
}

interface DashboardSummary {
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  notStartedModules: number;
  overallProgressPercent: number;
}

interface DashboardData {
  summary: DashboardSummary;
  modules: DashboardModule[];
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isModuleStatus = (value: unknown): value is ModuleStatus =>
  value === "COMPLETED" || value === "IN_PROGRESS" || value === "NOT_STARTED";

const isDashboardData = (value: unknown): value is DashboardData => {
  if (!isObject(value) || !isObject(value.summary) || !Array.isArray(value.modules)) {
    return false;
  }

  const summary = value.summary;
  const summaryIsValid =
    typeof summary.totalModules === "number" &&
    typeof summary.completedModules === "number" &&
    typeof summary.inProgressModules === "number" &&
    typeof summary.notStartedModules === "number" &&
    typeof summary.overallProgressPercent === "number";

  if (!summaryIsValid) {
    return false;
  }

  return value.modules.every((module) => {
    if (!isObject(module) || !isModuleStatus(module.status)) {
      return false;
    }

    const hasBaseFields =
      typeof module.moduleId === "string" &&
      typeof module.title === "string" &&
      typeof module.slug === "string" &&
      typeof module.progressPercent === "number";

    if (!hasBaseFields) {
      return false;
    }

    if (module.estimatedMinutes !== undefined && typeof module.estimatedMinutes !== "number") {
      return false;
    }

    return true;
  });
};

const getStatusStyle = (status: ModuleStatus): string => {
  if (status === "COMPLETED") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }
  if (status === "IN_PROGRESS") {
    return "bg-purple-50 text-purple-700 border border-purple-200";
  }
  return "bg-slate-100 text-slate-600 border border-slate-200";
};

const getStatusLabel = (status: ModuleStatus): string => {
  if (status === "COMPLETED") {
    return "Completed";
  }
  if (status === "IN_PROGRESS") {
    return "In Progress";
  }
  return "Not Started";
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
} as const;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
} as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch("/dashboard");

      if (!isDashboardData(response)) {
        throw new Error("Unexpected dashboard response shape.");
      }

      setDashboard(response);
    } catch (fetchError: unknown) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Failed to load dashboard.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="pt-24 px-6 min-h-screen bg-[var(--bg-color)] overflow-hidden relative">
      <motion.div 
        className="max-w-6xl mx-auto relative z-10 pb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-10 ae-brand-card border border-[var(--ae-border)] shadow-sm rounded-[28px] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ae-blue)] mb-3">
            Algorithmic Explorers Dashboard
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-[var(--text-color)]">
            Welcome back, {user?.firstName || "Student"}!
          </h1>
          <p className="text-[var(--text-color)]/70 text-lg max-w-2xl font-medium">
            Track your module progress, continue your learning, and stay on top.
          </p>
        </motion.div>

        {isLoading ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-12 ae-brand-card border border-[var(--ae-border)] rounded-3xl shadow-sm">
            <Loader2 className="w-10 h-10 text-[var(--ae-blue)] animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Loading your learning workspace...</p>
          </motion.div>
        ) : null}

        {!isLoading && error ? (
          <motion.div variants={itemVariants} className="bg-red-50 border border-red-200 rounded-3xl p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-1">Failed to load</h3>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 transition-colors rounded-xl font-bold text-white shadow-md shadow-red-500/20"
            >
              Try Again
            </button>
          </motion.div>
        ) : null}

        {!isLoading && !error && dashboard ? (
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Stat Cards */}
              <motion.div whileHover={{ y: -4 }} className="ae-brand-card border border-[var(--ae-border)] hover:border-purple-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-500 mb-1">Total Modules</p>
                <p className="text-3xl font-black text-[var(--text-color)]">{dashboard.summary.totalModules}</p>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="ae-brand-card border border-[var(--ae-border)] hover:border-emerald-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-500 mb-1">Completed</p>
                <p className="text-3xl font-black text-[var(--text-color)]">{dashboard.summary.completedModules}</p>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="ae-brand-card border border-[var(--ae-border)] hover:border-amber-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                    <PlayCircle className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-500 mb-1">In Progress</p>
                <p className="text-3xl font-black text-[var(--text-color)]">{dashboard.summary.inProgressModules}</p>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="ae-brand-card border border-[var(--ae-border)] hover:border-slate-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors">
                    <Clock className="w-6 h-6 text-slate-600" />
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-500 mb-1">Not Started</p>
                <p className="text-3xl font-black text-[var(--text-color)]">{dashboard.summary.notStartedModules}</p>
              </motion.div>

              <Link to="/leaderboard" className="block group">
                <motion.div whileHover={{ y: -4 }} className="h-full ae-brand-card border border-[var(--ae-border)] hover:border-[var(--ae-blue)]/50 rounded-2xl p-6 shadow-sm hover:shadow-md relative overflow-hidden transition-all">
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--ae-blue)] via-[var(--ae-lavender)] to-[var(--ae-peach)]" />
                  <div className="flex items-start justify-between mb-4 relative z-10 pt-2">
                    <div className="p-3 bg-[var(--ae-blue)]/10 rounded-xl group-hover:bg-[var(--ae-blue)]/20 transition-colors">
                      <TrendingUp className="w-6 h-6 text-[var(--ae-blue)]" />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-slate-500 mb-1">Overall Progress</p>
                    <p className="text-3xl font-black text-[var(--text-color)]">
                      {Math.max(0, Math.min(100, Math.round(dashboard.summary.overallProgressPercent)))}%
                    </p>
                    <p className="text-xs font-bold text-[var(--ae-blue)] mt-3 flex items-center group-hover:underline">
                      View Leaderboard <ChevronRight className="w-4 h-4 ml-1" />
                    </p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>

            {/* Main Progress Tracker */}
            {/* Main Progress Tracker */}
            <motion.div variants={itemVariants} className="ae-brand-card border border-[var(--ae-border)] rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                 <div>
                    <h2 className="text-2xl font-black text-[var(--text-color)] mb-2">Learning Tracker</h2>
                    <p className="text-slate-500 font-medium text-sm">Your journey relative to the total curriculum.</p>
                 </div>
                 <div className="text-right">
                    <span className="text-[var(--ae-blue)] font-bold">{dashboard.summary.completedModules} of {dashboard.summary.totalModules}</span>
                    <span className="text-slate-400 ml-2 font-bold uppercase tracking-wider text-xs">Modules</span>
                 </div>
              </div>
              
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, Math.min(100, dashboard.summary.overallProgressPercent))}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  className="h-full bg-[var(--ae-blue)] rounded-full relative"
                />
              </div>
            </motion.div>

            {/* Modules List */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl font-black text-[var(--text-color)]">Your Modules</h2>
              </div>

              {dashboard.modules.length === 0 ? (
                <div className="ae-brand-card border border-[var(--ae-border)] rounded-3xl p-12 text-center text-slate-500 shadow-sm">
                  <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <p className="font-medium">No modules available yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {dashboard.modules.map((module, index) => (
                    <Link
                      key={module.moduleId}
                      to={`/modules/${module.moduleId}`}
                      className="block group"
                    >
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, x: 5 }}
                        className="ae-brand-card border border-[var(--ae-border)] hover:border-[var(--ae-blue)]/50 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all shadow-sm hover:shadow-md relative overflow-hidden"
                      >
                        <div className="flex-1 min-w-0 z-10">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md ${getStatusStyle(module.status)}`}>
                              {getStatusLabel(module.status)}
                            </span>
                            {typeof module.estimatedMinutes === "number" && (
                              <span className="text-xs text-slate-500 flex items-center font-bold">
                                <Clock className="w-3.5 h-3.5 mr-1" />
                                {module.estimatedMinutes} mins
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg md:text-xl font-black text-[var(--text-color)] group-hover:text-[var(--ae-blue)] transition-colors truncate">
                            {module.title}
                          </h3>
                        </div>
                        
                        <div className="md:w-64 flex flex-col justify-center gap-2 z-10 shrink-0">
                          <div className="flex justify-between text-sm font-bold">
                            <span className="text-slate-500">Progress</span>
                            <span className="text-[var(--ae-blue)]">{Math.round(module.progressPercent)}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${Math.max(0, Math.min(100, module.progressPercent))}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, ease: "easeOut", delay: 0.1 + index * 0.05 }}
                              className={`h-full rounded-full ${module.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-[var(--ae-blue)]'}`}
                            />
                          </div>
                        </div>

                        <div className="hidden md:flex flex-col items-center justify-center pl-6 border-l border-slate-200 z-10 gap-2 min-w-[100px]">
                          <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 group-hover:text-[var(--ae-blue)] transition-colors">
                            {module.status === 'COMPLETED' ? 'Review' : (module.status === 'IN_PROGRESS' ? 'Continue' : 'Start')}
                          </span>
                          <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-[var(--ae-blue)] border border-slate-200 group-hover:border-[var(--ae-blue)] flex items-center justify-center transition-all duration-300 shadow-sm">
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
