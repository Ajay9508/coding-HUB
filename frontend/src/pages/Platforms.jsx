import { useState, useMemo } from "react";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import AppLayout from "../components/organisms/AppLayout";
import PlatformCard, { PlatformLogo } from "../components/molecules/PlatformCard";
import WhyConnectCard from "../components/molecules/WhyConnectCard";
import ConnectModal from "../components/molecules/ConnectModal";
import platformsData from "../data/platforms";

const categoryFilters = [
  { id: "all", label: "All Platforms" },
  { id: "Competitive Programming", label: "Competitive Programming" },
  { id: "Interview Prep", label: "Interview Prep" },
  { id: "Practice", label: "Practice" },
];

const Platforms = () => {
  const [platforms, setPlatforms] = useState(platformsData);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [modalPlatform, setModalPlatform] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: platforms.length };
    categoryFilters.forEach((cat) => {
      if (cat.id !== "all") {
        counts[cat.id] = platforms.filter((p) =>
          p.categories?.includes(cat.id)
        ).length;
      }
    });
    return counts;
  }, [platforms]);

  // Filtered platforms
  const filteredPlatforms = useMemo(() => {
    return platforms.filter((platform) => {
      const matchesCategory =
        activeCategory === "all" ||
        platform.categories?.includes(activeCategory) ||
        platform.category === activeCategory;

      const matchesSearch =
        searchQuery.trim() === "" ||
        platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        platform.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        platform.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        platform.tags.some((tag) =>
          tag.label.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesCategory && matchesSearch;
    });
  }, [platforms, activeCategory, searchQuery]);

  const handleOpenConnect = (platform) => {
    setModalPlatform(platform);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    // default to first unconnected platform or first platform
    const unconnected = platforms.find((p) => !p.isConnected) || platforms[0];
    setModalPlatform(unconnected);
    setIsModalOpen(true);
  };

  const handleSaveConnection = ({ id, isConnected, handle }) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isConnected, handle: handle || p.handle } : p
      )
    );
  };

  return (
    <AppLayout searchValue={searchQuery} onSearchChange={setSearchQuery}>
      {/* Top Page Header & Promo Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-8">
        {/* Title Area */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF0BE] text-[#171717] shadow-xs">
              <LayoutGrid size={22} strokeWidth={2.3} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
              Coding Platforms
            </h1>
          </div>
          <p className="mt-2.5 max-w-2xl text-xs sm:text-sm text-[#5F5F5F] leading-relaxed">
            Connect your coding profiles, track your progress and unlock your potential
            across multiple platforms.
          </p>
        </div>

        {/* Promo Card Banner (Track. Compare. Improve.) */}
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-[#FED7B2] bg-gradient-to-r from-[#FFF3E8] via-[#FEEBD9] to-[#FEDBC0] p-4 sm:p-5 shadow-xs max-w-md w-full shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#FF8E3C] shadow-xs">
              <span className="font-black text-base">{"</>"}</span>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[#171717]">
                Track. Compare. Improve.
              </h3>
              <p className="mt-0.5 text-[11px] text-[#5F5F5F] leading-tight">
                Connect your accounts and get real-time stats from all platforms in one
                place.
              </p>
            </div>
          </div>

          {/* Mini Developer Illustration */}
          <div className="hidden sm:flex relative shrink-0 items-center justify-center h-16 w-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFA057]/20 text-2xl">
              👨‍💻
            </div>
            <span className="absolute -top-1 right-0 rounded-full bg-[#3B82F6] px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs">
              {"</>"}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & View Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categoryFilters.map((category) => {
            const count = categoryCounts[category.id] ?? 0;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-xs ${
                  isActive
                    ? "bg-[#FFD05A] text-[#171717]"
                    : "border border-[#E9E2D8] bg-white text-[#5F5F5F] hover:bg-[#FFF8EE] hover:text-[#171717]"
                }`}
              >
                {category.label} ({count})
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher (Grid / List) */}
        <div className="flex items-center self-end sm:self-auto rounded-2xl border border-[#E9E2D8] bg-white p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              viewMode === "grid"
                ? "bg-[#FFF0BE] text-[#171717] shadow-xs"
                : "text-[#7A7A7A] hover:text-[#171717]"
            }`}
          >
            <LayoutGrid size={15} />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              viewMode === "list"
                ? "bg-[#FFF0BE] text-[#171717] shadow-xs"
                : "text-[#7A7A7A] hover:text-[#171717]"
            }`}
          >
            <List size={15} />
            List
          </button>
        </div>
      </div>

      {/* Content Rendering: Grid vs List */}
      {filteredPlatforms.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#E9E2D8] bg-white p-12 text-center">
          <SlidersHorizontal size={36} className="mx-auto text-[#FFA057]" />
          <h3 className="mt-4 text-lg font-bold text-[#171717]">No platforms found</h3>
          <p className="mt-1 text-xs text-[#7A7A7A]">
            No platform matches "{searchQuery}". Try a different keyword or filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}
            className="mt-5 rounded-2xl bg-[#FFD05A] px-5 py-2.5 text-xs font-bold text-[#171717] hover:bg-[#FFA057] transition"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlatforms.map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              onConnect={handleOpenConnect}
              onManage={handleOpenConnect}
            />
          ))}

          {/* 6th Card: Why Connect Your Profiles? */}
          {activeCategory === "all" && !searchQuery && (
            <WhyConnectCard onConnectNew={handleOpenNew} />
          )}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredPlatforms.map((platform) => (
            <div
              key={platform.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#E9E2D8] bg-white p-5 shadow-xs hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#F2ECE4] bg-[#FFFBF5]">
                  <PlatformLogo type={platform.logoType} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#171717]">{platform.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        platform.isConnected
                          ? "bg-[#E8F8EE] text-[#16A34A]"
                          : "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      {platform.isConnected ? "• Connected" : "• Not Connected"}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7A7A] mt-0.5">{platform.subtitle}</p>
                  <p className="text-xs text-[#5F5F5F] mt-1 max-w-xl line-clamp-1">
                    {platform.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F2ECE4]">
                <div className="flex items-center gap-4 text-xs">
                  {platform.stats.map((stat) => (
                    <div key={stat.label} className="text-right">
                      <p className="text-[10px] text-[#7A7A7A]">{stat.label}</p>
                      <p className="font-bold text-[#171717]">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenConnect(platform)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                    platform.isConnected
                      ? "border border-[#FFD05A] bg-[#FFFBF0] text-[#171717] hover:bg-[#FFEEC2]"
                      : "bg-[#171717] text-white hover:bg-black"
                  }`}
                >
                  {platform.isConnected ? "Manage" : "Connect"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Connect / Manage Modal */}
      <ConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        platform={modalPlatform}
        platforms={platforms}
        onSave={handleSaveConnection}
      />
    </AppLayout>
  );
};

export default Platforms;
