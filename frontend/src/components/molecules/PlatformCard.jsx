import { Settings2, Link2, ArrowRight, RefreshCw } from "lucide-react";

// Platform Vector Logos
export const PlatformLogo = ({ type }) => {
  switch (type) {
    case "codeforces":
      return (
        <div className="flex items-end gap-1 h-7">
          <span className="w-1.5 h-4 bg-[#FFC107] rounded-xs" />
          <span className="w-1.5 h-7 bg-[#2196F3] rounded-xs" />
          <span className="w-1.5 h-3 bg-[#F44336] rounded-xs" />
        </div>
      );
    case "leetcode":
      return (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
          <path
            d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 4.818 3.528 5.985 5.985 0 0 0 3.343-.572l6.096-3.82a1.376 1.376 0 0 0 .285-2.062 1.376 1.376 0 0 0-2.062-.285l-5.69 3.565a3.24 3.24 0 0 1-1.81.31 3.213 3.213 0 0 1-2.607-1.91 3.167 3.167 0 0 1-.189-.55 3.01 3.01 0 0 1-.034-1.282 2.87 2.87 0 0 1 .656-1.144l3.633-3.89 4.887-5.234a1.375 1.375 0 0 0-.964-2.316z"
            fill="#262626"
          />
          <path
            d="M9.833 13.924a1.375 1.375 0 0 0 0 2.75h9.432a1.375 1.375 0 0 0 0-2.75H9.833z"
            fill="#FFA116"
          />
        </svg>
      );
    case "codechef":
      return (
        <div className="flex flex-col items-center justify-center">
          <span className="text-xl">👨‍🍳</span>
        </div>
      );
    case "hackerrank":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00EA64] font-black text-white text-base">
          H
        </div>
      );
    case "atcoder":
      return (
        <div className="flex flex-col items-center">
          <span className="text-xs font-black text-[#171717] tracking-tighter">AtCoder</span>
        </div>
      );
    case "topcoder":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0096D6] font-black text-white text-xs shadow-xs">
          TC
        </div>
      );
    case "spoj":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1B365D] font-black text-white text-xs shadow-xs">
          SP
        </div>
      );
    case "geeksforgeeks":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2F8D46] font-black text-white text-xs shadow-xs">
          GfG
        </div>
      );
    case "hackerearth":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#323754] font-black text-[#2C95FF] text-xs shadow-xs">
          {"{;}"}
        </div>
      );
    case "codewars":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#AD2C27] font-black text-white text-xs shadow-xs">
          ⚔️
        </div>
      );
    case "exercism":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#009CAB] font-black text-white text-xs shadow-xs">
          EX
        </div>
      );
    case "projecteuler":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#8A3B14] font-black text-white text-xs shadow-xs">
          ∑
        </div>
      );
    case "dmoj":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#3949AB] font-black text-white text-xs shadow-xs">
          DM
        </div>
      );
    case "kattis":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2B6CB0] font-black text-white text-xs shadow-xs">
          KT
        </div>
      );
    case "usaco":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E53E3E] font-black text-white text-xs shadow-xs">
          🇺🇸
        </div>
      );
    case "googlekickstart":
      return (
        <div className="flex items-center gap-0.5 font-black text-xs">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">K</span>
          <span className="text-[#FBBC05]">S</span>
        </div>
      );
    case "csacademy":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#6B46C1] font-black text-white text-xs shadow-xs">
          CS
        </div>
      );
    case "toph":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0D9488] font-black text-white text-xs shadow-xs">
          TP
        </div>
      );
    case "naukricode360":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FF5722] font-black text-white text-xs shadow-xs">
          360
        </div>
      );
    case "beecrowd":
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F59E0B] font-black text-white text-xs shadow-xs">
          🐝
        </div>
      );
    default:
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFF0BE] font-bold text-[#FF8E3C] text-xs">
          {"</>"}
        </div>
      );
  }
};

const tagStyles = {
  pink: "bg-[#FFE9E9] text-[#F35F67]",
  blue: "bg-[#EBF5FF] text-[#2563EB]",
  mint: "bg-[#E8F8F0] text-[#0D9488]",
  purple: "bg-[#F5EEFF] text-[#9333EA]",
  orange: "bg-[#FFF2E5] text-[#EA580C]",
};

const PlatformCard = ({ platform, onConnect, onManage, onSync, syncing }) => {
  return (
    <article className="flex flex-col justify-between rounded-3xl border border-[#E9E2D8] bg-white p-6 shadow-xs hover:shadow-md transition-all">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F2ECE4] bg-[#FFFBF5] shadow-xs">
              <PlatformLogo type={platform.logoType} />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#171717]">{platform.name}</h3>
              <p className="text-xs text-[#7A7A7A] mt-0.5">{platform.subtitle}</p>
            </div>
          </div>

          {/* Connection Status Badge */}
          <div>
            {platform.isConnected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F8EE] px-3 py-1 text-xs font-bold text-[#16A34A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-[#6B7280]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
                Not Connected
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs leading-relaxed text-[#5F5F5F] line-clamp-2">
          {platform.description}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {platform.tags.map((tag) => (
            <span
              key={tag.label}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                tagStyles[tag.variant] || tagStyles.blue
              }`}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-6 border-t border-[#F2ECE4] pt-5">
        <div className="pb-5 text-xs text-[#7A7A7A]">
          {platform.isConnected
            ? <><p>Connected account: <span className="font-semibold text-[#171717]">@{platform.handle}</span></p><div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-[#FFFBF5] p-3"><span className="block text-[10px]">Solved</span><strong className="mt-1 block text-base text-[#171717]">{platform.solved ?? "—"}</strong></div><div className="rounded-xl bg-[#FFFBF5] p-3"><span className="block text-[10px]">Rating</span><strong className="mt-1 block text-base text-[#171717]">{platform.rating ?? "—"}</strong></div></div><p className={`mt-2 ${platform.syncStatus === "error" ? "text-[#B42318]" : "text-[#7A7A7A]"}`}>{platform.syncError || (platform.lastSyncedAt ? `Last synced ${new Date(platform.lastSyncedAt).toLocaleString()}` : platform.syncStatus === "unavailable" ? "Automatic stats sync is unavailable" : "Stats have not synced yet")}</p></>
            : "Connect your handle to link this platform to your account."}
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => onManage && onManage(platform)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#171717] hover:text-[#FF8E3C] transition"
          >
            View Details
            <ArrowRight size={14} />
          </button>

          {platform.isConnected ? (
            <>
            <button type="button" onClick={() => onSync?.(platform.id)} disabled={syncing} className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9E2D8] bg-white px-3 py-2 text-xs font-bold text-[#171717] hover:bg-[#FFF8EE] disabled:opacity-60" aria-label={`Sync ${platform.name} stats`}><RefreshCw className={syncing ? "animate-spin" : ""} size={14} />Sync</button>
            <button
              type="button"
              onClick={() => onManage && onManage(platform)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#FFD05A] bg-[#FFFBF0] px-4 py-2 text-xs font-bold text-[#171717] hover:bg-[#FFEEC2] transition shadow-xs"
            >
              <Settings2 size={14} />
              Manage
            </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onConnect && onConnect(platform)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#171717] px-4 py-2 text-xs font-bold text-white hover:bg-black transition shadow-xs"
            >
              <Link2 size={14} />
              Connect
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default PlatformCard;
