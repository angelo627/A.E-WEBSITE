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
    return "bg-gradient-to-r from-amber-500/10 to-yellow-500/5 hover:from-amber-500/20 border-l-4 border-l-amber-400";
  }
  if (entry.rank === 2) {
    return "bg-gradient-to-r from-slate-300/10 to-slate-400/5 hover:from-slate-300/20 border-l-4 border-l-slate-300";
  }
  if (entry.rank === 3) {
    return "bg-gradient-to-r from-orange-600/10 to-orange-700/5 hover:from-orange-600/20 border-l-4 border-l-orange-500";
  }
  return "bg-white/5 hover:bg-white/10 transition-colors border-l-4 border-l-transparent";
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
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        className="max-w-6xl mx-auto relative z-10 pb-20 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section variants={itemVariants} className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 rounded-full mb-4 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <Trophy className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
            Global Leaderboard
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Ranked by average score, then total quiz attempts. Compete with others and secure your spot!
          </p>
        </motion.section>

        {isLoading ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
            <p className="text-purple-200">Loading leaderboard...</p>
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
              onClick={() => void loadLeaderboard()}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 transition-colors rounded-xl font-medium text-white shadow-lg shadow-rose-500/20"
            >
              Try Again
            </button>
          </motion.div>
        ) : null}

        {!isLoading && !error && entries.length === 0 ? (
          <motion.div variants={itemVariants} className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center text-gray-400">
             <Trophy className="w-12 h-12 mx-auto text-gray-600 mb-4 opacity-50" />
             <p>No leaderboard data yet. Be the first to start learning!</p>
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
                  badgeColor = "text-slate-300";
                  bgGlow = "hover:shadow-[0_0_30px_rgba(203,213,225,0.2)] border-slate-400/30";
                  icon = <Medal className="w-8 h-8 text-slate-300" />;
                } else if (entry.rank === 3) {
                  badgeColor = "text-orange-500";
                  bgGlow = "hover:shadow-[0_0_30px_rgba(249,115,22,0.2)] border-orange-500/30";
                  icon = <Award className="w-8 h-8 text-orange-500" />;
                }

                return (
                  <motion.article 
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    key={entry.userId} 
                    className={`relative bg-white/[0.03] backdrop-blur-xl border rounded-3xl p-6 md:p-8 flex flex-col items-center text-center transition-all duration-300 ${bgGlow} ${entry.rank === 1 ? 'md:-mt-8 shadow-2xl shadow-amber-500/10' : ''}`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                    
                    <div className="mb-4 relative">
                       <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                       {icon}
                    </div>
                    
                    <span className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${badgeColor}`}>
                      Rank #{entry.rank}
                    </span>
                    
                    <h2 className="text-2xl font-bold text-white mb-6 truncate w-full">{entry.username}</h2>
                    
                    <div className="text-left w-full space-y-4">
                      <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                         <div className="flex items-center text-gray-400 text-sm">
                            <Target className="w-4 h-4 mr-2" /> Avg Score
                         </div>
                         <span className={`font-bold ${badgeColor}`}>{Math.round(entry.averageScore)}%</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                         <div className="flex items-center text-gray-400 text-sm">
                            <Activity className="w-4 h-4 mr-2" /> Completed
                         </div>
                         <span className="font-bold text-white">{entry.modulesCompleted}</span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.section>

            <motion.section variants={itemVariants} className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-1 md:p-4 mt-12 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left border-collapse">
                  <thead>
                    <tr className="text-xs uppercase text-gray-400 border-b border-white/5">
                      <th className="px-6 py-4 font-medium tracking-wider">Rank</th>
                      <th className="px-6 py-4 font-medium tracking-wider">Student</th>
                      <th className="px-6 py-4 font-medium tracking-wider">Average Score</th>
                      <th className="px-6 py-4 font-medium tracking-wider">Attempts</th>
                      <th className="px-6 py-4 font-medium tracking-wider text-right">Modules</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, idx) => (
                      <motion.tr 
                        key={entry.userId} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        className={`${getRowStyle(entry)} group`}
                      >
                        <td className="px-6 py-4">
                          <span className={`font-bold rounded-lg px-3 py-1 bg-white/5 ${entry.rank <= 3 ? 'text-amber-400' : 'text-gray-300'}`}>
                            #{entry.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {entry.username}
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center">
                             <div className="w-24 h-1.5 bg-white/10 rounded-full mr-3 overflow-hidden">
                               <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                  style={{ width: `${Math.round(entry.averageScore)}%` }}
                               />
                             </div>
                             <span className="font-medium text-gray-200">{Math.round(entry.averageScore)}%</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-medium">
                          {entry.totalAttempts}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white font-medium">
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
