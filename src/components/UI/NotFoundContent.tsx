import { lazy, Suspense } from "react";
import type { ElementType } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { ArrowBackRounded as ArrowBackIcon } from "@mui/icons-material";

// Lazy: tsparticles is a heavy dependency and nothing else on the white-label
// site path pulls it in. A static import would land it in the PublicWebsite
// chunk and cost every customer page load, not just the 404.
const ParticlesBackground = lazy(
  () => import("@/components/UI/ParticlesBackground"),
);

const NOT_FOUND_ART = "/assets/common/404.webp";

const SYSTEM_FONT =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const viewEnter = keyframes`
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

const artFloat = keyframes`
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
`;

export interface NotFoundSocialLink {
  label: string;
  href: string;
  Icon: ElementType;
}

export interface NotFoundContentProps {
  /** Where "back home" points. Router path for in-app links, or an absolute URL. */
  homeHref: string;
  /** CTA label — brand-specific, e.g. "Back to Techietribe Home". */
  homeLabel?: string;
  /** Sub-headline under the artwork. */
  message?: string;
  /**
   * Base background colour. On white-label sites this is the site's own
   * primary colour so the page reads as part of that brand.
   */
  baseColor?: string;
  /** Optional cover image layered over `baseColor`. */
  backgroundImage?: string;
  /** Accent used for hover/focus affordances. */
  accentColor?: string;
  /** Optional social row. Omitted entirely when not supplied. */
  socialLinks?: NotFoundSocialLink[];
  /** Animated particle field. Code-split, so it costs nothing when off. */
  showParticles?: boolean;
  /** Particle link colour. Omit to keep the app-theme default. */
  particleLinkColor?: string;
  /** Top padding to clear a fixed/overlaying header. */
  topOffset?: string;
  /** Renders the CTA as a plain anchor instead of a router Link. */
  useAnchor?: boolean;
  /** Fills the viewport. Disable when the page already has header/footer chrome. */
  fullHeight?: boolean;
}

/**
 * Brand-agnostic 404 layout shared by the Techietribe marketing site and the
 * white-label public websites. Every brand-specific detail (colours, CTA
 * target, socials) arrives via props so nothing leaks across tenants.
 */
const NotFoundContent = ({
  homeHref,
  homeLabel = "Back to Home",
  message = "The page you were looking for is in a different quantum state. Ready to reconnect?",
  baseColor = "#07110f",
  backgroundImage,
  accentColor = "#9bd6d8",
  socialLinks,
  showParticles = false,
  particleLinkColor,
  topOffset = "0px",
  useAnchor = false,
  fullHeight = true,
}: NotFoundContentProps) => {
  const ctaProps = useAnchor
    ? { component: "a" as const, href: homeHref }
    : { component: Link, to: homeHref };

  return (
    // Opaque shell: the entry animation starts clipped, and without this the
    // white <body> background shows through the clipped bands.
    //
    // The sizing below is deliberately template-agnostic. Templates wrap page
    // bodies in a stretched flex `main`, so a fixed height would leave the
    // container's own background showing between this section and the footer.
    // `flex: 1 0 auto` + `height: 100%` make it absorb whatever space the shell
    // hands it, and the minHeight is the fallback for plain block parents.
    <Box
      component="section"
      sx={{
        background: baseColor,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        flex: "1 0 auto",
        alignSelf: "stretch",
        height: "100%",
        minHeight: fullHeight ? "100svh" : "min(70svh, 640px)",
      }}
    >
      <Box
        sx={{
          position: "relative",
          flex: "1 0 auto",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `calc(${topOffset} + clamp(1.75rem, 5vw, 3.5rem)) 1rem clamp(1.75rem, 5vw, 3.5rem)`,
          isolation: "isolate",
          background: backgroundImage
            ? `${baseColor} url("${backgroundImage}") center / cover no-repeat`
            : baseColor,
          color: "#fff",
          fontFamily: SYSTEM_FONT,
          animation: `${viewEnter} 1100ms cubic-bezier(0.22, 1, 0.36, 1) both`,
          transformOrigin: "center",
          willChange: "opacity, filter, clip-path, transform",

          "@media (max-width: 600px)": {
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

        {showParticles && (
          <Suspense fallback={null}>
            {/* Left undefined, ParticlesBackground keeps its app-theme colour —
                correct for Techietribe. White-label sites pass their own. */}
            <ParticlesBackground linkColor={particleLinkColor} />
          </Suspense>
        )}

        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "clamp(1.25rem, 3vw, 2.25rem)",
            width: "100%",
            maxWidth: "980px",
            marginInline: "auto",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              animation: `${artFloat} 6s ease-in-out infinite`,

              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
              },
            }}
          >
            <Box
              component="img"
              src={NOT_FOUND_ART}
              alt="404 — page not found"
              width={725}
              height={509}
              loading="eager"
              decoding="async"
              sx={{
                width: "min(80%, 440px)",
                height: "auto",
                filter: "drop-shadow(0 14px 36px rgba(0, 0, 0, 0.45))",
              }}
            />
          </Box>

          <Typography
            component="p"
            sx={{
              maxWidth: "620px",
              color: "rgba(255, 255, 255, 0.72)",
              fontFamily: SYSTEM_FONT,
              fontSize: "clamp(0.92rem, 1.6vw, 1.05rem)",
              lineHeight: 1.65,
            }}
          >
            {message}
          </Typography>

          <Box
            {...ctaProps}
            sx={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              minHeight: "3.35rem",
              boxSizing: "border-box",
              padding: "0.85rem 2.15rem",
              border: "1px solid rgba(255, 255, 255, 0.42)",
              borderRadius: "999px",
              background:
                "linear-gradient(110deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1) 48%, rgba(255, 255, 255, 0.2))",
              color: "#fff",
              fontFamily: SYSTEM_FONT,
              fontSize: "clamp(0.95rem, 1.6vw, 1.05rem)",
              fontWeight: 600,
              lineHeight: 1,
              textDecoration: "none",
              whiteSpace: "nowrap",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow:
                "inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 14px 38px rgba(0, 0, 0, 0.28)",
              transition:
                "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",

              "& .MuiSvgIcon-root": {
                fontSize: "1.15rem",
                transition: "transform 180ms ease",
              },

              "&:hover": {
                transform: "translateY(-2px)",
                borderColor: accentColor,
                boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.24), 0 18px 44px rgba(0, 0, 0, 0.34)`,

                "& .MuiSvgIcon-root": {
                  transform: "translateX(-3px)",
                },
              },

              "&:focus-visible": {
                outline: `3px solid ${accentColor}`,
                outlineOffset: "4px",
              },
            }}
          >
            <ArrowBackIcon />
            {homeLabel}
          </Box>

          {!!socialLinks?.length && (
            <Box
              component="nav"
              aria-label="Social links"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "clamp(0.5rem, 1.6vw, 1rem)",
                marginTop: "clamp(0.25rem, 1.5vw, 1rem)",
              }}
            >
              {socialLinks.map(({ label, href, Icon }) => (
                <Tooltip key={label} title={label} arrow placement="top">
                  <IconButton
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    sx={{
                      width: "2.6rem",
                      height: "2.6rem",
                      border: "1px solid rgba(255, 255, 255, 0.22)",
                      background: "rgba(255, 255, 255, 0.06)",
                      color: "rgba(255, 255, 255, 0.82)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      transition:
                        "transform 160ms ease, color 160ms ease, border-color 160ms ease, background 160ms ease",

                      "& .MuiSvgIcon-root": { fontSize: "1.15rem" },

                      "&:hover": {
                        transform: "translateY(-3px)",
                        borderColor: accentColor,
                        background: "rgba(255, 255, 255, 0.14)",
                        color: "#fff",
                      },

                      "&:focus-visible": {
                        outline: `3px solid ${accentColor}`,
                        outlineOffset: "3px",
                      },
                    }}
                  >
                    <Icon />
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default NotFoundContent;
