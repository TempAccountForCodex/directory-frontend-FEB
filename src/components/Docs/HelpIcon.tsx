/**
 * HelpIcon — Contextual help icon (Step 10.9.8)
 *
 * Renders a small (?) icon button that opens /docs/:slug in a new tab.
 * Purely presentational — no API calls.
 */

import React, { memo, useCallback } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { HelpCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HelpIconProps {
  /** Documentation article slug — e.g. 'customize-design' */
  slug: string;
  /** Tooltip text shown on hover. Defaults to 'Learn more'. */
  tooltip?: string;
  /** Icon size in pixels. Defaults to 16. */
  size?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const HelpIcon = memo<HelpIconProps>(
  ({ slug, tooltip = "Learn more", size = 16 }) => {
    const handleClick = useCallback(() => {
      window.open(`/docs/${slug}`, "_blank", "noopener,noreferrer");
    }, [slug]);

    return (
      <Tooltip title={tooltip}>
        <IconButton
          size="small"
          aria-label={`Help: ${tooltip}`}
          onClick={handleClick}
          sx={{
            p: 0.25,
            color: "text.secondary",
            opacity: 0.7,
            "&:hover": {
              opacity: 1,
              color: "primary.main",
              bgcolor: "transparent",
            },
          }}
        >
          <HelpCircle size={size} />
        </IconButton>
      </Tooltip>
    );
  },
);

HelpIcon.displayName = "HelpIcon";

export default HelpIcon;
