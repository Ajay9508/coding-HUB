import { Link } from "react-router-dom";
import { Search, Moon, LayoutGrid, Home, Trophy, Map, BookOpen } from "lucide-react";
import Logo from "../atoms/Logo";
import Button from "../atoms/Button";
import { useAuth } from "../../context/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#E9E2D8] bg-[#FFFBF5]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo />

        {/* Nav Links with Icons */}
        <div className="hidden items-center gap-7 md:flex text-sm font-semibold text-[#5F5F5F]">
          {/* <Link to="/" className="flex items-center gap-1.5 text-[#171717] hover:text-[#FF7378] transition">
            <Home size={16} />
            Home
          </Link> */}

          <Link to="/platforms" className="flex items-center gap-1.5 hover:text-[#FF7378] transition">
            <LayoutGrid size={16} />
            Platforms
          </Link>

          <Link to="/contests" className="flex items-center gap-1.5 hover:text-[#FF7378] transition">
            <Trophy size={16} />
            Contests
          </Link>

          <Link to="/roadmaps" className="flex items-center gap-1.5 hover:text-[#FF7378] transition">
            <Map size={16} />
            Roadmaps
          </Link>

          <Link to="/resources" className="flex items-center gap-1.5 hover:text-[#FF7378] transition">
            <BookOpen size={16} />
            Resources
          </Link>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/platforms"
            className="rounded-xl border border-[#E9E2D8] bg-white p-3 text-[#171717] hover:bg-[#FFF0DA] transition"
            aria-label="Search platforms"
          >
            <Search size={18} />
          </Link>

          <button
            type="button"
            className="rounded-xl border border-[#E9E2D8] bg-white p-3 text-[#171717] hover:bg-[#FFF0DA] transition"
            aria-label="Toggle theme"
          >
            <Moon size={18} />
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="secondary">Dashboard</Button>
              </Link>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
