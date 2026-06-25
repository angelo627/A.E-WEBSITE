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
  LayoutDashboard,
  Megaphone
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
  announcements: number;
  communityPosts: number;
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
      const [usersRes, modulesRes, quizzesRes, productsRes, testimonialsRes, teamRes, announcementsRes, communityRes] =
        await Promise.all([
          apiFetch("/admin/users"),
          apiFetch("/admin/modules"),
          apiFetch("/admin/quizzes"),
          apiFetch("/admin/products"),
          apiFetch("/admin/testimonials"),
          apiFetch("/admin/team"),
          apiFetch("/announcements"),
          apiFetch("/community")
        ]);

      const users = asArray(usersRes);
      const modules = asArray(modulesRes);
      const quizzes = asArray(quizzesRes);
      const products = asArray(productsRes);
      const testimonials = asArray(testimonialsRes);
      const teamMembers = asArray(teamRes);
      const announcements = asArray(announcementsRes?.announcements);
      const communityPosts = asArray(communityRes?.posts);

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
        publishedModules,
        announcements: announcements.length,
        communityPosts: communityPosts.length
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
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "group-hover:border-blue-500/30"
      },
      {
        label: "Modules",
        value: summary.modules,
        sub: `${summary.publishedModules} published`,
        icon: BookOpen,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
        border: "group-hover:border-indigo-500/30"
      },
      { 
        label: "Assessments", 
        value: summary.quizzes, 
        sub: "Total quizzes created",
        icon: FileText,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "group-hover:border-purple-500/30"
      },
      { 
        label: "Products", 
        value: summary.products, 
        sub: "Digital catalog entries",
        icon: ShoppingBag,
        color: "text-fuchsia-500",
        bg: "bg-fuchsia-500/10",
        border: "group-hover:border-fuchsia-500/30"
      },
      {
        label: "Testimonials",
        value: summary.testimonials,
        sub: `${summary.pendingTestimonials} pending review`,
        icon: MessageSquare,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        border: "group-hover:border-rose-500/30"
      },
      { 
        label: "Team Members", 
        value: summary.teamMembers, 
        sub: "Public profiles active",
        icon: ShieldCheck,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "group-hover:border-emerald-500/30"
      },
      { 
        label: "Announcements", 
        value: summary.announcements || 0, 
        sub: "Site-wide active banners",
        icon: Megaphone,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "group-hover:border-amber-500/30"
      },
      { 
        label: "Community Posts", 
        value: summary.communityPosts || 0, 
        sub: "Member discussions",
        icon: MessageSquare,
        color: "text-cyan-500",
        bg: "bg-cyan-500/10",
        border: "group-hover:border-cyan-500/30"
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
    { label: "Manage Announcements", path: "/admin/announcements", icon: Megaphone },
    { label: "Manage Community (Pin/Like)", path: "/community", icon: MessageSquare },
  ];

  return (
    <div className="pt-40 px-6 md:pt-48 md:px-10 min-h-screen ae-brand-page text-[var(--text-color)] pb-20 overflow-hidden relative font-outfit">
      {/* Background decorations for Admin Theme */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        className="max-w-7xl mx-auto relative z-10 pb-20 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section variants={itemVariants} className="flex items-center gap-5 mb-8">
          <div className="p-4 ae-brand-card rounded-2xl shadow-sm border border-[var(--ae-border)]">
            <LayoutDashboard className="w-8 h-8 text-[var(--ae-blue)]" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-[var(--text-color)] italic tracking-tight">
              Command Center
            </h1>
            <p className="text-[var(--text-color)]/60 font-medium text-sm md:text-lg mt-2 font-light">
              System overview and quick access to management tools.
            </p>
          </div>
        </motion.section>

        {isLoading ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-24 ae-brand-card border border-[var(--ae-border)] rounded-[2rem] shadow-sm">
            <Loader2 className="w-12 h-12 text-[var(--ae-blue)] animate-spin mb-6" />
            <p className="text-[var(--text-color)]/60 font-bold text-lg animate-pulse">Loading system overview...</p>
          </motion.div>
        ) : null}

        {!isLoading && error ? (
          <motion.div variants={itemVariants} className="bg-rose-500/10 border border-rose-500/20 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-[var(--text-color)] mb-2 italic">Failed to connect</h3>
                <p className="text-[var(--text-color)]/60 font-medium text-lg">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void loadSummary()}
              className="px-10 py-4 bg-rose-500 hover:bg-rose-600 transition-all rounded-xl font-bold text-white shadow-xl hover:scale-105 active:scale-95"
            >
              Retry
            </button>
          </motion.div>
        ) : null}

        {!isLoading && !error && summary ? (
          <>
            <motion.section variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <motion.article
                    key={card.label}
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="ae-brand-card border border-[var(--ae-border)] rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--ae-blue)]/5 rounded-bl-[4rem] -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                    
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 rounded-2xl transition-all duration-300 ${card.bg} group-hover:scale-110`}>
                        <Icon className={`w-7 h-7 ${card.color}`} />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-[var(--text-color)]/40 mb-2 tracking-widest uppercase">{card.label}</p>
                    <p className="text-5xl font-black text-[var(--text-color)] mb-3 italic">{card.value}</p>
                    <p className="text-sm font-bold text-[var(--text-color)]/60 font-light">{card.sub}</p>
                  </motion.article>
                );
              })}
            </motion.section>

            <motion.section variants={itemVariants} className="ae-brand-card border border-[var(--ae-border)] rounded-[2.5rem] p-8 md:p-12 mt-12 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--ae-blue)]/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
               
              <h2 className="text-3xl font-black text-[var(--text-color)] mb-10 italic tracking-tight underline decoration-[var(--ae-blue)]/30 decoration-8 underline-offset-8">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link 
                      key={action.path}
                      to={action.path} 
                      className="group relative overflow-hidden rounded-2xl bg-[var(--bg-color)]/50 border border-[var(--ae-border)] hover:border-[var(--ae-blue)]/50 p-6 transition-all duration-500 hover:bg-[var(--ae-blue)]/5 flex items-center justify-between shadow-sm hover:shadow-lg"
                    >
                      <div className="flex items-center gap-5 relative z-10">
                        <div className="p-3 ae-brand-card border border-[var(--ae-border)] rounded-xl group-hover:bg-[var(--ae-blue)] group-hover:border-[var(--ae-blue)] transition-all duration-300">
                           <Icon className="w-6 h-6 text-[var(--text-color)]/60 group-hover:text-white transition-colors" />
                        </div>
                        <span className="font-bold text-lg text-[var(--text-color)]/80 group-hover:text-[var(--text-color)] transition-colors">
                          {action.label}
                        </span>
                      </div>
                      
                      <ChevronRight className="w-6 h-6 text-[var(--text-color)]/30 group-hover:text-[var(--ae-blue)] transition-all duration-300 group-hover:translate-x-2 relative z-10" />
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
