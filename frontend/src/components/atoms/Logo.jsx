import { Link } from "react-router-dom";

const Logo = () => (
  <Link to="/" className="flex items-center gap-3" aria-label="Coding Hub home">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF7378] font-black text-white">
      {"</>"}
    </span>
    <span className="text-lg font-black tracking-tight">
      Coding <span className="text-[#F35F67]">Hub</span>
    </span>
  </Link>
);

export default Logo;
