import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../atoms/Button";
import useGsap from "../../utils/useGsap";

const Hero = () => {
  const sectionRef = useRef(null);
  const badgeRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const visualRef = useRef(null);
  const iconRef = useRef(null);
  const particlesRef = useRef(null);

  const { gsap, fadeInUp, fadeInLeft, scaleIn, heroTextReveal } = useGsap();

  // Main entrance animations
  useEffect(() => {
    if (!gsap || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Badge fade in
      gsap.fromTo(
        badgeRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1 }
      );

      // Hero text reveal on h1
      if (headingRef.current) {
        heroTextReveal(headingRef.current);
      }

      // Subtitle fade in up
      if (subtitleRef.current) {
        fadeInUp(subtitleRef.current, 0.8);
      }

      // CTA buttons fade in from left
      if (ctaRef.current) {
        fadeInLeft(ctaRef.current, 1.1);
      }

      // Hero visual scale in
      if (visualRef.current) {
        scaleIn(visualRef.current, 0.5);
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [gsap, fadeInUp, fadeInLeft, scaleIn, heroTextReveal]);

  // Floating animation on the code icon (continuous)
  useEffect(() => {
    if (!gsap || !iconRef.current) return;

    const tween = gsap.to(iconRef.current, {
      y: -15,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => tween.kill();
  }, [gsap]);

  // Particle / sparkle effect in hero visual background
  useEffect(() => {
    if (!gsap || !particlesRef.current) return;

    const container = particlesRef.current;
    const particles = [];
    const PARTICLE_COUNT = 18;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = document.createElement("span");
      particle.className = "pointer-events-none absolute rounded-full";

      // Randomize size between small dots and medium sparkles
      const size = Math.random() * 6 + 3;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // Use palette colors for particles
      const colors = ["#D96868", "#F2F2F2", "#91AE6E", "#689D4B"];
      particle.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      particle.style.opacity = "0";

      container.appendChild(particle);
      particles.push(particle);

      // Animate each particle in a loop
      const animateParticle = () => {
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;

        gsap.set(particle, {
          left: `${startX}%`,
          top: `${startY}%`,
          opacity: 0,
          scale: 0,
        });

        gsap.to(particle, {
          opacity: Math.random() * 0.7 + 0.3,
          scale: 1,
          duration: Math.random() * 1 + 0.5,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(particle, {
              opacity: 0,
              scale: 0,
              y: -(Math.random() * 40 + 20),
              duration: Math.random() * 1.5 + 1,
              ease: "power1.in",
              onComplete: animateParticle,
            });
          },
        });
      };

      // Stagger particle start times
      gsap.delayedCall(Math.random() * 3, animateParticle);
    }

    return () => {
      particles.forEach((p) => {
        gsap.killTweensOf(p);
        p.remove();
      });
    };
  }, [gsap]);

  return (
    <section ref={sectionRef} className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div
            ref={badgeRef}
            className="mb-5 inline-flex rounded-full bg-[#E5ECE2] px-4 py-2 text-sm font-bold text-[#4A6E33] dark:bg-[#1E2B1E] dark:text-[#91AE6E] border border-[#91AE6E]/40 shadow-xs"
            style={{ opacity: 0 }}
          >
            The Developer's Command Center
          </div>

          <h1
            ref={headingRef}
            className="text-5xl font-black leading-tight md:text-6xl text-[#1A241A] dark:text-[#F2F2F2]"
            style={{ visibility: "hidden" }}
          >
            All Coding Platforms. One Destination.
          </h1>

          <p
            ref={subtitleRef}
            className="mt-6 max-w-xl text-lg leading-8 text-[#4A584A] dark:text-[#D2DDD0]"
            style={{ opacity: 0 }}
          >
            Track your coding progress, ratings, contests and profiles from
            multiple coding platforms in one unified dashboard.
          </p>

          <div
            ref={ctaRef}
            className="mt-8 flex flex-wrap gap-3"
            style={{ opacity: 0 }}
          >
            <Link to="/platforms">
              <Button variant="primary">Explore 30+ Platforms</Button>
            </Link>

            <Link to="/contests">
              <Button variant="secondary">🏆 Contests & Arena</Button>
            </Link>

            <Link to="/ide">
              <Button variant="secondary">💻 Open IDE</Button>
            </Link>
          </div>
        </div>

        <div
          ref={visualRef}
          className="hero-visual relative overflow-hidden rounded-[2rem] bg-[#E5ECE2] dark:bg-[#1D261D] p-10 border-2 border-[#91AE6E]/40 dark:border-[#2E3D2E]"
          style={{ opacity: 0 }}
        >
          {/* Particle container */}
          <div
            ref={particlesRef}
            className="pointer-events-none absolute inset-0"
          />

          <div className="flex min-h-[320px] items-center justify-center">
            <div
              ref={iconRef}
              className="text-[120px] font-black text-[#689D4B] dark:text-[#91AE6E]"
            >
              {"</>"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
