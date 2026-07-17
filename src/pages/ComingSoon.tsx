import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import { keyframes } from "@mui/material/styles";
import {
  Check as CheckIcon,
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
import comingSoonHeading from "@/assets/images/coming-soon-1.png";

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

const socialLinks = [
  {
    label: "Email",
    href: "mailto:info@thetechietribe.com",
    Icon: EmailIcon,
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
  "You will choose from the available Techietribe AI templates.",
  "Techietribe will customize the selected template using your content, logo, images, brand colors, and instructions.",
  "The offer includes only minor text, image, color, and section adjustments.",
  "Custom designs, major layout changes, advanced features, integrations, and additional pages are not included.",
  "You must provide complete and accurate content on time.",
  "You confirm that you have permission to use all submitted content and images.",
  "The offer includes up to two reasonable revision rounds.",
  "Domain registration, renewals, premium assets, and third-party services are not included.",
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
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [termsDraft, setTermsDraft] = useState(false);

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
    setTermsDraft(termsAccepted);
    setIsTermsOpen(true);
  };

  const handleTermsToggle = () => {
    if (termsAccepted) {
      setTermsAccepted(false);
      setTermsDraft(false);
      return;
    }

    openTerms();
  };

  const handleAgree = () => {
    if (!termsDraft) {
      return;
    }

    setTermsAccepted(true);
    setIsTermsOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!termsAccepted) {
      openTerms();
      return;
    }

    if (honeypot) {
      setStatus("success");
      setMessage("Your early-access request has been submitted.");
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
          website: honeypot,
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
                outline: "3px solid rgba(155, 214, 216, 0.5)",
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
                color: "#9bd6d8",
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

              <Box
                component="input"
                name="website"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                sx={{
                  position: "absolute !important",
                  left: "-9999px",
                  width: "1px !important",
                  height: "1px",
                }}
              />

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
              gap: "1rem 1.75rem",
              marginTop: "2rem",
            }}
          >
            {status !== "success" && (
              <Button
                type="button"
                disableRipple
                aria-pressed={termsAccepted}
                onClick={handleTermsToggle}
                sx={{
                  display: "inline-flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  gap: "0.6rem",
                  minWidth: 0,
                  padding: "0.35rem 0.5rem",
                  border: 0,
                  borderRadius: 0,
                  background: "transparent",
                  color: "rgba(255, 255, 255, 0.82)",
                  font: "inherit",
                  fontSize: "0.92rem",
                  lineHeight: "normal",
                  textTransform: "none",
                  cursor: "pointer",

                  "&:hover": {
                    background: "transparent",
                  },

                  "&:hover .terms-checkbox-box": {
                    borderColor: "rgba(255, 255, 255, 0.8)",
                  },

                  "&:focus-visible": {
                    outline: "3px solid rgba(155, 214, 216, 0.5)",
                    outlineOffset: "3px",
                    borderRadius: "8px",
                  },

                  "& strong": {
                    color: "#fff",
                    fontWeight: 700,
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  },
                }}
              >
                <Box
                  component="span"
                  className="terms-checkbox-box"
                  aria-hidden="true"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "1.25rem",
                    height: "1.25rem",
                    boxSizing: "border-box",
                    flex: "0 0 auto",
                    marginTop: "0.14rem",
                    border: termsAccepted
                      ? "1px solid #9bd6d8"
                      : "1px solid rgba(255, 255, 255, 0.5)",
                    borderRadius: "6px",
                    background: termsAccepted
                      ? "#9bd6d8"
                      : "rgba(255, 255, 255, 0.1)",
                    color: "#0e1512",
                    transition:
                      "background 160ms ease, border-color 160ms ease",
                  }}
                >
                  {termsAccepted && (
                    <CheckIcon sx={{ fontSize: "14px" }} aria-hidden="true" />
                  )}
                </Box>

                <Box component="span">
                  <Typography
                    component="span"
                    sx={{
                      display: "block",
                      textAlign: "left",
                      ml: 1,
                      fontSize: "0.9rem",
                      lineHeight: 1.45,
                    }}
                  >
                    I agree to the{" "}
                    <Box component="strong">Terms &amp; Conditions</Box> and
                    understand
                    <br />
                    that early access is limited to 100 users.
                  </Typography>
                </Box>
              </Button>
            )}

            <Box
              component="nav"
              aria-label="Social media"
              sx={{
                display: "flex",
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
              background: "rgba(3, 12, 10, 0.88)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
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

              <Box
                component="label"
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "0.75rem",
                  alignItems: "start",
                  marginTop: "1.15rem",
                  color: "#fff",
                  fontWeight: 700,
                  lineHeight: 1.45,
                  cursor: "pointer",
                }}
              >
                <Checkbox
                  checked={termsDraft}
                  onChange={(event) => setTermsDraft(event.target.checked)}
                  disableRipple
                  sx={{
                    width: "1.25rem",
                    height: "1.25rem",
                    marginTop: "0.1rem",
                    padding: 0,
                    color: "rgba(255, 255, 255, 0.5)",

                    "&.Mui-checked": {
                      color: "var(--soon-green)",
                    },

                    "& .MuiSvgIcon-root": {
                      fontSize: "1.25rem",
                    },
                  }}
                />

                <Box component="span">
                  I have read and agree to the Terms &amp; Conditions.
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "1.4rem",

                  "@media (max-width: 600px)": {
                    flexDirection: "column-reverse",
                  },
                }}
              >
                <Button
                  type="button"
                  disableRipple
                  onClick={() => setIsTermsOpen(false)}
                  sx={{
                    ...modalActionBaseSx,
                    border: "1px solid rgba(255, 255, 255, 0.26)",
                    background: "transparent",
                    color: "#fff",

                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  disableRipple
                  disableElevation
                  disabled={!termsDraft}
                  onClick={handleAgree}
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

                    "&.Mui-disabled": {
                      pointerEvents: "auto",
                      cursor: "not-allowed",
                      opacity: 0.42,
                      background: "#fff",
                      color: "#101513",
                      boxShadow: "none",
                    },
                  }}
                >
                  I Agree
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default ComingSoon;
