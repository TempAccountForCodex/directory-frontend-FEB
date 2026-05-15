import React, { useRef, useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";

/**
 * Vertical scroll drives horizontal movement across N panels,
 * then adds a vertical "tail" phase on the last panel and exposes progress [0..1].
 *
 * Props:
 *  - gap: CSS length between panels (default 0)
 *  - tailScreens: how many viewport-heights to allocate for vertical tail (default 1)
 *  - pinOffset: sticky top offset (default 0) if you have a fixed header
 */
interface HorizontalPinScrollProps {
  children: React.ReactNode;
  gap?: number | string;
  tailScreens?: number;
  pinOffset?: number;
}

const HorizontalPinScroll: React.FC<HorizontalPinScrollProps> = ({
  children,
  gap = 0,
  tailScreens = 1,
  pinOffset = 0,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [workflowProgress, setWorkflowProgress] = useState(0);

  const panels = useMemo(() => React.Children.toArray(children), [children]);
  const count = panels.length;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;

        const rect = wrapper.getBoundingClientRect();
        const viewH = window.innerHeight;

        // Amount we've scrolled into the wrapper (0 when wrapper top hits viewport top)
        const start = Math.max(0, -rect.top + pinOffset);

        // Horizontal phase spans (count - 1) screens
        const horizScrollHeight = Math.max(0, (count - 1) * viewH);

        // Total scrollable height inside wrapper:
        //  - (count - 1) screens for horizontal
        //  - + tailScreens screens for the vertical tail on the last panel
        const totalScrollable = horizScrollHeight + tailScreens * viewH;

        // Progress within horizontal part [0..1]
        const horizProgress =
          horizScrollHeight > 0
            ? Math.min(1, Math.max(0, start / horizScrollHeight))
            : 1;

        // Move the track horizontally
        const maxX = Math.max(0, track.scrollWidth - window.innerWidth);
        const x = -horizProgress * maxX;
        track.style.transform = `translateX(${x}px)`;

        // If we've finished horizontal scrolling, enter vertical tail
        if (horizProgress >= 1 - 1e-3 || Math.abs(x) >= maxX - 0.5) {
          const tailStart = horizScrollHeight;
          const tailRange = totalScrollable - horizScrollHeight; // = tailScreens * viewH
          let newProgress = 0;
          if (tailRange > 0) {
            newProgress = Math.min(
              1,
              Math.max(0, (start - tailStart) / tailRange),
            );
          }
          setWorkflowProgress(newProgress);
        } else {
          setWorkflowProgress(0);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [count, gap, tailScreens, pinOffset]);

  // Wrapper height = (count - 1) screens for horizontal + tailScreens for vertical tail + 1 viewport already visible.
  // Since sticky keeps one screen pinned, total element height should be:
  //   (count - 1 + tailScreens) * 100vh + 100vh (for the pinned viewport)
  // But a simpler, accurate approach: make the wrapper tall enough that
  // scrollable distance (wrapperHeight - viewH) = horizScrollHeight + tailScreens*viewH.
  // Therefore:
  const wrapperHeight = `calc(${(count - 1 + tailScreens) * 100}vh + 100vh)`;

  return (
    <Box
      ref={wrapperRef}
      sx={{
        position: "relative",
        height: wrapperHeight,
        width: "100vw",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: "59px",
          left: 0,
          height: `calc(100vh - ${pinOffset}px)`,
          width: "100vw",
          overflow: "hidden",
          willChange: "transform",
        }}
      >
        <Box
          ref={trackRef}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            height: "100%",
            transform: "translateX(0)",
            transition: "transform 0s",
            gap,
          }}
        >
          {panels.map((child, idx) => (
            <Box
              key={idx}
              component="section"
              sx={{
                flex: "0 0 100vw",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {idx === panels.length - 1
                ? React.isValidElement(child)
                  ? React.cloneElement(child as React.ReactElement<any>, {
                      scrollProgress: workflowProgress,
                    })
                  : child
                : child}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default HorizontalPinScroll;
