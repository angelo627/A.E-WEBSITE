import { useState } from "react";
import { Menu, X } from "lucide-react";
import favicon from "../ui/learning-cohorts/images/favicon.png";

const Navbar: React.FC = () => {
  const [active, setActive] = useState<string>("Learn");
  const [openProfile, setOpenProfile] = useState<boolean>(false);
  const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);

  const links: string[] = [
    "Home",
    "Learn",
    "Guru Circle",
    "Volunteer",
    "Projects",
    "AE News",
    "Exco Team",
    "Research Lab",
    "Testimonials",
  ];

  const toggleProfile = (): void => {
    setOpenProfile(!openProfile);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-center px-4 pt-4">
      <div className="w-full max-w-7xl flex items-center justify-between px-6 py-3 rounded-full ae-brand-card relative">

        {/* MOBILE HAMBURGER BUTTON */}
        <div className="md:hidden flex items-center order-first mr-4">
          <button
            onClick={() => setOpenMobileMenu(!openMobileMenu)}
            className="text-[var(--ae-plum-deep)] focus:outline-none p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            {openMobileMenu ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* LOGO */}
        <img src={favicon} alt="logo" className="w-auto h-10 object-contain rounded-full" />

        {/* NAV LINKS (Desktop) */}
        <nav className="hidden md:flex gap-8 text-sm">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              onClick={() => setActive(link)}
              className={`cursor-pointer transition-all duration-200 ${
                active === link
                  ? "text-[var(--ae-blue)] font-semibold"
                  : "text-gray-600 hover:text-[var(--ae-blue)]"
              }`}
            >
              {link}
            </a>
          ))}
        </nav>

        {/* PROFILE */}
        <div className="relative">
          <button
            onClick={toggleProfile}
            className="ae-brand-button cursor-pointer w-10 h-10 rounded-full flex items-center justify-center transition border-none"
          >
            👤
          </button>

          {openProfile && (
            <div className="absolute right-0 mt-3 w-40 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">

              <button className="cursor-pointer w-full text-left px-4 py-2 text-sm text-[var(--ae-plum-deep)] hover:bg-gray-50">
                Log In
              </button>

              <button className="cursor-pointer w-full text-left px-4 py-2 text-sm text-[var(--ae-plum-deep)] hover:bg-gray-50">
                Sign Up
              </button>

            </div>
          )}
        </div>

      </div>

      {/* MOBILE DROPDOWN MENU */}
      {openMobileMenu && (
        <div className="absolute top-[80px] left-4 right-4 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 flex flex-col gap-2 md:hidden">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              onClick={() => {
                setActive(link);
                setOpenMobileMenu(false);
              }}
              className={`font-semibold py-3 px-4 rounded-xl transition-colors ${
                active === link
                  ? "bg-[var(--ae-blue)]/10 text-[var(--ae-blue)]"
                  : "text-[var(--ae-plum-deep)] hover:bg-slate-100"
              }`}
            >
              {link}
            </a>
          ))}
          <div className="h-px bg-slate-200 my-2 mx-2" />
          <div className="flex gap-3 px-2">
             <button className="flex-1 cursor-pointer py-3 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
                Log In
             </button>
             <button className="flex-1 ae-brand-button py-3 text-sm font-bold rounded-xl transition border-none text-white">
                Sign Up
             </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;