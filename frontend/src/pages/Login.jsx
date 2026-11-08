import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/atoms/Button";
import { useAuth } from "../context/useAuth";
import { LogIn, AlertCircle } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center auth-shell bg-[#FFFBF5] px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="auth-card w-full max-w-md rounded-3xl border border-[#E9E2D8] bg-white p-8 sm:p-10 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF0BE] text-[#171717]">
            <LogIn size={20} />
          </div>
          <span className="text-xs font-bold text-[#FF8E3C] uppercase tracking-wider">
            Secure Authentication
          </span>
        </div>

        <h1 className="text-3xl font-black text-[#171717]">Welcome back</h1>
        <p className="mt-1 text-xs text-[#5F5F5F]">
          Sign in to access your coding profiles, contest schedule & IDE.
        </p>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#FFE2DE] p-3 text-xs font-bold text-[#F35F67]">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-[#E9E2D8] bg-[#FFFBF5] px-4 py-3 text-xs text-[#171717] outline-none focus:border-[#FFD05A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-[#E9E2D8] bg-[#FFFBF5] px-4 py-3 text-xs text-[#171717] outline-none focus:border-[#FFD05A]"
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Login to CodingHub"}
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-[#5F5F5F]">
          Don't have an account?{" "}
          <Link to="/register" className="font-bold text-[#FF8E3C] hover:underline">
            Register now
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
