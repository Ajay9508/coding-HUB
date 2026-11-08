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
    <div className="flex min-h-screen items-center justify-center auth-shell bg-[#EEEEEE] dark:bg-[#071B2B] px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="auth-card w-full max-w-md rounded-3xl border border-[#B9E4E8] bg-white dark:bg-[#0c2133] dark:border-[#167D8D]/40 p-8 sm:p-10 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#B9E4E8] text-[#071B2B] dark:bg-[#167D8D] dark:text-white">
            <UserPlus size={20} />
          </div>
          <span className="text-xs font-bold text-[#167D8D] dark:text-[#B9E4E8] uppercase tracking-wider">
            Join the Community
          </span>
        </div>

        <h1 className="text-3xl font-black text-[#071B2B] dark:text-[#EEEEEE]">Create account</h1>
        <p className="mt-1 text-xs text-[#526574] dark:text-[#B9E4E8]/80">
          Get your unified developer profile, contest tracking, and integrated IDE.
        </p>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#B9E4E8]/40 border border-[#167D8D] p-3 text-xs font-bold text-[#071B2B] dark:text-[#EEEEEE]">
            <AlertCircle size={16} className="shrink-0 text-[#167D8D]" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#071B2B] dark:text-[#EEEEEE] mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Alex Chen"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-[#B9E4E8] bg-[#EEEEEE] dark:bg-[#071B2B] dark:text-[#EEEEEE] dark:border-[#167D8D]/40 px-4 py-3 text-xs text-[#071B2B] outline-none focus:border-[#167D8D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071B2B] dark:text-[#EEEEEE] mb-1">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-[#B9E4E8] bg-[#EEEEEE] dark:bg-[#071B2B] dark:text-[#EEEEEE] dark:border-[#167D8D]/40 px-4 py-3 text-xs text-[#071B2B] outline-none focus:border-[#167D8D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071B2B] dark:text-[#EEEEEE] mb-1">
              Password (min 8 characters)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              required
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-[#B9E4E8] bg-[#EEEEEE] dark:bg-[#071B2B] dark:text-[#EEEEEE] dark:border-[#167D8D]/40 px-4 py-3 text-xs text-[#071B2B] outline-none focus:border-[#167D8D]"
            />
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create CodingHub Account"}
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-[#526574] dark:text-[#cbd5e1]">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-[#167D8D] dark:text-[#B9E4E8] hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
