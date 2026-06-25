import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { Search, Palette, Server, Code, Brain, BarChart3, Binary, Rocket } from "lucide-react";

const FadeInWhenVisible = ({
  children,
  delay = 0,
  y = 30,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
    >
      {children}
    </motion.div>
  );
};

const cohorts = [
  { title: "UI/UX & Product Design", icon: Palette },
  { title: "Backend Development", icon: Server },
  { title: "Frontend Development", icon: Code },
  { title: "Machine Learning", icon: Brain },
  { title: "Computational Analysis", icon: BarChart3 },
  { title: "Algorithm Basics", icon: Binary },
];

export default function CohortsSection() {
  return (
    <section className="relative z-20 px-4 sm:px-6 pt-12 pb-6 sm:pt-16 md:pt-24 text-[var(--text-color)] font-outfit">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <FadeInWhenVisible delay={0.2}>
          <header className="text-center mb-10 sm:mb-12 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--ae-blue)]/10 border border-[var(--ae-blue)]/20 mb-6 mx-auto">
              <Rocket className="w-4 h-4 text-[var(--ae-blue)]" />
              <span className="text-[10px] font-black text-[var(--ae-blue)] uppercase tracking-[0.2em]">Live Tracks</span>
            </div>
            <h1 className="mx-auto mb-6 w-full text-center font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-[var(--text-color)] leading-[0.9] italic tracking-tighter uppercase">
              Learning <span className="text-[var(--ae-blue)]">Cohorts</span>
            </h1>
            <p className="text-[var(--text-color)]/60 text-sm sm:text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-medium italic">
              Master industry-leading skills with expert guidance and hands-on projects through our specialized learning cohorts.
            </p>
          </header>
        </FadeInWhenVisible>

        {/* Search Bar */}
        <FadeInWhenVisible delay={0.3}>
          <div className="w-full flex justify-center px-4 sm:px-0 mb-12 sm:mb-16 md:mb-24 group">
            <div className="flex w-full max-w-2xl gap-3 relative">
              <div className="flex flex-row items-center w-full py-4 sm:py-5 pr-14 pl-8 rounded-3xl ae-brand-card shadow-2xl border border-[var(--ae-border)] bg-[var(--bg-color)]/50 focus-within:border-[var(--ae-blue)] focus-within:ring-4 focus-within:ring-[var(--ae-blue)]/5 transition-all">
                <input
                  type="text"
                  placeholder="Search for a specialized course..."
                  className="flex-1 bg-transparent text-sm sm:text-base md:text-lg text-[var(--text-color)] placeholder-[var(--text-color)]/30 focus:outline-none font-bold italic"
                />
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ae-brand-button shadow-lg shadow-[var(--ae-blue)]/20 flex-shrink-0 cursor-pointer">
                <Search className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </FadeInWhenVisible>

        {/* Swiper */}
        <FadeInWhenVisible delay={0.4}>
          <div className="relative w-full flex justify-center items-center min-h-[350px] sm:min-h-[450px] md:min-h-[600px]">
            {/* Center fixed Logo */}
            <div className="absolute z-20 top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center px-3 sm:px-0">
              <div className="relative flex h-[140px] w-[140px] items-center justify-center rounded-full bg-[var(--ae-blue)] shadow-[0_0_56px_rgba(51,65,143,0.3)] sm:h-[180px] sm:w-[180px] md:h-[245px] md:w-[245px] lg:h-[290px] lg:w-[290px]">
                <div className="relative flex h-[115px] w-[115px] items-center justify-center overflow-hidden rounded-full bg-white shadow-2xl sm:h-[145px] sm:w-[145px] md:h-[205px] md:w-[205px] lg:h-[240px] lg:w-[240px] group cursor-pointer">
                  <img
                    src="/favicon.png"
                    alt="AE Logo"
                    className="h-[55px] w-[70px] object-contain sm:h-[70px] sm:w-[92px] md:h-[92px] md:w-[120px] lg:h-[115px] lg:w-[150px] group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <Link
                to="/signup"
                className="ae-brand-button mt-8 h-[60px] sm:h-[75px] w-[180px] sm:w-[240px] flex items-center justify-center gap-3 rounded-[20px] sm:rounded-[24px] text-base sm:text-lg font-black uppercase tracking-widest text-white transition-all hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 italic"
              >
                Enroll Now →
              </Link>
            </div>

            {/* Background moving slides */}
            <Swiper
              modules={[Autoplay, FreeMode]}
              spaceBetween={50}
              slidesPerView={1.5}
              centeredSlides={true}
              loop={true}
              loopAdditionalSlides={3}
              freeMode={{ enabled: true, momentum: false }}
              speed={10000}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
              }}
              breakpoints={{
                640: { slidesPerView: 2.5 },
                1024: { slidesPerView: 5 },
              }}
              className="w-full h-full opacity-30 select-none pointer-events-none"
            >
              {[...cohorts, ...cohorts].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <SwiperSlide key={idx} className="flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-[2rem] bg-[var(--ae-blue)]/5 backdrop-blur-md border border-[var(--ae-blue)]/10 flex items-center justify-center mb-6">
                        <Icon className="w-10 h-10 sm:w-12 md:w-14 text-[var(--ae-blue)]" />
                      </div>
                      <p className="text-center text-[10px] sm:text-xs md:text-sm text-[var(--text-color)]/30 font-black uppercase tracking-[0.2em] max-w-[120px] leading-tight">
                        {item.title}
                      </p>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}
