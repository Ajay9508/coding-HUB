import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/atoms/Button";
import { useAuth } from "../context/useAuth";
import { UserPlus, AlertCircle } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await register(name.trim(), email.trim().toLowerCase(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Registration failed. Please try a different email.",
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
            <UserPlus size={20} />
          </div>
          <span className="text-xs font-bold text-[#FF8E3C] uppercase tracking-wider">
            Join the Community
          </span>
        </div>

        <h1 className="text-3xl font-black text-[#171717]">Create account</h1>
        <p className="mt-1 text-xs text-[#5F5F5F]">
          Get your unified developer profile, contest tracking, and integrated IDE.
        </p>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#FFE2DE] p-3 text-xs font-bold text-[#F35F67]">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Alex Chen"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-[#E9E2D8] bg-[#FFFBF5] px-4 py-3 text-xs text-[#171717] outline-none focus:border-[#FFD05A]"
            />
          </div>

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
            <label className="block text-xs font-bold text-[#171717] mb-1">
              Password (min 8 characters)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              required
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-[#E9E2D8] bg-[#FFFBF5] px-4 py-3 text-xs text-[#171717] outline-none focus:border-[#FFD05A]"
            />
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create CodingHub Account"}
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-[#5F5F5F]">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-[#FF8E3C] hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
