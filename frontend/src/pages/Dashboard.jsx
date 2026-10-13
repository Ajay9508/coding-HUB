import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Code2, RefreshCw, Trophy } from "lucide-react";
import AppLayout from "../components/organisms/AppLayout";
import { useAuth } from "../context/useAuth";
import api from "../api";

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const { data } = await api.get("/dashboard");
      setDashboard(data.dashboard);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    api.get("/dashboard")
      .then(({ data }) => { if (active) { setDashboard(data.dashboard); setError(""); } })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Could not load your dashboard."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const profiles = dashboard?.connectedPlatforms ?? [];
  const syncProfiles = async () => {
    setSyncing(true);
    setError("");
    const results = [];
    for (const profile of profiles) {
      try { await api.post(`/platforms/${profile.platformId}/sync`); results.push(true); }
      catch { results.push(false); }
    }
    await loadDashboard();
    const failed = results.filter((result) => !result);
    if (failed.length) setError(`${failed.length} profile${failed.length === 1 ? "" : "s"} could not sync. See each profile for details.`);
    setSyncing(false);
  };
  const stats = [
    { label: "Problems solved", value: dashboard?.stats.problemsSolved ?? "—", icon: <Code2 size={21} /> },
    { label: "Average rating", value: dashboard?.stats.averageRating ?? "—", icon: <Trophy size={21} /> },
    { label: "Connected platforms", value: dashboard?.stats.connectedPlatforms ?? 0, icon: <CheckCircle2 size={21} /> },
  ];

  return (
    <AppLayout>
      <div>
        <p className="font-semibold text-[#F35F67]">DASHBOARD</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#171717]">Welcome, {user?.name || "Developer"} 👋</h1>
            <p className="mt-2 text-sm text-[#5F5F5F]">Your account data and connected coding profiles.</p>
          </div>
          <button type="button" onClick={profiles.length ? syncProfiles : loadDashboard} disabled={loading || syncing} className="inline-flex items-center gap-2 rounded-2xl bg-[#FFD05A] px-5 py-3 text-sm font-bold text-[#171717] transition hover:bg-[#FFA057] disabled:opacity-70 shadow-xs">
            <RefreshCw className={loading || syncing ? "animate-spin" : ""} size={18} /> {syncing ? "Syncing profiles…" : profiles.length ? "Sync all profiles" : "Refresh dashboard"}
          </button>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl bg-[#FFE2DE] p-3 text-sm text-[#B42318]">{error}</p>}

        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Coding statistics">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-3xl border border-[#E9E2D8] bg-white p-6 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0DA] text-[#F35F67]">{stat.icon}</div>
              <p className="mt-5 text-xs text-[#5F5F5F] font-semibold">{stat.label}</p>
              <p className="mt-1 text-3xl font-black text-[#171717]">{loading ? "…" : stat.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-2xl font-black text-[#171717]">Connected platforms</h2><p className="mt-1 text-xs text-[#5F5F5F]">Only profiles connected to your account appear here.</p></div>
            <span className="rounded-full bg-[#FFE2DE] px-3 py-1 text-xs font-bold text-[#F35F67]">{profiles.length} connected</span>
          </div>

          {loading ? <p className="mt-6 text-sm text-[#7A7A7A]">Loading your profiles…</p> : profiles.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-[#E9E2D8] bg-white p-8 text-center">
              <h3 className="font-bold text-[#171717]">No profiles connected yet</h3>
              <p className="mt-2 text-sm text-[#5F5F5F]">Connect a coding account to see it on your dashboard.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {profiles.map((profile) => (
                <article key={profile.platformId} className="rounded-3xl border border-[#E9E2D8] bg-white p-6 shadow-xs">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0DA] font-black text-[#F35F67]">{profile.name.slice(0, 2).toUpperCase()}</span>
                  <h3 className="mt-4 text-xl font-black text-[#171717]">{profile.name}</h3>
                  <p className="text-xs text-[#5F5F5F] mt-0.5">@{profile.handle}</p>
                  <dl className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#FFFBF5] p-3 border border-[#F2ECE4]"><dt className="text-xs text-[#5F5F5F]">Solved</dt><dd className="mt-1 font-bold text-base text-[#171717]">{profile.solved ?? "—"}</dd></div>
                    <div className="rounded-2xl bg-[#FFFBF5] p-3 border border-[#F2ECE4]"><dt className="text-xs text-[#5F5F5F]">Rating</dt><dd className="mt-1 font-bold text-base text-[#171717]">{profile.rating ?? "—"}</dd></div>
                  </dl>
                  <p className={`mt-3 text-xs ${profile.syncStatus === "error" ? "text-[#B42318]" : "text-[#7A7A7A]"}`}>{profile.syncError || (profile.lastSyncedAt ? `Last synced ${new Date(profile.lastSyncedAt).toLocaleString()}` : profile.syncStatus === "unavailable" ? "Automatic stats sync is unavailable" : "Stats have not synced yet")}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
