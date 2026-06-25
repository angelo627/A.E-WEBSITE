import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Send, MessageCircle, Mail, MapPin } from "lucide-react";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

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

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", message: "" });
    }, 3000);
  };

  return (
    <div className="relative overflow-hidden ae-brand-page min-h-screen font-outfit">
      <div
        className="w-full relative overflow-hidden min-h-screen"
        style={{
          backgroundImage: `url('${bgPath}')`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-[var(--bg-color)]/90 pointer-events-none fixed" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 pt-40 pb-24">
          
          <FadeInWhenVisible>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h1 className="text-[var(--text-color)] text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight drop-shadow-sm mb-6 italic">
                Get in Touch
              </h1>
              <p className="text-[var(--text-color)]/80 text-lg md:text-xl leading-relaxed">
                Have questions about the cohort or need help with your account? We're here for you.
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            
            {/* Contact Information */}
            <div>
              <FadeInWhenVisible delay={0.1}>
                <h2 className="text-3xl font-semibold text-[var(--text-color)] mb-8 italic">Reach Out Directly</h2>
                
                <div className="space-y-8 mb-12">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 ae-brand-card rounded-xl flex items-center justify-center shrink-0 border border-[var(--ae-border)] shadow-sm">
                      <Mail className="text-[var(--ae-blue)]" size={24} />
                    </div>
                    <div>
                      <h4 className="text-[var(--text-color)] text-lg font-medium mb-1">Email Us</h4>
                      <p className="text-[var(--text-color)]/60 mb-2 font-light">Our friendly team is here to help.</p>
                      <a href="mailto:hello@algorithmicexplorers.com" className="text-[var(--ae-blue)] hover:text-[var(--text-color)] transition-colors font-semibold">hello@algorithmicexplorers.com</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 ae-brand-card rounded-xl flex items-center justify-center shrink-0 border border-[var(--ae-border)] shadow-sm">
                      <MapPin className="text-[var(--ae-blue)]" size={24} />
                    </div>
                    <div>
                      <h4 className="text-[var(--text-color)] text-lg font-medium mb-1">Global HQ</h4>
                      <p className="text-[var(--text-color)]/60 mb-2 font-light">Based in SF, operating globally.</p>
                      <p className="text-[var(--ae-blue)] font-semibold">123 Innovation Drive, CA 94103</p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <div className="ae-brand-card from-[var(--ae-blue)]/5 to-transparent border border-[var(--ae-border)] rounded-2xl p-6 sm:p-8 relative overflow-hidden group shadow-md hover:shadow-xl transition-all duration-500">
                  <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <MessageCircle size={150} className="text-[var(--ae-blue)]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-color)] mb-2 relative z-10 italic">Join our Community</h3>
                  <p className="text-[var(--text-color)]/70 mb-6 relative z-10 max-w-sm leading-relaxed font-light">Get real-time updates, daily algo challenges, and instant support from the community.</p>
                  <a 
                    href="https://forms.gle/sc9w11jVmH6tucEo8" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 ae-brand-button font-bold py-3.5 px-8 rounded-xl hover:scale-105 active:scale-95 transition-all relative z-10 shadow-lg"
                  >
                    <MessageCircle size={20} />
                    Join Community Now
                  </a>
                </div>

                {/* Socials */}
                <div className="mt-12">
                  <h4 className="text-[var(--text-color)]/40 text-xs uppercase tracking-widest font-bold mb-6">Follow our journey</h4>
                  <div className="flex gap-5">
                    <a href="https://x.com/AlgorithmicExp_?t=zL9moipPK_qgjFI7OrrIrQ&s=09" className="w-12 h-12 ae-brand-card border border-[var(--ae-border)] shadow-sm rounded-full flex items-center justify-center text-[var(--text-color)]/60 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-all duration-300 hover:scale-110">
                      <FaTwitter size={20} />
                    </a>
                    <a href="https://www.linkedin.com/company/algorithmic-explorers/" className="w-12 h-12 ae-brand-card border border-[var(--ae-border)] shadow-sm rounded-full flex items-center justify-center text-[var(--text-color)]/60 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all duration-300 hover:scale-110">
                      <FaLinkedin size={20} />
                    </a>
                    <a href="#" className="w-12 h-12 ae-brand-card border border-[var(--ae-border)] shadow-sm rounded-full flex items-center justify-center text-[var(--text-color)]/60 hover:bg-black hover:text-white hover:border-black transition-all duration-300 hover:scale-110">
                      <FaGithub size={20} />
                    </a>
                  </div>
                </div>
              </FadeInWhenVisible>
            </div>

            {/* Contact Form */}
            <div>
              <FadeInWhenVisible delay={0.3}>
                <div className="ae-brand-card border border-[var(--ae-border)] rounded-[2.5rem] p-8 sm:p-10 md:p-12 shadow-xl relative overflow-hidden backdrop-blur-xl">
                  {/* Decorative element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ae-blue)]/5 rounded-bl-[5rem] -mr-16 -mt-16 pointer-events-none" />
                  
                  <h3 className="text-3xl font-extrabold text-[var(--text-color)] mb-8 italic tracking-tight">Send a Message</h3>
                  
                  {isSubmitted ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-10 text-center min-h-[400px] flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Send className="text-green-600" size={32} />
                      </div>
                      <h4 className="text-2xl text-[var(--text-color)] font-bold mb-3 italic">Message Sent!</h4>
                      <p className="text-green-700/80 font-medium">We'll get back to you within 24 hours.</p>
                      <button 
                        onClick={() => setIsSubmitted(false)}
                        className="mt-8 text-sm font-bold text-[var(--ae-blue)] hover:underline"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-[var(--text-color)]/70 text-sm font-bold ml-1">Your Name</label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-[var(--bg-color)]/50 border border-[var(--ae-border)] shadow-sm rounded-2xl px-6 py-4 text-[var(--text-color)] focus:outline-none focus:ring-4 focus:ring-[var(--ae-blue)]/10 focus:border-[var(--ae-blue)] transition-all font-medium"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-[var(--text-color)]/70 text-sm font-bold ml-1">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-[var(--bg-color)]/50 border border-[var(--ae-border)] shadow-sm rounded-2xl px-6 py-4 text-[var(--text-color)] focus:outline-none focus:ring-4 focus:ring-[var(--ae-blue)]/10 focus:border-[var(--ae-blue)] transition-all font-medium"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[var(--text-color)]/70 text-sm font-bold ml-1">How can we help?</label>
                        <textarea 
                          required
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="w-full bg-[var(--bg-color)]/50 border border-[var(--ae-border)] shadow-sm rounded-2xl px-6 py-4 text-[var(--text-color)] focus:outline-none focus:ring-4 focus:ring-[var(--ae-blue)]/10 focus:border-[var(--ae-blue)] transition-all resize-none font-medium"
                          placeholder="Please describe your inquiry..."
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-5 flex items-center justify-center gap-3 ae-brand-button shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] font-bold text-lg"
                      >
                        <Send size={20} />
                        Send Message
                      </button>
                    </form>
                  )}
                </div>
              </FadeInWhenVisible>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
