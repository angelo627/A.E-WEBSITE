import { useState, useEffect } from "react";
import favicon from "../learning-cohorts/images/favicon.png";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { useTheme } from "../../../context/ThemeContext";
import { HiMenu, HiX, HiSun, HiMoon } from "react-icons/hi";

function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const dashboardPath = isAdmin ? "/admin" : "/dashboard";

  const publicLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/cohorts", label: "Cohorts" },
    { to: "/modules", label: "Modules" },
    { to: "/products", label: "Products" },
    { to: "/guru-circle", label: "Guru Circle" },
    { to: "/testimonials", label: "Testimonials" },
    { to: "/community", label: "Community" },
    { to: "/contact", label: "Contact" },
  ];

  const authenticatedLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/community", label: "Community" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const adminLinks = [
    { to: "/admin", label: "Admin Dashboard" },
    { to: "/admin/modules", label: "Modules" },
    { to: "/admin/quizzes", label: "Quizzes" },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/testimonials", label: "Testimonials" },
    { to: "/admin/team", label: "Team" },
    { to: "/admin/users", label: "Users" },
  ];

  const navLinks = !isLoggedIn ? publicLinks : isAdmin ? adminLinks : authenticatedLinks;

  return (
    <header className={`fixed top-0 left-0 w-full z-50 flex justify-center px-4 transition-all duration-300 ${isScrolled ? "pt-2" : "pt-4"}`}>
      <div className="w-full max-w-7xl relative">
        <div className={`w-full flex items-center justify-between px-6 py-3 rounded-full border transition-all duration-300 ${
          isScrolled 
            ? "bg-[var(--nav-bg)] backdrop-blur-md border-[var(--ae-blue)]/20 shadow-lg" 
            : "ae-brand-card backdrop-blur-xl border-transparent shadow-md"
        }`}>

          {/* LOGO */}
          <Link to="/" onClick={closeMenu} className="shrink-0">
            <img src={favicon} className="w-10 h-10 rounded-full" alt="Logo" />
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden lg:flex gap-8 text-sm font-medium tracking-wide">
            {navLinks.map((link) => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                className={({ isActive }) => 
                  `transition-colors duration-200 relative py-1 ${
                    isActive 
                      ? "text-[var(--ae-blue)] font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[var(--ae-blue)]" 
                      : "text-[var(--text-color)]/60 hover:text-[var(--ae-blue)]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* PROFILE / LOGIN / HAMBURGER */}
          <div className="flex gap-4 items-center">
            <div className="hidden sm:flex gap-6 items-center">
              {!isLoggedIn ? (
                <>
                  <NavLink 
                    to="/login" 
                    className={({ isActive }) => 
                      `text-sm font-bold transition-all duration-300 relative px-1 ${
                        isActive 
                          ? "text-[var(--ae-blue)] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-[var(--ae-blue)]" 
                          : "text-[var(--text-color)]/60 hover:text-[var(--ae-blue)]"
                      }`
                    }
                  >
                    Login
                  </NavLink>
                  <NavLink 
                    to="/signup" 
                    className={({ isActive }) => 
                      `text-sm px-6 py-2.5 font-bold rounded-full transition-all duration-300 shadow-sm ${
                        isActive 
                          ? "bg-[var(--ae-blue)] text-white ring-2 ring-[var(--ae-blue)]/30 ring-offset-2" 
                          : "ae-brand-button text-white hover:shadow-lg"
                      }`
                    }
                  >
                    Sign Up
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink 
                    to={dashboardPath} 
                    className={({ isActive }) => 
                      `text-sm font-bold transition-all duration-300 ${
                        isActive ? "text-[var(--ae-blue)]" : "text-[var(--text-color)]/60 hover:text-[var(--ae-blue)]"
                      }`
                    }
                  >
                    {isAdmin ? "Admin Dashboard" : "Dashboard"}
                  </NavLink>
                  <button
                    onClick={logout}
                    className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* MOBILE TOGGLE */}
            <button 
              className="lg:hidden text-2xl text-[var(--text-color)] p-2 hover:bg-[var(--bg-color)]/40 rounded-full transition-colors"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <HiX /> : <HiMenu />}
            </button>

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-[var(--ae-border)] bg-[var(--bg-color)]/50 backdrop-blur-sm hover:shadow-md transition-all text-xl flex items-center justify-center text-[var(--ae-blue)]"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <HiMoon /> : <HiSun className="text-yellow-400" />}
            </button>

            {isLoggedIn && (
              <Link to={dashboardPath} onClick={closeMenu} className="hidden sm:flex w-10 h-10 ml-2 rounded-full ae-brand-card border border-[var(--ae-border)] text-[var(--text-color)] items-center justify-center cursor-pointer hover:bg-[var(--bg-color)]/80 transition-colors shadow-sm">
                👤
              </Link>
            )}
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isMenuOpen && (
          <div className="absolute top-20 left-0 w-full bg-[var(--bg-color)] border border-[var(--ae-border)] shadow-2xl rounded-3xl p-8 lg:hidden flex flex-col gap-6 text-lg text-[var(--text-color)] font-medium animate-in fade-in slide-in-from-top-4 duration-300 z-40 backdrop-blur-xl max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className={({ isActive }) => 
                    `transition-colors ${isActive ? "text-[var(--ae-blue)] font-bold" : "text-[var(--text-color)]/70 hover:text-[var(--ae-blue)]"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <hr className="border-[var(--ae-border)]" />
            
            {!isLoggedIn ? (
              <div className="flex flex-col gap-4">
                <Link to="/login" onClick={closeMenu} className="hover:text-[var(--ae-blue)] transition-colors">Login</Link>
                <Link to="/signup" onClick={closeMenu} className="ae-brand-button text-center text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition-colors">Sign Up</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="text-left font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
