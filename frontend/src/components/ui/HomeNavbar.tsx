import { useState } from "react";
import { Menu, X } from "lucide-react";
import favicon from "../ui/learning-cohorts/images/favicon.png";

function Navbar() {
  const [active, setActive] = useState("Home");
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  const links = [
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

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-center px-4 pt-4">
      <div className="w-full max-w-7xl flex items-center justify-between px-6 py-3 rounded-full ae-brand-card">

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

        {/* AUTH BUTTONS */}
        <div className="flex items-center gap-3">
          <button className="cursor-pointer px-4 py-2 text-sm text-[var(--ae-plum-deep)] bg-gray-100 hover:bg-gray-200 rounded-full transition">
            Sign Up
          </button>

          <button className="ae-brand-button px-5 py-2 text-sm rounded-full transition border-none">
            Log In
          </button>
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
                Sign Up
             </button>
             <button className="flex-1 ae-brand-button py-3 text-sm font-bold rounded-xl transition border-none text-white">
                Log In
             </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;