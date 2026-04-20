import { Palette, Server, Code, Brain, BarChart3, Binary } from "lucide-react";
import type { FC } from "react";
import { motion } from "framer-motion";

type Category = {
  title: string;
  courses: string;
  icon: React.ElementType;
  color: string;
  glow: string;
};

const categories: Category[] = [
  { title: "ML & AI",              courses: "11 Courses", icon: Brain,    color: "from-purple-500/20 to-purple-900/10", glow: "rgba(168,85,247,0.35)" },
  { title: "Development",          courses: "12 Courses", icon: Code,     color: "from-cyan-500/20 to-cyan-900/10",    glow: "rgba(34,211,238,0.35)"  },
  { title: "Marketing",            courses: "12 Courses", icon: BarChart3, color: "from-rose-500/20 to-rose-900/10",   glow: "rgba(244,63,94,0.35)"   },
  { title: "UI/UX & Design",       courses: "14 Courses", icon: Palette,  color: "from-amber-500/20 to-amber-900/10", glow: "rgba(245,158,11,0.35)"  },
  { title: "Backend Dev",          courses: "9 Courses",  icon: Server,   color: "from-emerald-500/20 to-emerald-900/10", glow: "rgba(16,185,129,0.35)" },
  { title: "Algorithm Basics",     courses: "7 Courses",  icon: Binary,   color: "from-indigo-500/20 to-indigo-900/10", glow: "rgba(99,102,241,0.35)" },
  { title: "Frontend Dev",         courses: "10 Courses", icon: Code,     color: "from-violet-500/20 to-violet-900/10", glow: "rgba(139,92,246,0.35)" },
  { title: "Computational Sci.",   courses: "6 Courses",  icon: BarChart3, color: "from-sky-500/20 to-sky-900/10",    glow: "rgba(14,165,233,0.35)"  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const TopCategories: FC = () => {
  return (
    <section>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-white text-2xl font-bold">Top Categories</h2>
          <p className="text-gray-500 text-sm mt-1">Browse by what interests you most</p>
        </div>
        <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium flex items-center gap-1">
          See All →
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 80, damping: 16 }}
              whileHover={{ scale: 1.04, y: -4 }}
              className={`bg-gradient-to-br ${cat.color} border border-white/10 hover:border-white/20 rounded-2xl py-8 px-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 group`}
              style={{ boxShadow: `0 0 0 rgba(0,0,0,0)` }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${cat.glow}`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 rgba(0,0,0,0)`; }}
            >
              <div
                className="w-16 h-16 flex items-center justify-center rounded-full border border-white/10 bg-white/5 group-hover:scale-110 transition-transform duration-300"
                style={{ boxShadow: `0 0 20px ${cat.glow}` }}
              >
                <Icon className="w-7 h-7 text-white/80" />
              </div>
              <div className="text-center">
                <h3 className="text-white font-semibold text-sm group-hover:text-white transition-colors">{cat.title}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{cat.courses}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default TopCategories;