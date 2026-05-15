import React, { useRef, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";
import SectionHeader from "../../UI/SectionHeader";

const videoSrc: string =
  "/assets/publicAssets/videos/About/bg_test2_compressed.mp4";
const bgVideoSrc: string =
  "/assets/publicAssets/videos/About/why-choose-us-bg.mp4";

const Wrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  textAlign: "center",
  overflow: "hidden",
  padding: "120px 0px 227px 0px",
  [theme.breakpoints.down("md")]: {
    padding: "100px 0 120px",
  },
  [theme.breakpoints.down("sm")]: {
    padding: "60px 0 120px",
  },
  backgroundColor: "transparent",
  color: "#fff",
  zIndex: 1,
}));

const WordWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexWrap: "wrap",
  fontWeight: 900,
  fontSize: "10rem",
  letterSpacing: "0.02em",
  position: "relative",
  lineHeight: 1,
  [theme.breakpoints.down("xl")]: { fontSize: "8rem" },
  [theme.breakpoints.down("lg")]: { fontSize: "6rem" },
  [theme.breakpoints.down("md")]: { fontSize: "4.5rem" },
  [theme.breakpoints.down("sm")]: {
    fontSize: "2.5rem",
    letterSpacing: "0.01em",
  },
}));

const LetterWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  margin: "0 0px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    margin: "0 2px",
  },
}));

const LetterChar = styled(Box)({
  visibility: "hidden",
  fontWeight: 900,
});

interface ConnectorProps {
  anchor: "top" | "bottom";
}

const Connector = styled(Box, {
  shouldForwardProp: (prop) => prop !== "anchor",
})<ConnectorProps>(({ anchor }) => ({
  position: "absolute",
  [anchor === "top" ? "top" : "bottom"]: "-85px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  zIndex: 3,
}));

const DashedLine = styled("div")({
  borderLeft: "2px dashed #000",
  height: 40,
});

const Circle = styled("div")({
  width: 10,
  height: 10,
  borderRadius: "50%",
  border: "2px solid #000",
  backgroundColor: "transparent",
});

const Keyword = styled(Typography)(({ theme }) => ({
  fontSize: "0.85rem",
  color: "#666",
  fontWeight: 400,
  whiteSpace: "nowrap",
  marginTop: theme.spacing(1),
  [theme.breakpoints.down("lg")]: { fontSize: "0.7rem" },
  [theme.breakpoints.down("sm")]: { fontSize: "0.6rem" },
}));

const MaskedVideoText = styled(Box)({
  position: "relative",
  display: "inline-block",
  width: "100%",
});

// ===== main =====
export default function WhyChooseUs(): JSX.Element {
  const [videoActive, setVideoActive] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const frameCbRef = useRef<number | null>(null);
  const metricsRef = useRef({ width: 0, height: 0, fontSize: "16px" });

  const letters: {
    char: string;
    word: string;
    position: "top" | "bottom";
  }[] = [
    { char: "T", word: "Transparent", position: "top" },
    { char: "E", word: "Excellence", position: "bottom" },
    { char: "C", word: "Collaboration", position: "top" },
    { char: "H", word: "Honesty", position: "bottom" },
    { char: "I", word: "Innovation", position: "top" },
    { char: "E", word: "Empathy", position: "bottom" },
    { char: "T", word: "Trust", position: "top" },
    { char: "R", word: "Reliability", position: "bottom" },
    { char: "I", word: "Integrity", position: "top" },
    { char: "B", word: "Boldness", position: "bottom" },
    { char: "E", word: "Empowerment", position: "top" },
  ];

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVideoActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "220px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setIsInViewport(Boolean(entries[0]?.isIntersecting));
      },
      { threshold: 0.05, rootMargin: "120px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!videoActive || !isInViewport) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const wrap = textContainerRef.current;
    if (!video || !canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(1.5, Math.max(1, window.devicePixelRatio || 1));

    const sizeCanvas = () => {
      const rect = wrap.getBoundingClientRect();
      canvas.style.width = `${rect.width + 50}px`;
      canvas.style.height = `${rect.height}px`;
      canvas.style.marginLeft = `-30px`;

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      metricsRef.current = {
        width: rect.width,
        height: rect.height,
        fontSize: window.getComputedStyle(wrap).fontSize,
      };
    };

    const drawFrame = () => {
      const { width, height, fontSize } = metricsRef.current;
      if (!width || !height) return;
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, width, height);

        ctx.drawImage(video, 0, 0, width, height);

        ctx.globalCompositeOperation = "destination-in";
        ctx.font = `900 ${fontSize} Sora, Arial, system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000";

        ctx.fillText("TECHIETRIBE", width / 2, height / 2);
        ctx.globalCompositeOperation = "source-over";
      }
    };

    const schedule = () => {
      if (typeof video.requestVideoFrameCallback === "function") {
        frameCbRef.current = video.requestVideoFrameCallback(() => {
          drawFrame();
          schedule();
        });
        return;
      }

      let lastTs = 0;
      const tick = (ts: number) => {
        if (ts - lastTs >= 33) {
          lastTs = ts;
          drawFrame();
        }
        frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (
        frameCbRef.current &&
        typeof video.cancelVideoFrameCallback === "function"
      ) {
        video.cancelVideoFrameCallback(frameCbRef.current);
        frameCbRef.current = null;
      }
    };

    sizeCanvas();
    const ro = new ResizeObserver(sizeCanvas);
    ro.observe(wrap);

    video.play().catch(() => {});
    schedule();

    return () => {
      stop();
      ro.disconnect();
    };
  }, [videoActive, isInViewport]);

  return (
    <Wrapper ref={sectionRef}>
      {videoActive && (
        <Box
          component="video"
          src={bgVideoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
            opacity: 0.25,
          }}
        />
      )}

      {videoActive && (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          crossOrigin="anonymous"
          style={{ position: "absolute", width: 0, height: 0, opacity: 0 }}
        />
      )}

      <SectionHeader
        text="Empowering Businesses with Powerful Online Presence"
        subtext="We make it easy for every business to get online with a free professional landing page and built-in directory visibility no coding, no complexity, no extra cost."
        variant="lg"
        align="center"
        sx={{ mb: 4 }}
        titleSx={{ color: "#151515ff", letterSpacing: 0.5, fontWeight: 800 }}
        subtextSx={{
          maxWidth: 800,
          color: "text.primary",
          mb: { xs: "100px", sm: "150px" },
        }}
      />

      <MaskedVideoText>
        {videoActive && (
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        )}

        <WordWrapper ref={textContainerRef}>
          {letters.map(({ char, word, position }, index) => (
            <LetterWrapper key={index}>
              {position === "top" && (
                <Connector anchor="top">
                  <Keyword>{word}</Keyword>
                  <DashedLine />
                  <Circle />
                </Connector>
              )}

              <LetterChar>{char}</LetterChar>

              {position === "bottom" && (
                <Connector anchor="bottom">
                  <Circle />
                  <DashedLine />
                  <Keyword>{word}</Keyword>
                </Connector>
              )}
            </LetterWrapper>
          ))}
        </WordWrapper>
      </MaskedVideoText>
    </Wrapper>
  );
}
