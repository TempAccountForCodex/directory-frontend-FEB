/**
 * TemplateFavorites — Step 3.6.3
 *
 * Heart toggle button for template favorite state.
 * - Optimistic UI update via onToggle callback
 * - Framer Motion scale pulse animation on toggle
 * - Teal (#378C92) fill when favorited, transparent when not
 * - e.stopPropagation() to prevent card click
 */
import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface TemplateFavoritesProps {
  templateId: string;
  isFavorited: boolean;
  onToggle: (templateId: string, newState: boolean) => void;
  size?: "small" | "medium";
}

const TEAL = "#378C92";

const ICON_SIZE: Record<NonNullable<TemplateFavoritesProps["size"]>, number> = {
  small: 16,
  medium: 20,
};

const TemplateFavorites = React.memo(function TemplateFavorites({
  templateId,
  isFavorited,
  onToggle,
  size = "medium",
}: TemplateFavoritesProps) {
  const iconSize = ICON_SIZE[size];

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggle(templateId, !isFavorited);
    },
    [templateId, isFavorited, onToggle],
  );

  return (
    <motion.button
      data-favorited={String(isFavorited)}
      onClick={handleClick}
      animate={{ scale: 1 }}
      whileTap={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.3 }}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: size === "small" ? "4px" : "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        lineHeight: 0,
        transition: "background 0.2s ease",
      }}
    >
      <Heart
        size={iconSize}
        color={isFavorited ? TEAL : "rgba(255,255,255,0.6)"}
        fill={isFavorited ? TEAL : "transparent"}
        strokeWidth={2}
      />
    </motion.button>
  );
});

export default TemplateFavorites;
