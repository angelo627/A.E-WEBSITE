// src/pages/HomePage.tsx
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import WhoWeAreSection from "../components/ui/WhoWeAre";
import { Mouse } from "lucide-react";
import { ArrowDown } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Award, TrendingUp, Users } from "lucide-react";
import CohortsSection from "../components/ui/CohortsSection";
import TestimonialSwiper from "../components/ui/TestimonialSwiper";
import CommunitySection from "../components/ui/CommunitySection";
import InternshipModal from "../components/ui/InternshipModal";

const bgPath = "/background.jpg";

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

const Card = ({
  title,
  subtitle,
  cta,
  icon,
  iconAccent = "blue",
  comment,
  commentLink,
}: {
  title: string;
  subtitle?: string;
  cta?: string;
  icon: React.ReactNode;
  iconAccent?: "blue" | "peach" | "lavender";
  comment?: string;
  commentLink?: string;
}) => (
  <div
    className="
      w-full min-h-80 md:h-82
      ae-brand-card backdrop-blur-md
      rounded-xl p-6 sm:p-8 md:p-10
      relative
      flex flex-col justify-between items-start
      shadow-xl
    "
  >
    <div className="w-full sm:w-[95%] ">
      <div
        className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border shadow-lg ${
          iconAccent === "peach"
            ? "border-[var(--ae-peach)]/25 bg-[var(--ae-peach)]/12 text-[var(--ae-peach)]"
            : iconAccent === "lavender"
              ? "border-[var(--ae-lavender)]/25 bg-[var(--ae-lavender)]/12 text-[var(--ae-lavender)]"
              : "border-[var(--ae-blue)]/25 bg-[var(--ae-blue)]/12 text-[var(--ae-periwinkle)]"
        }`}
      >
        {icon}
      </div>

      <h3 className="text-[var(--text-color)] text-lg sm:text-xl font-semibold mb-2 text-start">{title}</h3>
      {subtitle && (
        <p className="text-[var(--text-color)]/78 text-lg sm:text-xl leading-relaxed text-start">
          {subtitle}
        </p>
      )}
    </div>

    {(cta || (comment && commentLink)) && (
      <div className="mt-6 w-full">
        {cta && (
          <button
            className="w-full py-2 rounded-md flex items-center justify-center ae-brand-button font-semibold"
          >
            {cta}
          </button>
        )}
        {comment && commentLink && (
          <p className="text-[var(--text-color)]/60 text-start text-sm leading-relaxed">
            <a href="" className="text-[var(--ae-blue)] font-semibold text-md mr-2">
              {commentLink}
            </a>
            {comment}
          </p>
        )}
      </div>
    )}
  </div>
);

const HomePage = () => {
  const sponsors = [
    { name: "Company 1", logo: "/unsplash-logo.png" },
    { name: "Company 2", logo: "/Notion-logo.png" },
    { name: "Company 3", logo: "/Intercom-logo.png" },
    { name: "Company 4", logo: "/descript-logo.png" },
    { name: "Company 5", logo: "/Grammarly-logo.png" },
    { name: "Company 6", logo: "/Intercom-logo.png" },
  ];

  return (
    <>
    <div className="relative overflow-hidden ae-brand-page">
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: `url('${bgPath}')`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    >
      {/* Enhanced overlay for better blending */}
    
      {/* Additional soft overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--nav-bg)] via-[var(--bg-color)]/70 to-[var(--bg-color)] pointer-events-none" />

      {/* centered hero */}
      <header className="relative z-20 flex items-center justify-center min-h-screen pt-80 lg:pt-70 lg:pb-12 h-screen">
        <div className="max-w-3xl text-center px-4 sm:px-6">
          <FadeInWhenVisible>
            <p className="text-[var(--ae-blue)] font-bold tracking-widest text-xs sm:text-sm md:text-base mb-3 md:mb-4">
              Welcome to AE.
            </p>

            <h1 className="text-[var(--text-color)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight drop-shadow-sm">
              Gear Up For The
              <br />
              <span className="text-[var(--ae-peach)]">Future.</span>
            </h1>

            {/* circular indicator + down arrow */}
            <div className="flex flex-col items-center gap-3 mt-8">
              <div className="w-10 h-10 rounded-full border border-[var(--ae-peach)]/40 bg-[var(--ae-peach)]/10 flex items-center justify-center text-[var(--ae-peach)]">
                <Mouse size={25} strokeWidth={1.5} />
              </div>
              <ArrowDown size={38} className="text-[var(--ae-peach)] animate-bounce" />
            </div>
          </FadeInWhenVisible>
        </div>
      </header>

      {/* cards row */}
      <section className="relative z-20 -mt-12 sm:-mt-16 md:-mt-20 px-4 sm:px-6 pb-16 sm:pb-20 md:pb-24">
        <div className="max-w-7xl mx-auto">
          {/* changed from flex to grid for equal widths */}
          <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <FadeInWhenVisible delay={0.1}>
              <Card
                title="Do it the Algorithmic Explorers Way"
                subtitle="Join a community of forward-thinking explorers."
                commentLink="AE retreat on"
                comment="31st December, 2025"
                icon={<Award size={28} strokeWidth={2.1} />}
                iconAccent="blue"
              />
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.25}>
              <Card
                title="Prioritizing Growth"
                subtitle="With 120k+ active user's"
                cta="Sign Up as Volunteer"
                icon={<TrendingUp size={28} strokeWidth={2.1} />}
                iconAccent="peach"
              />
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.4}>
              <Card
                title="Collaboration & Development"
                subtitle="Collaborate on cutting-edge AI projects."
                commentLink="AE retreat on"
                comment="31st December, 2025"
                icon={<Users size={28} strokeWidth={2.1} />}
                iconAccent="lavender"
              />
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

</div>

      {/* Trust Section */}
      <FadeInWhenVisible delay={0.3} y={20}>
        <section className="relative z-20 pb-3 sm:pb-4 px-4 sm:px-6">
          {" "}
          {/* removed top padding, minimal bottom */}
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-lg sm:text-4xl md:text-5xl text-[var(--ae-plum-deep)] font-semibold">
              Trusted by 25,000+ Teams Worldwide
            </h1>
          </div>
        </section>
      </FadeInWhenVisible>
      {/* Sponsors Section – Swiper marquee with blurred fade edges */}
      <FadeInWhenVisible delay={0.5} y={20}>
        <section className="relative z-20 pt-2 pb-8 sm:pb-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto w-full overflow-hidden rounded-2xl bg-[var(--ae-plum-deep)] shadow-lg">
            <div className="relative py-4">
              <Swiper
                className="marquee-swiper pointer-events-none"
                modules={[Autoplay, FreeMode]}
                slidesPerView={2.5}
                spaceBetween={24}
                loop
                loopAdditionalSlides={sponsors.length}
                freeMode={{ enabled: true }}
                allowTouchMove={false}
                speed={8000}
                autoplay={{
                  delay: 0,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: false,
                }}
                breakpoints={{
                  640: { slidesPerView: 3.5 },
                  768: { slidesPerView: 4.5 },
                  1024: { slidesPerView: 5.5 },
                }}
              >
                {[...sponsors, ...sponsors].map((s, i) => (
                  <SwiperSlide key={i}>
                    <div className="flex items-center justify-center h-22 rounded-xl p-6">
                      <img
                        src={s.logo}
                        alt={s.name}
                        className="max-h-16 object-contain"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Dark faded edges for smooth entry/exit of white logos */}
              <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[var(--ae-plum-deep)] to-transparent z-20 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[var(--ae-plum-deep)] to-transparent z-20 pointer-events-none" />
            </div>
          </div>
        </section>
      </FadeInWhenVisible>
      
              
      <WhoWeAreSection />
        
      {/* GURU CIRCLE */}
      
      <FadeInWhenVisible delay={0.2} y={30}>
        <section className="relative z-20 min-h-80 overflow-visible px-4 py-12 sm:px-6 sm:py-16 md:py-10">
          {/* decorative purple radial glow in center (enhances the blob) */}
          <div
            className="pointer-events-none absolute -bottom-30 left-15 z-0 h-131.25 w-131.25 rounded-full bg-[var(--ae-lavender)]/20 blur-[125px]"
          />

          <div
            className="pointer-events-none absolute -top-55 -right-28 z-0 h-131.25 w-131.25 rounded-full bg-[var(--ae-lavender)]/20 blur-[125px]"
          />

          <div className="relative z-10 mx-auto max-w-7xl">
            <h2 className="text-4xl md:text-6xl text-start text-[var(--text-color)] font-semibold sm:text-3xl mb-6 sm:mb-8 md:mb-10">
              The Guru Circle
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 md:flex-row gap-6 md:gap-0 py-2">
              <div className="w-full md:w-149 h-full  md:h-144 p-4 sm:p-6 transition-all duration-700 hover:scale-105 rounded-3xl bg-black/5">
                <img
                  src="/guru-preview.png"
                  className="rounded-2xl h-full w-full object-cover shadow-lg border-3 border-white/10"
                  alt="Guru Circle Preview"
                />
              </div>
              <div className="w-full p-3 sm:p-5 h-full flex flex-col justify-center">
                <div className="py-6 sm:py-8 md:py-10 text-[var(--text-color)]/80 text-base font-normal leading-relaxed lg:text-2xl text-justify">
                  <p className="mb-4 sm:mb-5">
                    An exclusive forum section where members who have advanced
                    in their AI journey (Gurus) can share their knowledge,
                    showcase projects, collaborate on challenges, and discuss
                    advanced AI topics.
                  </p>
                  <p>
                    Gain access to general discussions, project showcases, job
                    opportunities, mentorship requests.
                  </p>
                </div>
                <div className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-5 w-full">
                  <button className="flex flex-row justify-center items-center w-[172px] h-[60px] p-[10px] gap [10px] rounded-[15px] ae-brand-button transition-all duration-500 hover:-translate-y-1">
                    <ArrowUpRight size={15} className="sm:w-4 sm:h-4 mr-2" />
                    Read More
                  </button>

                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeInWhenVisible>
      <CohortsSection />
      <TestimonialSwiper />
      {/* Community Section */}
      <CommunitySection />
      <InternshipModal />
      </div>
    </>
  );
};

export default HomePage;
