import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

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
    return "bg-amber-500/15 border border-amber-300/30";
  }
  if (entry.rank === 2) {
    return "bg-slate-400/15 border border-slate-300/30";
  }
  if (entry.rank === 3) {
    return "bg-orange-700/15 border border-orange-500/30";
  }
  return "bg-white/5 border border-white/10";
};

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
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-purple-300 mb-2">Leaderboard</h1>
          <p className="text-gray-300">
            Ranked by average score, then total quiz attempts.
          </p>
        </section>

        {isLoading ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            Loading leaderboard...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="bg-rose-500/10 border border-rose-400/30 rounded-2xl p-6">
            <p className="text-rose-200 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => void loadLeaderboard()}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-400 rounded-lg font-medium"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !error && entries.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-gray-300">
            No leaderboard data yet.
          </div>
        ) : null}

        {!isLoading && !error && entries.length > 0 ? (
          <>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topThree.map((entry) => (
                <article key={entry.userId} className={`rounded-xl p-4 ${getRowStyle(entry)}`}>
                  <p className="text-sm text-gray-300">Rank #{entry.rank}</p>
                  <p className="text-xl font-semibold">{entry.username}</p>
                  <p className="text-sm text-gray-200">Avg Score: {entry.averageScore}%</p>
                  <p className="text-sm text-gray-200">
                    Modules Completed: {entry.modulesCompleted}
                  </p>
                </article>
              ))}
            </section>

            <section className="bg-white/5 border border-white/10 rounded-2xl p-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="text-xs uppercase text-gray-400">
                    <th className="px-3 py-3">Rank</th>
                    <th className="px-3 py-3">User</th>
                    <th className="px-3 py-3">Average Score</th>
                    <th className="px-3 py-3">Attempts</th>
                    <th className="px-3 py-3">Modules Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.userId} className={getRowStyle(entry)}>
                      <td className="px-3 py-3 font-semibold">#{entry.rank}</td>
                      <td className="px-3 py-3">{entry.username}</td>
                      <td className="px-3 py-3">{entry.averageScore}%</td>
                      <td className="px-3 py-3">{entry.totalAttempts}</td>
                      <td className="px-3 py-3">{entry.modulesCompleted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
