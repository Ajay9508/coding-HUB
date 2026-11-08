import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  Trophy,
  Code2,
  Map,
  BookOpen,
  FileText,
  Users,
  User,
  Settings,
  X,
} from "lucide-react";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Platforms", path: "/platforms", icon: LayoutGrid },
  { name: "Contests", path: "/contests", icon: Trophy },
  { name: "Code IDE", path: "/ide", icon: Code2 },
  { name: "Roadmaps", path: "/roadmaps", icon: Map },
  { name: "Resources", path: "/resources", icon: BookOpen },
  { name: "Blog", path: "/blog", icon: FileText },
  { name: "Community", path: "/community", icon: Users },
  { name: "Profile", path: "/dashboard", icon: User },
  { name: "Settings", path: "/settings", icon: Settings },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-5">
      {/* Top section: Logo + Nav */}
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6">
          <NavLink to="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="flex h-11 w-13 items-center justify-center rounded-2xl bg-[#689D4B] shadow-xs transition-transform group-hover:scale-105">
              <span className="text-lg font-black text-white">{"</>"}</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#1A241A] dark:text-[#F2F2F2]">
                Coding <span className="text-[#D96868]">Hub</span>
              </h1>
              <p className="text-[11px] font-medium text-[#4A584A] dark:text-[#8C9D8A]">
                All Coding Platforms. One Destination.
              </p>
            </div>
          </NavLink>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="rounded-xl p-1.5 text-[#4A584A] hover:bg-[#E5ECE2] dark:hover:bg-[#222E22] lg:hidden"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav Links */}
        <nav className="mt-2 space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#689D4B] text-white font-bold shadow-xs"
                    : "text-[#4A584A] hover:bg-[#E5ECE2] hover:text-[#1A241A] dark:text-[#D2DDD0] dark:hover:bg-[#222E22] dark:hover:text-white"
                }`}
              >
                <Icon
                  size={19}
                  className={isActive ? "text-white" : "text-[#689D4B] dark:text-[#91AE6E]"}
                  strokeWidth={isActive ? 2.3 : 2}
                />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo Card - Solid flat, no linear gradient */}
      <div className="mt-6 rounded-3xl border border-[#D6E0D2] bg-white p-5 text-center shadow-xs dark:border-[#2E3D2E] dark:bg-[#1D261D]">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-[#E5ECE2] p-3 shadow-inner dark:bg-[#141A14]">
          <div className="relative flex flex-col items-center">
            {/* Monitor graphic */}
            <div className="flex h-12 w-16 items-center justify-center rounded-lg border-2 border-[#689D4B] bg-white shadow-xs dark:bg-[#1D261D]">
              <span className="text-xs font-black text-[#D96868]">
                {location.pathname.startsWith("/contests") ? "🏆" : "</>"}
              </span>
            </div>
            <div className="h-1.5 w-6 bg-[#689D4B] rounded-b-sm"></div>
            <div className="h-1 w-10 bg-[#91AE6E] rounded-full mt-0.5"></div>
            {/* Stars */}
            <span className="absolute -top-1 -right-2 text-[10px] text-[#D96868]">✦</span>
            <span className="absolute -bottom-1 -left-2 text-[8px] text-[#91AE6E]">✦</span>
          </div>
        </div>

        <h2 className="mt-3 text-xs font-black tracking-wide text-[#1A241A] dark:text-[#F2F2F2]">
          {location.pathname.startsWith("/contests")
            ? "Compete • Improve • Grow"
            : "Build • Learn • Grow"}
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-[#4A584A] dark:text-[#8C9D8A]">
          {location.pathname.startsWith("/contests")
            ? "Every contest is a step closer to your goals."
            : "Your coding journey, all in one place."}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="app-sidebar hidden w-64 shrink-0 border-r border-[#E9E2D8] bg-[#FFFBF5] lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">{sidebarContent}</div>
      </aside>

      {/* Mobile Off-canvas Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/35 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-[#FFFBF5] shadow-2xl">
            <div className="h-full overflow-y-auto">{sidebarContent}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
