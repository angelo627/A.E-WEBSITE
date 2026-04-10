import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/ui/learning-cohorts/Navbar";

// Public Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import LearningCohort from "./pages/LearningCohort";
import ModulesPage from "./pages/ModulesPage";
import ProductsPage from "./pages/ProductsPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import ContactPage from "./pages/ContactPage";

// Generic Pages included initially
import Guru from "./pages/Guru";
import GuruCircle from "./pages/GuruCircle";

// Auth Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardPage from "./pages/DashboardPage";
import ModuleDetailPage from "./pages/ModuleDetailPage";
import QuizPage from "./pages/QuizPage";
import LeaderboardPage from "./pages/LeaderboardPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageModules from "./pages/admin/ManageModules";
import ManageQuizzes from "./pages/admin/ManageQuizzes";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageTestimonials from "./pages/admin/ManageTestimonials";
import ManageTeam from "./pages/admin/ManageTeam";
import ViewUsers from "./pages/admin/ViewUsers";

function App() {
  return (
    <BrowserRouter>
      {/* We display Navbar across all routes for now. (Can be customized later) */}
      <Navbar />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/cohorts" element={<LearningCohort />} />
        <Route path="/modules" element={<ModulesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/guru" element={<Guru />} />
        <Route path="/guru-circle" element={<GuruCircle />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* AUTHENTICATED USER ROUTES */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/modules/:id" element={<ModuleDetailPage />} />
        <Route path="/quiz/:id" element={<QuizPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/modules" element={<ManageModules />} />
        <Route path="/admin/quizzes" element={<ManageQuizzes />} />
        <Route path="/admin/products" element={<ManageProducts />} />
        <Route path="/admin/testimonials" element={<ManageTestimonials />} />
        <Route path="/admin/team" element={<ManageTeam />} />
        <Route path="/admin/users" element={<ViewUsers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
