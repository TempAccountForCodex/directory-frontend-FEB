import React, { useRef, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
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
  const theme = useTheme();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);

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
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const wrap = textContainerRef.current;
    if (!video || !canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.max(1, window.devicePixelRatio || 1);

    const sizeCanvas = () => {
      const rect = wrap.getBoundingClientRect();
      canvas.style.width = `${rect.width + 50}px`;
      canvas.style.height = `${rect.height}px`;
      canvas.style.marginLeft = `-30px`;

      canvas.width = rect.width * DPR;
      canvas.height = rect.height * DPR;

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const draw = () => {
      if (video.readyState >= 2) {
        const rect = wrap.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);

        ctx.drawImage(video, 0, 0, rect.width, rect.height);

        ctx.globalCompositeOperation = "destination-in";
        const fs = window.getComputedStyle(wrap).fontSize;
        ctx.font = `900 ${fs} Sora, Arial, system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000";

        ctx.fillText("TECHIETRIBE", rect.width / 2, rect.height / 2);
        ctx.globalCompositeOperation = "source-over";
      }
      requestAnimationFrame(draw);
    };

    sizeCanvas();
    const ro = new ResizeObserver(sizeCanvas);
    ro.observe(wrap);

    video.play().catch(() => {});
    requestAnimationFrame(draw);

    return () => ro.disconnect();
  }, []);

  return (
    <Wrapper>
      <Box
        component="video"
        src={bgVideoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
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

      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        style={{ position: "absolute", width: 0, height: 0, opacity: 0 }}
      />

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
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

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
