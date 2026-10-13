import { Compass, Bell, Clock, ArrowRight, Calendar } from "lucide-react";
import { PlatformLogo } from "./PlatformCard";

export const RecommendedForYouWidget = ({ contests, onSelectContest }) => {
  const recommendedList = contests.filter((c) => c.isRecommended).slice(0, 3);

  return (
    <div className="rounded-3xl border border-[#E9E2D8] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE4]">
        <div className="flex items-center gap-2">
          <Compass size={18} className="text-[#FF8E3C]" />
          <h3 className="text-sm font-black text-[#171717]">Recommended for You</h3>
        </div>
        <span className="text-xs font-bold text-[#FF8E3C] hover:underline cursor-pointer flex items-center gap-0.5">
          View All <ArrowRight size={12} />
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {recommendedList.length === 0 && <p className="py-3 text-center text-xs text-[#9A9A9A]">No recommendations available yet.</p>}
        {recommendedList.map((contest) => (
          <div
            key={contest.id}
            onClick={() => onSelectContest && onSelectContest(contest)}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[#F2ECE4] bg-[#FFFBF5] p-3 hover:bg-[#FFF4E5] transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-[#E9E2D8]">
                <PlatformLogo type={contest.logoType} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#171717] truncate">{contest.title}</p>
                <p className="text-[11px] text-[#7A7A7A] mt-0.5">
                  {contest.status === "live" ? (
                    <span className="text-[#EF4444] font-semibold">Live</span>
                  ) : (
                    "Upcoming"
                  )}{" "}
                  • {contest.duration}
                </p>
              </div>
            </div>

            {contest.matchScore && <span className="shrink-0 rounded-lg bg-[#E8F8EE] px-2 py-0.5 text-[10px] font-black text-[#16A34A]">{contest.matchScore}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export const YourRemindersWidget = ({ reminders, contests, onToggleReminder }) => {
  const reminderContests = contests.filter((c) => reminders.includes(c.id));

  return (
    <div className="rounded-3xl border border-[#E9E2D8] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE4]">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-[#FF8E3C]" />
          <h3 className="text-sm font-black text-[#171717]">Your Reminders</h3>
        </div>
        <span className="text-xs font-bold text-[#FF8E3C] hover:underline cursor-pointer flex items-center gap-0.5">
          View All <ArrowRight size={12} />
        </span>
      </div>

      <div className="mt-3 space-y-2.5">
        {reminderContests.length === 0 ? (
          <p className="text-xs text-[#9A9A9A] py-3 text-center">
            No reminders set yet. Click 🔔 on any contest to save!
          </p>
        ) : (
          reminderContests.slice(0, 4).map((contest) => (
            <div
              key={contest.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[#F2ECE4] bg-white p-2.5 hover:bg-[#FFFBF5] transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#FFF0DA] text-[#FF8E3C]">
                  <Clock size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#171717] truncate">{contest.title}</p>
                  <p className="text-[10px] text-[#7A7A7A]">
                    {contest.startDate}, {contest.startTime}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleReminder && onToggleReminder(contest.id)}
                title="Remove reminder"
                className="shrink-0 text-[10px] font-bold text-[#F35F67] hover:underline px-1"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const SyncGoogleCalendarWidget = () => {
  const handleSyncAll = () => {
    // Open Google Calendar main URL in new tab
    window.open("https://calendar.google.com/calendar/", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-3xl border border-[#E9E2D8] bg-white p-5 shadow-xs">
      <div className="flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC]">
          <Calendar size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-black text-[#171717]">
            Sync with Google Calendar
          </h4>
          <p className="mt-1 text-[11px] text-[#7A7A7A] leading-relaxed">
            Open Google Calendar to add contests you want to track.
          </p>
        </div>
      </div>

      <div className="mt-4 pt-2">
        <button
          type="button"
          onClick={handleSyncAll}
          className="w-full rounded-2xl bg-[#FF8E3C] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#EA580C] transition shadow-xs"
        >
          Open Google Calendar
        </button>
      </div>
    </div>
  );
};
