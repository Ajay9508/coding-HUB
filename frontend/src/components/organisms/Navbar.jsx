import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, LayoutGrid, Trophy, Code2, Map, BookOpen, Menu, X } from "lucide-react";
import Logo from "../atoms/Logo";
import Button from "../atoms/Button";
import ThemeToggle from "../atoms/Theme";
import { useAuth } from "../../context/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/platforms", label: "Platforms", icon: LayoutGrid },
    { to: "/contests", label: "Contests", icon: Trophy },
    { to: "/ide", label: "IDE", icon: Code2 },
    { to: "/roadmaps", label: "Roadmaps", icon: Map },
    { to: "/resources", label: "Resources", icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-[#D6E0D2]/80 bg-[#F2F2F2]/90 backdrop-blur-xl dark:border-[#2E3D2E]/80 dark:bg-[#141A14]/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo />

        <div className="hidden items-center gap-6 text-sm font-semibold text-[#4A584A] dark:text-[#D2DDD0] lg:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-1.5 transition hover:text-[#689D4B] dark:hover:text-[#91AE6E]">
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/platforms"
            className="hidden rounded-xl border border-[#D6E0D2] bg-white p-3 text-[#1A241A] hover:bg-[#E5ECE2] dark:bg-[#1D261D] dark:text-[#F2F2F2] dark:border-[#2E3D2E] transition sm:flex"
            aria-label="Search platforms"
          >
            <Search size={18} />
          </Link>

          <ThemeToggle />

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/dashboard">
                <Button variant="secondary">Dashboard</Button>
              </Link>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </div>
          )}

          <button
            type="button"
            className="rounded-xl border border-[#D6E0D2] bg-white p-3 text-[#1A241A] dark:border-[#2E3D2E] dark:bg-[#1D261D] dark:text-[#F2F2F2] lg:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="border-t border-[#D6E0D2]/80 px-4 py-3 dark:border-[#2E3D2E]/80 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">
            {links.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#4A584A] hover:bg-[#E5ECE2] dark:text-[#D2DDD0] dark:hover:bg-[#222E22]">
                <Icon size={17} className="text-[#689D4B]" />
                {label}
              </Link>
            ))}
            {user && (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#4A584A] hover:bg-[#E5ECE2] dark:text-[#D2DDD0] dark:hover:bg-[#222E22] sm:hidden">
                  Dashboard
                </Link>
                <button type="button" onClick={() => { logout(); setMenuOpen(false); }} className="rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#D96868] hover:bg-[#FCE8E8] dark:hover:bg-[#2D1E1E] sm:hidden">
                  Logout
                </button>
              </>
            )}
            {!user && (
              <div className="flex gap-2 border-t border-[#D6E0D2] px-3 pt-3 dark:border-[#2E3D2E] sm:hidden">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 rounded-xl border border-[#91AE6E] px-3 py-2 text-center text-sm font-bold text-[#1A241A] dark:border-[#2E3D2E] dark:text-[#F2F2F2]">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 rounded-xl bg-[#689D4B] px-3 py-2 text-center text-sm font-bold text-white">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
