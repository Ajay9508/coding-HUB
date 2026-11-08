import { Link } from "react-router-dom";

const Logo = () => (
  <Link to="/" className="flex items-center gap-3" aria-label="Coding Hub home">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#689D4B] font-black text-white shadow-xs">
      {"</>"}
    </span>
    <span className="text-lg font-black tracking-tight text-[#1A241A] dark:text-[#F2F2F2]">
      Coding <span className="text-[#D96868]">Hub</span>
    </span>
  </Link>
);

export default Logo;
