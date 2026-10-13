import { Calendar, Clock, Users, Bell, BellRing, ExternalLink, CalendarPlus } from "lucide-react";
import { PlatformLogo } from "./PlatformCard";
import { generateGoogleCalendarLink } from "../../utils/calendar";

const ContestRow = ({ contest, isSaved, onToggleReminder }) => {
  const isLive = contest.status === "live";
  const isUpcoming = contest.status === "upcoming";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-[#E9E2D8] bg-white p-5 shadow-xs hover:shadow-md transition">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#F2ECE4] bg-[#FFFBF5]">
          <PlatformLogo type={contest.logoType} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-[#171717] truncate">{contest.title}</h3>
            {isLive ? (
              <span className="shrink-0 rounded-full bg-[#FFE9E9] px-2.5 py-0.5 text-[10px] font-black text-[#EF4444]">
                • LIVE NOW
              </span>
            ) : isUpcoming ? (
              <span className="shrink-0 rounded-full bg-[#E8F8F0] px-2.5 py-0.5 text-[10px] font-bold text-[#10B981]">
                • UPCOMING
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-[10px] font-semibold text-[#6B7280]">
                • COMPLETED
              </span>
            )}
          </div>
          <p className="text-xs text-[#7A7A7A] mt-0.5">
            {contest.platform} • {contest.subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 text-xs pt-3 md:pt-0 border-t md:border-t-0 border-[#F2ECE4]">
        <div className="flex items-center gap-4 text-[#5F5F5F]">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-[#9A9A9A]" />
            <span>{contest.startDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-[#9A9A9A]" />
            <span>{contest.duration}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Users size={13} className="text-[#9A9A9A]" />
            <span>{contest.participants}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleReminder && onToggleReminder(contest.id)}
            title={isSaved ? "Remove reminder" : "Save reminder"}
            className={`rounded-xl p-2 border transition ${
              isSaved
                ? "bg-[#FFF0BE] border-[#FFD05A] text-[#171717]"
                : "border-[#E9E2D8] text-[#5F5F5F] hover:bg-[#FFF4E5]"
            }`}
          >
            {isSaved ? <BellRing size={15} className="text-[#FF8E3C]" /> : <Bell size={15} />}
          </button>

          <a
            href={generateGoogleCalendarLink(contest)}
            target="_blank"
            rel="noopener noreferrer"
            title="Add to Google Calendar"
            className="rounded-xl p-2 border border-[#E9E2D8] text-[#5F5F5F] hover:bg-[#FFF4E5] transition"
          >
            <CalendarPlus size={15} />
          </a>

          <a
            href={contest.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1 shadow-xs ${
              isLive || isUpcoming
                ? "bg-[#FF8E3C] text-white hover:bg-[#EA580C]"
                : "border border-[#E9E2D8] text-[#171717] hover:bg-[#FFF4E5]"
            }`}
          >
            {isLive ? "Join Now" : isUpcoming ? "Register" : "View Details"}
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContestRow;
