import { useEffect, useRef, useState } from "react";
import type { ComponentProps, FormEvent } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Modal,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import { keyframes } from "@mui/material/styles";
import {
  Check as CheckIcon,
  AutoAwesomeRounded as SparkleIcon,
  CelebrationRounded as CelebrationIcon,
  CheckCircleOutlineRounded as CheckCircleIcon,
  CloseRounded as CloseIcon,
  EmailOutlined as EmailIcon,
  ErrorOutlineRounded as ErrorIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  PersonOutlineRounded as PersonIcon,
  YouTube as YouTubeIcon,
} from "@mui/icons-material";

import ParticlesBackground from "@/components/UI/ParticlesBackground";

const comingSoonHeading = "/assets/images/Coming-soon-1.webp";

const SYSTEM_FONT =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const GOOGLE_SHEETS_WEB_APP_URL = import.meta.env
  .VITE_GOOGLE_SHEETS_WEB_APP_URL as string | undefined;

const comingSoonViewEnter = keyframes`
  0% {
    opacity: 0;
    filter: blur(8px);
    clip-path: inset(42% 0 42% 0);
    transform: scale(1.025);
  }

  100% {
    opacity: 1;
    filter: blur(0);
    clip-path: inset(0 0 0 0);
    transform: scale(1);
  }
`;

const offerPillFloat = keyframes`
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }
`;

const offerPillGlow = keyframes`
  0%,
  100% {
    opacity: 0.55;
    transform: scale(0.96);
  }

  50% {
    opacity: 1;
    transform: scale(1.08);
  }
`;

const offerPillShimmer = keyframes`
  0% {
    transform: translateX(-165%) skewX(-20deg);
  }

  60%,
  100% {
    transform: translateX(260%) skewX(-20deg);
  }
`;

const backdropAnimation = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const modalAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.965);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const DiscordIcon = (props: ComponentProps<typeof SvgIcon>) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.516c-.21.375-.444.88-.608 1.275a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.275A19.74 19.74 0 0 0 3.832 4.37C.534 9.046-.36 13.58.087 18.058a19.9 19.9 0 0 0 5.994 3.03c.48-.655.91-1.35 1.28-2.08a12.98 12.98 0 0 1-2.02-.97c.17-.124.336-.253.498-.385 3.9 1.804 8.13 1.804 11.982 0 .164.134.33.263.498.386-.64.38-1.317.705-2.02.97.37.73.798 1.425 1.28 2.08a19.88 19.88 0 0 0 5.994-3.03c.524-5.188-.894-9.68-3.256-13.69ZM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.333-.956 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.333-.946 2.419-2.157 2.419Z" />
  </SvgIcon>
);

const socialLinks = [
  {
    label: "Discord",
    href: "https://discord.gg/fNCrM6gA7F",
    Icon: DiscordIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/thetechietribe.official",
    Icon: FacebookIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/thetechietribe_/",
    Icon: InstagramIcon,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@thetechietribe.official",
    Icon: YouTubeIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/techietribe",
    Icon: LinkedInIcon,
  },
];

const offerTerms = [
  "You will choose from the available Premium Techietribe AI templates.",
  "Techietribe will customize the selected template using your content, logo, images, brand colors, and instructions.",
  "The offer includes only minor text, image, color, and section adjustments.",
  "Custom designs, major layout changes, advanced features, integrations, and additional pages are not included.",
  "You must provide complete and accurate content on time.",
  "You confirm that you have permission to use all submitted content and images.",
  "The offer includes up to one reasonable revision rounds.",
  "Domain registration, custom domains setup, renewals, premium assets, and third-party services are not included.",
  "You are responsible for maintaining the required subscription.",
  "Applying does not guarantee acceptance.",
  "Techietribe may reject requests that are incomplete, unsuitable, unlawful, technically impractical, or outside the offer's scope.",
  "Techietribe does not guarantee traffic, leads, sales, conversions, or search rankings.",
];

const visuallyHiddenSx = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

const fieldLabelSx = {
  position: "relative",
  display: "flex",
  alignItems: "center",

  "& > .MuiSvgIcon-root": {
    position: "absolute",
    left: "1.15rem",
    color: "rgba(255, 255, 255, 0.78)",
    pointerEvents: "none",
    zIndex: 1,
    fontSize: "18px",
  },
} as const;

