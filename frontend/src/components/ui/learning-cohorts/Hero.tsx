import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { FiSearch } from "react-icons/fi";
import { Palette, Server, Code, Brain, BarChart3, Binary, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import favicon from "../learning-cohorts/images/favicon.png";

const cohorts = [
  { title: "UI/UX & Product Design", icon: Palette },
  { title: "Backend Development", icon: Server },
  { title: "Frontend Development", icon: Code },
  { title: "Machine Learning", icon: Brain },
  { title: "Computational Analysis", icon: BarChart3 },
  { title: "Algorithm Basics", icon: Binary },
];

const bgPath = "/background.jpg";

function Hero() {
  return (
    <section className="w-full pt-48 pb-16 relative overflow-hidden flex flex-col items-center font-outfit min-h-screen">
      {/* ── Rich Background (Same as About Page) ── */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('${bgPath}')`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-[var(--bg-color)]/90 pointer-events-none" />
      </div>

      {/* ── Brand Glows ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[var(--ae-blue)]/20 blur-[220px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-[var(--bg-color)] to-transparent" />
      </div>

      <div className="relative w-full max-w-5xl px-6 text-center z-10">
        {/* Title Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--ae-blue)]/10 border border-[var(--ae-blue)]/20 mb-8 animate-fade-in">
          <Rocket className="w-4 h-4 text-[var(--ae-blue)]" />
          <span className="text-[10px] font-black text-[var(--ae-blue)] uppercase tracking-[0.2em]">Next-Gen Learning</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black leading-[0.95] mb-8 text-[var(--text-color)] italic tracking-tighter uppercase">
          Learning <span className="text-[var(--ae-blue)]">Cohorts</span>
        </h1>

        <p className="text-[var(--text-color)]/60 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-medium italic">
          Structured paths designed to take you from beginner to engineering expert. Choose your track and start building the future.
        </p>

        {/* Search */}
        <div className="flex justify-center items-center gap-3 mb-24 max-w-2xl mx-auto w-full group">
          <div className="relative flex-1">
             <input
              placeholder="Query our database for a cohort..."
              className="w-full px-8 py-5 rounded-3xl
                ae-brand-card
                bg-[var(--bg-color)]/50
                border border-[var(--ae-border)]
                text-[var(--text-color)] placeholder:text-[var(--text-color)]/30
                outline-none
                shadow-2xl
                focus:border-[var(--ae-blue)] focus:ring-4 focus:ring-[var(--ae-blue)]/5 transition-all
                font-bold italic"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-[var(--ae-blue)] shadow-lg shadow-[var(--ae-blue)]/20 flex items-center justify-center text-white">
               <FiSearch className="text-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Animated Swiper Carousel ── */}
      <div className="relative w-full flex justify-center items-center min-h-[300px] sm:min-h-[500px] z-10">
        {/* Center fixed AE logo */}
        <div className="absolute z-20 top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="relative flex h-[180px] w-[180px] items-center justify-center rounded-full bg-[var(--ae-blue)] shadow-[0_0_56px_rgba(51,65,143,0.3)] sm:h-[245px] sm:w-[245px] md:h-72 md:w-72">
            <div className="relative flex h-[150px] w-[150px] items-center justify-center overflow-hidden rounded-full bg-white shadow-2xl sm:h-[205px] sm:w-[205px] md:h-60 md:w-60 group cursor-pointer">
              <img
                src={favicon}
                alt="AE Logo"
                className="h-[70px] w-[92px] object-contain sm:h-[92px] sm:w-[120px] md:h-[112px] md:w-[148px] group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>

          <Link
            to="/signup"
            className="ae-brand-button mt-8 flex h-[60px] w-[180px] items-center justify-center gap-2.5 rounded-[20px] px-6 text-base font-black uppercase tracking-widest transition-all hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 sm:h-[80px] sm:w-[260px] sm:rounded-[24px] sm:text-lg italic"
          >
            Enroll Now →
          </Link>
        </div>

        {/* Spinning cohort Swiper */}
        <Swiper
          modules={[Autoplay, FreeMode]}
          spaceBetween={40}
          slidesPerView={1.5}
          centeredSlides={true}
          loop={true}
          loopAdditionalSlides={3}
          freeMode={{ enabled: true, momentum: false }}
          speed={10000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          allowTouchMove={false}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 50 },
            640: { slidesPerView: 3, spaceBetween: 60 },
            1024: { slidesPerView: 5, spaceBetween: 100 },
          }}
          className="cohorts-swiper w-full pointer-events-none opacity-40 select-none"
        >
          {[...cohorts, ...cohorts, ...cohorts].map((item, index) => {
            const Icon = item.icon;
            return (
              <SwiperSlide key={index} className="flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-[2rem] bg-[var(--ae-blue)]/5 backdrop-blur-md border border-[var(--ae-blue)]/10 flex items-center justify-center mb-6">
                    <Icon className="w-10 h-10 sm:w-12 md:w-14 text-[var(--ae-blue)]" />
                  </div>
                  <p className="text-center text-[10px] sm:text-xs md:text-sm text-[var(--text-color)]/40 font-black uppercase tracking-[0.2em] max-w-[120px] leading-tight">
                    {item.title}
                  </p>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}

export default Hero;