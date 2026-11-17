import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not send the reset email.");
    }
  };
  return <div className="flex min-h-screen items-center justify-center auth-shell bg-[#EEEEEE] px-6 py-12">
    <form onSubmit={submit} className="auth-card w-full max-w-md rounded-3xl border border-[#B9E4E8] bg-white p-8 sm:p-10 shadow-sm">
      <h1 className="text-3xl font-black text-[#071B2B]">Forgot password?</h1>
      <p className="mt-2 text-xs text-[#526574]">Enter your email and we will send a secure reset link.</p>
      {(message || error) && <p className={`mt-5 rounded-xl p-3 text-xs font-bold ${error ? "bg-[#FFE2DE] text-[#B42318]" : "bg-[#E8F8EE] text-[#167D8D]"}`}>{message || error}</p>}
      <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-6 w-full rounded-2xl border border-[#B9E4E8] bg-[#EEEEEE] px-4 py-3 text-xs outline-none" />
      <button type="submit" className="mt-4 w-full rounded-2xl bg-[#167D8D] px-4 py-3 text-xs font-bold text-white">Send reset link</button>
      <Link to="/login" className="mt-6 block text-center text-xs font-bold text-[#167D8D] hover:underline">Back to login</Link>
    </form>
  </div>;
};

export default ForgotPassword;
