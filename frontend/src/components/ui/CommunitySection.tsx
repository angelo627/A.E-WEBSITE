import { motion } from "framer-motion";
import { ArrowUpRight, Users } from "lucide-react";

// TODO: Replace with your real WhatsApp / Discord / Telegram invite link
const COMMUNITY_LINK = "https://forms.gle/sc9w11jVmH6tucEo8";

const VECTOR = "Vector.png";


export default function CommunitySection(){
  return (
    <section className="relative h-fit p-5 bg-transparent text-[var(--text-color)] overflow-hidden flex flex-col items-center ae-brand-page">
      {/* Title Section */}
      <div className="mt-20 text-center px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[87.11px] font-semibold tracking-tight italic">Our Community</h1>
        <div className="flex justify-center mt-4">
          <div className="inline-flex h-12 items-center gap-3 rounded-[10px] ae-brand-card border border-[var(--ae-border)] px-5 text-[var(--text-color)] shadow-sm">
            <div className="flex -space-x-2" aria-hidden="true">
              {["#33418f", "#f5a487", "#9aa8e7"].map((color) => (
                <span
                  key={color}
                  className="grid h-7 w-7 place-items-center rounded-full border-2 border-[var(--card-bg)]"
                  style={{ backgroundColor: color }}
                >
                  <Users size={13} className="text-white" strokeWidth={2.5} />
                </span>
              ))}
            </div>
            <span className="text-base font-semibold tracking-normal text-[var(--text-color)] sm:text-lg">
              500K+ People
            </span>
          </div>
        </div>
      </div>



      {/* MAP SECTION */}
      <div className="w-full max-w-7xl mt-15 lg:mt-20 flex flex-col items-center">
        <div className="w-full rounded-2xl overflow-hidden relative">
          {/* Map Background */}
          <img src={VECTOR} alt="map" className="w-full opacity-40 object-cover filter grayscale brightness-110 dark:brightness-50" />
          
          {/* Subtle glow behind map */}
          <div className="absolute inset-0 bg-[var(--ae-blue)]/5 blur-[100px] pointer-events-none" />
        </div>

        {/* Email Capture Area */}
        <div className="mt-12 w-full max-w-161.75 px-4">
          <div className="flex flex-col items-stretch gap-4 p-0 sm:h-15 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex h-14 w-full items-center gap-3 rounded-[15px] ae-brand-card border border-[var(--ae-border)] px-4 py-2.5 shadow-sm sm:h-15 sm:w-105.25 sm:px-6.75">
              <input
                type="email"
                placeholder="Enter your email..."
                className="h-6.25 w-full min-w-0 bg-transparent text-base leading-6.25 tracking-[-0.500092px] text-[var(--text-color)] outline-none placeholder:text-[var(--text-color)]/40 sm:w-43.75 sm:text-[20.0037px]"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => window.open(COMMUNITY_LINK, "_blank", "noreferrer")}
              className="ae-brand-button flex h-14 w-full items-center justify-center gap-2.5 rounded-[15px] px-2.5 py-2.5 text-white sm:h-15 sm:w-53.75 transition-transform hover:shadow-xl"
            >
              <ArrowUpRight size={20} className="inline-block" />
              <span className="text-base font-bold text-white sm:text-[20px]">
                Join Community
              </span>
            </motion.button>
          </div>
        </div>
      </div>



    </section>
  );
}
