import { Link } from "react-router-dom";
import platforms from "../../data/platforms";
import PlatformCard from "../molecules/PlatformCard";

const PlatformSection = () => {
  // Show first 3 platforms for the home preview
  const previewPlatforms = platforms.slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-semibold text-[#F35F67]">EXPLORE</p>
          <h2 className="mt-2 text-3xl font-black text-[#171717]">Top Coding Platforms</h2>
        </div>

        <Link
          to="/platforms"
          className="font-semibold text-[#F35F67] hover:text-[#FF7378] transition flex items-center gap-1"
        >
          View all →
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {previewPlatforms.map((platform) => (
          <PlatformCard key={platform.id} platform={platform} />
        ))}
      </div>
    </section>
  );
};

export default PlatformSection;