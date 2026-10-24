import { useState } from "react";
import {
  Clock,
  Heart,
  Search,
} from "lucide-react";
import AppLayout from "../components/organisms/AppLayout";

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Competitive Programming", "Tutorials", "System Design", "Contest Analysis"];

  const filteredPosts = posts.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch =
      search.trim() === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLike = (id, e) => {
    e?.stopPropagation();
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  return (
    <AppLayout>
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#FED7B2] bg-gradient-to-r from-[#FFF4E6] via-[#FEEBD9] to-[#FEDBC0] p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-b from-[#FFE8B2] to-[#FFD05A] text-3xl shadow-sm border-2 border-white/80">
              ✍️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#FFE2DE] px-3 py-0.5 text-xs font-black text-[#F35F67]">
                  ENGINEERING EDITORIALS
                </span>
                <span className="rounded-full bg-[#E8F8EE] px-2.5 py-0.5 text-[11px] font-bold text-[#16A34A]">
                  Community Insights
                </span>
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
                Developer Blog & Contest Editorials
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#5F5F5F] max-w-xl">
                Contest post-mortems, algorithm tutorials, interview preparation blueprints, and
                software engineering best practices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
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
            placeholder="Search blog posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#E9E2D8] bg-white pl-9 pr-3 py-2 text-xs text-[#171717] outline-none focus:border-[#FFD05A]"
          />
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.length === 0 && (
          <div className="md:col-span-2 rounded-3xl border border-dashed border-[#E9E2D8] bg-white p-12 text-center">
            <h2 className="text-lg font-bold text-[#171717]">No editorials published yet</h2>
            <p className="mt-2 text-xs text-[#7A7A7A]">Published articles will appear here once they are available from the editorial system.</p>
          </div>
        )}
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="cursor-pointer rounded-3xl border border-[#E9E2D8] bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="rounded-full bg-[#FFF0BE] px-3 py-1 text-xs font-bold text-[#171717]">
                  {post.category}
                </span>
                <span className="text-xs text-[#7A7A7A] flex items-center gap-1">
                  <Clock size={12} /> {post.readTime}
                </span>
              </div>

              <h2 className="text-xl font-black text-[#171717] hover:text-[#FFA057] transition leading-snug">
                {post.title}
              </h2>

              <p className="mt-3 text-xs text-[#5F5F5F] leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-[#FFFBF5] border border-[#E9E2D8] px-2 py-0.5 text-[10px] font-bold text-[#5F5F5F]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F2ECE4] flex items-center justify-between text-xs text-[#7A7A7A]">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFE2DE] font-bold text-[11px] text-[#F35F67]">
                  {post.author.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-bold text-[#171717]">{post.author}</span>
                <span>·</span>
                <span>{post.date}</span>
              </div>

              <button
                type="button"
                onClick={(e) => handleLike(post.id, e)}
                className="flex items-center gap-1.5 font-bold text-[#F35F67] hover:opacity-80"
              >
                <Heart size={14} fill="currentColor" />
                <span>{post.likes}</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Blog Detail Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="max-w-2xl w-full rounded-3xl bg-white p-8 shadow-2xl overflow-y-auto max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE4]">
              <span className="rounded-full bg-[#FFF0BE] px-3 py-1 text-xs font-bold text-[#171717]">
                {selectedPost.category}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="rounded-xl border border-[#E9E2D8] px-3 py-1 text-xs font-bold hover:bg-[#FFF0DA]"
              >
                Close ✕
              </button>
            </div>

            <h1 className="mt-4 text-2xl font-black text-[#171717] leading-tight">
              {selectedPost.title}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-xs text-[#7A7A7A]">
              <span>By {selectedPost.author}</span>
              <span>·</span>
              <span>{selectedPost.date}</span>
              <span>·</span>
              <span>{selectedPost.readTime}</span>
            </div>

            <div className="mt-6 text-sm text-[#374151] leading-relaxed space-y-4">
              <p className="font-semibold text-[#171717]">{selectedPost.excerpt}</p>
              <p>{selectedPost.content}</p>
              <p>
                In competitive programming and software engineering, deliberate practice focused on
                weak areas accelerates progress 5x compared to randomly solving problems.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#F2ECE4] flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => handleLike(selectedPost.id, e)}
                className="flex items-center gap-2 rounded-xl bg-[#FFE2DE] px-4 py-2 text-xs font-bold text-[#F35F67]"
              >
                <Heart size={14} fill="currentColor" />
                <span>{selectedPost.likes} Likes</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="rounded-xl bg-[#171717] px-5 py-2 text-xs font-bold text-white hover:bg-black"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Blog;
