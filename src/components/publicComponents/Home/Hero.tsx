import React from "react";
import { useNavigate } from "react-router-dom";

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

const HeroMobile = "/assets/publicAssets/videos/Home/hero7.mp4";
const HeroMobileFrame = "/assets/publicAssets/images/home/heroFrames/hero7.webp";

// `frame` is the video's first frame, shown as placeholder while it loads
const SLIDES = [
  {
    id: 1,
    title: "Education",
    image: "/assets/publicAssets/images/home/Education.webp",
    video: "/assets/publicAssets/videos/Home/Education.mp4",
    frame: "/assets/publicAssets/images/home/heroFrames/Education.webp",
  },
  {
    id: 2,
    title: "Gardening",
    image: "/assets/publicAssets/images/home/Gardening.webp",
    video: "/assets/publicAssets/videos/Home/Gardening.mp4",
    frame: "/assets/publicAssets/images/home/heroFrames/Gardening.webp",
  },
  {
    id: 3,
    title: "Consulting",
    image: "/assets/publicAssets/images/home/Consulting.webp",
    video: "/assets/publicAssets/videos/Home/Consulting.mp4",
    frame: "/assets/publicAssets/images/home/heroFrames/Consulting.webp",
  },
  {
    id: 4,
    title: "Restaurant",
    image: "/assets/publicAssets/images/home/Restaurant.webp",
    video: "/assets/publicAssets/videos/Home/Restaurant.mp4",
    frame: "/assets/publicAssets/images/home/heroFrames/Restaurant.webp",
  },
  {
    id: 5,
    title: "Plumbing",
    image: "/assets/publicAssets/images/home/Plumbing.webp",
    video: "/assets/publicAssets/videos/Home/Plumbing.mp4",
    frame: "/assets/publicAssets/images/home/heroFrames/Plumbing.webp",
  },
];

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

function styleFor(offset: number, isMobile: boolean): React.CSSProperties {
  if (offset === 0) {
    return {
      transform: "translateX(-50%) translateZ(0) scale(1)",
      zIndex: 5,
      opacity: 1,
      cursor: "pointer",
    };
  }

  const side = Math.sign(offset);
  const depth = clamp(Math.abs(offset), 1, 2);
  const tx = (isMobile ? 38 : 48) * side * depth;
  const ry = (isMobile ? 14 : 18) * side * depth;
  const tz = -160 * depth;
  const sc = 0.9 - (depth - 1) * 0.08;

  return {
    transform: `translateX(calc(-50% + ${tx}%)) translateZ(${tz}px) rotateY(${ry}deg) scale(${sc})`,
    zIndex: 5 - depth,
    opacity: depth === 2 ? 0.55 : 0.8,
    filter: "brightness(0.75)",
    cursor: "pointer",
  };
}

