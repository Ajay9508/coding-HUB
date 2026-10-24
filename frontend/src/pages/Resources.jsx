import { useState } from "react";
import {
  Search,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import AppLayout from "../components/organisms/AppLayout";

const CURATED_RESOURCES = [
  {
    id: "res-1",
    title: "CP-Algorithms Archive",
    description: "The definitive encyclopedia of algorithms and data structures with C++ implementations.",
    category: "Algorithms",
    difficulty: "Advanced",
    url: "https://cp-algorithms.com/",
    tags: ["Algorithms", "Math", "Graphs"],
  },
  {
    id: "res-2",
    title: "The System Design Primer",
    description: "Learn how to design large-scale systems with interactive visual flashcards and diagrams.",
    category: "System Design",
    difficulty: "Intermediate",
    url: "https://github.com/donnemartin/system-design-primer",
    tags: ["Distributed Systems", "Architecture", "Cloud"],
  },
  {
    id: "res-3",
    title: "NeetCode 150 Problem Map",
    description: "Curated roadmap of the most commonly asked technical interview questions sorted by pattern.",
    category: "Interview Prep",
    difficulty: "Intermediate",
    url: "https://neetcode.io/",
    tags: ["Patterns", "LeetCode", "Interviews"],
  },
  {
    id: "res-4",
    title: "Big-O Cheat Sheet",
    description: "Quick reference card for time and space complexities of all major algorithms and data structures.",
    category: "Cheat Sheets",
    difficulty: "Beginner",
    url: "https://www.bigocheatsheet.com/",
    tags: ["Big-O", "Sorting", "Complexity"],
  },
  {
    id: "res-5",
    title: "CS50's Introduction to Computer Science",
    description: "Harvard's world-renowned open course on computational thinking, memory, and algorithms.",
    category: "Tutorials",
    difficulty: "Beginner",
    url: "https://cs50.harvard.edu/x/",
    tags: ["C", "Python", "Harvard"],
  },
  {
    id: "res-6",
    title: "Visualgo: Visualizing Algorithms",
    description: "Interactive visual animations showing step-by-step executions of trees, sorting, and graphs.",
    category: "Algorithms",
    difficulty: "Beginner",
    url: "https://visualgo.net/",
    tags: ["Animations", "Visualizer", "Graphs"],
  },
  {
    id: "res-7",
    title: "Design Patterns in Object-Oriented Software",
    description: "Refactoring Guru's clear visual guide to Creational, Structural, and Behavioral patterns.",
    category: "System Design",
    difficulty: "Intermediate",
    url: "https://refactoring.guru/design-patterns",
    tags: ["OOP", "Design Patterns", "Clean Code"],
  },
  {
    id: "res-8",
    title: "Linux Command Line Cheat Sheet",
    description: "Essential bash commands, pipes, grep, sed, awk, and shell scripting shortcuts.",
    category: "Cheat Sheets",
    difficulty: "Beginner",
    url: "https://explainshell.com/",
    tags: ["Linux", "Bash", "Terminal"],
  },
];

const CATEGORIES = ["All", "Algorithms", "System Design", "Interview Prep", "Cheat Sheets", "Tutorials"];

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("codinghub_bookmarked_resources") || "{}");
    } catch {
      return {};
    }
  });

  const toggleBookmark = (id) => {
    const updated = { ...bookmarks, [id]: !bookmarks[id] };
    setBookmarks(updated);
    try {
      localStorage.setItem("codinghub_bookmarked_resources", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage error", e);
    }
  };

  const filtered = CURATED_RESOURCES.filter((res) => {
    const matchesCategory = activeCategory === "All" || res.category === activeCategory;
    const matchesSearch =
      search.trim() === "" ||
      res.title.toLowerCase().includes(search.toLowerCase()) ||
      res.description.toLowerCase().includes(search.toLowerCase()) ||
      res.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <AppLayout>
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#FED7B2] bg-gradient-to-r from-[#FFF4E6] via-[#FEEBD9] to-[#FEDBC0] p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-b from-[#FFE8B2] to-[#FFD05A] text-3xl shadow-sm border-2 border-white/80">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#FFE2DE] px-3 py-0.5 text-xs font-black text-[#F35F67]">
                  CURATED DIRECTORY
                </span>
                <span className="rounded-full bg-[#E8F8EE] px-2.5 py-0.5 text-[11px] font-bold text-[#16A34A]">
                  Verified High-Quality
                </span>
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
                Developer Resources & Cheatsheets
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#5F5F5F] max-w-xl">
                The finest articles, algorithmic references, system design whitepapers, and interview
                tools chosen by competitive programmers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                activeCategory === cat
                  ? "bg-[#FFD05A] text-[#171717]"
                  : "border border-[#E9E2D8] bg-white text-[#5F5F5F] hover:bg-[#FFF8EE]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7A7A]" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#E9E2D8] bg-white pl-9 pr-3 py-2 text-xs text-[#171717] outline-none focus:border-[#FFD05A]"
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((res) => {
          const isSaved = Boolean(bookmarks[res.id]);

          return (
            <div
              key={res.id}
              className="flex flex-col justify-between rounded-3xl border border-[#E9E2D8] bg-white p-6 shadow-xs hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-full bg-[#FFF0BE] px-3 py-1 text-xs font-bold text-[#171717]">
                    {res.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(res.id)}
                    className={`rounded-lg p-1.5 transition ${
                      isSaved
                        ? "text-[#F35F67] bg-[#FFE2DE]"
                        : "text-[#7A7A7A] hover:bg-[#FFF8EE]"
                    }`}
                  >
                    <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                  </button>
                </div>

                <h3 className="text-base font-black text-[#171717]">{res.title}</h3>
                <p className="mt-2 text-xs text-[#5F5F5F] leading-relaxed">
                  {res.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {res.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg bg-[#FFFBF5] border border-[#E9E2D8] px-2 py-0.5 text-[10px] font-bold text-[#5F5F5F]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F2ECE4] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#7A7A7A]">Level: {res.difficulty}</span>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-[#171717] px-4 py-2 text-xs font-bold text-white hover:bg-black transition shadow-xs"
                >
                  Visit Guide <ExternalLink size={12} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Resources;
