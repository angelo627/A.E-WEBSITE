import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";

interface AdminSummary {
  users: number;
  modules: number;
  quizzes: number;
  products: number;
  testimonials: number;
  teamMembers: number;
  pendingTestimonials: number;
  activeUsers: number;
  publishedModules: number;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Failed to load admin overview.";
};

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

export default function AdminDashboard() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [usersRes, modulesRes, quizzesRes, productsRes, testimonialsRes, teamRes] =
        await Promise.all([
          apiFetch("/admin/users"),
          apiFetch("/admin/modules"),
          apiFetch("/admin/quizzes"),
          apiFetch("/admin/products"),
          apiFetch("/admin/testimonials"),
          apiFetch("/admin/team")
        ]);

      const users = asArray(usersRes);
      const modules = asArray(modulesRes);
      const quizzes = asArray(quizzesRes);
      const products = asArray(productsRes);
      const testimonials = asArray(testimonialsRes);
      const teamMembers = asArray(teamRes);

      const activeUsers = users.filter(
        (item) => isObject(item) && item.status === "ACTIVE"
      ).length;

      const pendingTestimonials = testimonials.filter(
        (item) => isObject(item) && item.status === "PENDING"
      ).length;

      const publishedModules = modules.filter(
        (item) => isObject(item) && item.isPublished === true
      ).length;

      setSummary({
        users: users.length,
        modules: modules.length,
        quizzes: quizzes.length,
        products: products.length,
        testimonials: testimonials.length,
        teamMembers: teamMembers.length,
        pendingTestimonials,
        activeUsers,
        publishedModules
      });
    } catch (fetchError: unknown) {
      setError(getErrorMessage(fetchError));
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const cards = useMemo(
    () =>
      summary
        ? [
            { label: "Users", value: summary.users, sub: `${summary.activeUsers} active` },
            {
              label: "Modules",
              value: summary.modules,
              sub: `${summary.publishedModules} published`
            },
            { label: "Quizzes", value: summary.quizzes, sub: "Assessment records" },
            { label: "Products", value: summary.products, sub: "Catalog entries" },
            {
              label: "Testimonials",
              value: summary.testimonials,
              sub: `${summary.pendingTestimonials} pending`
            },
            { label: "Team Members", value: summary.teamMembers, sub: "Public profile entries" }
          ]
        : [],
    [summary]
  );

  return (
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-purple-300 mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Platform overview and quick access to management tools.</p>
        </section>

        {isLoading ? (
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            Loading admin overview...
          </section>
        ) : null}

        {!isLoading && error ? (
          <section className="bg-rose-500/10 border border-rose-400/30 rounded-2xl p-6">
            <p className="text-rose-200 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => void loadSummary()}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-400 rounded-lg font-medium"
            >
              Retry
            </button>
          </section>
        ) : null}

        {!isLoading && !error && summary ? (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => (
                <article
                  key={card.label}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <p className="text-xs uppercase text-gray-400">{card.label}</p>
                  <p className="text-3xl font-semibold mt-1">{card.value}</p>
                  <p className="text-sm text-gray-300 mt-1">{card.sub}</p>
                </article>
              ))}
            </section>

            <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Link to="/admin/modules" className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-3">
                  Manage Modules
                </Link>
                <Link to="/admin/quizzes" className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-3">
                  Manage Quizzes
                </Link>
                <Link to="/admin/products" className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-3">
                  Manage Products
                </Link>
                <Link to="/admin/testimonials" className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-3">
                  Manage Testimonials
                </Link>
                <Link to="/admin/team" className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-3">
                  Manage Team
                </Link>
                <Link to="/admin/users" className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-3">
                  View Users
                </Link>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
