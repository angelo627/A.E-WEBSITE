import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { motion } from "framer-motion";
import { 
  Users, 
  BookOpen, 
  FileText, 
  ShoppingBag, 
  MessageSquare, 
  ShieldCheck, 
  ChevronRight,
  Loader2,
  AlertCircle,
  LayoutDashboard
} from "lucide-react";

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

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
} as const;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
} as const;

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

  const cards = useMemo(() => {
    if (!summary) return [];
    return [
      { 
        label: "Total Users", 
        value: summary.users, 
        sub: `${summary.activeUsers} active accounts`,
        icon: Users,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "group-hover:border-blue-500/30"
      },
      {
        label: "Modules",
        value: summary.modules,
        sub: `${summary.publishedModules} published`,
        icon: BookOpen,
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
        border: "group-hover:border-indigo-500/30"
      },
      { 
        label: "Assessments", 
        value: summary.quizzes, 
        sub: "Total quizzes created",
        icon: FileText,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "group-hover:border-purple-500/30"
      },
      { 
        label: "Products", 
        value: summary.products, 
        sub: "Digital catalog entries",
        icon: ShoppingBag,
        color: "text-fuchsia-400",
        bg: "bg-fuchsia-500/10",
        border: "group-hover:border-fuchsia-500/30"
      },
      {
        label: "Testimonials",
        value: summary.testimonials,
        sub: `${summary.pendingTestimonials} pending review`,
        icon: MessageSquare,
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "group-hover:border-rose-500/30"
      },
      { 
        label: "Team Members", 
        value: summary.teamMembers, 
        sub: "Public profiles active",
        icon: ShieldCheck,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "group-hover:border-emerald-500/30"
      }
    ];
  }, [summary]);

  const quickActions = [
    { label: "Manage Modules", path: "/admin/modules", icon: BookOpen },
    { label: "Manage Quizzes", path: "/admin/quizzes", icon: FileText },
    { label: "Manage Products", path: "/admin/products", icon: ShoppingBag },
    { label: "Manage Testimonials", path: "/admin/testimonials", icon: MessageSquare },
    { label: "Manage Team", path: "/admin/team", icon: ShieldCheck },
    { label: "View Users", path: "/admin/users", icon: Users },
  ];

  return (
    <div className="pt-24 px-6 min-h-screen bg-[#050020] text-white overflow-hidden relative">
      {/* Background decorations for Admin Theme */}
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
            <LayoutDashboard className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Command Center
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-2">
              System overview and quick access to management tools.
            </p>
          </div>
        </motion.section>

        {isLoading ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-blue-200">Loading system overview...</p>
          </motion.div>
        ) : null}

        {!isLoading && error ? (
          <motion.div variants={itemVariants} className="bg-rose-500/10 backdrop-blur-md border border-rose-500/20 rounded-3xl p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-rose-200 mb-1">Failed to connect</h3>
                <p className="text-rose-300/70">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void loadSummary()}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 transition-colors rounded-xl font-medium text-white shadow-lg shadow-rose-500/20"
            >
              Retry
            </button>
          </motion.div>
        ) : null}

        {!isLoading && !error && summary ? (
          <>
            <motion.section variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <motion.article
                    key={card.label}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-xl transition-all duration-300 group ${card.border}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl transition-colors ${card.bg}`}>
                        <Icon className={`w-6 h-6 ${card.color}`} />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-400 mb-1 tracking-wide uppercase">{card.label}</p>
                    <p className="text-4xl font-bold text-white mb-2">{card.value}</p>
                    <p className="text-sm text-gray-500">{card.sub}</p>
                  </motion.article>
                );
              })}
            </motion.section>

            <motion.section variants={itemVariants} className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-8 mt-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link 
                      key={action.path}
                      to={action.path} 
                      className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 p-5 transition-all duration-300 hover:bg-white/10 flex items-center justify-between"
                    >
                      {/* Hover Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="p-2.5 bg-white/5 rounded-lg group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                           <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                          {action.label}
                        </span>
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors group-hover:translate-x-1 duration-300 relative z-10" />
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          </>
        ) : null}
      </motion.div>
    </div>
  );
}
