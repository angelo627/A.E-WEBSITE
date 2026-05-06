import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Medal, 
  Award,
  Target,
  Activity,
  Loader2,
  AlertCircle
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  averageScore: number;
  totalAttempts: number;
  modulesCompleted: number;
  isTopThree: boolean;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isLeaderboardEntry = (value: unknown): value is LeaderboardEntry => {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.rank === "number" &&
    typeof value.userId === "string" &&
    typeof value.username === "string" &&
    typeof value.averageScore === "number" &&
    typeof value.totalAttempts === "number" &&
    typeof value.modulesCompleted === "number" &&
    typeof value.isTopThree === "boolean"
  );
};

const isLeaderboardResponse = (value: unknown): value is LeaderboardEntry[] =>
  Array.isArray(value) && value.every((entry) => isLeaderboardEntry(entry));

const getRowStyle = (entry: LeaderboardEntry): string => {
  if (entry.rank === 1) {
    return "leaderboard-row leaderboard-row-first border-l-4 border-l-amber-400";
  }
  if (entry.rank === 2) {
    return "leaderboard-row leaderboard-row-second border-l-4 border-l-slate-300";
  }
  if (entry.rank === 3) {
    return "leaderboard-row leaderboard-row-third border-l-4 border-l-orange-500";
  }
  return "leaderboard-row border-l-4 border-l-transparent";
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

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch("/leaderboard?limit=50");
      if (!isLeaderboardResponse(response)) {
        throw new Error("Unexpected leaderboard response shape.");
      }
      setEntries(response);
    } catch (fetchError: unknown) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Failed to load leaderboard.";
      setError(message);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  const topThree = useMemo(() => entries.filter((entry) => entry.rank <= 3), [entries]);

  return (
    <div className="pt-24 px-6 min-h-screen bg-[var(--bg-color)] overflow-hidden relative">

      <motion.div 
        className="max-w-6xl mx-auto relative z-10 pb-20 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section variants={itemVariants} className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-purple-100 rounded-full mb-4 shadow-sm">
            <Trophy className="w-10 h-10 text-[var(--ae-blue)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 text-[var(--text-color)]">
            Global Leaderboard
          </h1>
          <p className="text-[var(--text-color)]/70 font-medium text-lg max-w-2xl mx-auto">
            Ranked by average score, then total quiz attempts. Compete with others and secure your spot!
          </p>
        </motion.section>

        {isLoading ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-12 ae-brand-card border border-[var(--ae-border)] rounded-3xl shadow-sm">
            <Loader2 className="w-10 h-10 text-[var(--ae-blue)] animate-spin mb-4" />
            <p className="app-muted-text font-medium">Loading leaderboard...</p>
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
              onClick={() => void loadLeaderboard()}
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 transition-colors rounded-xl font-bold text-white shadow-md shadow-red-500/20"
            >
              Try Again
            </button>
          </motion.div>
        ) : null}

        {!isLoading && !error && entries.length === 0 ? (
          <motion.div variants={itemVariants} className="ae-brand-card border border-[var(--ae-border)] shadow-sm rounded-3xl p-12 text-center app-muted-text">
             <Trophy className="w-12 h-12 mx-auto app-subtle-text mb-4" />
             <p className="font-medium">No leaderboard data yet. Be the first to start learning!</p>
          </motion.div>
        ) : null}

        {!isLoading && !error && entries.length > 0 ? (
          <>
            <motion.section variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 px-4 sm:px-0 mt-8">
              {topThree.map((entry) => {
                let badgeColor = "text-amber-400";
                let bgGlow = "hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] border-amber-500/30";
                let icon = <Trophy className="w-8 h-8 text-amber-400" />;
                
                if (entry.rank === 2) {
                  badgeColor = "text-slate-400";
                  bgGlow = "hover:border-slate-300/50 border-[var(--ae-border)]";
                  icon = <Medal className="w-8 h-8 text-slate-400" />;
                } else if (entry.rank === 3) {
                  badgeColor = "text-orange-500";
                  bgGlow = "hover:border-orange-500/30 border-orange-200";
                  icon = <Award className="w-8 h-8 text-orange-500" />;
                }

                return (
                  <motion.article 
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    key={entry.userId} 
                    className={`relative ae-brand-card shadow-sm border rounded-3xl p-6 md:p-8 flex flex-col items-center text-center transition-all duration-300 ${bgGlow} ${entry.rank === 1 ? 'md:-mt-8 border-amber-200 hover:border-amber-400/30 shadow-md shadow-amber-500/5' : ''}`}
                  >
                    
                    <div className="mb-4">
                       {icon}
                    </div>
                    
                    <span className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${badgeColor}`}>
                      Rank #{entry.rank}
                    </span>
                    
                    <h2 className="text-2xl font-black text-[var(--text-color)] mb-6 truncate w-full">{entry.username}</h2>
                    
                    <div className="text-left w-full space-y-4">
                      <div className="flex justify-between items-center app-soft-surface border rounded-xl p-3">
                         <div className="flex items-center app-muted-text font-bold text-xs uppercase tracking-wider">
                            <Target className="w-4 h-4 mr-2" /> Avg Score
                         </div>
                         <span className={`font-black ${badgeColor}`}>{Math.round(entry.averageScore)}%</span>
                      </div>
                      <div className="flex justify-between items-center app-soft-surface border rounded-xl p-3">
                         <div className="flex items-center app-muted-text font-bold text-xs uppercase tracking-wider">
                            <Activity className="w-4 h-4 mr-2" /> Completed
                         </div>
                         <span className="font-black text-[var(--text-color)]">{entry.modulesCompleted}</span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.section>

            <motion.section variants={itemVariants} className="ae-brand-card border border-[var(--ae-border)] rounded-3xl p-1 md:p-4 mt-12 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left border-collapse">
                  <thead>
                    <tr className="text-xs uppercase font-bold app-subtle-text border-b border-[var(--ae-border)]">
                      <th className="px-6 py-4 tracking-wider">Rank</th>
                      <th className="px-6 py-4 tracking-wider">Student</th>
                      <th className="px-6 py-4 tracking-wider">Average Score</th>
                      <th className="px-6 py-4 tracking-wider">Attempts</th>
                      <th className="px-6 py-4 tracking-wider text-right">Modules</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, idx) => (
                      <motion.tr 
                        key={entry.userId} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        className={`${getRowStyle(entry)} group border-b border-[var(--ae-border)] last:border-b-0`}
                      >
                        <td className="px-6 py-4">
                          <span className={`font-black rounded-lg px-3 py-1 bg-[var(--card-bg)] border border-[var(--ae-border)] shadow-sm ${entry.rank <= 3 ? 'text-amber-500' : 'app-subtle-text'}`}>
                            #{entry.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black leaderboard-row-text group-hover:text-[var(--ae-periwinkle)] transition-colors">
                          {entry.username}
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center">
                             <div className="w-24 h-2 app-soft-surface rounded-full mr-3 overflow-hidden border">
                               <div 
                                  className="h-full bg-[var(--ae-blue)] rounded-full"
                                  style={{ width: `${Math.round(entry.averageScore)}%` }}
                               />
                             </div>
                             <span className="font-bold leaderboard-row-text">{Math.round(entry.averageScore)}%</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 leaderboard-row-muted font-bold">
                          {entry.totalAttempts}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full app-soft-surface leaderboard-row-muted font-black border">
                             {entry.modulesCompleted}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>
          </>
        ) : null}
      </motion.div>
    </div>
  );
}
