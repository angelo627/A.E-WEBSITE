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
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  }
  if (status === "IN_PROGRESS") {
    return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
  }
  return "bg-white/5 text-gray-400 border border-white/10";
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
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        className="max-w-6xl mx-auto relative z-10 pb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent">
            Welcome back, {user?.firstName || "Student"}!
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Track your module progress, continue your learning, and stay on top.
          </p>
        </motion.div>

        {isLoading ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
            <p className="text-purple-200">Loading your learning workspace...</p>
          </motion.div>
        ) : null}

        {!isLoading && error ? (
          <motion.div variants={itemVariants} className="bg-rose-500/10 backdrop-blur-md border border-rose-500/20 rounded-3xl p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-rose-200 mb-1">Failed to load</h3>
                <p className="text-rose-300/70">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 transition-colors rounded-xl font-medium text-white shadow-lg shadow-rose-500/20"
            >
              Try Again
            </button>
          </motion.div>
        ) : null}

        {!isLoading && !error && dashboard ? (
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Stat Cards */}
              <motion.div whileHover={{ y: -4 }} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-purple-500/30 rounded-2xl p-6 shadow-xl transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-400 mb-1">Total Modules</p>
                <p className="text-3xl font-bold text-white">{dashboard.summary.totalModules}</p>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-emerald-500/30 rounded-2xl p-6 shadow-xl transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-400 mb-1">Completed</p>
                <p className="text-3xl font-bold text-white">{dashboard.summary.completedModules}</p>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-amber-500/30 rounded-2xl p-6 shadow-xl transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                    <PlayCircle className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-400 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-white">{dashboard.summary.inProgressModules}</p>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-gray-400/30 rounded-2xl p-6 shadow-xl transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                    <Clock className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-400 mb-1">Not Started</p>
                <p className="text-3xl font-bold text-white">{dashboard.summary.notStartedModules}</p>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="bg-gradient-to-br from-purple-900/40 to-pink-900/20 backdrop-blur-xl border border-purple-500/20 hover:border-purple-400/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    <TrendingUp className="w-6 h-6 text-purple-300" />
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-medium text-purple-200/70 mb-1">Overall Progress</p>
                  <p className="text-3xl font-bold text-white">
                    {Math.max(0, Math.min(100, Math.round(dashboard.summary.overallProgressPercent)))}%
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Main Progress Tracker */}
            <motion.div variants={itemVariants} className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                 <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Learning Tracker</h2>
                    <p className="text-gray-400 text-sm">Your journey relative to the total curriculum.</p>
                 </div>
                 <div className="text-right">
                    <span className="text-purple-400 font-medium">{dashboard.summary.completedModules} of {dashboard.summary.totalModules}</span>
                    <span className="text-gray-500 ml-2">Modules Completed</span>
                 </div>
              </div>
              
              <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, Math.min(100, dashboard.summary.overallProgressPercent))}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 rounded-full relative"
                />
              </div>
            </motion.div>

            {/* Modules List */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl font-bold text-white">Your Modules</h2>
              </div>

              {dashboard.modules.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-600 mb-4 opacity-50" />
                  <p>No modules available yet.</p>
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
                        className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-purple-500/30 hover:bg-white/[0.05] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all shadow-lg hover:shadow-purple-500/5 relative overflow-hidden"
                      >
                        {/* Optional glow on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="flex-1 min-w-0 z-10">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md ${getStatusStyle(module.status)}`}>
                              {getStatusLabel(module.status)}
                            </span>
                            {typeof module.estimatedMinutes === "number" && (
                              <span className="text-xs text-gray-500 flex items-center font-medium">
                                <Clock className="w-3 h-3 mr-1" />
                                {module.estimatedMinutes} mins
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                            {module.title}
                          </h3>
                        </div>
                        
                        <div className="md:w-64 flex flex-col justify-center gap-2 z-10 shrink-0">
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-purple-300">{Math.round(module.progressPercent)}%</span>
                          </div>
                          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${Math.max(0, Math.min(100, module.progressPercent))}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, ease: "easeOut", delay: 0.1 + index * 0.05 }}
                              className={`h-full rounded-full ${module.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-purple-500'}`}
                            />
                          </div>
                        </div>

                        <div className="hidden md:flex flex-col items-center justify-center pl-6 border-l border-white/10 z-10 gap-2 min-w-[100px]">
                          <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500 group-hover:text-purple-400 transition-colors">
                            {module.status === 'COMPLETED' ? 'Review' : (module.status === 'IN_PROGRESS' ? 'Continue' : 'Start')}
                          </span>
                          <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-purple-500 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] flex items-center justify-center transition-all duration-300">
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
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
