import { useRef, useEffect } from "react";
import useGsap from "../../utils/useGsap";

/**
 * Animated wrapper component that triggers GSAP animations
 * when the element enters the viewport via ScrollTrigger.
 *
 * @param {object} props
 * @param {"fadeInUp"|"fadeInLeft"|"fadeInRight"|"scaleIn"|"staggerChildren"} props.animation
 * @param {number} [props.delay=0]
 * @param {number} [props.stagger=0.15]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
const AnimatedSection = ({
  animation = "fadeInUp",
  delay = 0,
  stagger = 0.15,
  className = "",
  children,
}) => {
  const ref = useRef(null);
  const {
    gsap,
    ScrollTrigger,
    fadeInUp,
    fadeInLeft,
    fadeInRight,
    scaleIn,
    staggerChildren,
  } = useGsap();

  useEffect(() => {
    const el = ref.current;
    if (!gsap || !ScrollTrigger || !el) return;

    // Set initial hidden state
    gsap.set(el, { opacity: 0 });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        switch (animation) {
          case "fadeInUp":
            fadeInUp(el, delay);
            break;
          case "fadeInLeft":
            fadeInLeft(el, delay);
            break;
          case "fadeInRight":
            fadeInRight(el, delay);
            break;
          case "scaleIn":
            scaleIn(el, delay);
            break;
          case "staggerChildren":
            gsap.set(el, { opacity: 1 });
            staggerChildren(el, "> *", stagger);
            break;
          default:
            fadeInUp(el, delay);
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, [
    gsap,
    ScrollTrigger,
    animation,
    delay,
    stagger,
    fadeInUp,
    fadeInLeft,
    fadeInRight,
    scaleIn,
    staggerChildren,
  ]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default AnimatedSection;
