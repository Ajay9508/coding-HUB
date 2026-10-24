import { useEffect, useState } from "react";
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Plus,
} from "lucide-react";
import AppLayout from "../components/organisms/AppLayout";
import { useAuth } from "../context/useAuth";
import api from "../api";

const Community = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("discussions"); // 'discussions' | 'groups' | 'achievements'
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get("/community")
      .then(({ data }) => {
        if (active) setDiscussions(data.discussions || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.detail || "Could not load community discussions.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const { data } = await api.post("/community", {
        title: newTitle.trim(),
        content: newContent.trim(),
        category: "General",
      });
      setDiscussions((current) => [data.discussion, ...current]);
      setNewTitle("");
      setNewContent("");
      setShowNewModal(false);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not post this discussion. Sign in first.");
    }
  };

  const handleLike = async (id) => {
    try {
      const { data } = await api.post(`/community/${id}/like`);
      setDiscussions((current) =>
        current.map((discussion) =>
          discussion.id === id ? data.discussion : discussion,
        ),
      );
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not add your reaction. Sign in first.");
    }
  };

  return (
    <AppLayout>
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#FED7B2] bg-gradient-to-r from-[#FFF4E6] via-[#FEEBD9] to-[#FEDBC0] p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-b from-[#FFE8B2] to-[#FFD05A] text-3xl shadow-sm border-2 border-white/80">
              👥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#FFE2DE] px-3 py-0.5 text-xs font-black text-[#F35F67]">
                  CODER NETWORK
                </span>
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
                Developer Community & Study Groups
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#5F5F5F] max-w-xl">
                Collaborate with fellow coders, discuss tough algorithmic problems, form contest
                teams, and celebrate milestones together.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!user) {
                setError("Sign in before starting a discussion.");
                return;
              }
              setShowNewModal(true);
            }}
            className="flex items-center gap-2 rounded-2xl bg-[#171717] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-black transition"
          >
            <Plus size={16} />
            Start Discussion
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E9E2D8] pb-4 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("discussions")}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-bold transition shadow-xs ${
            activeTab === "discussions"
              ? "bg-[#FFD05A] text-[#171717]"
              : "border border-[#E9E2D8] bg-white text-[#5F5F5F] hover:bg-[#FFF8EE]"
          }`}
        >
          <MessageSquare size={16} />
          Discussions ({discussions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("groups")}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-bold transition shadow-xs ${
            activeTab === "groups"
              ? "bg-[#FFD05A] text-[#171717]"
              : "border border-[#E9E2D8] bg-white text-[#5F5F5F] hover:bg-[#FFF8EE]"
          }`}
        >
          <Users size={16} />
          Study Rooms
        </button>
      </div>

      {/* Tab 1: Discussions */}
      {activeTab === "discussions" && (
        <div className="space-y-4">
          {error && (
            <p role="alert" className="rounded-2xl bg-[#FFE2DE] p-4 text-xs font-bold text-[#B42318]">
              {error}
            </p>
          )}
          {loading && <p className="rounded-3xl border border-[#E9E2D8] bg-white p-8 text-center text-sm text-[#5F5F5F]">Loading discussions…</p>}
          {!loading && discussions.length === 0 && (
            <div className="rounded-3xl border border-dashed border-[#E9E2D8] bg-white p-10 text-center">
              <MessageSquare size={32} className="mx-auto text-[#FFA057]" />
              <h2 className="mt-3 text-base font-bold text-[#171717]">No discussions yet</h2>
              <p className="mt-1 text-xs text-[#7A7A7A]">Be the first member to start a real discussion.</p>
            </div>
          )}
          {discussions.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-[#E9E2D8] bg-white p-6 shadow-xs hover:shadow-md transition"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="rounded-full bg-[#FFF0BE] px-3 py-1 text-[11px] font-bold text-[#171717]">
                  {item.category}
                </span>
                <span className="text-[11px] text-[#7A7A7A]">{new Date(item.createdAt).toLocaleString()}</span>
              </div>

              <h2 className="text-base font-black text-[#171717] hover:text-[#FFA057] transition cursor-pointer">
                {item.title}
              </h2>
              <p className="mt-2 text-xs text-[#5F5F5F] leading-relaxed">{item.content}</p>

              <div className="mt-4 pt-4 border-t border-[#F2ECE4] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFE2DE] font-bold text-[11px] text-[#F35F67]">
                    {item.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-[#171717]">{item.author}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleLike(item.id)}
                    className="flex items-center gap-1.5 font-bold text-[#5F5F5F] hover:text-[#FFA057]"
                  >
                    <ThumbsUp size={14} />
                    <span>{item.likes}</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-[#5F5F5F]">
                    <MessageSquare size={14} />
                    <span>{item.replies} replies</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Study Rooms */}
      {activeTab === "groups" && (
        <div className="rounded-3xl border border-dashed border-[#E9E2D8] bg-white p-10 text-center">
          <Users size={32} className="mx-auto text-[#FFA057]" />
          <h2 className="mt-3 text-base font-bold text-[#171717]">Study rooms are not available yet</h2>
          <p className="mt-1 text-xs text-[#7A7A7A]">Rooms will appear here after they are created by real members.</p>
        </div>
      )}

      {/* New Discussion Modal */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="max-w-lg w-full rounded-3xl bg-white p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE4]">
              <h2 className="text-lg font-black text-[#171717]">New Community Topic</h2>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="rounded-xl p-1 text-[#7A7A7A] hover:bg-[#FFF0DA]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDiscussion} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="What's your question or discussion topic?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-2xl border border-[#E9E2D8] bg-[#FFFBF5] px-4 py-2.5 text-xs text-[#171717] outline-none focus:border-[#FFD05A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Details</label>
                <textarea
                  rows={4}
                  placeholder="Provide context, code snippets, or error details..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full rounded-2xl border border-[#E9E2D8] bg-[#FFFBF5] px-4 py-2.5 text-xs text-[#171717] outline-none focus:border-[#FFD05A]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F2ECE4]">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-xl border border-[#E9E2D8] px-4 py-2 text-xs font-bold text-[#5F5F5F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#171717] px-5 py-2 text-xs font-bold text-white hover:bg-black"
                >
                  Post Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Community;
