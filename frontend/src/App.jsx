import {
  Routes,
  Route,
  Navigate,
  Link
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Platforms from "./pages/Platforms";
import Contests from "./pages/Contests";
import AppLayout from "./components/organisms/AppLayout";
import { useAuth } from "./context/useAuth";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Reusable placeholder for secondary sidebar pages
const ComingSoonPage = ({ title, description, icon }) => (
  <AppLayout>
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FFF0BE] text-3xl shadow-xs">
        {icon}
      </div>
      <h1 className="mt-5 text-3xl font-black text-[#171717]">{title}</h1>
      <p className="mt-2 max-w-md text-xs sm:text-sm text-[#5F5F5F] leading-relaxed">
        {description}
      </p>
      <Link
        to="/platforms"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#FFD05A] px-6 py-3 text-xs sm:text-sm font-bold text-[#171717] hover:bg-[#FFA057] transition shadow-xs"
      >
        Explore Coding Platforms
      </Link>
    </div>
  </AppLayout>
);

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/platforms" element={<Platforms />} />
      <Route path="/contests" element={<Contests />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roadmaps"
        element={
          <ComingSoonPage
            title="Developer Roadmaps"
            description="Curated learning paths for Data Structures, Algorithms, System Design, and Competitive Programming."
            icon="🗺️"
          />
        }
      />
      <Route
        path="/resources"
        element={
          <ComingSoonPage
            title="Curated Resources"
            description="Cheat sheets, interview problem templates, algorithmic notes, and documentation hubs."
            icon="📚"
          />
        }
      />
      <Route
        path="/blog"
        element={
          <ComingSoonPage
            title="Developer Blog"
            description="Articles, contest analysis, editorial solutions, and engineering interview insights."
            icon="✍️"
          />
        }
      />
      <Route
        path="/community"
        element={
          <ComingSoonPage
            title="Coding Community"
            description="Join fellow competitive programmers, discuss solutions, share tips, and organize study rooms."
            icon="👥"
          />
        }
      />
      <Route
        path="/settings"
        element={
          <ComingSoonPage
            title="Settings & Preferences"
            description="Manage your account preferences, connected API tokens, theme settings, and notifications."
            icon="⚙️"
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
