import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { FiSearch } from "react-icons/fi";
import { Palette, Server, Code, Brain, BarChart3, Binary, ArrowRight } from "lucide-react";
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

function Hero() {
  return (
    <section className="w-full pt-48 pb-16 relative overflow-hidden flex flex-col items-center bg-[#050020]">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-purple-700/25 blur-[220px] rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
      </div>

      <div className="relative w-full max-w-7xl px-6 text-center">
        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-semibold leading-tight pb-2 mb-4 bg-gradient-to-r from-white via-purple-200 to-[#6635C4] text-transparent bg-clip-text">
          Learning Cohorts
        </h1>

        <p className="text-gray-400 text-base mb-10 max-w-lg mx-auto leading-relaxed">
          Structured paths designed to take you from beginner to engineering expert. Choose your track and start learning today.
        </p>

        {/* Search */}
        <div className="flex justify-center items-center gap-3 mb-16">
          <input
            placeholder="Search for a course or cohort..."
            className="w-full max-w-[480px] px-6 py-4 rounded-2xl
              bg-gradient-to-r from-[#060221] to-[#201239]
              border border-purple-500/20
              text-white placeholder:text-[#407199]
              outline-none
              shadow-[inset_0_0_20px_rgba(2,48,83,0.8)]
              focus:border-purple-500/50 transition-colors"
          />
          <button className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center
            bg-gradient-to-br from-[#1b0c3b] to-[#0b0620]
            border border-purple-500/20
            shadow-[inset_0_0_20px_rgba(2,48,83,0.8)]
            hover:border-purple-500/40 transition-colors">
            <FiSearch className="text-purple-300 text-lg" />
          </button>
        </div>
      </div>

      {/* ── Animated Swiper Carousel (same as homepage) ── */}
      <div className="relative w-full flex justify-center items-center min-h-80 sm:min-h-[500px]">
        {/* Center fixed AE logo */}
        <div className="absolute z-20 top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="relative flex h-[180px] w-[180px] items-center justify-center rounded-full bg-[#7B37D9] shadow-[0_0_56px_#9326D1] sm:h-[245px] sm:w-[245px] md:h-72 md:w-72 md:shadow-[0_0_94px_#9326D1]">
            <div className="relative flex h-[150px] w-[150px] items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_0_32px_rgba(0,19,34,0.08)] sm:h-[205px] sm:w-[205px] md:h-60 md:w-60">
              <img
                src={favicon}
                alt="AE Logo"
                className="h-[70px] w-[92px] object-contain sm:h-[92px] sm:w-[120px] md:h-[112px] md:w-[148px]"
              />
            </div>
          </div>

          <Link
            to="/signup"
            className="mt-5 sm:mt-8 flex h-[54px] w-[176px] items-center justify-center gap-2.5 rounded-[16px] bg-gradient-to-r from-[#951DC8] to-[#1C044E] px-4 text-base font-medium text-white shadow-[inset_0_0_25px_rgba(0,121,221,0.7)] transition-transform hover:scale-[1.03] sm:h-[72px] sm:w-[220px] sm:rounded-[19px] sm:text-xl"
          >
            Enroll now
            <ArrowRight className="h-4 w-4 -rotate-45" />
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
          speed={8000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          allowTouchMove={false}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 50 },
            640: { slidesPerView: 3, spaceBetween: 60 },
            1024: { slidesPerView: 5, spaceBetween: 80 },
          }}
          className="cohorts-swiper w-full pointer-events-none"
        >
          {[...cohorts, ...cohorts, ...cohorts].map((item, index) => {
            const Icon = item.icon;
            return (
              <SwiperSlide key={index} className="flex items-center justify-center">
                <div className="flex flex-col items-center opacity-50">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center mb-3">
                    <Icon className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white/70" />
                  </div>
                  <p className="text-center text-[10px] sm:text-xs md:text-sm text-white/60 max-w-[80px] sm:max-w-[100px] leading-tight">
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