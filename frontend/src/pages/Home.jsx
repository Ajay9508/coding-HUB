import Navbar from
  "../components/organisms/Navbar";

import Hero from
  "../components/organisms/Hero";

import PlatformSection from
  "../components/organisms/PlatformSection";
// import Sidebar from "../components/organisms/Sidebar";
const Home = () => {
  return (
    <div className="min-h-screen bg-[#FFFBF5]">
        <Navbar />
        {/* <Sidebar/> */}
      <Hero />
      <PlatformSection />

      <section className="mx-auto max-w-7xl  px-6 py-16">
        <div className="rounded-3xl  bg-[#171717] p-10  text-white   ">
          <p className="  text-[rgb(255,208,90)] font-semibold">
            CODING HUB
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Your coding journey,
            all in one place.
          </h2>

          <p className=" mt-4 max-w-2xl text-gray-300">
            Connect your coding profiles,
            track solved problems,
            compare performance and
            never miss a contest.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;