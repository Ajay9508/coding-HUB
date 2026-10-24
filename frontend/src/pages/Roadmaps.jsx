import { useState, useEffect } from "react";
import {
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import AppLayout from "../components/organisms/AppLayout";

const ROADMAPS_DATA = [
  {
    id: "dsa",
    title: "Data Structures & Algorithms Mastery",
    description:
      "Comprehensive journey from basic arrays and pointers to advanced trees, graphs, and dynamic programming.",
    icon: "⚡",
    color: "#FFA057",
    modules: [
      {
        id: "m1",
        title: "1. Fundamentals & Time Complexity",
        level: "Beginner",
        topics: [
          { id: "dsa-1", name: "Big-O Notation & Complexity Analysis", url: "https://en.wikipedia.org/wiki/Big_O_notation" },
          { id: "dsa-2", name: "Arrays, Dynamic Sizing & Amortized Analysis", url: "https://leetcode.com/explore/learn/card/fun-with-arrays/" },
          { id: "dsa-3", name: "Two-Pointers & Sliding Window Technique", url: "https://leetcode.com/tag/sliding-window/" },
          { id: "dsa-4", name: "Binary Search & Monotonic Predicates", url: "https://leetcode.com/tag/binary-search/" },
        ],
      },
      {
        id: "m2",
        title: "2. Linear & Non-Linear Structures",
        level: "Intermediate",
        topics: [
          { id: "dsa-5", name: "Singly & Doubly Linked Lists", url: "https://leetcode.com/tag/linked-list/" },
          { id: "dsa-6", name: "Stacks, Monotonic Stacks & Queues", url: "https://leetcode.com/tag/stack/" },
          { id: "dsa-7", name: "Binary Trees & BST Traversals (Pre/In/Post/Level)", url: "https://leetcode.com/tag/tree/" },
          { id: "dsa-8", name: "Binary Heap & Priority Queue Operations", url: "https://leetcode.com/tag/heap-priority-queue/" },
        ],
      },
      {
        id: "m3",
        title: "3. Advanced Graphs & Dynamic Programming",
        level: "Advanced",
        topics: [
          { id: "dsa-9", name: "BFS, DFS, Connected Components & Topological Sort", url: "https://leetcode.com/tag/graph/" },
          { id: "dsa-10", name: "Dijkstra, Bellman-Ford & Floyd-Warshall Algorithms", url: "https://cp-algorithms.com/graph/dijkstra.html" },
          { id: "dsa-11", name: "Disjoint Set Union (DSU / Kruskal's MST)", url: "https://cp-algorithms.com/data_structures/disjoint_set_union.html" },
          { id: "dsa-12", name: "Dynamic Programming (Knapsack, LCS, LIS, Interval DP)", url: "https://leetcode.com/tag/dynamic-programming/" },
        ],
      },
    ],
  },
  {
    id: "system-design",
    title: "System Design & Distributed Architecture",
    description:
      "Design highly scalable, fault-tolerant systems for millions of concurrent users.",
    icon: "🏗️",
    color: "#3B82F6",
    modules: [
      {
        id: "sd-m1",
        title: "1. Core Scalability Concepts",
        level: "Beginner",
        topics: [
          { id: "sd-1", name: "Vertical vs. Horizontal Scaling & Load Balancing", url: "https://github.com/donnemartin/system-design-primer" },
          { id: "sd-2", name: "CAP Theorem, PACELC & Consistency Models", url: "https://en.wikipedia.org/wiki/CAP_theorem" },
          { id: "sd-3", name: "Caching Strategies (Redis, Memcached, Write-Through)", url: "https://redis.io/" },
          { id: "sd-4", name: "Database Sharding, Replication & Read Replicas", url: "https://aws.amazon.com/relational-database/" },
        ],
      },
      {
        id: "sd-m2",
        title: "2. Real-World Architecture Deep Dives",
        level: "Intermediate",
        topics: [
          { id: "sd-5", name: "Design a URL Shortener (TinyURL) with Rate Limiting", url: "https://github.com/donnemartin/system-design-primer#design-pastebin" },
          { id: "sd-6", name: "Design a Video Streaming Platform (Netflix / YouTube)", url: "https://netflixtechblog.com/" },
          { id: "sd-7", name: "Design a Real-time Chat Messaging App (WhatsApp)", url: "https://discord.com/blog" },
          { id: "sd-8", name: "Event-Driven Architecture with Apache Kafka & SQS", url: "https://kafka.apache.org/" },
        ],
      },
    ],
  },
  {
    id: "cp",
    title: "Competitive Programming Masterclass",
    description:
      "Conquer Div 2, Div 1, Codeforces rounds, and ICPC regional problems with advanced math & algorithms.",
    icon: "🏆",
    color: "#10B981",
    modules: [
      {
        id: "cp-m1",
        title: "1. Number Theory & Combinatorics",
        level: "Intermediate",
        topics: [
          { id: "cp-1", name: "Modular Arithmetic & Fast Exponentiation (Binary Pow)", url: "https://cp-algorithms.com/algebra/binary-exp.html" },
          { id: "cp-2", name: "Sieve of Eratosthenes & Prime Factorization", url: "https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html" },
          { id: "cp-3", name: "Euler's Totient Function & Extended Euclidean GCD", url: "https://cp-algorithms.com/algebra/extended-euclid-algorithm.html" },
        ],
      },
      {
        id: "cp-m2",
        title: "2. Segment Trees & Range Queries",
        level: "Advanced",
        topics: [
          { id: "cp-4", name: "Fenwick Tree (Binary Indexed Tree) Point & Range Updates", url: "https://cp-algorithms.com/data_structures/fenwick.html" },
          { id: "cp-5", name: "Segment Tree with Lazy Propagation", url: "https://cp-algorithms.com/data_structures/segment_tree.html" },
          { id: "cp-6", name: "Trie (Prefix Tree) & XOR Maximum Subarray", url: "https://cp-algorithms.com/string/prefix-function.html" },
        ],
      },
    ],
  },
];

const Roadmaps = () => {
  const [activeRoadmapId, setActiveRoadmapId] = useState("dsa");
  const [completedTopics, setCompletedTopics] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("codinghub_roadmap_completed") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("codinghub_roadmap_completed", JSON.stringify(completedTopics));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [completedTopics]);

  const activeRoadmap = ROADMAPS_DATA.find((r) => r.id === activeRoadmapId) || ROADMAPS_DATA[0];

  const totalTopics = activeRoadmap.modules.reduce((sum, m) => sum + m.topics.length, 0);
  const doneTopics = activeRoadmap.modules.reduce(
    (sum, m) => sum + m.topics.filter((t) => completedTopics[t.id]).length,
    0
  );
  const percent = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0;

  const toggleTopic = (id) => {
    setCompletedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AppLayout>
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#FED7B2] bg-gradient-to-r from-[#FFF4E6] via-[#FEEBD9] to-[#FEDBC0] p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-b from-[#FFE8B2] to-[#FFD05A] text-3xl shadow-sm border-2 border-white/80">
              🗺️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#FFE2DE] px-3 py-0.5 text-xs font-black text-[#F35F67]">
                  STRUCTURED TRACKS
                </span>
                <span className="rounded-full bg-[#E8F8EE] px-2.5 py-0.5 text-[11px] font-bold text-[#16A34A]">
                  Progress Tracking
                </span>
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
                Developer Learning Roadmaps
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#5F5F5F] max-w-xl">
                Master critical computer science concepts step-by-step. Check off topics to
                track your mastery and visualize your growth.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-xs p-4 shadow-xs min-w-[200px]">
            <p className="text-xs font-bold text-[#7A7A7A]">Track Completion</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-[#171717]">{percent}%</span>
              <span className="text-xs text-[#5F5F5F]">({doneTopics}/{totalTopics} topics)</span>
            </div>
            <div className="w-full bg-[#E9E2D8] h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-[#FFD05A] to-[#FFA057] h-full transition-all duration-500 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {ROADMAPS_DATA.map((r) => {
          const isActive = r.id === activeRoadmapId;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveRoadmapId(r.id)}
              className={`flex items-center gap-2.5 whitespace-nowrap rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold transition shadow-xs ${
                isActive
                  ? "bg-[#171717] text-white"
                  : "border border-[#E9E2D8] bg-white text-[#5F5F5F] hover:bg-[#FFF8EE]"
              }`}
            >
              <span>{r.icon}</span>
              <span>{r.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Roadmap Timeline Modules */}
      <div className="space-y-6">
        {activeRoadmap.modules.map((module, mIdx) => (
          <div
            key={module.id}
            className="rounded-3xl border border-[#E9E2D8] bg-white p-6 sm:p-8 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-4 mb-5">
              <div>
                <span className="text-xs font-bold text-[#FF8E3C] uppercase tracking-wider">
                  Module {mIdx + 1}
                </span>
                <h3 className="text-lg font-black text-[#171717] mt-0.5">{module.title}</h3>
              </div>
              <span className="rounded-full bg-[#FFF0BE] px-3 py-1 text-xs font-bold text-[#171717]">
                {module.level}
              </span>
            </div>

            <div className="space-y-3">
              {module.topics.map((topic) => {
                const isDone = Boolean(completedTopics[topic.id]);

                return (
                  <div
                    key={topic.id}
                    onClick={() => toggleTopic(topic.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer ${
                      isDone
                        ? "bg-[#E8F8EE]/50 border-[#86EFAC]"
                        : "bg-[#FFFBF5] border-[#E9E2D8] hover:bg-[#FFF8EE]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg transition ${
                          isDone ? "bg-[#16A34A] text-white" : "border-2 border-[#CBD5E1] bg-white"
                        }`}
                      >
                        {isDone && <CheckCircle2 size={16} />}
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          isDone ? "line-through text-[#7A7A7A]" : "text-[#171717]"
                        }`}
                      >
                        {topic.name}
                      </span>
                    </div>

                    <a
                      href={topic.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline shrink-0 ml-2"
                    >
                      Study Guide <ExternalLink size={12} />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default Roadmaps;
