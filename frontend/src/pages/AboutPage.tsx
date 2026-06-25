import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import { FaLinkedin, FaTwitter, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { Users, X, Rocket, Eye, ShieldCheck, Target } from "lucide-react";

interface TeamMember {
  id: string;
  fullName: string;
  roleTitle: string;
  bio: string;
  imageUrl: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  whatsappUrl?: string | null;
  emailAddress?: string | null;
}

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
  const inView = useInView(ref, { once: true, margin: "-50px" });

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

export default function AboutPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (selectedMember) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedMember]);

  useEffect(() => {
    async function getTeam() {
      try {
        const data = await apiFetch("/public/team");
        setTeamMembers(data);
      } catch (err) {
        console.error("Error fetching team:", err);
      } finally {
        setLoading(false);
      }
    }
    getTeam();
  }, []);

  return (
    <div className="relative overflow-hidden ae-brand-page min-h-screen font-outfit">
      <div
        className="w-full relative overflow-hidden"
        style={{
          backgroundImage: `url('${bgPath}')`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-[var(--bg-color)]/90 pointer-events-none fixed" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 pt-40 pb-24">
          
          {/* Header Section */}
          <FadeInWhenVisible>
            <div className="text-center max-w-3xl mx-auto mb-24">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--ae-blue)]/10 border border-[var(--ae-blue)]/20 mb-8">
                <Rocket className="w-4 h-4 text-[var(--ae-blue)]" />
                <span className="text-[10px] font-black text-[var(--ae-blue)] uppercase tracking-[0.2em]">Our Story</span>
              </div>
              <h1 className="text-[var(--text-color)] text-4xl sm:text-4xl md:text-5xl font-black leading-tight drop-shadow-sm mb-8 italic tracking-tighter uppercase">
                Redefining <span className="text-[var(--ae-blue)]">Intelligence</span>
              </h1>
              <p className="text-[var(--text-color)]/70 text-lg md:text-2xl leading-relaxed font-light">
                Empowering the next generation of algorithmic thinkers and digital builders through deep engineering excellence.
              </p>
            </div>
          </FadeInWhenVisible>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
            <FadeInWhenVisible delay={0.1}>
              <div className="ae-brand-card border border-[var(--ae-border)] rounded-[2.5rem] p-10 lg:p-14 h-full shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--ae-blue)]/5 rounded-bl-[5rem] -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                <div className="w-16 h-16 rounded-2xl bg-[var(--ae-blue)] shadow-lg shadow-[var(--ae-blue)]/20 flex items-center justify-center mb-10 group-hover:-translate-y-2 transition-transform">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-color)] mb-6 italic tracking-tight uppercase">Our Mission</h2>
                <p className="text-[var(--text-color)]/60 leading-relaxed text-lg font-medium">
                  To provide the right mentorship, elite training, and a hyper-collaborative environment that transforms aspiring AI enthusiasts from curious learners into global technical contributors.
                </p>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <div className="ae-brand-card border border-[var(--ae-border)] rounded-[2.5rem] p-10 lg:p-14 h-full shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--ae-peach)]/5 rounded-bl-[5rem] -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                <div className="w-16 h-16 rounded-2xl bg-[var(--ae-peach)] shadow-lg shadow-[var(--ae-peach)]/20 flex items-center justify-center mb-10 group-hover:-translate-y-2 transition-transform">
                  <Eye className="w-8 h-8 text-[#0F172A]" strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-color)] mb-6 italic tracking-tight uppercase">Our Vision</h2>
                <p className="text-[var(--text-color)]/60 leading-relaxed text-lg font-medium">
                  To raise a global elite of AI experts and innovators who will architect the future, leading meaningful research and building breakthrough products that make the world hyper-connected.
                </p>
              </div>
            </FadeInWhenVisible>
          </div>

          {/* Team Section */}
          <FadeInWhenVisible delay={0.3}>
            <div className="text-center mb-20 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--ae-blue)]/10 border border-[var(--ae-blue)]/20 mb-8">
                <ShieldCheck className="w-4 h-4 text-[var(--ae-blue)]" />
                <span className="text-[10px] font-black text-[var(--ae-blue)] uppercase tracking-[0.2em]">Core Council</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-[var(--text-color)] mb-8 italic tracking-tighter uppercase">
                The <span className="text-[var(--ae-blue)]">Architects</span> Behind AE
              </h2>
              <p className="text-[var(--text-color)]/60 text-lg md:xl max-w-3xl mx-auto leading-relaxed font-medium">
                Meet the passionate engineers and designers working tirelessly to democratize high-end technology education.
              </p>
            </div>
          </FadeInWhenVisible>
  
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
               <div className="w-14 h-14 border-4 border-[var(--ae-blue)]/20 border-t-[var(--ae-blue)] rounded-full animate-spin mb-6"></div>
               <p className="text-[var(--ae-blue)] font-black text-sm uppercase tracking-widest animate-pulse">Scanning Registry...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-40 ae-brand-card border border-[var(--ae-border)] rounded-[3rem] shadow-2xl mx-4 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[var(--ae-blue)]/5 to-transparent pointer-events-none" />
               <Users className="w-16 h-16 mx-auto mb-6 text-[var(--text-color)]/10" />
               <p className="italic text-xl font-black text-[var(--text-color)]/40 tracking-tight uppercase">No agents active in this sector.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-4">
              {teamMembers.map((member, idx) => (
                <FadeInWhenVisible delay={0.4 + idx * 0.1} key={member.id}>
                  <div 
                    onClick={() => setSelectedMember(member)}
                    className="group relative ae-brand-card border border-[var(--ae-border)] rounded-[2.5rem] overflow-hidden hover:-translate-y-2 transition-all duration-500 shadow-xl cursor-pointer"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {member.imageUrl ? (
                        <img 
                          src={member.imageUrl} 
                          alt={member.fullName} 
                          className="w-full h-full object-cover object-top filter group-hover:scale-105 transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-[var(--bg-color)]/50 flex items-center justify-center border-b border-[var(--ae-border)]">
                           <span className="text-6xl font-black text-[var(--text-color)]/10 select-none uppercase">{member.fullName.charAt(0)}</span>
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--ae-blue)]/90 via-[var(--ae-blue)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8 z-10">
                          <span className="px-6 py-3 bg-white text-[var(--ae-blue)] text-xs font-black uppercase tracking-[0.2em] rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                             Intel Details
                          </span>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="p-8 relative text-center">
                      <p className="text-[var(--ae-blue)] font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                        {member.roleTitle}
                      </p>
                      <h3 className="text-2xl font-black text-[var(--text-color)] leading-tight italic uppercase tracking-tighter">
                        {member.fullName}
                      </h3>
                    </div>
                  </div>
                </FadeInWhenVisible>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden ae-brand-card border border-[var(--ae-border)] rounded-[3rem] shadow-[0_0_100px_rgba(51,65,143,0.2)] flex flex-col md:flex-row z-10"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedMember(null)}
                className="absolute top-6 right-6 p-3 bg-[var(--bg-color)]/80 hover:bg-[var(--ae-blue)] rounded-2xl text-[var(--text-color)] hover:text-white border border-[var(--ae-border)] transition-all z-20 shadow-xl"
              >
                <X size={20} strokeWidth={3} />
              </button>

              {/* Modal Image */}
              <div className="w-full md:w-[45%] h-full relative shrink-0 bg-[var(--bg-color)]">
                {selectedMember.imageUrl ? (
                  <img 
                    src={selectedMember.imageUrl} 
                    alt={selectedMember.fullName} 
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--bg-color)] flex items-center justify-center">
                     <span className="text-[10rem] font-black text-[var(--text-color)]/5 select-none uppercase">{selectedMember.fullName.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--bg-color)] hidden md:block" />
              </div>

              {/* Modal Content */}
              <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col overflow-y-auto bg-[var(--bg-color)]">
                <p className="text-[var(--ae-blue)] font-black text-xs uppercase tracking-[0.3em] mb-4">
                  {selectedMember.roleTitle}
                </p>
                <h3 className="text-4xl md:text-5xl font-black text-[var(--text-color)] italic mb-10 uppercase tracking-tighter leading-none">
                  {selectedMember.fullName}
                </h3>
                
                <div className="flex-grow space-y-6 mb-12">
                   <div className="w-12 h-1.5 bg-[var(--ae-blue)] rounded-full" />
                   <p className="text-[var(--text-color)]/80 text-lg md:text-xl leading-relaxed font-light whitespace-pre-wrap">
                      {selectedMember.bio}
                   </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-auto pt-8 border-t border-[var(--ae-border)]">
                  {selectedMember.linkedinUrl && (
                    <a href={selectedMember.linkedinUrl} target="_blank" rel="noreferrer" className="w-14 h-14 bg-[var(--bg-color)] border border-[var(--ae-border)] rounded-2xl hover:bg-[#0077b5] hover:text-white transition-all flex items-center justify-center text-[var(--text-color)]/60 shadow-lg">
                      <FaLinkedin size={22} />
                    </a>
                  )}
                  {selectedMember.twitterUrl && (
                    <a href={selectedMember.twitterUrl} target="_blank" rel="noreferrer" className="w-14 h-14 bg-[var(--bg-color)] border border-[var(--ae-border)] rounded-2xl hover:bg-black hover:text-white transition-all flex items-center justify-center text-[var(--text-color)]/60 shadow-lg">
                      <FaTwitter size={22} />
                    </a>
                  )}
                   {selectedMember.whatsappUrl && (
                    <a href={selectedMember.whatsappUrl} target="_blank" rel="noreferrer" className="w-14 h-14 bg-[var(--bg-color)] border border-[var(--ae-border)] rounded-2xl hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center text-[var(--text-color)]/60 shadow-lg">
                      <FaWhatsapp size={22} />
                    </a>
                  )}
                  {selectedMember.emailAddress && (
                    <a href={`mailto:${selectedMember.emailAddress}`} className="w-14 h-14 bg-[var(--bg-color)] border border-[var(--ae-border)] rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-[var(--text-color)]/60 shadow-lg">
                      <FaEnvelope size={22} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
