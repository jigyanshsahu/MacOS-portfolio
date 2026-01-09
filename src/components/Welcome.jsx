import gsap from "gsap";
import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";

const FONT_WEIGHT = {
  subtitle: { min: 100, max: 400, base: 100 },
  title: { min: 400, max: 900, base: 400 },
};

const renderText = (text, className = "", baseWeight = 400) =>
  [...text].map((char, i) => (
    <span
      key={i}
      className={className}
      style={{ fontVariationSettings: `"wght" ${baseWeight}` }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  ));

const setupTextHover = (container, type) => {
  if (!container) return;

  const letters = container.querySelectorAll("span");
  if (!letters.length) return;

  const { min, max, base } = FONT_WEIGHT[type];

  const animateLetter = (letter, weight) =>
    gsap.to(letter, {
      fontVariationSettings: `"wght" ${weight}`,
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });

  const handleMouseMove = (e) => {
    const { left } = container.getBoundingClientRect();
    const mouseX = e.clientX - left;

    letters.forEach((letter) => {
      const { left: l, width: w } = letter.getBoundingClientRect();
      const center = l - left + w / 2;
      const distance = Math.abs(mouseX - center);

      const intensity = Math.exp(-(distance ** 2) / 20000);
      const weight = min + (max - min) * intensity;

      animateLetter(letter, weight);
    });
  };
const handleMouseLeave = () => letters.forEach((letter)=> animateLetter(letter,base,0.3))

  container.addEventListener("mousemove", handleMouseMove);
  container.addEventListener("mouseleave", handleMouseLeave);


  return () => {
    container.removeEventListener("mousemove", handleMouseMove);
    container.removeEventListener("mouseleave", handleMouseLeave);
    letters.forEach((l) =>
      gsap.set(l, { fontVariationSettings: `"wght" ${base}` })
    );
  };
};

const Welcome = () => {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useGSAP(() => {
    const cleanups = [
      setupTextHover(titleRef.current, "title"),
      setupTextHover(subtitleRef.current, "subtitle"),
    ];

    return () => cleanups.forEach((fn) => fn && fn());
  }, []);

  return (
    <section id="welcome">
      <p ref={subtitleRef} className="text-3xl font-georama">
        {renderText("Hello, I'm Jigyansh! Welcome to my", "", 300)}
      </p>

      <h1 ref={titleRef} className="mt-7">
        {renderText("portfolio", "text-9xl italic font-georama", 400)}
      </h1>

      <div className="small-screen">
        <p>This portfolio is  designed for desktop/tablet screens only.</p>
      </div>
      </section>
  );
};

export default Welcome;
