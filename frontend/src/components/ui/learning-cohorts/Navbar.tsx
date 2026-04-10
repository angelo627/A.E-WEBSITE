import favicon from "../learning-cohorts/images/favicon.png";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-center px-4 pt-4">

      <div className="w-full max-w-7xl flex items-center justify-between px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">

        {/* LOGO */}
        <Link to="/">
          <img src={favicon} className="w-10 h-10 rounded-full" alt="Logo" />
        </Link>

        {/* NAV LINKS */}
        <nav className="hidden md:flex gap-8 text-sm text-gray-300">
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/cohorts" className="text-white font-medium">Cohorts</Link>
          <Link to="/modules">Modules</Link>
          <Link to="/products">Products</Link>
          <Link to="/guru-circle">Guru Circle</Link>
          <Link to="/testimonials">Testimonials</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        {/* PROFILE / LOGIN */}
        <div className="flex gap-4 items-center">
          <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link to="/signup" className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors border border-white/10">
            Sign Up
          </Link>
          <Link to="/dashboard" className="w-10 h-10 ml-2 rounded-full bg-purple-600 flex items-center justify-center cursor-pointer hover:bg-purple-500 transition-colors">
            👤
          </Link>
        </div>

      </div>
    </header>
  );
}

export default Navbar;