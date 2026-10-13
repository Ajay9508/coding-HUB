import { Link } from "react-router-dom";
import Button from "../atoms/Button";

const Hero = () => {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="mb-5 inline-flex rounded-full bg-[#FFE2DE] px-4 py-2 text-sm font-semibold text-[#F35F67]">
            The Developer's Command Center
          </div>

          <h1 className="text-5xl font-black leading-tight md:text-6xl">
            All Coding Platforms.
            <span className="block text-[#FF7378]">One Destination.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-[#5F5F5F]">
            Track your coding progress, ratings, contests and profiles from multiple coding
            platforms in one unified dashboard.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/platforms">
              <Button>Explore Platforms</Button>
            </Link>

            <Link to="/contests">
              <Button variant="secondary">View Contests</Button>
            </Link>
          </div>
        </div>

        <div className="hero-visual relative rounded-[2rem] bg-[#FFF0BE] p-10">
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-[120px] font-black text-[#FFA057]">{"</>"}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
