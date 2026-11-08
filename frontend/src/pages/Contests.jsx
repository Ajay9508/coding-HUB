import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, LayoutGrid, List, Plus, Search, X } from "lucide-react";
import AppLayout from "../components/organisms/AppLayout";
import ContestCard from "../components/molecules/ContestCard";
import ContestRow from "../components/molecules/ContestRow";
import ContestCalendarWidget from "../components/molecules/ContestCalendarWidget";
import { YourRemindersWidget } from "../components/molecules/ContestSideWidgets";
import { useAuth } from "../context/useAuth";
import api from "../api";

const toContestView = (contest) => {
  const start = new Date(contest.startAt ?? contest.startDate);
  return {
    ...contest,
    startDate: Number.isNaN(start.getTime()) ? "Not reported" : start.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    startTime: Number.isNaN(start.getTime()) ? "" : start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    subtitle: contest.description || contest.subtitle || contest.platform,
    duration: contest.duration || "Not reported",
    participants: contest.participants ?? "Not reported",
    tags: Array.isArray(contest.tags) ? contest.tags : [],
    logoType: contest.logoType || contest.platform?.toLowerCase().replace(/[^a-z]/g, ""),
  };
};

const Contests = () => {
  const { user } = useAuth();
  const [contests, setContests] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [platform, setPlatform] = useState("all");
  const [status, setStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", platform: "", startAt: "", url: "", duration: "" });

  const loadContests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/contests", { params: { limit: 100 } });
      setContests((data.contests || []).map(toContestView));
      if (user) {
        const reminderResponse = await api.get("/contests/reminders");
        setReminders(reminderResponse.data.reminders || []);
      } else {
        setReminders([]);
      }
      setError("");
    } catch (requestError) {
      setContests([]);
      setError(requestError.response?.data?.detail || "Could not load contests. Check that the API is running.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadContests();
    }, 0);
    return () => window.clearTimeout(task);
  }, [loadContests]);

  const platforms = useMemo(
    () => [...new Set(contests.map((contest) => contest.platform).filter(Boolean))].sort(),
    [contests],
  );

  const filteredContests = useMemo(
    () => contests.filter((contest) => {
      const matchesPlatform = platform === "all" || contest.platform === platform;
      const matchesStatus = status === "all" || (status === "reminders" ? reminders.includes(contest.id) : contest.status === status);
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || [contest.title, contest.platform, contest.subtitle].filter(Boolean).some((value) => value.toLowerCase().includes(query));
      return matchesPlatform && matchesStatus && matchesSearch;
    }),
    [contests, platform, reminders, searchQuery, status],
  );

  const toggleReminder = async (contestId) => {
    if (!user) {
      setError("Sign in to save a contest reminder.");
      return;
    }
    try {
      if (reminders.includes(contestId)) await api.delete(`/contests/${contestId}/reminder`);
      else await api.put(`/contests/${contestId}/reminder`);
      const { data } = await api.get("/contests/reminders");
      setReminders(data.reminders || []);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not update your reminder.");
    }
  };

  const createContest = async (event) => {
    event.preventDefault();
    if (!user) {
      setError("Sign in before creating a contest.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/contests", {
        title: form.title.trim(),
        platform: form.platform.trim(),
        startAt: new Date(form.startAt).toISOString(),
        url: form.url.trim(),
        duration: form.duration.trim() || undefined,
      }, { headers: { "Idempotency-Key": crypto.randomUUID() } });
      setForm({ title: "", platform: "", startAt: "", url: "", duration: "" });
      setShowCreate(false);
      await loadContests();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not create this contest.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout searchValue={searchQuery} onSearchChange={setSearchQuery}>
      <section className="rounded-3xl border border-[#FED7B2] bg-gradient-to-r from-[#FFF4E6] via-[#FEEBD9] to-[#FEDBC0] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black tracking-wider text-[#F35F67]">CONTEST DIRECTORY</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#171717]">Coding Contests</h1>
            <p className="mt-2 max-w-xl text-sm text-[#5F5F5F]">Only contests saved to CodingHub are shown here—no sample schedules or simulated rounds.</p>
          </div>
          {user && <button type="button" onClick={() => setShowCreate(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#171717] px-5 py-3 text-xs font-bold text-white hover:bg-black"><Plus size={16} /> Add contest</button>}
        </div>
      </section>

      {error && <p role="alert" className="mt-6 rounded-2xl bg-[#FFE2DE] p-4 text-sm font-bold text-[#B42318]">{error}</p>}

      <section className="mt-6 flex flex-col gap-4 rounded-3xl border border-[#E9E2D8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <select value={platform} onChange={(event) => setPlatform(event.target.value)} className="rounded-xl border border-[#E9E2D8] bg-[#FFFBF5] px-3 py-2 text-xs font-bold text-[#171717]">
            <option value="all">All platforms</option>
            {platforms.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          {["all", "live", "upcoming", "completed", "reminders"].map((item) => <button key={item} type="button" onClick={() => setStatus(item)} className={`rounded-xl px-3 py-2 text-xs font-bold capitalize ${status === item ? "bg-[#FFD05A] text-[#171717]" : "border border-[#E9E2D8] text-[#5F5F5F]"}`}>{item === "reminders" ? "My reminders" : item}</button>)}
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto"><Search size={15} className="text-[#7A7A7A]" /><span className="text-xs text-[#7A7A7A]">{filteredContests.length} results</span><button type="button" aria-label="Grid view" onClick={() => setViewMode("grid")} className={`rounded-lg p-2 ${viewMode === "grid" ? "bg-[#FFF0BE]" : "text-[#7A7A7A]"}`}><LayoutGrid size={16} /></button><button type="button" aria-label="List view" onClick={() => setViewMode("list")} className={`rounded-lg p-2 ${viewMode === "list" ? "bg-[#FFF0BE]" : "text-[#7A7A7A]"}`}><List size={16} /></button></div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
        <div>{loading ? <div className="rounded-3xl border border-[#E9E2D8] bg-white p-12 text-center text-sm text-[#5F5F5F]">Loading contests…</div> : filteredContests.length === 0 ? <div className="rounded-3xl border border-dashed border-[#E9E2D8] bg-white p-12 text-center"><Calendar size={34} className="mx-auto text-[#FFA057]" /><h2 className="mt-3 text-lg font-bold text-[#171717]">No contests to show</h2><p className="mt-1 text-xs text-[#7A7A7A]">Add a verified contest or change the selected filters.</p></div> : viewMode === "grid" ? <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">{filteredContests.map((contest) => <ContestCard key={contest.id} contest={contest} isSaved={reminders.includes(contest.id)} onToggleReminder={toggleReminder} />)}</div> : <div className="space-y-4">{filteredContests.map((contest) => <ContestRow key={contest.id} contest={contest} isSaved={reminders.includes(contest.id)} onToggleReminder={toggleReminder} />)}</div>}</div>
        <aside className="space-y-5"><ContestCalendarWidget contests={contests} /><YourRemindersWidget reminders={reminders} contests={contests} onToggleReminder={toggleReminder} /></aside>
      </section>

      {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreate(false)}><form onSubmit={createContest} onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between border-b border-[#F2ECE4] pb-4"><h2 className="text-lg font-black text-[#171717]">Add a contest</h2><button type="button" aria-label="Close" onClick={() => setShowCreate(false)} className="rounded-lg p-1 text-[#5F5F5F]"><X size={18} /></button></div><div className="mt-5 space-y-4"><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Contest title" className="w-full rounded-xl border border-[#E9E2D8] bg-[#FFFBF5] px-3 py-2.5 text-sm" /><input required value={form.platform} onChange={(event) => setForm({ ...form, platform: event.target.value })} placeholder="Platform (for example, Codeforces)" className="w-full rounded-xl border border-[#E9E2D8] bg-[#FFFBF5] px-3 py-2.5 text-sm" /><input required type="datetime-local" value={form.startAt} onChange={(event) => setForm({ ...form, startAt: event.target.value })} className="w-full rounded-xl border border-[#E9E2D8] bg-[#FFFBF5] px-3 py-2.5 text-sm" /><input required type="url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="Official contest URL" className="w-full rounded-xl border border-[#E9E2D8] bg-[#FFFBF5] px-3 py-2.5 text-sm" /><input value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} placeholder="Duration (optional, for example 2 hours)" className="w-full rounded-xl border border-[#E9E2D8] bg-[#FFFBF5] px-3 py-2.5 text-sm" /></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-[#E9E2D8] px-4 py-2 text-xs font-bold text-[#5F5F5F]">Cancel</button><button disabled={submitting} type="submit" className="rounded-xl bg-[#171717] px-4 py-2 text-xs font-bold text-white disabled:opacity-60">{submitting ? "Adding…" : "Add contest"}</button></div></form></div>}
    </AppLayout>
  );
};

export default Contests;
