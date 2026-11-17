import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) return setError("Passwords do not match.");
    try {
      const { data } = await api.post("/auth/reset-password", { token: params.get("token"), password });
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "This reset link is invalid or expired.");
    }
  };
  return <div className="flex min-h-screen items-center justify-center auth-shell bg-[#EEEEEE] px-6 py-12">
    <form onSubmit={submit} className="auth-card w-full max-w-md rounded-3xl border border-[#B9E4E8] bg-white p-8 sm:p-10 shadow-sm">
      <h1 className="text-3xl font-black text-[#071B2B]">Reset password</h1>
      {(message || error) && <p className={`mt-5 rounded-xl p-3 text-xs font-bold ${error ? "bg-[#FFE2DE] text-[#B42318]" : "bg-[#E8F8EE] text-[#167D8D]"}`}>{message || error}</p>}
      <input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" className="mt-6 w-full rounded-2xl border border-[#B9E4E8] bg-[#EEEEEE] px-4 py-3 text-xs outline-none" />
      <input type="password" required minLength={8} value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Confirm new password" className="mt-4 w-full rounded-2xl border border-[#B9E4E8] bg-[#EEEEEE] px-4 py-3 text-xs outline-none" />
      <button type="submit" className="mt-4 w-full rounded-2xl bg-[#167D8D] px-4 py-3 text-xs font-bold text-white">Reset password</button>
      <Link to="/login" className="mt-6 block text-center text-xs font-bold text-[#167D8D] hover:underline">Back to login</Link>
    </form>
  </div>;
};

export default ResetPassword;
