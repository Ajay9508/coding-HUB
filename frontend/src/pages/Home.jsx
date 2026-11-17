import Navbar from "../components/organisms/Navbar";
import Hero from "../components/organisms/Hero";
import PlatformSection from "../components/organisms/PlatformSection";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#F2F2F2] dark:bg-[#141A14]">
      <Navbar />
      <Hero />
      <PlatformSection />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl border border-[#2E3D2E] bg-[#1A241A] p-8 text-[#F2F2F2] shadow-xl sm:p-10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#91AE6E]">
            CODING HUB
          </p>

          <h2 className="mt-3 text-3xl font-black text-white">
            Your coding journey, all in one place.
          </h2>

          <p className="mt-4 max-w-2xl leading-relaxed text-[#D2DDD0]">
            Connect your coding profiles, track solved problems, compare performance and never miss a contest across 30 top global platforms.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
