import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, ChevronDown, Menu, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import ThemeToggle from "../atoms/Theme";

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

  const displayName = user?.name || "";
  const initials = displayName
    ? displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header className="app-topbar sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b border-[#D6E0D2] bg-[#F2F2F2] dark:bg-[#141A14] dark:border-[#2E3D2E] px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex flex-1 items-center gap-3 max-w-2xl">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D6E0D2] bg-white text-[#1A241A] hover:bg-[#E5ECE2] dark:bg-[#1D261D] dark:text-[#F2F2F2] dark:border-[#2E3D2E] lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#4A584A] dark:text-[#8C9D8A]"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search contests, platforms, or keywords..."
            className="h-11 w-full rounded-2xl border border-[#D6E0D2] bg-white pl-11 pr-4 text-sm text-[#1A241A] dark:text-[#F2F2F2] dark:bg-[#1D261D] dark:border-[#2E3D2E] placeholder:text-[#6E7E6E] dark:placeholder:text-[#8C9D8A] focus:border-[#689D4B] focus:outline-none focus:ring-2 focus:ring-[#689D4B]/20 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Right: Notifications & Profile / Auth */}
      <div className="flex items-center gap-3 sm:gap-4">
        <ThemeToggle />

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D6E0D2] bg-white text-[#1A241A] hover:bg-[#E5ECE2] dark:bg-[#1D261D] dark:text-[#F2F2F2] dark:border-[#2E3D2E] transition shadow-xs"
          >
            <Bell size={19} />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#D96868] text-[10px] font-black text-white ring-2 ring-white dark:ring-[#141A14]">
              3
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#D6E0D2] bg-white p-4 shadow-xl z-50 dark:bg-[#1D261D] dark:border-[#2E3D2E]">
              <div className="flex items-center justify-between pb-3 border-b border-[#D6E0D2] dark:border-[#2E3D2E]">
                <h3 className="font-bold text-sm text-[#1A241A] dark:text-[#F2F2F2]">Contest & Platform Updates</h3>
                <span className="text-[11px] font-bold text-[#689D4B] dark:text-[#91AE6E]">Active</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <Link
                  to="/contests"
                  onClick={() => setNotificationsOpen(false)}
                  className="block rounded-xl bg-[#F2F2F2] p-2.5 hover:bg-[#E5ECE2] dark:bg-[#141A14] dark:hover:bg-[#222E22] transition"
                >
                  <p className="font-semibold text-[#1A241A] dark:text-[#F2F2F2]">Codeforces Round #930</p>
                  <p className="text-[#4A584A] dark:text-[#8C9D8A] mt-0.5">Upcoming global contest. View schedule →</p>
                </Link>
                <Link
                  to="/contests?tab=local"
                  onClick={() => setNotificationsOpen(false)}
                  className="block rounded-xl bg-[#F2F2F2] p-2.5 hover:bg-[#E5ECE2] dark:bg-[#141A14] dark:hover:bg-[#222E22] transition"
                >
                  <p className="font-semibold text-[#1A241A] dark:text-[#F2F2F2]">Local Contest Arena</p>
                  <p className="text-[#4A584A] dark:text-[#8C9D8A] mt-0.5">Compete on local leaderboards & rank.</p>
                </Link>
                <Link
                  to="/platforms"
                  onClick={() => setNotificationsOpen(false)}
                  className="block rounded-xl bg-[#F2F2F2] p-2.5 hover:bg-[#E5ECE2] dark:bg-[#141A14] dark:hover:bg-[#222E22] transition"
                >
                  <p className="font-semibold text-[#1A241A] dark:text-[#F2F2F2]">30 Platforms Supported</p>
                  <p className="text-[#4A584A] dark:text-[#8C9D8A] mt-0.5">Explore catalogs & connect profiles.</p>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill or Login/Register Buttons */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 rounded-2xl border border-[#D6E0D2] bg-white px-2.5 py-1.5 hover:bg-[#E5ECE2] dark:bg-[#1D261D] dark:border-[#2E3D2E] transition shadow-xs"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#689D4B] text-xs font-black text-white shadow-xs">
                {initials}
              </div>
              <span className="hidden sm:inline text-sm font-bold text-[#1A241A] dark:text-[#F2F2F2]">
                {displayName}
              </span>
              <ChevronDown size={16} className="text-[#4A584A] dark:text-[#8C9D8A]" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#D6E0D2] bg-white p-2 shadow-xl z-50 dark:bg-[#1D261D] dark:border-[#2E3D2E]">
                <div className="px-3 py-2 border-b border-[#D6E0D2] dark:border-[#2E3D2E]">
                  <p className="font-bold text-sm text-[#1A241A] dark:text-[#F2F2F2] truncate">{displayName}</p>
                  <p className="text-xs text-[#4A584A] dark:text-[#8C9D8A] truncate">{user.email}</p>
                </div>

                <div className="mt-1 space-y-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#1A241A] dark:text-[#F2F2F2] hover:bg-[#E5ECE2] dark:hover:bg-[#222E22] transition"
                  >
                    <User size={15} />
                    <span>Dashboard & Profiles</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#1A241A] dark:text-[#F2F2F2] hover:bg-[#E5ECE2] dark:hover:bg-[#222E22] transition"
                  >
                    <Settings size={15} />
                    <span>Settings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      navigate("/");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#D96868] hover:bg-[#FCE8E8] dark:hover:bg-[#2D1E1E] transition"
                  >
                    <LogOut size={15} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-2xl border border-[#91AE6E] bg-white px-3.5 py-2 text-xs font-bold text-[#1A241A] hover:bg-[#E5ECE2] dark:bg-[#1D261D] dark:text-[#F2F2F2] dark:border-[#2E3D2E] transition shadow-xs"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-2xl bg-[#689D4B] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#58863F] transition shadow-xs"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopHeader;
