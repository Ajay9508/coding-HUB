import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Platforms from "./pages/Platforms";
import Contests from "./pages/Contests";
import CodeIDE from "./pages/CodeIDE";
import Roadmaps from "./pages/Roadmaps";
import Resources from "./pages/Resources";
import Blog from "./pages/Blog";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import { useAuth } from "./context/useAuth";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-bold text-gray-500">
        Loading CodingHub...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/platforms" element={<Platforms />} />
      <Route path="/contests" element={<Contests />} />
      <Route path="/contests/local" element={<Navigate to="/contests?tab=local" replace />} />
      <Route path="/local-contests" element={<Navigate to="/contests?tab=local" replace />} />
      <Route path="/ide" element={<CodeIDE />} />
      <Route path="/roadmaps" element={<Roadmaps />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/community" element={<Community />} />
      <Route path="/settings" element={<Settings />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
