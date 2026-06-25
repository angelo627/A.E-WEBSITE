import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from "lucide-react";

const InternshipModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show the modal after a 2-second delay on every visit as requested
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl overflow-hidden ae-brand-card shadow-2xl rounded-3xl flex flex-col md:flex-row max-h-[90vh] md:max-h-none"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors md:text-[var(--text-color)] md:bg-transparent md:hover:bg-[var(--ae-blue)]/10"
            >
              <X size={24} />
            </button>

            {/* Image Side */}
            <div className="w-full md:w-1/2 h-[200px] md:h-auto overflow-hidden bg-[var(--bg-color)]/50">
              <img
                src="/internship-2026.jpg"
                alt="AE 2026 Internship"
                className="w-full h-full object-cover"
                onError={(e) => {
                   // Fallback if image doesn't exist yet
                   e.currentTarget.src = 'https://via.placeholder.com/600x800?text=Internship+2026+COMING+SOON';
                }}
              />
            </div>

            {/* Content Side */}
            <div className="w-full md:w-1/2 p-5 md:p-12 flex flex-col justify-center overflow-y-auto md:overflow-y-visible">
              <div className="space-y-4 md:space-y-6">
                <div>
                  <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider text-[var(--ae-blue)] uppercase bg-[var(--ae-blue)]/10 rounded-full mb-2 md:mb-3">
                    Applications Open
                  </span>
                  <h2 className="text-2xl md:text-4xl font-black text-[var(--text-color)] leading-tight">
                    AE 2026 <span className="text-[var(--ae-peach)]">Internship</span>
                  </h2>
                </div>

                <div className="space-y-3 md:space-y-4 text-[var(--text-color)]/70">
                  <p className="font-medium text-sm md:text-lg">
                    Level up your skills in <span className="text-[var(--text-color)] font-bold">Full Stack Web Dev</span> and <span className="text-[var(--text-color)] font-bold">Artificial Intelligence</span>.
                  </p>
                  
                  <ul className="space-y-1.5 md:space-y-2">
                    {[
                      'Join expert builders & designers',
                      'Access to paid gigs & opportunities',
                      'Premium membership ID provided',
                      'Peer-to-peer learning & demo days'
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--ae-blue)]" />
                        <span className="text-xs md:text-sm font-semibold">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 md:pt-4 flex flex-col sm:flex-row gap-3 md:gap-4">
                  <a
                    href="https://wa.me/2348105994390"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 ae-brand-button inline-flex items-center justify-center gap-2 px-4 md:px-6 py-3.5 md:py-4 text-white font-bold text-xs sm:text-sm md:text-base rounded-xl shadow-lg shadow-[var(--ae-blue)]/20 hover:scale-[1.02] transition-all duration-300 min-h-[44px] md:min-h-auto whitespace-nowrap"
                  >
                    <MessageCircle size={18} className="flex-shrink-0" />
                    <span>Enquire on WhatsApp</span>
                  </a>
                  <button
                    onClick={handleClose}
                    className="flex-1 inline-flex items-center justify-center px-4 md:px-6 py-3.5 md:py-4 text-[var(--text-color)]/60 font-bold text-xs sm:text-sm md:text-base hover:bg-[var(--ae-blue)]/5 rounded-xl transition-colors border border-[var(--ae-border)] min-h-[44px] md:min-h-auto"
                  >
                    Later
                  </button>
                </div>
                
                <p className="text-[8px] md:text-[10px] text-center text-slate-400 font-medium">
                  Opposite faculty of Arts Lecture hall, UNN
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InternshipModal;
