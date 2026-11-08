import Navbar from "../components/organisms/Navbar";
import Hero from "../components/organisms/Hero";
import PlatformSection from "../components/organisms/PlatformSection";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#EEEEEE] dark:bg-[#071B2B]">
      <Navbar />
      <Hero />
      <PlatformSection />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl bg-[#071B2B] p-10 text-[#EEEEEE] border border-[#167D8D]/40 shadow-xl">
          <p className="text-[#B9E4E8] font-bold tracking-wider uppercase text-xs">
            CODING HUB
          </p>

          <h2 className="mt-3 text-3xl font-black text-white">
            Your coding journey, all in one place.
          </h2>

          <p className="mt-4 max-w-2xl text-[#cbd5e1] leading-relaxed">
            Connect your coding profiles, track solved problems, compare performance and never miss a contest across 30 top global platforms.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
