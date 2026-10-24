import { useState, useEffect } from "react";
import { Calendar, Clock, Users, Bell, BellRing, CalendarPlus, ExternalLink, CheckCircle } from "lucide-react";
import { PlatformLogo } from "./PlatformCard";
import { generateGoogleCalendarLink } from "../../utils/calendar";

const tagStyles = {
  orange: "bg-[#FFF2E5] text-[#EA580C]",
  purple: "bg-[#F5EEFF] text-[#9333EA]",
  blue: "bg-[#EBF5FF] text-[#2563EB]",
  green: "bg-[#ECFDF5] text-[#059669]",
  cyan: "bg-[#ECFEFF] text-[#0891B2]",
};

const ContestCard = ({ contest, isSaved = false, onToggleReminder }) => {
  // Live ticking countdown
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!contest.countdown) return 0;
    return (
      (contest.countdown.hours || 0) * 3600 +
      (contest.countdown.minutes || 0) * 60 +
      (contest.countdown.seconds || 0)
    );
  });

  useEffect(() => {
    if (!contest.countdown || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [contest.countdown, secondsLeft]);

  const hrs = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const mins = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  const isLive = contest.status === "live";
  const isUpcoming = contest.status === "upcoming";
  const isCompleted = contest.status === "completed";

  return (
    <article className="flex flex-col justify-between rounded-3xl border border-[#E9E2D8] bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition-all">
      <div>
        {/* Header: Platform & Status Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#F2ECE4] bg-[#FFFBF5]">
              <PlatformLogo type={contest.logoType} />
            </div>
            <span className="text-sm font-bold text-[#171717]">{contest.platform}</span>
          </div>

          {/* Status Badge */}
          {isLive && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE9E9] px-3 py-1 text-[11px] font-black text-[#EF4444]">
              <span className="h-2 w-2 rounded-full bg-[#EF4444] animate-pulse" />
              LIVE NOW
            </span>
          )}
          {isUpcoming && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F8F0] px-3 py-1 text-[11px] font-bold text-[#10B981]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              UPCOMING
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-semibold text-[#6B7280]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
              COMPLETED
            </span>
          )}
        </div>

        {/* Title & Subtitle */}
        <h3 className="mt-4 text-lg font-black text-[#171717] line-clamp-1">
          {contest.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-[#7A7A7A]">
          <span>{contest.subtitle}</span>
          {contest.isRated && (
            <>
              <span>•</span>
              <span className="rounded-md bg-[#F3EEFF] px-2 py-0.5 text-[10px] font-bold text-[#7C3AED]">
                Rated
              </span>
            </>
          )}
        </div>

        {/* Schedule Details Row */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-[#5F5F5F] border-y border-[#F2ECE4] py-3">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-[#9A9A9A] shrink-0" />
            <span className="truncate">{contest.startDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-[#9A9A9A] shrink-0" />
            <span>{contest.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
            <Users size={13} className="text-[#9A9A9A] shrink-0" />
            <span>{contest.participants}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          {contest.tags.map((tag) => (
            <span
              key={tag.label}
              className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${
                tagStyles[tag.variant] || tagStyles.orange
              }`}
            >
              {tag.label}
            </span>
          ))}
        </div>

        {/* Countdown Box */}
        <div className="mt-4 rounded-2xl bg-[#FFFBF5] border border-[#F2ECE4] p-3 text-center">
          {isCompleted ? (
            <div className="flex items-center justify-center gap-2 py-1 text-xs font-semibold text-[#5F5F5F]">
              <CheckCircle size={16} className="text-[#10B981]" />
              <span>Contest Ended • View Results →</span>
            </div>
          ) : contest.countdown ? (
            <div>
              <p className="text-[10px] font-semibold text-[#7A7A7A]">
                {isLive ? "Ends in" : "Starts in"}
              </p>
              <div
                className={`mt-1 flex items-center justify-center gap-2 text-xl font-black tracking-wider ${
                  isLive ? "text-[#EF4444]" : "text-[#10B981]"
                }`}
              >
                <span>{hrs}</span>
                <span className="text-sm opacity-60">:</span>
                <span>{mins}</span>
                <span className="text-sm opacity-60">:</span>
                <span>{secs}</span>
              </div>
              <div className="flex justify-center gap-6 text-[9px] font-medium text-[#9A9A9A]">
                <span>hrs</span>
                <span>min</span>
                <span>sec</span>
              </div>
            </div>
          ) : (
            <p className="py-2 text-xs font-semibold text-[#5F5F5F]">
              Check the official contest page for the current schedule.
            </p>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-5 pt-3 border-t border-[#F2ECE4] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Remind Me button */}
          <button
            type="button"
            onClick={() => onToggleReminder && onToggleReminder(contest.id)}
            title={isSaved ? "Remove reminder" : "Save reminder"}
            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold transition ${
              isSaved
                ? "bg-[#FFF0BE] text-[#171717]"
                : "border border-[#E9E2D8] text-[#5F5F5F] hover:bg-[#FFF4E5]"
            }`}
          >
            {isSaved ? (
              <BellRing size={14} className="text-[#FF8E3C]" />
            ) : (
              <Bell size={14} />
            )}
            <span className="hidden sm:inline">{isSaved ? "Saved" : "Remind Me"}</span>
          </button>

          {/* Add to Calendar button */}
          <a
            href={generateGoogleCalendarLink(contest)}
            target="_blank"
            rel="noopener noreferrer"
            title="Add to Google Calendar"
            className="inline-flex items-center gap-1 rounded-xl border border-[#E9E2D8] px-2.5 py-2 text-xs font-semibold text-[#5F5F5F] hover:bg-[#FFF4E5] transition"
          >
            <CalendarPlus size={14} />
            <span className="hidden md:inline">Calendar</span>
          </a>
        </div>

        {/* Primary CTA */}
        {isLive ? (
          <a
            href={contest.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF8E3C] px-4 py-2 text-xs font-bold text-white hover:bg-[#EA580C] transition shadow-xs"
          >
            Join Now
            <ExternalLink size={13} />
          </a>
        ) : isUpcoming ? (
          <a
            href={contest.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF8E3C] px-4 py-2 text-xs font-bold text-white hover:bg-[#EA580C] transition shadow-xs"
          >
            Register
            <ExternalLink size={13} />
          </a>
        ) : (
          <a
            href={contest.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9E2D8] bg-[#FFFBF5] px-3.5 py-2 text-xs font-bold text-[#171717] hover:bg-[#FFF4E5] transition"
          >
            View Details
          </a>
        )}
      </div>
    </article>
  );
};

export default ContestCard;