const fieldInputSx = {
  display: "block",
  width: "100%",
  minHeight: "3.55rem",
  boxSizing: "border-box",
  margin: 0,
  border: "1px solid rgba(255, 255, 255, 0.34)",
  borderRadius: "999px",
  background: "rgba(255, 255, 255, 0.12)",
  color: "#fff",
  padding: "0.85rem 1.1rem 0.85rem 3.1rem",
  font: "inherit",
  outline: "none",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.12)",
  transition:
    "box-shadow 160ms ease, border-color 160ms ease, background 160ms ease",

  "&::placeholder": {
    color: "rgba(255, 255, 255, 0.68)",
    opacity: 1,
  },

  "&:focus": {
    borderColor: "rgba(255, 255, 255, 0.68)",
    background: "rgba(255, 255, 255, 0.18)",
    boxShadow:
      "0 0 0 4px rgba(55, 140, 146, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.18)",
  },
} as const;

const waitlistButtonSx = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.55rem",
  minWidth: "180px",
  minHeight: "3.55rem",
  boxSizing: "border-box",
  border: 0,
  borderRadius: "999px",
  padding: "0.85rem 1.3rem",
  background: "#fff",
  color: "#101513",
  font: "inherit",
  fontWeight: 800,
  lineHeight: "normal",
  textTransform: "none",
  cursor: "pointer",
  boxShadow: "0 16px 36px rgba(0, 0, 0, 0.28)",
  transition: "transform 160ms ease, background 160ms ease, opacity 160ms ease",

  "&:hover": {
    background: "#f1f1f1",
    transform: "translateY(-2px)",
    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.28)",
  },

  "&:focus-visible": {
    outline: "3px solid rgba(155, 214, 216, 0.5)",
    outlineOffset: "3px",
  },

  "&.Mui-disabled": {
    pointerEvents: "auto",
    cursor: "not-allowed",
    opacity: 0.7,
    background: "#fff",
    color: "#101513",
    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.28)",
    transform: "none",
  },

  "@media (max-width: 600px)": {
    width: "100%",
  },

  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
} as const;

const modalActionBaseSx = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 0,
  minHeight: "3rem",
  boxSizing: "border-box",
  padding: "0.85rem 1.35rem",
  borderRadius: "999px",
  font: "inherit",
  fontWeight: 800,
  lineHeight: "normal",
  textTransform: "none",
  cursor: "pointer",
  transition: "background 160ms ease, opacity 160ms ease",

  "&:focus-visible": {
    outline: "3px solid rgba(155, 214, 216, 0.5)",
    outlineOffset: "3px",
  },

  "@media (max-width: 600px)": {
    width: "100%",
  },
} as const;

