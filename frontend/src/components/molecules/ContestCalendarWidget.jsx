import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dateKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const ContestCalendarWidget = ({ contests = [], onSelectDate }) => {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(null);
  const cells = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(firstDay);
    start.setDate(1 - firstDay.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return { date, current: date.getMonth() === month.getMonth() };
    });
  }, [month]);
  const contestDays = useMemo(() => new Set(contests.map((contest) => {
    const value = contest.startAt ?? contest.startDate;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : dateKey(date);
  }).filter(Boolean)), [contests]);

  return (
    <div className="rounded-3xl border border-[#E9E2D8] bg-white p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-[#F2ECE4] pb-3">
        <CalendarIcon size={18} className="text-[#FF8E3C]" />
        <h3 className="text-sm font-black text-[#171717]">Contest Calendar</h3>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-bold text-[#171717]">{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Previous month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="rounded-lg p-1 text-[#7A7A7A] hover:bg-[#FFF4E5]"><ChevronLeft size={16} /></button>
          <button type="button" aria-label="Next month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="rounded-lg p-1 text-[#7A7A7A] hover:bg-[#FFF4E5]"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 text-center text-[10px] font-bold text-[#9A9A9A]">
        {daysOfWeek.map((day) => <div key={day} className="py-1">{day}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-xs">
        {cells.map(({ date, current }, index) => {
          const key = dateKey(date);
          const isSelected = selected === key;
          const hasContest = contestDays.has(key);
          return (
            <button key={`${key}-${index}`} type="button" disabled={!current} onClick={() => { setSelected(key); onSelectDate?.(date); }} className={`relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-xs transition ${!current ? "cursor-default text-[#C5BEB5]" : isSelected ? "bg-[#FF8E3C] font-black text-white shadow-xs" : "font-medium text-[#171717] hover:bg-[#FFF0BE]"}`}>
              <span>{date.getDate()}</span>
              {hasContest && !isSelected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#FF8E3C]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ContestCalendarWidget;
