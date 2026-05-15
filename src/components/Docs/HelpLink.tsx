/**
 * HelpLink — Inline 'Learn more' documentation link (Step 10.9.8)
 *
 * Renders a small caption-style link to a documentation article.
 * Purely presentational — no API calls.
 */

import React, { memo } from "react";
import Typography from "@mui/material/Typography";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HelpLinkProps {
  /** Documentation article slug — e.g. 'create-first-website' */
  slug: string;
  /** Link text. Defaults to 'Learn more'. */
  text?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const HelpLink = memo<HelpLinkProps>(({ slug, text = "Learn more" }) => {
  return (
    <Typography
      component="a"
      href={`/docs/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      variant="caption"
      sx={{
        color: "primary.main",
        textDecoration: "none",
        fontWeight: 500,
        "&:hover": {
          textDecoration: "underline",
        },
      }}
    >
      {text}
    </Typography>
  );
});

HelpLink.displayName = "HelpLink";

export default HelpLink;
