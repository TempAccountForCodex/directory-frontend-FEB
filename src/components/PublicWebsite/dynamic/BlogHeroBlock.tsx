/**
 * BlogHeroBlock — BLOG_HERO
 *
 * Presentational dark-gradient hero for a blog index page, mirroring the public
 * /blog (InsightsPage) hero. Purely visual: eyebrow, stroke-accent headline and
 * description. Search + category filtering live in the BLOG_GRID block, so this
 * block holds no data-fetch or shared filter state.
 */

import React from "react";
import { Box, Typography } from "@mui/material";
import {
  blogHeroFont,
  blogStaticProps,
  resolveBlogHeroGlow,
} from "./blogSectionShared";

const star = "/assets/publicAssets/images/common/star.svg";

interface BlogHeroContent {
  eyebrow?: string;
  heading?: string;
  headingAccent?: string;
  description?: string;
  accentColor?: string;
}

interface Block {
  id: number;
  blockType: string;
  content: BlogHeroContent;
  sortOrder: number;
}

interface BlogHeroBlockProps {
  block: Block;
  primaryColor?: string;
}

const BlogHeroBlockBase: React.FC<BlogHeroBlockProps> = ({
  block,
  primaryColor = "#398c91",
}) => {
  const {
    eyebrow = "",
    heading = "",
    headingAccent = "",
    description = "",
    accentColor,
  } = block.content || {};

  // Follow the website's primary color unless the block sets a *custom* accent.
  // "#398c91" was an old baked-in default (it used to be seeded into content and
  // is the legacy fallback), so treat it — and blanks — as "unset" so existing
  // blog heroes track the website's primary color instead of the fixed teal.
  const LEGACY_HERO_ACCENT = "#398c91";
  const trimmedAccent =
    typeof accentColor === "string" ? accentColor.trim() : "";
  const customAccent =
    trimmedAccent && trimmedAccent.toLowerCase() !== LEGACY_HERO_ACCENT
      ? trimmedAccent
      : "";
  const resolvedAccent = customAccent || primaryColor;

  // Lift/differentiate the glows so dark brand colors still read on black.
  const heroGlow = resolveBlogHeroGlow(resolvedAccent);

  return (
    <Box
      {...blogStaticProps(block.id, "blog-hero-section", "Blog hero section", "container")}
      component="section"
      sx={{
        position: "relative",
        minHeight: "480px",
        overflow: "hidden",
        bgcolor: "#020303",
        fontFamily: blogHeroFont,
        backgroundImage: `
          radial-gradient(circle at 20% 30%, ${heroGlow.primary} 0%, rgba(2,3,3,0) 45%),
          radial-gradient(circle at 80% 70%, ${heroGlow.highlight} 0%, rgba(2,3,3,0) 42%),
          url(${star})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        "& .MuiTypography-root": { fontFamily: blogHeroFont },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
          zIndex: 3,
        },
      }}
    >
      <Box
        {...blogStaticProps(block.id, "blog-hero-content", "Blog hero content", "container")}
        sx={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          padding: {
            xs: "102px 20px 42px",
            md: "118px 96px 48px",
            lg: "136px 200px 56px",
          },
        }}
      >
        {eyebrow && (
          <Typography
            {...blogStaticProps(
              block.id,
              "blog-hero-eyebrow",
              "Blog hero eyebrow",
              "text",
              "static.blog-hero-eyebrow",
              "eyebrow",
            )}
            sx={{
              color: "#dff7fb",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "3.5px",
              textTransform: "uppercase",
              mb: "20px",
            }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography
          {...blogStaticProps(
            block.id,
            "blog-hero-heading",
            "Blog hero heading",
            "text",
            "static.blog-hero-heading",
            "heading",
          )}
          variant="h1"
          sx={{
            fontSize: {
              xs: "clamp(36px, 12vw, 48px)",
              md: "clamp(48px, 6vw, 82px)",
            },
            fontWeight: 800,
            lineHeight: { xs: 1.08, md: 1.03 },
            color: "#ffffff",
            mb: "30px",
            maxWidth: { xs: "100%", md: "720px" },
            letterSpacing: { xs: "-0.8px", md: "-1.3px" },
          }}
        >
          {heading}
          {headingAccent && (
            <>
              {" "}
              <Box
                {...blogStaticProps(
                  block.id,
                  "blog-hero-heading-accent",
                  "Blog hero accent word",
                  "text",
                  "static.blog-hero-heading-accent",
                  "headingAccent",
                )}
                component="span"
                sx={{ color: resolvedAccent, WebkitTextStroke: "1px #ffffff74" }}
              >
                {headingAccent}
              </Box>
            </>
          )}
        </Typography>
        {description && (
          <Typography
            {...blogStaticProps(
              block.id,
              "blog-hero-description",
              "Blog hero description",
              "text",
              "static.blog-hero-description",
              "description",
            )}
            variant="body1"
            sx={{
              color: "rgba(232,242,247,0.82)",
              fontSize: { xs: "14px", md: "17px" },
              lineHeight: 1.75,
              maxWidth: { xs: "100%", md: "620px" },
            }}
          >
            {description}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

BlogHeroBlockBase.displayName = "BlogHeroBlock";

const BlogHeroBlock = React.memo(BlogHeroBlockBase);
BlogHeroBlock.displayName = "BlogHeroBlock";

export default BlogHeroBlock;
