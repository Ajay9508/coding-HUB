import { useCallback, useMemo } from "react";

/**
 * Custom hook providing GSAP animation utilities.
 * Accesses GSAP and ScrollTrigger from the global window object (loaded via CDN).
 */
const useGsap = () => {
  const gsap = window.gsap || null;
  const ScrollTrigger = window.ScrollTrigger || null;

  // Register ScrollTrigger plugin if available
  if (gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /** Fade in from below */
  const fadeInUp = useCallback(
    (element, delay = 0) => {
      if (!gsap || !element) return null;
      return gsap.fromTo(
        element,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay,
          ease: "power3.out",
        }
      );
    },
    [gsap]
  );

  /** Fade in from left */
  const fadeInLeft = useCallback(
    (element, delay = 0) => {
      if (!gsap || !element) return null;
      return gsap.fromTo(
        element,
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          delay,
          ease: "power3.out",
        }
      );
    },
    [gsap]
  );

  /** Fade in from right */
  const fadeInRight = useCallback(
    (element, delay = 0) => {
      if (!gsap || !element) return null;
      return gsap.fromTo(
        element,
        { opacity: 0, x: 60 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          delay,
          ease: "power3.out",
        }
      );
    },
    [gsap]
  );

  /** Stagger animate children */
  const staggerChildren = useCallback(
    (parent, childSelector = "> *", stagger = 0.15) => {
      if (!gsap || !parent) return null;
      const children = parent.querySelectorAll(childSelector);
      if (!children.length) return null;
      return gsap.fromTo(
        children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger,
          ease: "power2.out",
        }
      );
    },
    [gsap]
  );

  /** Scale from 0 to 1 */
  const scaleIn = useCallback(
    (element, delay = 0) => {
      if (!gsap || !element) return null;
      return gsap.fromTo(
        element,
        { opacity: 0, scale: 0.7 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          delay,
          ease: "back.out(1.7)",
        }
      );
    },
    [gsap]
  );

  /** Parallax scroll effect */
  const parallax = useCallback(
    (element, speed = 0.5) => {
      if (!gsap || !ScrollTrigger || !element) return null;
      return gsap.to(element, {
        yPercent: speed * 50,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    [gsap, ScrollTrigger]
  );

  /** Character-by-character text reveal */
  const heroTextReveal = useCallback(
    (element) => {
      if (!gsap || !element) return null;

      const text = element.textContent;
      element.textContent = "";
      element.style.visibility = "visible";

      // Wrap each character in a span
      const chars = text.split("").map((char) => {
        const span = document.createElement("span");
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.display = "inline-block";
        span.style.opacity = "0";
        element.appendChild(span);
        return span;
      });

      return gsap.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.05,
        stagger: 0.03,
        ease: "power2.out",
        delay: 0.2,
      });
    },
    [gsap]
  );

  /** Magnetic hover effect for buttons */
  const magneticButton = useCallback(
    (element) => {
      if (!gsap || !element) return null;

      const handleMouseMove = (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(element, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: "power2.out",
        });
      };

      const handleMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.4)",
        });
      };

      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);

      // Return cleanup function
      return () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    },
    [gsap]
  );

  /** Count up animation */
  const smoothCounter = useCallback(
    (element, endValue, duration = 2) => {
      if (!gsap || !element) return null;

      const counter = { value: 0 };
      return gsap.to(counter, {
        value: endValue,
        duration,
        ease: "power1.out",
        onUpdate: () => {
          element.textContent = Math.round(counter.value).toLocaleString();
        },
      });
    },
    [gsap]
  );

  /** Fade in on scroll using ScrollTrigger */
  const scrollFadeIn = useCallback(
    (element) => {
      if (!gsap || !ScrollTrigger || !element) return null;
      return gsap.fromTo(
        element,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            end: "top 50%",
            toggleActions: "play none none none",
          },
        }
      );
    },
    [gsap, ScrollTrigger]
  );

  return useMemo(
    () => ({
      gsap,
      ScrollTrigger,
      fadeInUp,
      fadeInLeft,
      fadeInRight,
      staggerChildren,
      scaleIn,
      parallax,
      heroTextReveal,
      magneticButton,
      smoothCounter,
      scrollFadeIn,
    }),
    [
      gsap,
      ScrollTrigger,
      fadeInUp,
      fadeInLeft,
      fadeInRight,
      staggerChildren,
      scaleIn,
      parallax,
      heroTextReveal,
      magneticButton,
      smoothCounter,
      scrollFadeIn,
    ]
  );
};

export default useGsap;
