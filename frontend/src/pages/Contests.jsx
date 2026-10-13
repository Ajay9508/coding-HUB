import { useState, useMemo, useEffect } from "react";
import {
  Radio,
  Clock,
  Calendar,
  Bell,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";
import AppLayout from "../components/organisms/AppLayout";
import ContestCard from "../components/molecules/ContestCard";
import ContestRow from "../components/molecules/ContestRow";
import ContestCalendarWidget from "../components/molecules/ContestCalendarWidget";
import {
  RecommendedForYouWidget,
  YourRemindersWidget,
  SyncGoogleCalendarWidget,
} from "../components/molecules/ContestSideWidgets";
import { PlatformLogo } from "../components/molecules/PlatformCard";
import { useAuth } from "../context/useAuth";
import api from "../api";

const platformFilterOptions = [
  { id: "all", label: "All", icon: "all" },
  { id: "Codeforces", label: "Codeforces", logoType: "codeforces" },
  { id: "LeetCode", label: "LeetCode", logoType: "leetcode" },
  { id: "CodeChef", label: "CodeChef", logoType: "codechef" },
  { id: "AtCoder", label: "AtCoder", logoType: "atcoder" },
  { id: "HackerRank", label: "HackerRank", logoType: "hackerrank" },
];

const statusFilterOptions = [
  { id: "all", label: "All" },
  { id: "live", label: "Live Now" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "reminders", label: "My Reminders" },
];

const Contests = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [reminders, setReminders] = useState([]);
  const [summary, setSummary] = useState({ live: 0, next24Hours: 0, thisWeek: 0 });
  useEffect(() => {
    let active = true;
    Promise.all([
        api.get("/contests", { params: { limit: 100 } }),
        userId ? api.get("/contests/reminders") : Promise.resolve({ data: { reminders: [] } }),
    ]).then(([{ data: contestData }, reminderData]) => {
      if (!active) return;
      setContests(contestData.contests.map((contest) => ({ ...contest, tags: contest.tags ?? [], logoType: contest.logoType ?? contest.platform?.toLowerCase().replace(/[^a-z]/g, ""), subtitle: contest.subtitle ?? contest.platform })));
      setSummary(contestData.summary ?? { live: 0, next24Hours: 0, thisWeek: 0 });
      setReminders(reminderData.data.reminders);
      setError("");
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || "Could not load contests.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [userId]);

  const toggleReminder = async (contestId) => {
    if (!user) {
      setError("Sign in to save contest reminders.");
      return;
    }
    setError("");
    try {
      if (reminders.includes(contestId)) await api.delete(`/contests/${contestId}/reminder`);
      else await api.put(`/contests/${contestId}/reminder`);
      const { data } = await api.get("/contests/reminders");
      setReminders(data.reminders);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update this reminder.");
    }
  };

  // Filtered contest list
  const filteredContests = useMemo(() => {
    return contests.filter((contest) => {
      // Platform filter
      const matchesPlatform =
        selectedPlatform === "all" || contest.platform === selectedPlatform;

      // Status filter
      let matchesStatus = true;
      if (selectedStatus === "reminders") {
        matchesStatus = reminders.includes(contest.id);
      } else if (selectedStatus !== "all") {
        matchesStatus = contest.status === selectedStatus;
      }

      // Search query
      const matchesSearch =
        searchQuery.trim() === "" ||
        contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contest.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contest.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contest.tags.some((tag) =>
          tag.label.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesPlatform && matchesStatus && matchesSearch;
    });
  }, [contests, selectedPlatform, selectedStatus, searchQuery, reminders]);

  return (
    <AppLayout searchValue={searchQuery} onSearchChange={setSearchQuery}>
      {error && <p role="alert" className="mb-5 rounded-xl bg-[#FFE2DE] p-3 text-sm text-[#B42318]">{error}</p>}
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#FED7B2] bg-gradient-to-r from-[#FFF4E6] via-[#FEEBD9] to-[#FEDBC0] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {/* Big Golden Trophy */}
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-b from-[#FFE8B2] to-[#FFD05A] text-3xl sm:text-4xl shadow-sm border-2 border-white/80">
              🏆
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#171717] tracking-tight">
                Coding Contests
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#5F5F5F] max-w-xl leading-relaxed">
                Discover upcoming and ongoing coding contests from top platforms.
                Sharpen your skills, climb the rankings and achieve your goals!
              </p>
            </div>
          </div>

          {/* Right illustration & doodle */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
            <div className="text-right">
              <span className="font-caveat text-sm font-bold text-[#FF8E3C] italic block">
                Better Code,
              </span>
              <span className="font-caveat text-base font-extrabold text-[#EA580C] italic block">
                Bigger Dreams ✨
              </span>
            </div>

            <div className="relative flex h-20 w-24 items-center justify-center rounded-2xl bg-white/60 backdrop-blur-xs border border-white p-2">
              <div className="text-3xl">👨‍💻</div>
              <span className="absolute -top-1 -right-1 text-xs">🏔️</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Quick Stat Metric Cards */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Live Now */}
        <div className="rounded-3xl border border-[#E9E2D8] bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFE9E9] text-[#EF4444]">
            <Radio size={22} className="animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7A7A7A]">Live Now</p>
            <h2 className="text-2xl font-black text-[#171717]">{summary.live}</h2>
            <p className="text-[11px] text-[#9A9A9A] truncate">Contests are live right now</p>
          </div>
        </div>

        {/* Next 24 Hours */}
        <div className="rounded-3xl border border-[#E9E2D8] bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EBF5FF] text-[#2563EB]">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7A7A7A]">Next 24 Hours</p>
            <h2 className="text-2xl font-black text-[#171717]">{summary.next24Hours}</h2>
            <p className="text-[11px] text-[#9A9A9A] truncate">Contests starting soon</p>
          </div>
        </div>

        {/* This Week */}
        <div className="rounded-3xl border border-[#E9E2D8] bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF2E5] text-[#EA580C]">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7A7A7A]">This Week</p>
            <h2 className="text-2xl font-black text-[#171717]">{summary.thisWeek}</h2>
            <p className="text-[11px] text-[#9A9A9A] truncate">Total contests</p>
          </div>
        </div>

        {/* Saved Reminders */}
        <div className="rounded-3xl border border-[#E9E2D8] bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0BE] text-[#D97706]">
            <Bell size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7A7A7A]">Saved Reminders</p>
            <h2 className="text-2xl font-black text-[#171717]">{reminders.length}</h2>
            <p className="text-[11px] text-[#9A9A9A] truncate">Don't miss your favorites</p>
          </div>
        </div>
      </div>

      {/* Filter Row 1: Platform Pills + Search + View Switcher */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Platform Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {platformFilterOptions.map((opt) => {
            const isActive = selectedPlatform === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedPlatform(opt.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-2xl px-3.5 py-2 text-xs font-bold transition shadow-xs ${
                  isActive
                    ? "bg-[#FFD05A] text-[#171717]"
                    : "border border-[#E9E2D8] bg-white text-[#5F5F5F] hover:bg-[#FFF8EE] hover:text-[#171717]"
                }`}
              >
                {opt.id === "all" ? (
                  <span>🔥</span>
                ) : (
                  <div className="h-4 w-4 flex items-center justify-center">
                    <PlatformLogo type={opt.logoType} />
                  </div>
                )}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search input + View Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-56">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A9A]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contests..."
              className="h-10 w-full rounded-2xl border border-[#E9E2D8] bg-white pl-9 pr-3 text-xs text-[#171717] outline-none focus:border-[#FF8E3C]"
            />
          </div>

          <div className="flex items-center rounded-2xl border border-[#E9E2D8] bg-white p-1 shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                viewMode === "grid"
                  ? "bg-[#FFD05A] text-[#171717] shadow-xs"
                  : "text-[#7A7A7A] hover:text-[#171717]"
              }`}
            >
              <LayoutGrid size={13} />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                viewMode === "list"
                  ? "bg-[#FFD05A] text-[#171717] shadow-xs"
                  : "text-[#7A7A7A] hover:text-[#171717]"
              }`}
            >
              <List size={13} />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row 2: Status Filter Pills */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statusFilterOptions.map((opt) => {
          const isActive = selectedStatus === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedStatus(opt.id)}
              className={`whitespace-nowrap rounded-2xl px-4 py-1.5 text-xs font-bold transition ${
                isActive
                  ? "bg-[#FF8E3C] text-white shadow-xs"
                  : "border border-[#E9E2D8] bg-white text-[#7A7A7A] hover:bg-[#FFF8EE] hover:text-[#171717]"
              }`}
            >
              {opt.label}
              {opt.id === "reminders" && ` (${reminders.length})`}
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Layout (Contests Grid + Right Panel Widgets) */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Contests Grid or List */}
        <div className="xl:col-span-2 space-y-6">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-[#E9E2D8] bg-white p-12 text-center text-sm text-[#5F5F5F]">Loading contests…</div>
          ) : filteredContests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#E9E2D8] bg-white p-12 text-center">
              <Calendar size={36} className="mx-auto text-[#FFA057]" />
              <h3 className="mt-4 text-base font-bold text-[#171717]">No contests found</h3>
              <p className="mt-1 text-xs text-[#7A7A7A]">
                {contests.length === 0 ? "No contest feed is configured yet. Contests added through the API will appear here." : "Try adjusting your platform filters, status, or search keywords."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedPlatform("all");
                  setSelectedStatus("all");
                  setSearchQuery("");
                }}
                className="mt-4 rounded-2xl bg-[#FFD05A] px-5 py-2 text-xs font-bold text-[#171717] hover:bg-[#FFA057] transition"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredContests.map((contest) => (
                <ContestCard
                  key={contest.id}
                  contest={contest}
                  isSaved={reminders.includes(contest.id)}
                  onToggleReminder={toggleReminder}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredContests.map((contest) => (
                <ContestRow
                  key={contest.id}
                  contest={contest}
                  isSaved={reminders.includes(contest.id)}
                  onToggleReminder={toggleReminder}
                />
              ))}
            </div>
          )}

        </div>

        {/* Right 1 Column: Side Widgets */}
        <div className="space-y-5">
          {/* Calendar Widget */}
          <ContestCalendarWidget contests={contests} />

          {/* Recommended for You Widget */}
          <RecommendedForYouWidget
            contests={contests}
            onSelectContest={(contest) => {
              setSearchQuery(contest.title);
            }}
          />

          {/* Your Reminders Widget */}
          <YourRemindersWidget
            reminders={reminders}
            contests={contests}
            onToggleReminder={toggleReminder}
          />

          {/* Sync Google Calendar Widget */}
          <SyncGoogleCalendarWidget />
        </div>
      </div>
    </AppLayout>
  );
};

export default Contests;
