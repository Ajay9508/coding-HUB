import { Link } from "react-router-dom";
import { Search, LayoutGrid, Trophy, Code2, Map, BookOpen } from "lucide-react";
import Logo from "../atoms/Logo";
import Button from "../atoms/Button";
import ThemeToggle from "../atoms/Theme";
import { useAuth } from "../../context/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#D6E0D2] bg-[#F2F2F2]/95 backdrop-blur dark:bg-[#141A14]/95 dark:border-[#2E3D2E]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo />

        {/* Nav Links with Icons */}
        <div className="hidden items-center gap-6 lg:flex text-sm font-semibold text-[#4A584A] dark:text-[#D2DDD0]">
          <Link to="/platforms" className="flex items-center gap-1.5 hover:text-[#689D4B] dark:hover:text-[#91AE6E] transition">
            <LayoutGrid size={16} />
            Platforms
          </Link>

          <Link to="/contests" className="flex items-center gap-1.5 hover:text-[#689D4B] dark:hover:text-[#91AE6E] transition">
            <Trophy size={16} />
            Contests
          </Link>

          <Link to="/ide" className="flex items-center gap-1.5 hover:text-[#689D4B] dark:hover:text-[#91AE6E] transition">
            <Code2 size={16} />
            IDE
          </Link>

          <Link to="/roadmaps" className="flex items-center gap-1.5 hover:text-[#689D4B] dark:hover:text-[#91AE6E] transition">
            <Map size={16} />
            Roadmaps
          </Link>

          <Link to="/resources" className="flex items-center gap-1.5 hover:text-[#689D4B] dark:hover:text-[#91AE6E] transition">
            <BookOpen size={16} />
            Resources
          </Link>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/platforms"
            className="rounded-xl border border-[#D6E0D2] bg-white p-3 text-[#1A241A] hover:bg-[#E5ECE2] dark:bg-[#1D261D] dark:text-[#F2F2F2] dark:border-[#2E3D2E] transition"
            aria-label="Search platforms"
          >
            <Search size={18} />
          </Link>

          <ThemeToggle />

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
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
