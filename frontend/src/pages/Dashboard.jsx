import { useMemo, useState } from "react";
import { CheckCircle2, Code2, RefreshCw, Trophy } from "lucide-react";
import AppLayout from "../components/organisms/AppLayout";
import { useAuth } from "../context/useAuth";

const initialProfiles = [
  { name: "LeetCode", handle: "coder", solved: 184, rating: 1682, category: "DSA", synced: true },
  { name: "Codeforces", handle: "coder", solved: 96, rating: 1210, category: "Competitive", synced: true },
  { name: "CodeChef", handle: "coder", solved: 73, rating: 1435, category: "Competitive", synced: false },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState("Just now");

  const totals = useMemo(() => ({
    solved: profiles.reduce((sum, profile) => sum + profile.solved, 0),
    averageRating: Math.round(
      profiles.reduce((sum, profile) => sum + profile.rating, 0) / profiles.length,
    ),
  }), [profiles]);

  const syncProfiles = () => {
    setIsSyncing(true);
    window.setTimeout(() => {
      setProfiles((currentProfiles) =>
        currentProfiles.map((profile) => ({ ...profile, synced: true })),
      );
      setLastSynced("Just now");
      setIsSyncing(false);
    }, 450);
  };

  const stats = [
    { label: "Problems solved", value: totals.solved, icon: <Code2 size={21} /> },
    { label: "Average rating", value: totals.averageRating, icon: <Trophy size={21} /> },
    { label: "Connected platforms", value: profiles.length, icon: <CheckCircle2 size={21} /> },
  ];

  return (
    <AppLayout>
      <div>
        <p className="font-semibold text-[#F35F67]">DASHBOARD</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#171717]">
              Welcome, {user?.name || "Developer"} 👋
            </h1>
            <p className="mt-2 text-sm text-[#5F5F5F]">
              Your coding progress, collected in one clear view.
            </p>
          </div>
          <button
            type="button"
            onClick={syncProfiles}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#FFD05A] px-5 py-3 text-sm font-bold text-[#171717] transition hover:bg-[#FFA057] disabled:cursor-not-allowed disabled:opacity-70 shadow-xs"
          >
            <RefreshCw className={isSyncing ? "animate-spin" : ""} size={18} />
            {isSyncing ? "Syncing..." : "Sync profiles"}
          </button>
        </div>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Coding statistics">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-3xl border border-[#E9E2D8] bg-white p-6 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0DA] text-[#F35F67]">
                {stat.icon}
              </div>
              <p className="mt-5 text-xs text-[#5F5F5F] font-semibold">{stat.label}</p>
              <p className="mt-1 text-3xl font-black text-[#171717]">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-[#171717]">Connected platforms</h2>
              <p className="mt-1 text-xs text-[#5F5F5F]">Last synced: {lastSynced}</p>
            </div>
            <span className="rounded-full bg-[#FFE2DE] px-3 py-1 text-xs font-bold text-[#F35F67]">
              {profiles.length} connected
            </span>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <article key={profile.name} className="rounded-3xl border border-[#E9E2D8] bg-white p-6 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0DA] font-black text-[#F35F67]">
                      {profile.name.slice(0, 2).toUpperCase()}
                    </span>
                    <h3 className="mt-4 text-xl font-black text-[#171717]">{profile.name}</h3>
                    <p className="text-xs text-[#5F5F5F] mt-0.5">@{profile.handle} · {profile.category}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      profile.synced
                        ? "bg-[#E5F8E9] text-[#247A3D]"
                        : "bg-[#FFF0DA] text-[#9A5B00]"
                    }`}
                  >
                    {profile.synced ? "Synced" : "Needs sync"}
                  </span>
                </div>
                <dl className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#FFFBF5] p-3 border border-[#F2ECE4]">
                    <dt className="text-xs text-[#5F5F5F]">Solved</dt>
                    <dd className="mt-1 font-bold text-base text-[#171717]">{profile.solved}</dd>
                  </div>
                  <div className="rounded-2xl bg-[#FFFBF5] p-3 border border-[#F2ECE4]">
                    <dt className="text-xs text-[#5F5F5F]">Rating</dt>
                    <dd className="mt-1 font-bold text-base text-[#171717]">{profile.rating}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