const ComingSoon = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const modalTitleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (!isTermsOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      modalTitleRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTermsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTermsOpen]);

  const openTerms = () => {
    setIsTermsOpen(true);
  };

  const handleTermsToggle = () => {
    setTermsAccepted((currentValue) => !currentValue);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!termsAccepted) {
      setStatus("error");
      setMessage("Please agree to the Terms & Conditions before joining.");
      return;
    }

    if (!GOOGLE_SHEETS_WEB_APP_URL) {
      setStatus("error");
      setMessage(
        "The early-access form is not configured. Add VITE_GOOGLE_SHEETS_WEB_APP_URL to your environment file.",
      );
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          termsAccepted,
          website: "",
          source: "early-access",
        }),
      });

      setName("");
      setEmail("");
      setStatus("success");
      setMessage("Your early-access request has been submitted.");
    } catch {
      setStatus("error");
      setMessage(
        "We could not submit your early-access request. Please try again.",
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100svh",
        overflow: "hidden",
        background: "#07110f",
      }}
    >
      <Box
        component="main"
        sx={{
          "--soon-green": "#378c92",
          "--soon-paper": "#f2f3eb",

          position: "relative",
          minHeight: "100svh",
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
          padding: "2rem 1rem",
          isolation: "isolate",
          background:
            '#07110f url("/assets/images/home/bg-image.webp") center / cover no-repeat',
          color: "#fff",
          fontFamily: SYSTEM_FONT,
          animation: `${comingSoonViewEnter} 1100ms cubic-bezier(0.22, 1, 0.36, 1) both`,
          transformOrigin: "center",
          willChange: "opacity, filter, clip-path, transform",

          "@media (max-width: 600px)": {
            padding: "2rem 1rem",
            overflowY: "auto",
          },

          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
            opacity: 1,
            filter: "none",
            clipPath: "inset(0 0 0 0)",
            transform: "scale(1)",
          },
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: -2,
            background:
              "linear-gradient(90deg, rgba(3, 15, 12, 0.82), rgba(2, 8, 7, 0.75)), linear-gradient(0deg, rgba(2, 8, 7, 0.72), transparent 60%)",
          }}
        />

        <ParticlesBackground />

        <Tooltip
          arrow
          placement="bottom-end"
          enterTouchDelay={0}
          leaveTouchDelay={5000}
          title={
            <Box sx={{ maxWidth: "320px", padding: "0.25rem" }}>
              <Typography
                component="div"
                sx={{
                  mb: "0.35rem",
                  color: "#fff",
                  fontFamily: SYSTEM_FONT,
                  fontSize: "0.9rem",
                  fontWeight: 800,
                  lineHeight: 1.3,
                }}
              >
                Your landing page build is on us
              </Typography>

              <Typography
                component="div"
                sx={{
                  color: "rgba(255, 255, 255, 0.76)",
                  fontFamily: SYSTEM_FONT,
                  fontSize: "0.8rem",
                  lineHeight: 1.55,
                }}
              >
                The first 100 approved users will receive one landing page built
                at no development cost. An active Techietribe AI subscription is
                still required for hosting, deployment, maintenance, and related
                platform services.
              </Typography>
            </Box>
          }
          slotProps={{
            tooltip: {
              sx: {
                maxWidth: "360px",
                padding: "0.85rem 1rem",
                border: "1px solid rgba(155, 214, 216, 0.24)",
                borderRadius: "14px",
                background: "rgba(7, 19, 18, 0.96)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                boxShadow: "0 18px 48px rgba(0, 0, 0, 0.42)",
              },
            },
            arrow: {
              sx: {
                color: "rgba(7, 19, 18, 0.96)",
              },
            },
          }}
        >
          <Box
            component="button"
            type="button"
            aria-label="First 100 users free landing page build offer. Hover or focus for details."
            sx={{
              position: "absolute",
              top: "clamp(1rem, 2.4vw, 2rem)",
              right: "clamp(1rem, 2.4vw, 2rem)",
              zIndex: 4,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.72rem",
              minHeight: "3rem",
              boxSizing: "border-box",
              overflow: "hidden",
              padding: "0.5rem 1rem 0.5rem 0.55rem",
              border: "1px solid rgba(255, 255, 255, 0.48)",
              borderRadius: "999px",
              background:
                "linear-gradient(110deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1) 48%, rgba(255, 255, 255, 0.2))",
              color: "#fff",
              fontFamily: SYSTEM_FONT,
              lineHeight: 1,
              whiteSpace: "nowrap",
              cursor: "help",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              scale: 0.9,
              boxShadow:
                "inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 14px 38px rgba(0, 0, 0, 0.28), 0 0 30px rgba(55, 140, 146, 0.12)",
              animation: `${offerPillFloat} 3.8s ease-in-out infinite`,
              transition:
                "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",

              "&::after": {
                content: '""',
                position: "absolute",
                top: "-40%",
                left: 0,
                width: "28%",
                height: "180%",
                pointerEvents: "none",
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent)",
                animation: `${offerPillShimmer} 4.6s ease-in-out infinite`,
              },

              "&:hover": {
                transform: "translateY(-2px) scale(1.015)",
                borderColor: "rgba(155, 214, 216, 0.8)",
                boxShadow:
                  "inset 0 1px 0 rgba(255, 255, 255, 0.24), 0 18px 44px rgba(0, 0, 0, 0.34), 0 0 34px rgba(55, 140, 146, 0.2)",
              },

              "&:focus-visible": {
                outline: "3px solid rgba(155, 214, 216, 0.5)",
                outlineOffset: "4px",
              },

              "@media (max-width: 900px)": {
                top: "1rem",
                left: "50%",
                right: "auto",
                translate: "-50% 0",
              },

              "@media (max-width: 600px)": {
                top: "0.85rem",
                left: "50%",
                right: "auto",
                translate: "-50% 0",
                minHeight: "2.65rem",
                gap: "0.55rem",
                padding: "0.42rem 0.8rem 0.42rem 0.45rem",
              },

              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",

                "&::after": {
                  animation: "none",
                  display: "none",
                },
              },
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2rem",
                height: "2rem",
                flex: "0 0 auto",
                border: "1px solid rgba(255, 255, 255, 0.24)",
                borderRadius: "50%",
                background:
                  "linear-gradient(145deg, rgba(193, 193, 193, 0.96), rgba(177, 177, 177, 0.88))",
                color: "#07110f",
                boxShadow:
                  "inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 5px 16px rgba(255, 255, 255, 0.3)",

                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: "-5px",
                  zIndex: -1,
                  borderRadius: "50%",
                  background: "rgba(155, 214, 216, 0.18)",
                  animation: `${offerPillGlow} 2.2s ease-in-out infinite`,
                },

                "@media (max-width: 600px)": {
                  width: "1.8rem",
                  height: "1.8rem",
                },

                "@media (prefers-reduced-motion: reduce)": {
                  "&::before": {
                    animation: "none",
                  },
                },
              }}
            >
              <CelebrationIcon
                sx={{
                  fontSize: "1.12rem",

                  "@media (max-width: 600px)": {
                    fontSize: "1rem",
                  },
                }}
              />
            </Box>

            <Box
              component="span"
              sx={{
                position: "relative",
                zIndex: 1,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.38rem",
                fontSize: "clamp(0.76rem, 1vw, 0.88rem)",
                fontWeight: 800,
                letterSpacing: "0.01rem",
              }}
            >
              <Box
                component="span"
                sx={{
                  color: "#cecccc",
                  fontWeight: 900,
                }}
              >
                First 100:
              </Box>

              <Box component="span" sx={{ color: "#cecccc" }}>
                Your Page Built Free!
              </Box>

              <SparkleIcon
                aria-hidden="true"
                sx={{
                  ml: "0.05rem",
                  color: "#cecccc",
                  fontSize: "1rem",
                }}
              />
            </Box>
          </Box>
        </Tooltip>

        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            width: "min(1140px, 100%)",
            textAlign: "center",
            transform: "scale(0.9)",
            transformOrigin: "center",
          }}
        >
          <Box
            component="a"
            href="/"
            aria-label="Techietribe home"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "clamp(0rem, 3vh, 4rem)",
              color: "inherit",
              textDecoration: "none",

              "&:focus-visible": {
                outline: "3px solid rgba(194, 209, 210, 0.5)",
                outlineOffset: "3px",
              },

              "@media (max-width: 600px)": {
                marginBottom: "3.2rem",
              },
            }}
          >
            <Box
              component="img"
              src="/WhiteLogo.png"
              alt="Techietribe"
              sx={{
                display: "block",
                width: "clamp(10rem, 17vw, 13rem)",
                height: "auto",
              }}
            />

            <Box
              component="span"
              sx={{
                borderLeft: "1px solid rgba(255, 255, 255, 0.3)",
                paddingLeft: "0.75rem",
                color: "#c4c4c4",
                fontSize: "2rem",
                fontWeight: 900,
                lineHeight: "normal",
              }}
            >
              AI
            </Box>
          </Box>

          <Box
            component="img"
            src={comingSoonHeading}
            alt="Coming Soon"
            sx={{
              "--cs-heading": "min(800px, 82vw)",
              display: "block",
              width: "var(--cs-heading)",
              height: "auto",
              margin:
                "calc(var(--cs-heading) * -0.2) auto calc(var(--cs-heading) * -0.24)",
              marginTop: "2px",
              marginBottom: "5px",
            }}
          />

          <Box
            component="p"
            sx={{
              maxWidth: "1140px",
              margin: "1.6rem auto 2.3rem",
              color: "rgba(255, 255, 255, 0.75)",
              fontSize: "clamp(1rem, 1.7vw, 1.12rem)",
              lineHeight: 1.55,
              letterSpacing: "0.05rem",

              "@media (min-width: 1040px)": {
                whiteSpace: "nowrap",
              },
            }}
          >
            Ready to build smarter? Join the waitlist and be first to know when
            Techietribe AI launches.
          </Box>

          {status === "success" ? (
            <Box
              role="status"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                width: "min(650px, 100%)",
                margin: "0 auto",
                border: "1px solid rgba(155, 214, 216, 0.38)",
                borderRadius: "16px",
                padding: "0.95rem 1rem",
                background: "rgba(7, 34, 29, 0.88)",
                textAlign: "left",
                boxSizing: "border-box",
              }}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "2.8rem",
                  height: "2.8rem",
                  flex: "0 0 auto",
                  borderRadius: "50%",
                  background: "rgba(155, 214, 216, 0.15)",
                  color: "#9bd6d8",
                }}
              >
                <CheckCircleIcon sx={{ fontSize: "23px" }} aria-hidden="true" />
              </Box>

              <Box>
                <Box
                  component="strong"
                  sx={{
                    display: "block",
                    color: "#fff",
                    fontSize: "1.05rem",
                  }}
                >
                  You&apos;re on the early list.
                </Box>

                <Box
                  component="p"
                  sx={{
                    margin: "0.18rem 0 0",
                    color: "rgba(255, 255, 255, 0.72)",
                    lineHeight: 1.45,
                  }}
                >
                  {message}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: "grid",
                gap: "0.75rem",
                width: "min(650px, 100%)",
                margin: "0 auto",
              }}
            >
              <Box component="label" sx={fieldLabelSx}>
                <Box component="span" sx={visuallyHiddenSx}>
                  First name
                </Box>

                <PersonIcon aria-hidden="true" />

                <Box
                  component="input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  type="text"
                  autoComplete="given-name"
                  placeholder="First name"
                  required
                  sx={fieldInputSx}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  gap: "0.7rem",

                  "@media (max-width: 600px)": {
                    gridTemplateColumns: "1fr",
                  },
                }}
              >
                <Box component="label" sx={fieldLabelSx}>
                  <Box component="span" sx={visuallyHiddenSx}>
                    Email address
                  </Box>

                  <EmailIcon aria-hidden="true" />

                  <Box
                    component="input"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    required
                    sx={fieldInputSx}
                  />
                </Box>

                <Button
                  type="submit"
                  disableRipple
                  disableElevation
                  disabled={status === "loading" || !termsAccepted}
                  sx={waitlistButtonSx}
                >
                  {status === "loading" ? (
                    <>
                      <CircularProgress
                        size={18}
                        thickness={5}
                        sx={{
                          color: "currentColor",

                          "@media (prefers-reduced-motion: reduce)": {
                            animation: "none",
                          },
                        }}
                      />
                      Joining
                    </>
                  ) : (
                    "Join the waitlist"
                  )}
                </Button>
              </Box>

              {status === "error" && (
                <Box
                  role="alert"
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    width: "min(650px, 100%)",
                    margin: "0 auto",
                    border: "1px solid rgba(255, 175, 160, 0.48)",
                    borderRadius: "16px",
                    padding: "0.95rem 1rem",
                    background: "rgba(75, 18, 12, 0.72)",
                    color: "#ffd5ce",
                    textAlign: "left",
                    boxSizing: "border-box",
                  }}
                >
                  <ErrorIcon
                    aria-hidden="true"
                    sx={{
                      flex: "0 0 auto",
                      marginTop: "0.15rem",
                      fontSize: "18px",
                    }}
                  />

                  <Box
                    component="p"
                    sx={{
                      display: "grid",
                      gap: "0.12rem",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    <Box component="strong">Could not join the list.</Box>
                    {message}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem 3rem",
              marginTop: "1rem",

              "@media (max-width: 600px)": {
                marginTop: "0.85rem",
              },
            }}
          >
            {status !== "success" && (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.65rem",
                  color: "rgba(255, 255, 255, 0.82)",
                  fontFamily: SYSTEM_FONT,
                  fontSize: "0.9rem",
                  lineHeight: 1.45,
                }}
              >
                <Box
                  component="button"
                  type="button"
                  role="checkbox"
                  aria-checked={termsAccepted}
                  aria-label={
                    termsAccepted
                      ? "Uncheck Terms & Conditions agreement"
                      : "Agree to the Terms & Conditions"
                  }
                  onClick={handleTermsToggle}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "1.25rem",
                    height: "1.25rem",
                    minWidth: "1.25rem",
                    boxSizing: "border-box",
                    flex: "0 0 auto",
                    padding: 0,
                    border: termsAccepted
                      ? "1px solid #9bd6d8"
                      : "1px solid rgba(255, 255, 255, 0.5)",
                    borderRadius: "6px",
                    background: termsAccepted
                      ? "#9bd6d8"
                      : "rgba(255, 255, 255, 0.1)",
                    color: "#0e1512",
                    cursor: "pointer",
                    transition:
                      "background 160ms ease, border-color 160ms ease, transform 160ms ease",

                    "&:hover": {
                      borderColor: "rgba(255, 255, 255, 0.85)",
                      transform: "translateY(-1px)",
                    },

                    "&:focus-visible": {
                      outline: "3px solid rgba(155, 214, 216, 0.5)",
                      outlineOffset: "3px",
                    },

                    "@media (prefers-reduced-motion: reduce)": {
                      transition: "none",
                    },
                  }}
                >
                  {termsAccepted && (
                    <CheckIcon sx={{ fontSize: "14px" }} aria-hidden="true" />
                  )}
                </Box>

                <Typography
                  component="span"
                  sx={{
                    color: "rgba(255, 255, 255, 0.82)",
                    fontFamily: SYSTEM_FONT,
                    fontSize: "0.9rem",
                    lineHeight: 1.45,
                  }}
                >
                  I agree to the{" "}
                  <Box
                    component="button"
                    type="button"
                    onClick={openTerms}
                    sx={{
                      display: "inline",
                      minWidth: 0,
                      margin: 0,
                      padding: 0,
                      border: 0,
                      background: "transparent",
                      color: "#fff",
                      font: "inherit",
                      fontWeight: 700,
                      lineHeight: "inherit",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                      cursor: "pointer",

                      "&:hover": {
                        color: "#b9f0f2",
                      },

                      "&:focus-visible": {
                        outline: "3px solid rgba(155, 214, 216, 0.5)",
                        outlineOffset: "3px",
                        borderRadius: "4px",
                      },
                    }}
                  >
                    Terms &amp; Conditions
                  </Box>
                  .
                </Typography>
              </Box>
            )}

            <Box
              component="nav"
              aria-label="Social media"
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "0.65rem",
              }}
            >
              {socialLinks.map(({ label, href, Icon }) => (
                <Box
                  component="a"
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2.65rem",
                    height: "2.65rem",
                    boxSizing: "border-box",
                    border: "1px solid rgba(255, 255, 255, 0.24)",
                    borderRadius: "50%",
                    color: "rgba(255, 255, 255, 0.76)",
                    background: "rgba(0, 0, 0, 0.12)",
                    textDecoration: "none",
                    transition:
                      "color 160ms ease, background 160ms ease, transform 160ms ease",

                    "&:hover": {
                      color: "#0e1512",
                      background: "#fff",
                      transform: "translateY(-2px)",
                    },

                    "&:focus-visible": {
                      outline: "3px solid rgba(155, 214, 216, 0.5)",
                      outlineOffset: "3px",
                    },

                    "@media (prefers-reduced-motion: reduce)": {
                      transition: "none",
                    },
                  }}
                >
                  <Icon sx={{ fontSize: "19px" }} aria-hidden="true" />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Modal
          open={isTermsOpen}
          hideBackdrop
          disableAutoFocus
          disableRestoreFocus
          disableScrollLock
          aria-labelledby="coming-soon-terms-title"
          onClose={(_, reason) => {
            if (reason === "escapeKeyDown") {
              setIsTermsOpen(false);
            }
          }}
          sx={{ zIndex: 9999 }}
        >
          <Box
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsTermsOpen(false);
              }
            }}
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "grid",
              placeItems: "center",
              padding: "1rem",
              boxSizing: "border-box",
              background: "rgba(3, 12, 10, 0.68)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              animation: `${backdropAnimation} 240ms ease both`,
              fontFamily: SYSTEM_FONT,

              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
              },
            }}
          >
            <Box
              role="dialog"
              aria-modal="true"
              aria-labelledby="coming-soon-terms-title"
              sx={{
                position: "relative",
                width: "min(760px, 100%)",
                maxHeight: "min(90svh, 820px)",
                boxSizing: "border-box",
                overflow: "auto",
                textAlign: "left",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                borderRadius: "24px",
                background: "rgba(10, 12, 14, 0.9)",
                color: "#fff",
                padding: "clamp(1.5rem, 4vw, 2.6rem)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                pb: 6,
                boxShadow:
                  "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 32px 90px rgba(0, 0, 0, 0.46)",
                animation: `${modalAnimation} 340ms cubic-bezier(0.16, 1, 0.3, 1) both`,

                "@media (max-width: 600px)": {
                  borderRadius: "18px",
                  padding: "1.35rem",
                },

                "@media (prefers-reduced-motion: reduce)": {
                  animation: "none",
                },
              }}
            >
              <IconButton
                type="button"
                disableRipple
                aria-label="Close terms"
                onClick={() => setIsTermsOpen(false)}
                sx={{
                  position: "absolute",
                  top: "1.15rem",
                  right: "1.15rem",
                  width: "2.7rem",
                  height: "2.7rem",
                  padding: 0,
                  border: "1px solid rgba(255, 255, 255, 0.24)",
                  borderRadius: "50%",
                  background: "transparent",
                  color: "#fff",
                  transition: "background 160ms ease",

                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.1)",
                  },

                  "&:focus-visible": {
                    outline: "3px solid rgba(155, 214, 216, 0.5)",
                    outlineOffset: "3px",
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: "21px" }} aria-hidden="true" />
              </IconButton>

              <Box
                component="h2"
                id="coming-soon-terms-title"
                ref={modalTitleRef}
                tabIndex={-1}
                sx={{
                  maxWidth: "calc(100% - 4rem)",
                  margin: 0,
                  color: "#fff",
                  fontSize: "clamp(1.9rem, 5vw, 2.8rem)",
                  fontWeight: 600,
                  lineHeight: 1.05,
                  outline: "none",
                }}
              >
                Terms &amp; Conditions
              </Box>

              <Box
                component="p"
                sx={{
                  margin: "1rem 0 1.35rem",
                  maxWidth: "640px",
                  color: "rgba(255, 255, 255, 0.7)",
                  lineHeight: 1.6,
                }}
              >
                Techietribe AI will build one landing page for selected
                applicants at no additional development cost. Applicants must
                purchase and maintain an eligible Techietribe AI subscription.
              </Box>

              <Box
                component="p"
                sx={{
                  margin: "0 0 0.75rem",
                  color: "#fff",
                  fontWeight: 800,
                }}
              >
                By joining the waitlist, you agree that:
              </Box>

              <Box
                component="ul"
                sx={{
                  display: "grid",
                  gap: "0.65rem",
                  maxHeight: "31vh",
                  overflow: "auto",
                  margin: 0,
                  padding: "1.2rem 1.2rem 1.2rem 1.9rem",
                  boxSizing: "border-box",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.06)",
                  color: "rgba(255, 255, 255, 0.72)",
                  lineHeight: 1.45,

                  "& li::marker": {
                    color: "var(--soon-green)",
                  },
                }}
              >
                {offerTerms.map((term) => (
                  <Box component="li" key={term}>
                    {term}
                  </Box>
                ))}
              </Box>

              {/* <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "1.4rem",
                }}
              >
                <Button
                  type="button"
                  disableRipple
                  disableElevation
                  onClick={() => setIsTermsOpen(false)}
                  sx={{
                    ...modalActionBaseSx,
                    border: 0,
                    background: "#fff",
                    color: "#101513",
                    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.28)",

                    "&:hover": {
                      background: "#f1f1f1",
                      boxShadow: "0 16px 36px rgba(0, 0, 0, 0.28)",
                    },
                  }}
                >
                  Close
                </Button>
              </Box> */}
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default ComingSoon;
