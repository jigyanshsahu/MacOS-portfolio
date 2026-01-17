import useWindowStore from "#store/Window";
import { useGSAP } from "@gsap/react";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

const WindowWrapper = (Component, windowKey) => {
  const Wrapped = (props) => {
    const { focusWindow, windows } = useWindowStore();
    const windowState = windows?.[windowKey];

    if (!windowState) return null;

    const { isOpen, zIndex } = windowState;

    const ref = useRef(null);

    /* ---------- OPEN ANIMATION ---------- */
    useGSAP(
      () => {
        const el = ref.current;
        if (!el || !isOpen) return;

        el.style.display = "block";

        gsap.fromTo(
          el,
          { scale: 0.85, opacity: 0, y: 30 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: "power3.out",
          }
        );
      },
      { dependencies: [isOpen], scope: ref }
    );

    /* ---------- DRAG + FOCUS ---------- */
    useGSAP(() => {
      const el = ref.current;
      if (!el || !isOpen) return;

      const [instance] = Draggable.create(el, {
        onPress: () => {
          if (isOpen) focusWindow(windowKey);
        },
      });

      return () => instance.kill();
    }, [isOpen]);

    /* ---------- CLOSE ANIMATION ---------- */
    useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;

      if (!isOpen) {
        gsap.to(el, {
          opacity: 0,
          scale: 0.95,
          duration: 0.2,
          onComplete: () => {
            el.style.display = "none";
          },
        });
      }
    }, [isOpen]);

    return (
      <section
        id={windowKey}
        ref={ref}
        className="absolute"
        style={{ zIndex, display: isOpen ? "block" : "none" }}
        onMouseDown={() => {
          if (isOpen) focusWindow(windowKey);
        }}
      >
        <Component {...props} />
      </section>
    );
  };

  Wrapped.displayName = `WindowWrapper(${
    Component.displayName || Component.name || "Component"
  })`;

  return Wrapped;
};

export default WindowWrapper;
