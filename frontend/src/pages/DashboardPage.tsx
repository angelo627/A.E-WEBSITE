import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/useAuth";

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
    return "bg-emerald-500/20 text-emerald-300 border border-emerald-400/20";
  }
  if (status === "IN_PROGRESS") {
    return "bg-amber-500/20 text-amber-300 border border-amber-400/20";
  }
  return "bg-slate-500/20 text-slate-300 border border-slate-400/20";
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
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-purple-400">
          Welcome back, {user?.firstName || "Student"}!
        </h1>
        <p className="text-gray-300 mb-8">
          Track your module progress, continue your learning, and stay on top.
        </p>

        {isLoading ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">Loading dashboard...</div>
        ) : null}

        {!isLoading && error ? (
          <div className="bg-rose-500/10 border border-rose-400/30 rounded-2xl p-6">
            <p className="text-rose-200 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-400 rounded-lg font-medium"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !error && dashboard ? (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-5">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Total Modules</p>
                  <p className="text-2xl font-semibold">{dashboard.summary.totalModules}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Completed</p>
                  <p className="text-2xl font-semibold">{dashboard.summary.completedModules}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-xs uppercase tracking-wide text-gray-400">In Progress</p>
                  <p className="text-2xl font-semibold">{dashboard.summary.inProgressModules}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Not Started</p>
                  <p className="text-2xl font-semibold">{dashboard.summary.notStartedModules}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Progress</p>
                  <p className="text-2xl font-semibold">
                    {Math.max(0, Math.min(100, dashboard.summary.overallProgressPercent))}%
                  </p>
                </div>
              </div>

              <div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, dashboard.summary.overallProgressPercent)
                      )}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-semibold mb-4">Your Modules</h2>

              {dashboard.modules.length === 0 ? (
                <p className="text-gray-300">No modules available yet.</p>
              ) : (
                <div className="space-y-3">
                  {dashboard.modules.map((module) => (
                    <div
                      key={module.moduleId}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div>
                        <p className="text-lg font-medium">{module.title}</p>
                        <p className="text-sm text-gray-300">
                          Progress: {Math.max(0, Math.min(100, module.progressPercent))}%
                          {typeof module.estimatedMinutes === "number"
                            ? ` • ${module.estimatedMinutes} mins`
                            : ""}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full w-fit ${getStatusStyle(module.status)}`}>
                        {getStatusLabel(module.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
