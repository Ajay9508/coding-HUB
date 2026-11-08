import { useCallback, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Code2,
  RefreshCw,
  Trophy,
  Plus,
  Edit3,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import AppLayout from "../components/organisms/AppLayout";
import { useAuth } from "../context/useAuth";
import api from "../api";

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  // Profile Edit Modal / State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [nameSaveSuccess, setNameSaveSuccess] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const { data } = await api.get("/dashboard");
      setDashboard(data?.dashboard ?? null);
      setError("");
    } catch (requestError) {
      setDashboard(null);
      setError(
        requestError.response?.data?.detail ||
          "Could not load your dashboard. Check that the API is running.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadDashboard();
    }, 0);
    return () => window.clearTimeout(task);
  }, [loadDashboard]);

  const profiles = useMemo(() => dashboard?.connectedPlatforms ?? [], [dashboard]);

  const handleSyncAll = async () => {
    setSyncing(true);
    setError("");
    try {
      for (const profile of profiles) {
        await api.post(`/platforms/${profile.platformId}/sync`);
      }
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not synchronize every connected profile.");
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!editedName.trim()) return;

    try {
      const { data } = await api.patch("/users/me", { name: editedName.trim() });
      updateUser(data.user);
      setIsEditingName(false);
      setNameSaveSuccess(true);
      setTimeout(() => setNameSaveSuccess(false), 2000);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not update your name.");
    }
  };

  const stats = useMemo(() => {
    return [
      {
        label: "Total Problems Solved",
        value: dashboard?.stats?.problemsSolved ?? (loading ? "…" : "—"),
        icon: <Code2 size={22} />,
        accent: "bg-[#E8F8EE] text-[#16A34A]",
      },
      {
        label: "Average Rating",
        value: dashboard?.stats?.averageRating ?? (loading ? "…" : "—"),
        icon: <Trophy size={22} />,
        accent: "bg-[#FFF0BE] text-[#D97706]",
      },
      {
        label: "Connected Platforms",
        value: dashboard?.stats?.connectedPlatforms ?? profiles.length,
        icon: <CheckCircle2 size={22} />,
        accent: "bg-[#EBF5FF] text-[#2563EB]",
      },
    ];
  }, [dashboard, loading, profiles]);

  const memberSince = useMemo(() => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }
    return "—";
  }, [user]);

  return (
    <AppLayout>
      {/* ─── Top Profile & Welcome Header ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-[#FED7B2] bg-gradient-to-r from-[#FFF4E6] via-[#FEEBD9] to-[#FEDBC0] p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* User Avatar Badge */}
            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-b from-[#FFE8B2] to-[#FFD05A] text-2xl sm:text-3xl font-black text-[#171717] shadow-sm border-2 border-white/80">
              {(user?.name || "D").slice(0, 2).toUpperCase()}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#16A34A] text-white text-[10px] ring-2 ring-white">
                <Check size={12} strokeWidth={3} />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-[#FFE2DE] px-3 py-0.5 text-xs font-black text-[#F35F67]">
                  DEVELOPER PROFILE
                </span>
                <span className="rounded-full bg-[#E8F8EE] px-2.5 py-0.5 text-[11px] font-bold text-[#16A34A]">
                  Active Member
                </span>
              </div>

              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
                  {user?.name || dashboard?.user?.name}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsEditingName(!isEditingName)}
                  className="rounded-lg p-1 text-[#7A7A7A] hover:bg-white/60 transition"
                  title="Edit profile name"
                >
                  <Edit3 size={15} />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#5F5F5F]">
                {user?.email} · Member since {memberSince}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSyncAll}
              disabled={syncing}
              className="flex items-center gap-2 rounded-2xl bg-[#FFD05A] px-5 py-3 text-xs sm:text-sm font-bold text-[#171717] hover:bg-[#FFA057] transition shadow-xs disabled:opacity-60"
            >
              <RefreshCw className={syncing ? "animate-spin" : ""} size={16} />
              {syncing ? "Syncing..." : "Sync Stats"}
            </button>

            <Link
              to="/platforms"
              className="flex items-center gap-2 rounded-2xl bg-[#171717] px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-black transition shadow-xs"
            >
              <Plus size={16} />
              Connect Platform
            </Link>
          </div>
        </div>

        {/* Inline Name Edit Box */}
        {isEditingName && (
          <form
            onSubmit={handleUpdateName}
            className="mt-4 flex items-center gap-3 pt-4 border-t border-[#FED7B2]/70 max-w-md"
          >
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 rounded-xl border border-[#E9E2D8] bg-white px-3 py-2 text-xs text-[#171717] outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#171717] px-4 py-2 text-xs font-bold text-white hover:bg-black"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditingName(false)}
              className="rounded-xl border border-[#E9E2D8] px-3 py-2 text-xs font-bold text-[#5F5F5F]"
            >
              Cancel
            </button>
          </form>
        )}

        {nameSaveSuccess && (
          <p className="mt-2 text-xs font-bold text-[#16A34A]">✓ Name updated successfully!</p>
        )}
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-[#FFE2DE] p-4 text-xs font-bold text-[#B42318]">
          <ShieldCheck size={16} />
          {error}
        </div>
      )}

      {/* ─── 4 Main Stat Metric Cards ─── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-3xl border border-[#E9E2D8] bg-white p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.accent}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-[#7A7A7A]">{stat.label}</p>
              <h2 className="text-2xl font-black text-[#171717] mt-0.5">{stat.value}</h2>
            </div>
          </article>
        ))}
      </section>

      {/* ─── Main 2-Column Content ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 Cols): Connected Platforms & Detailed Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE4]">
            <div>
              <h2 className="text-xl font-black text-[#171717]">Connected Coding Profiles</h2>
              <p className="text-xs text-[#5F5F5F]">
                Real-time synchronized handles, solved counter, and competitive ratings.
              </p>
            </div>
            <Link
              to="/platforms"
              className="text-xs font-bold text-[#FF8E3C] hover:underline flex items-center gap-1"
            >
              Manage ({profiles.length}) <ArrowRight size={13} />
            </Link>
          </div>

          {profiles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#E9E2D8] bg-white p-12 text-center">
              <Code2 size={36} className="mx-auto text-[#FFA057]" />
              <h3 className="mt-4 text-base font-bold text-[#171717]">No platforms connected yet</h3>
              <p className="mt-1 text-xs text-[#7A7A7A] max-w-sm mx-auto">
                Connect your LeetCode, Codeforces, HackerRank, or CodeChef profiles to see unified
                metrics and ratings.
              </p>
              <Link
                to="/platforms"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#FFD05A] px-5 py-2.5 text-xs font-bold text-[#171717] hover:bg-[#FFA057] transition shadow-xs"
              >
                <Plus size={14} /> Connect Coding Profiles
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profiles.map((profile) => (
                <div
                  key={profile.platformId}
                  className="rounded-3xl border border-[#E9E2D8] bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0BE] font-black text-xs text-[#171717]">
                          {profile.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-[#171717]">{profile.name}</h3>
                          <p className="text-[11px] text-[#7A7A7A]">@{profile.handle}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#E8F8EE] px-2.5 py-0.5 text-[10px] font-bold text-[#16A34A]">
                        Synced
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#F2ECE4] pt-3">
                      <div className="rounded-xl bg-[#FFFBF5] p-2.5 border border-[#E9E2D8]">
                        <p className="text-[10px] text-[#7A7A7A] font-bold">Solved</p>
                        <p className="text-base font-black text-[#171717] mt-0.5">
                          {profile.solved ?? "—"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#FFFBF5] p-2.5 border border-[#E9E2D8]">
                        <p className="text-[10px] text-[#7A7A7A] font-bold">Rating</p>
                        <p className="text-base font-black text-[#171717] mt-0.5">
                          {profile.rating ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F2ECE4] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#7A7A7A]">
                      {profile.rank ? `Rank: ${profile.rank}` : "Active"}
                    </span>
                    <Link
                      to="/platforms"
                      className="font-bold text-[#FF8E3C] hover:underline text-[11px]"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Hub Shortcuts */}
          <div className="rounded-3xl border border-[#E9E2D8] bg-white p-6 shadow-xs">
            <h3 className="text-sm font-black text-[#171717] mb-3">Quick Navigation Hub</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/contests"
                className="flex items-center gap-3 rounded-2xl border border-[#E9E2D8] bg-[#FFFBF5] p-3.5 hover:bg-[#FFF0DA] transition shadow-xs"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFE2DE] text-[#F35F67]">
                  <Trophy size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171717]">Contests</h4>
                  <p className="text-[10px] text-[#7A7A7A]">Global & Local</p>
                </div>
              </Link>

              <Link
                to="/ide"
                className="flex items-center gap-3 rounded-2xl border border-[#E9E2D8] bg-[#FFFBF5] p-3.5 hover:bg-[#FFF0DA] transition shadow-xs"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF5FF] text-[#2563EB]">
                  <Code2 size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171717]">Online IDE</h4>
                  <p className="text-[10px] text-[#7A7A7A]">Run JS, C++, Python</p>
                </div>
              </Link>

              <Link
                to="/roadmaps"
                className="flex items-center gap-3 rounded-2xl border border-[#E9E2D8] bg-[#FFFBF5] p-3.5 hover:bg-[#FFF0DA] transition shadow-xs"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0BE] text-[#D97706]">
                  <Zap size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171717]">Roadmaps</h4>
                  <p className="text-[10px] text-[#7A7A7A]">DSA & System Design</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Account Details & Profile Card */}
        <div className="space-y-6">
          {/* Account Overview Box */}
          <div className="rounded-3xl border border-[#E9E2D8] bg-white p-6 shadow-xs">
            <h3 className="text-sm font-black text-[#171717] pb-3 border-b border-[#F2ECE4]">
              Account Overview
            </h3>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#7A7A7A]">Full Name</span>
                <span className="font-bold text-[#171717]">{user?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#7A7A7A]">Email</span>
                <span className="font-bold text-[#171717] truncate max-w-[180px]">
                  {user?.email}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#7A7A7A]">User ID</span>
                <span className="font-mono text-[10px] text-[#7A7A7A] truncate max-w-[160px]">
                  {user?.id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#7A7A7A]">Account Status</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F8EE] px-2 py-0.5 text-[10px] font-bold text-[#16A34A]">
                  Authenticated
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F2ECE4]">
              <Link
                to="/settings"
                className="flex items-center justify-center gap-1.5 w-full rounded-2xl border border-[#E9E2D8] bg-[#FFFBF5] py-2.5 text-xs font-bold text-[#171717] hover:bg-[#FFF0DA] transition shadow-xs"
              >
                Account Settings
              </Link>
            </div>
          </div>

          {/* Profile completion prompt */}
          <div className="rounded-3xl border border-[#FED7B2] bg-gradient-to-b from-[#FFF4E6] to-[#FEEBD9] p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#EA580C] shadow-xs">
                🔥
              </div>
              <div>
                <h4 className="text-sm font-black text-[#171717]">Build your coding profile</h4>
                <p className="text-[11px] text-[#5F5F5F]">Connect a supported public profile to see live statistics.</p>
              </div>
            </div>

            <p className="text-xs text-[#5F5F5F] leading-relaxed">
              Your dashboard only shows statistics returned by the connected platforms.
            </p>

            <Link
              to="/platforms"
              className="mt-4 flex items-center justify-center gap-1.5 rounded-2xl bg-[#171717] py-2.5 text-xs font-bold text-white hover:bg-black transition shadow-xs"
            >
              Connect a Platform
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
