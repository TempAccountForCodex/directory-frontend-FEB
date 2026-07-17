import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { useVisibility } from "@/hooks/useVisibility";
import "./ParticlesBackground.css";

const ParticlesBackground = () => {
  const [init, setInit] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Container | null>(null);
  const isVisible = useVisibility(containerRef);
  const [shouldInit, setShouldInit] = useState(false);

  useEffect(() => {
    if (isVisible) setShouldInit(true);
  }, [isVisible]);

  useEffect(() => {
    if (!shouldInit || init) return;

    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, [shouldInit, init]);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    if (isVisible) container.play();
    else container.pause();
  }, [isVisible]);

  const particlesLoaded = useCallback(
    async (container?: Container) => {
      particlesRef.current = container ?? null;
      if (!isVisible) container?.pause();
    },
    [isVisible],
  );

  const options = useMemo<ISourceOptions>(
    () => ({
      fpsLimit: 30,
      interactivity: {
        events: {
          onClick: { enable: false, mode: "push" },
          onHover: { enable: !isSmallScreen, mode: "repulse" },
        },
        modes: {
          push: { quantity: 4 },
          repulse: { distance: 230, duration: 0.4 },
        },
      },
      particles: {
        color: { value: "#f1f1f1" },
        links: {
          color: theme.palette.text.main,
          distance: 100,
          enable: true,
          opacity: 0.5,
          width: 1.5,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: { default: "bounce" },
          random: false,
          speed: 3,
          straight: false,
        },
        number: {
          density: { enable: true, area: 1080 },
          value: 700,
        },
        opacity: {
          value: { min: 0.1, max: 0.5 },
          animation: {
            enable: false,
            speed: 1,
            minimumValue: 0.1,
          },
        },
        shape: { type: "circle" },
        size: {
          value: { min: 0.5, max: 1 },
          random: { enable: true },
        },
      },
      detectRetina: false,
    }),
    [theme, isSmallScreen],
  );

  return (
    <div ref={containerRef} className="campaign-particles" aria-hidden="true">
      {init && (
        <Particles
          id="tsparticles"
          options={options}
          particlesLoaded={particlesLoaded}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
};

export default ParticlesBackground;
