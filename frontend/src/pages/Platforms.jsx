import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, List, RefreshCw, SlidersHorizontal } from "lucide-react";
import AppLayout from "../components/organisms/AppLayout";
import PlatformCard, { PlatformLogo } from "../components/molecules/PlatformCard";
import WhyConnectCard from "../components/molecules/WhyConnectCard";
import ConnectModal from "../components/molecules/ConnectModal";
import platformsData from "../data/platforms";
import api from "../api";
import { useAuth } from "../context/useAuth";

const categoryFilters = [
  { id: "all", label: "All Platforms" },
  { id: "Competitive Programming", label: "Competitive Programming" },
  { id: "Interview Prep", label: "Interview Prep" },
  { id: "Practice", label: "Practice" },
  { id: "Learning", label: "Learning" },
  { id: "Math & Logic", label: "Math & Logic" },
];

const Platforms = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [modalPlatform, setModalPlatform] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncingId, setSyncingId] = useState("");

  const loadPlatforms = useCallback(async () => {
    try {
      const [catalogRes, connectedRes] = await Promise.all([
        api.get("/platforms"),
        userId ? api.get("/platforms/connected") : Promise.resolve({ data: { platforms: [] } }),
      ]);
      const catalogList = catalogRes.data?.platforms || [];
      const connectedList = connectedRes.data?.platforms || [];

      const connected = new Map(connectedList.map((p) => [p.platformId, p]));

      // The catalog provides presentation metadata; connection and statistics always come from the API.
      const merged = platformsData.map((platform) => {
        const catalogItem = catalogList.find((c) => c.id === platform.id);
        const serverProfile = connected.get(platform.id);
        const profile = serverProfile;

        return {
          ...platform,
          ...(catalogItem || {}),
          ...(profile || {}),
          id: platform.id,
          categories: platform.categories || [platform.category],
          tags: platform.tags || [],
          logoType: platform.logoType || platform.id,
          isConnected: Boolean(profile?.handle),
          handle: profile?.handle || "",
          solved: profile?.solved,
          rating: profile?.rating,
          syncStatus: profile?.syncStatus || "idle",
        };
      });

      setPlatforms(merged);
      setLoadError("");
    } catch (requestError) {
      // Fall back to default catalog with 30 platforms
      const fallbackList = platformsData.map((platform) => ({
        ...platform,
        categories: platform.categories || [platform.category],
        tags: platform.tags || [],
        logoType: platform.logoType || platform.id,
        isConnected: false,
        handle: "",
        syncStatus: "idle",
      }));
      setPlatforms(fallbackList);
      setLoadError(
        requestError.response?.data?.detail ||
          "Could not load connected platforms from the API.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadPlatforms();
    }, 0);
    return () => window.clearTimeout(task);
  }, [loadPlatforms]);

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
    if (!user) {
      navigate("/login");
      return;
    }
    setModalPlatform(platform);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    // default to first unconnected platform or first platform
    const unconnected = platforms.find((p) => !p.isConnected) || platforms[0];
    setModalPlatform(unconnected);
    setIsModalOpen(true);
  };

  const handleSaveConnection = async ({ id, isConnected, handle }) => {
    if (!isConnected) {
      try {
        await api.delete(`/platforms/${id}`);
        await loadPlatforms();
      } catch (requestError) {
        setLoadError(requestError.response?.data?.detail || "Could not disconnect this platform.");
      }
      return;
    }

    try {
      await api.put(`/platforms/${id}`, { handle });
      await api.post(`/platforms/${id}/sync`);
      await loadPlatforms();
    } catch (requestError) {
      await loadPlatforms();
      setLoadError(
        requestError.response?.data?.detail ||
          "The platform was connected, but its live statistics could not be synchronized.",
      );
    }
  };

  const handleSync = async (id) => {
    setSyncingId(id);
    try {
      await api.post(`/platforms/${id}/sync`);
      await loadPlatforms();
    } catch (requestError) {
      setLoadError(requestError.response?.data?.detail || "Could not synchronize this platform.");
    } finally {
      setSyncingId("");
    }
  };

  return (
    <AppLayout searchValue={searchQuery} onSearchChange={setSearchQuery}>
      {/* Top Page Header & Promo Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-8">
        {/* Title Area */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#B9E4E8] text-[#071B2B] dark:bg-[#167D8D] dark:text-white shadow-xs">
              <LayoutGrid size={22} strokeWidth={2.3} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#071B2B] dark:text-[#EEEEEE] tracking-tight">
              Coding Platforms
            </h1>
          </div>
          <p className="mt-2.5 max-w-2xl text-xs sm:text-sm text-[#526574] dark:text-[#cbd5e1] leading-relaxed">
            Link your public profile handles. Only platforms connected to your account
            will appear as connected.
          </p>
        </div>

        {/* Promo Card Banner (Track. Compare. Improve.) */}
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-[#B9E4E8] bg-gradient-to-r from-[#B9E4E8]/60 via-[#EEEEEE] to-[#B9E4E8]/60 dark:from-[#071B2B] dark:via-[#0c263c] dark:to-[#167D8D] p-4 sm:p-5 shadow-xs max-w-md w-full shrink-0 dark:border-[#167D8D]/40">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-[#071B2B] text-[#167D8D] shadow-xs">
              <span className="font-black text-base">{"</>"}</span>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[#071B2B] dark:text-[#EEEEEE]">
                Track. Compare. Improve.
              </h3>
              <p className="mt-0.5 text-[11px] text-[#526574] dark:text-[#cbd5e1] leading-tight">
                Link your public handles here. Profile statistics appear when a platform
                data integration is available.
              </p>
            </div>
          </div>

          {/* Mini Developer Illustration */}
          <div className="hidden sm:flex relative shrink-0 items-center justify-center h-16 w-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#167D8D]/20 text-2xl">
              👨‍💻
            </div>
            <span className="absolute -top-1 right-0 rounded-full bg-[#167D8D] px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs">
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
                    ? "bg-[#167D8D] text-white"
                    : "border border-[#B9E4E8] bg-white text-[#526574] hover:bg-[#B9E4E8]/40 hover:text-[#071B2B] dark:bg-[#0c2133] dark:text-[#EEEEEE] dark:border-[#167D8D]/40"
                }`}
              >
                {category.label} ({count})
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher (Grid / List) */}
        <div className="flex items-center self-end sm:self-auto rounded-2xl border border-[#B9E4E8] bg-white dark:bg-[#0c2133] dark:border-[#167D8D]/40 p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              viewMode === "grid"
                ? "bg-[#B9E4E8] text-[#071B2B] dark:bg-[#167D8D] dark:text-white shadow-xs"
                : "text-[#526574] dark:text-[#cbd5e1] hover:text-[#071B2B] dark:hover:text-white"
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
                ? "bg-[#B9E4E8] text-[#071B2B] dark:bg-[#167D8D] dark:text-white shadow-xs"
                : "text-[#526574] dark:text-[#cbd5e1] hover:text-[#071B2B] dark:hover:text-white"
            }`}
          >
            <List size={15} />
            List
          </button>
        </div>
      </div>

      {/* Content Rendering: Grid vs List */}
      {loadError && <p role="alert" className="mb-5 rounded-xl bg-[#FFE2DE] p-3 text-sm text-[#B42318]">{loadError}</p>}
      {loading ? (
        <div className="rounded-3xl border border-[#E9E2D8] bg-white p-12 text-center text-sm text-[#5F5F5F]">Loading platform directory…</div>
      ) : filteredPlatforms.length === 0 ? (
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
              onSync={handleSync}
              syncing={syncingId === platform.id}
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
                  {platform.isConnected && <p className="mt-2 text-xs font-semibold text-[#5F5F5F]">Solved: {platform.solved ?? "—"} · Rating: {platform.rating ?? "—"} · {platform.syncStatus === "synced" ? "Synced" : platform.syncStatus === "unavailable" ? "Sync unavailable" : platform.syncStatus === "error" ? "Sync failed" : "Not synced"}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F2ECE4]">
                <p className="text-xs text-[#7A7A7A]">{platform.isConnected ? `@${platform.handle}` : "No account connected"}</p>

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
                {platform.isConnected && <button type="button" disabled={syncingId === platform.id} onClick={() => handleSync(platform.id)} title="Sync profile stats" aria-label={`Sync ${platform.name} profile stats`} className="rounded-xl border border-[#E9E2D8] bg-white p-2 text-[#5F5F5F] hover:bg-[#FFF8EE] disabled:opacity-60"><RefreshCw className={syncingId === platform.id ? "animate-spin" : ""} size={16} /></button>}
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
