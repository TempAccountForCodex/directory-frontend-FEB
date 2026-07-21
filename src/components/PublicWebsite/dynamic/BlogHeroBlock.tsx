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
import { blogHeroFont } from "./blogSectionShared";

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

  // Follow the website's primary color unless the block sets a custom accent.
  const resolvedAccent =
    typeof accentColor === "string" && accentColor.trim()
      ? accentColor
      : primaryColor;

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        minHeight: "480px",
        overflow: "hidden",
        bgcolor: "#020303",
        fontFamily: blogHeroFont,
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(55,140,146,0.35) 0%, rgba(2,3,3,0) 45%),
          radial-gradient(circle at 80% 70%, rgba(45,212,191,0.24) 0%, rgba(2,3,3,0) 42%),
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
