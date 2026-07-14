import React from "react";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { TemplatePageNavLink } from "../hooks/useWebsiteMenuNavLinks";

interface Props {
  links: TemplatePageNavLink[];
  /** Per-template styling so the links match the host template's nav items. */
  itemSx?: SxProps<Theme>;
  /** Called after a link is clicked (e.g. to close a mobile drawer). */
  onNavigate?: () => void;
}

/**
 * Renders the website's page/menu links (from {@link useWebsiteMenuNavLinks})
 * as navigation anchors. Shared across templates so every template shows live
 * page links (added pages appear, removed pages disappear) while keeping its
 * own look via `itemSx`. Renders nothing when there are no page links.
 */
const TemplatePageNavLinks: React.FC<Props> = ({
  links,
  itemSx,
  onNavigate,
}) => {
  if (!links.length) return null;
  return (
    <>
      {links.map((link) => (
        <Box
          key={link.id}
          component="a"
          href={link.href}
          onClick={() => onNavigate?.()}
          sx={{ textDecoration: "none", ...itemSx }}
        >
          {link.label}
        </Box>
      ))}
    </>
  );
};

export default TemplatePageNavLinks;
