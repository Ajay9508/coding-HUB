import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, ChevronDown, Menu, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../context/useAuth";

const TopHeader = ({ onMenuClick, searchValue = "", onSearchChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.name || "Amit Sharma";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AS";

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b border-[#E9E2D8] bg-[#FFFBF5]/95 px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex flex-1 items-center gap-3 max-w-2xl">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E9E2D8] bg-white text-[#171717] hover:bg-[#FFF0DA] lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E8E]"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search platforms, profiles, contests, or documentation..."
            className="h-11 w-full rounded-2xl border border-[#E9E2D8] bg-white pl-11 pr-4 text-sm text-[#171717] placeholder:text-[#9A9A9A] focus:border-[#FF8E3C] focus:outline-none focus:ring-2 focus:ring-[#FF8E3C]/20 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E9E2D8] bg-white text-[#171717] hover:bg-[#FFF0DA] transition shadow-xs"
          >
            <Bell size={19} />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#F35F67] text-[10px] font-black text-white ring-2 ring-white">
              3
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#E9E2D8] bg-white p-4 shadow-xl z-50">
              <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE4]">
                <h3 className="font-bold text-sm text-[#171717]">Notifications</h3>
                <span className="text-[11px] font-semibold text-[#FF8E3C]">3 New</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="rounded-xl bg-[#FFF8EE] p-2.5">
                  <p className="font-semibold text-[#171717]">Codeforces Round #930</p>
                  <p className="text-[#7A7A7A] mt-0.5">Starts in 3 hours. Register now!</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-2.5">
                  <p className="font-semibold text-[#171717]">LeetCode Weekly Contest</p>
                  <p className="text-[#7A7A7A] mt-0.5">Rating updated +34 points!</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-2.5">
                  <p className="font-semibold text-[#171717]">Profile Synced</p>
                  <p className="text-[#7A7A7A] mt-0.5">All 2 connected platforms updated.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 rounded-2xl border border-[#E9E2D8] bg-white px-2.5 py-1.5 hover:bg-[#FFF8EE] transition shadow-xs"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFA057] text-xs font-black text-white shadow-xs">
              {initials}
            </div>
            <span className="hidden sm:inline text-sm font-bold text-[#171717]">
              {displayName}
            </span>
            <ChevronDown size={16} className="text-[#7A7A7A]" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[#E9E2D8] bg-white p-2 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-[#F2ECE4]">
                <p className="font-bold text-sm text-[#171717]">{displayName}</p>
                <p className="text-xs text-[#7A7A7A] truncate">
                  {user?.email || "amit.sharma@example.com"}
                </p>
              </div>

              <div className="mt-1 space-y-1">
                <Link
                  to="/dashboard"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-[#FFF0DA] transition"
                >
                  <User size={15} />
                  <span>Dashboard / Profile</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-[#FFF0DA] transition"
                >
                  <Settings size={15} />
                  <span>Settings</span>
                </Link>

                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      navigate("/");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#F35F67] hover:bg-[#FFE2DE] transition"
                  >
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#FF8E3C] hover:bg-[#FFF0DA] transition"
                  >
                    <span>Login with Account</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
