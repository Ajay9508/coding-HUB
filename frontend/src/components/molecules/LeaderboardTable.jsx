import { useState, useMemo } from "react";
import {
  Trophy,
  Clock,
  Download,
  ArrowUpDown,
  Search,
} from "lucide-react";

const LeaderboardTable = ({
  participants = [],
  contestName = "Local Contest Leaderboard",
  showExport = true,
  currentUserName = "",
}) => {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("rank");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    let list = [...participants];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.handle?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "rank" || sortField === "timeTaken" || sortField === "penalty") {
        return sortAsc ? valA - valB : valB - valA;
      }
      // For score or problemsSolved, higher is better
      return sortAsc ? valB - valA : valA - valB;
    });

    return list;
  }, [participants, search, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === "rank" || field === "timeTaken" || field === "penalty");
    }
  };

  const exportCSV = () => {
    const headers = ["Rank", "Name", "Handle", "Solved", "Total", "Time(m)", "Penalty", "Score"];
    const rows = filtered.map((p) => [
      p.rank,
      `"${p.name}"`,
      `"${p.handle || ""}"`,
      p.problemsSolved,
      p.totalProblems,
      p.timeTaken,
      p.penalty,
      p.score,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${contestName.replace(/\s+/g, "_")}_leaderboard.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2.5 py-0.5 text-xs font-black text-white shadow-xs">
          🥇 1st
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-gray-300 to-slate-400 px-2.5 py-0.5 text-xs font-black text-white shadow-xs">
          🥈 2nd
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-600 to-yellow-700 px-2.5 py-0.5 text-xs font-black text-white shadow-xs">
          🥉 3rd
        </span>
      );
    }
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF0BE] text-xs font-black text-[#171717]">
        {rank}
      </span>
    );
  };

  return (
    <div className="rounded-3xl border border-[#E9E2D8] bg-white p-6 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F2ECE4]">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="text-[#FFA057]" size={22} />
            <h2 className="text-xl font-black text-[#171717]">{contestName}</h2>
          </div>
          <p className="text-xs text-[#5F5F5F] mt-1">
            Real-time ranked standings based on solved problems, penalties, and speed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7A7A]" />
            <input
              type="text"
              placeholder="Search coder..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 w-44 rounded-xl border border-[#E9E2D8] bg-[#FFFBF5] pl-8 pr-3 text-xs text-[#171717] outline-none focus:border-[#FFD05A]"
            />
          </div>

          {showExport && (
            <button
              type="button"
              onClick={exportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-[#E9E2D8] bg-white px-3 py-2 text-xs font-bold text-[#171717] hover:bg-[#FFF0DA] transition shadow-xs"
            >
              <Download size={14} />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E9E2D8] text-[11px] font-bold text-[#7A7A7A] uppercase tracking-wider">
              <th
                className="py-3 px-3 cursor-pointer hover:text-[#171717]"
                onClick={() => handleSort("rank")}
              >
                <div className="flex items-center gap-1">
                  Rank <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="py-3 px-3">Participant</th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-[#171717]"
                onClick={() => handleSort("problemsSolved")}
              >
                <div className="flex items-center gap-1">
                  Solved <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-[#171717]"
                onClick={() => handleSort("score")}
              >
                <div className="flex items-center gap-1">
                  Score <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-[#171717]"
                onClick={() => handleSort("timeTaken")}
              >
                <div className="flex items-center gap-1">
                  Time <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-[#171717]"
                onClick={() => handleSort("penalty")}
              >
                <div className="flex items-center gap-1">
                  Penalty <ArrowUpDown size={12} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE4] text-xs">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#7A7A7A]">
                  No participants matched your search.
                </td>
              </tr>
            ) : (
              paginated.map((p) => {
                const isCurrent =
                  currentUserName &&
                  (p.name.toLowerCase() === currentUserName.toLowerCase() ||
                    p.handle?.toLowerCase() === currentUserName.toLowerCase());

                return (
                  <tr
                    key={p.rank + p.name}
                    className={`transition-colors ${
                      isCurrent
                        ? "bg-[#FFF8EE] font-bold border-l-4 border-l-[#FFA057]"
                        : "hover:bg-[#FFFBF5]"
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {getRankBadge(p.rank)}
                    </td>

                    {/* Participant */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFE2DE] text-xs font-black text-[#F35F67]">
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[#171717] flex items-center gap-1">
                            {p.name}
                            {isCurrent && (
                              <span className="text-[10px] text-[#EA580C] bg-[#FFF0BE] px-1.5 py-0.2 rounded-md">
                                You
                              </span>
                            )}
                          </div>
                          {p.handle && (
                            <div className="text-[11px] text-[#7A7A7A]">@{p.handle}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Solved */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#171717]">
                          {p.problemsSolved} / {p.totalProblems || 5}
                        </span>
                        <div className="w-16 h-2 rounded-full bg-[#E9E2D8] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#FFD05A] to-[#FFA057] rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (p.problemsSolved / (p.totalProblems || 5)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-3 font-black text-sm text-[#171717]">
                      <span className="inline-block rounded-xl bg-[#FFF0BE] px-2.5 py-1 text-[#171717]">
                        {p.score} pts
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-3 text-[#5F5F5F]">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-[#9A9A9A]" />
                        {p.timeTaken}m
                      </div>
                    </td>

                    {/* Penalty */}
                    <td className="py-3.5 px-3 text-[#F35F67]">
                      {p.penalty > 0 ? `+${p.penalty}m` : "0m"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#F2ECE4] text-xs">
          <p className="text-[#7A7A7A]">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} coders
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-[#E9E2D8] px-2.5 py-1 text-xs font-bold disabled:opacity-40 hover:bg-[#FFF0DA]"
            >
              Prev
            </button>
            <span className="px-2 font-bold text-[#171717]">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-[#E9E2D8] px-2.5 py-1 text-xs font-bold disabled:opacity-40 hover:bg-[#FFF0DA]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;
