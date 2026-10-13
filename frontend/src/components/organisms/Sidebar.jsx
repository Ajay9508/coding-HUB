import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  Trophy,
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
            <div className="flex h-11 w-13 items-center justify-center rounded-2xl bg-red-400 shadow-sm transition-transform group-hover:scale-105">
              <span className="text-lg font-black text-white">{"</>"}</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#171717]">Coding <samp className="text-[#ff3c3c]">Hub</samp></h1>
              <p className="text-[11px] font-medium text-[#7A7A7A]">
                All Coding Platforms. One Destination.
              </p>
            </div>
          </NavLink>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="rounded-xl p-1.5 text-[#5F5F5F] hover:bg-[#FFF0DA] lg:hidden"
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
                    ? "bg-[#FFF0BE] text-[#171717] shadow-xs"
                    : "text-[#5F5F5F] hover:bg-[#FFF4E5] hover:text-[#171717]"
                }`}
              >
                <Icon
                  size={19}
                  className={isActive ? "text-[#171717]" : "text-[#5F5F5F]"}
                  strokeWidth={isActive ? 2.3 : 2}
                />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo Card */}
      <div className="mt-6 rounded-3xl border border-[#F2ECE4] bg-white p-5 text-center shadow-xs">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-b from-[#FFF2E0] to-[#FFE2CC] p-3 shadow-inner">
          <div className="relative flex flex-col items-center">
            {/* Monitor graphic */}
            <div className="flex h-12 w-16 items-center justify-center rounded-lg border-2 border-[#FFA057] bg-white shadow-xs">
              <span className="text-xs font-black text-[#FF8E3C]">
                {location.pathname.startsWith("/contests") ? "🏆" : "</>"}
              </span>
            </div>
            <div className="h-1.5 w-6 bg-[#FFA057] rounded-b-sm"></div>
            <div className="h-1 w-10 bg-[#FFD05A] rounded-full mt-0.5"></div>
            {/* Stars */}
            <span className="absolute -top-1 -right-2 text-[10px] text-[#FFA057]">✦</span>
            <span className="absolute -bottom-1 -left-2 text-[8px] text-[#FFD05A]">✦</span>
          </div>
        </div>

        <h2 className="mt-3 text-xs font-black tracking-wide text-[#171717]">
          {location.pathname.startsWith("/contests")
            ? "Compete • Improve • Grow"
            : "Build • Learn • Grow"}
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-[#7A7A7A]">
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