export default function HeroDepthCarousel() {
  const [index, setIndex] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth < 900);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = React.useState(false);
  const [videoLoaded, setVideoLoaded] = React.useState(false);
  const navigate = useNavigate();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Intersection Observer for lazy video loading
  React.useEffect(() => {
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Defer video loading until after initial paint
            const scheduleIdle: typeof window.requestIdleCallback =
              window.requestIdleCallback ||
              ((callback: IdleRequestCallback) =>
                window.setTimeout(
                  () =>
                    callback({
                      didTimeout: false,
                      timeRemaining: () => 0,
                    }),
                  1,
                ) as unknown as number);

            scheduleIdle(() => {
              setShouldLoadVideo(true);
            }, { timeout: 2000 });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    observerRef.current = observer;

    const heroSection = document.querySelector("section");
    if (heroSection) {
      observer.observe(heroSection);
    }

    return () => {
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  const heroVideoSrc = isMobile ? HeroMobile : SLIDES[index].video;
  const heroPlaceholderSrc = isMobile ? HeroMobileFrame : SLIDES[index].frame;

  // (Re)load the video whenever its source changes; fade it back in once
  // the new source is playable so the per-slide placeholder shows meanwhile
  React.useEffect(() => {
    if (!shouldLoadVideo || !videoRef.current) return;
    const video = videoRef.current;

    setVideoLoaded(false);

    const handleCanPlay = () => {
      setVideoLoaded(true);
    };

    const handleError = () => {
      // Silently fail if video fails to load
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.load();

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [shouldLoadVideo, heroVideoSrc]);

  // Prefetch first-frame placeholders so they show instantly on slide switch
  React.useEffect(() => {
    if (!shouldLoadVideo || isMobile) return;
    SLIDES.forEach((s) => {
      const img = new Image();
      img.src = s.frame;
    });
  }, [shouldLoadVideo, isMobile]);

  // Auto-scroll carousel every 6 seconds
  React.useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      6000,
    );
    return () => clearInterval(id);
  }, []);

  const next = () => setIndex((i) => (i + 1) % SLIDES.length);
  const prev = () => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);

  const handleCardClick = (i: number, off: number) => {
    if (off !== 0) {
      // Navigate to center first, then after animation navigate to preview
      setIndex(i);
      setTimeout(() => {
        navigate(`/landing-preview/${SLIDES[i].title.toLowerCase()}`);
      }, 320);
    } else {
      navigate(`/landing-preview/${SLIDES[i].title.toLowerCase()}`);
    }
  };

  const shouldRenderVideo = !prefersReducedMotion && shouldLoadVideo;

  return (
    <section
      style={{
        position: "relative",
        minHeight: "auto",
        overflow: "hidden",
        backgroundColor: "#0a0a0a",
        paddingBottom: 40,
      }}
    >
      {shouldRenderVideo && (
        <>
          <img
            src={heroPlaceholderSrc}
            alt=""
            aria-hidden
            decoding="async"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
              opacity: videoLoaded ? 0 : 0.85,
              transition: "opacity 0.5s ease-in",
              willChange: "opacity",
            }}
          />
          <video
            ref={videoRef}
            src={heroVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            disablePictureInPicture
            disableRemotePlayback
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
              opacity: videoLoaded ? 0.85 : 0,
              transition: "opacity 0.5s ease-in",
              willChange: "opacity",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          />
        </>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0.3))",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1100,
          margin: "0 auto",
          textAlign: "center",
          padding: "140px 16px 0",
        }}
      >
        <p
          style={{
            color: "#fff",
            letterSpacing: "0.18em",
            fontWeight: 600,
            opacity: 0.9,
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            margin: 0,
          }}
        >
          THE FASTEST WAY TO GO ONLINE
        </p>

        <h1
          style={{
            fontSize: "clamp(2rem, 7vw, 4.1rem)",
            fontWeight: 500,
            lineHeight: 1.15,
            color: "#fff",
            maxWidth: 900,
            margin: "24px auto 0",
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          Create Your <strong>Business</strong> Landing Page in Minutes
           with <strong>AI</strong>.
        </h1>

        <button
          type="button"
          style={{
            marginTop: 24,
            border: "none",
            borderRadius: 999,
            padding: "14px 34px",
            backgroundColor: "#fff",
            color: "#000",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 16,
            boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
          }}
        >
          Start Building with AI <span aria-hidden>→</span>
        </button>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1400,
          margin: "56px auto 0",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            position: "relative",
            perspective: 1600,
            height: isMobile ? 300 : 520,
            overflow: "visible",
          }}
        >
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#fff",
              background: "rgba(0,0,0,.5)",
              zIndex: 10,
              border: "none",
              borderRadius: 999,
              width: 40,
              height: 40,
              cursor: "pointer",
            }}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#fff",
              background: "rgba(0,0,0,.5)",
              zIndex: 10,
              border: "none",
              borderRadius: 999,
              width: 40,
              height: 40,
              cursor: "pointer",
            }}
          >
            ›
          </button>

          {SLIDES.map((it, i) => {
            let off = i - index;
            if (off > SLIDES.length / 2) off -= SLIDES.length;
            if (off < -SLIDES.length / 2) off += SLIDES.length;
            const shouldLoadImage = isMobile ? off === 0 : Math.abs(off) <= 1;
            const isCenter = off === 0;

            return (
              <div
                key={it.id}
                onClick={() => handleCardClick(i, off)}
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transformStyle: "preserve-3d",
                  width: isMobile ? 320 : 740,
                  maxWidth: "88vw",
                  height: isMobile ? 300 : 520,
                  borderRadius: 24,
                  overflow: "hidden",
                  transition:
                    "transform 600ms cubic-bezier(.22,.61,.36,1), opacity 400ms",
                  boxShadow: "0 30px 70px rgba(0,0,0,.6)",
                  background: "#0e0e0e",
                  outline: "1px solid rgba(255,255,255,.05)",
                  ...styleFor(off, isMobile),
                }}
              >
                <img
                  src={shouldLoadImage ? it.image : TRANSPARENT_PIXEL}
                  alt={it.title}
                  loading={off === 0 ? "eager" : "lazy"}
                  fetchpriority={off === 0 ? "high" : "auto"}
                  decoding="async"
                  width={isMobile ? 320 : 740}
                  height={isMobile ? 300 : 520}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* Center card info bar */}
                {isCenter && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
                      padding: "40px 24px 24px",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 18,
                        fontFamily: "system-ui, sans-serif",
                      }}
                    >
                      {it.title}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#fff",
                        background: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(8px)",
                        borderRadius: 999,
                        padding: "6px 14px",
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "system-ui, sans-serif",
                        border: "1px solid rgba(255,255,255,0.3)",
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 12,
                          height: 12,
                          border: "1.5px solid currentColor",
                          borderRadius: 2,
                          boxShadow: "4px -4px 0 -2px currentColor",
                        }}
                      />
                      Preview Template
                    </span>
                  </div>
                )}

                {/* Side card hover label */}
                {!isCenter && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,0.3)",
                      opacity: 0,
                      transition: "opacity 0.25s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.opacity = "1")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.opacity = "0")
                    }
                  >
                    <span
                      style={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 15,
                        fontFamily: "system-ui, sans-serif",
                        background: "rgba(0,0,0,0.5)",
                        borderRadius: 999,
                        padding: "8px 18px",
                      }}
                    >
                      {it.title}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
