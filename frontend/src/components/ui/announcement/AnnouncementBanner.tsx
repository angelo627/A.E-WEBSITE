import { useState, useEffect } from "react";
import { apiFetch } from "../../../lib/api";
import { X, Megaphone } from "lucide-react";
import { useAuth } from "../../../context/useAuth";

interface Announcement {
  id: string;
  title: string;
  message: string;
}

const AnnouncementBanner = () => {
  const { isLoggedIn } = useAuth();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchActiveAnnouncement();
    } else {
      setAnnouncement(null);
      setIsVisible(false);
    }
  }, [isLoggedIn]);

  const fetchActiveAnnouncement = async () => {
    try {
      const data = await apiFetch("/announcements/active");
      if (data.announcement) {
        const dismissedId = localStorage.getItem("ae_dismissed_announcement");
        if (dismissedId !== data.announcement.id) {
          setAnnouncement(data.announcement);
          setIsVisible(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch announcement:", err);
    }
  };

  const handleDismiss = () => {
    if (announcement) {
      localStorage.setItem("ae_dismissed_announcement", announcement.id);
      setIsVisible(false);
    }
  };

  if (!isVisible || !announcement) return null;

  return (
    <div className="fixed top-[72px] left-0 right-0 z-[40] animate-in slide-in-from-top duration-300">
      <div className="bg-gradient-to-r from-[var(--ae-blue)] to-[#33418f] text-white shadow-lg overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="hidden md:flex w-8 h-8 rounded-full bg-white/20 items-center justify-center shrink-0">
                <Megaphone className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">
                  {announcement.title}
                </p>
                <p className="text-xs text-white/80 line-clamp-1 md:line-clamp-none">
                  {announcement.message}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Subtle animated shine line */}
        <div className="absolute inset-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shine"></div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
