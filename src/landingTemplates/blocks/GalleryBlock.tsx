import React, { useState } from "react";
import { Box, Typography, Modal, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { BusinessData } from "../types/BusinessData";
import type { TemplateTheme } from "../templateEngine/types";
import FadeIn from "./FadeIn";

export interface GalleryBlockProps {
  data: BusinessData;
  theme: TemplateTheme;
  variant?: "masonry" | "strip" | "cinema";
}

interface GalleryTileProps {
  url: string;
  alt?: string;
  onClick: () => void;
  sx?: object;
}

function GalleryTile({ url, alt, onClick, sx }: GalleryTileProps) {
  return (
    <Box
      component="img"
      src={url}
      alt={alt ?? "Gallery image"}
      onClick={onClick}
      sx={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        cursor: "pointer",
        borderRadius: 2,
        transition: "transform 0.3s, filter 0.3s",
        "&:hover": { transform: "scale(1.03)", filter: "brightness(0.9)" },
        ...sx,
      }}
    />
  );
}

function Lightbox({
  images,
  index,
  onClose,
}: {
  images: { url: string; caption?: string }[];
  index: number | null;
  onClose: () => void;
}) {
  const img = index !== null ? images[index] : null;
  return (
    <Modal open={index !== null} onClose={onClose}>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "rgba(0,0,0,0.92)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
        }}
        onClick={onClose}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 16, right: 16, color: "#fff" }}
        >
          <CloseIcon />
        </IconButton>
        {img && (
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{ maxWidth: "90vw", maxHeight: "90vh" }}
          >
            <Box
              component="img"
              src={img.url}
              alt={img.caption}
              sx={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                borderRadius: 2,
                objectFit: "contain",
              }}
            />
            {img.caption && (
              <Typography sx={{ color: "#fff", textAlign: "center", mt: 2 }}>
                {img.caption}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Modal>
  );
}

function MasonryGallery({ data, theme }: Omit<GalleryBlockProps, "variant">) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const items = data.gallery ?? [];
  return (
    <Box sx={{ bgcolor: theme.bgPrimary, py: { xs: 8, md: 12 }, px: 3 }}>
      <FadeIn>
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            fontFamily: theme.fontFamily,
            fontWeight: 800,
            color: theme.headingColor,
            mb: 6,
          }}
        >
          Gallery
        </Typography>
      </FadeIn>
      <Box
        sx={{
          columns: { xs: 2, sm: 3, md: 4 },
          gap: 2,
          maxWidth: 1200,
          mx: "auto",
          "& > *": { breakInside: "avoid", mb: 2, display: "block" },
        }}
      >
        {items.map((it, i) => (
          <FadeIn key={i} delay={i * 0.05}>
            <Box
              sx={{
                height: i % 3 === 0 ? 240 : 180,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <GalleryTile
                url={it.url}
                alt={it.alt}
                onClick={() => setLightboxIdx(i)}
              />
            </Box>
          </FadeIn>
        ))}
      </Box>
      <Lightbox
        images={items}
        index={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
      />
    </Box>
  );
}

function StripGallery({ data, theme }: Omit<GalleryBlockProps, "variant">) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const items = data.gallery ?? [];
  return (
    <Box
      sx={{
        bgcolor: theme.bgSecondary,
        py: { xs: 6, md: 10 },
        overflow: "hidden",
      }}
    >
      <FadeIn>
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            fontFamily: theme.fontFamily,
            fontWeight: 800,
            color: theme.headingColor,
            mb: 4,
            px: 3,
          }}
        >
          Our Work
        </Typography>
      </FadeIn>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          px: 3,
          pb: 2,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { height: 4 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: theme.borderColor,
            borderRadius: 999,
          },
        }}
      >
        {items.map((it, i) => (
          <Box
            key={i}
            sx={{
              flexShrink: 0,
              width: 280,
              height: 200,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <GalleryTile
              url={it.url}
              alt={it.alt}
              onClick={() => setLightboxIdx(i)}
            />
          </Box>
        ))}
      </Box>
      <Lightbox
        images={items}
        index={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
      />
    </Box>
  );
}

function CinemaGallery({ data, theme }: Omit<GalleryBlockProps, "variant">) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const items = data.gallery ?? [];
  const hero = items[active];
  return (
    <Box sx={{ bgcolor: theme.bgSecondary, py: { xs: 8, md: 12 }, px: 3 }}>
      <FadeIn>
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            fontFamily: theme.fontFamily,
            fontWeight: 800,
            color: theme.headingColor,
            mb: 4,
          }}
        >
          Portfolio
        </Typography>
      </FadeIn>
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        {hero && (
          <Box
            sx={{
              height: { xs: 240, md: 460 },
              borderRadius: 3,
              overflow: "hidden",
              mb: 2,
              cursor: "pointer",
            }}
            onClick={() => setLightboxIdx(active)}
          >
            <GalleryTile
              url={hero.url}
              alt={hero.alt}
              onClick={() => setLightboxIdx(active)}
              sx={{ borderRadius: 0 }}
            />
          </Box>
        )}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(items.length, 5)}, 1fr)`,
            gap: 1,
          }}
        >
          {items.map((it, i) => (
            <Box
              key={i}
              sx={{
                height: 80,
                borderRadius: 1.5,
                overflow: "hidden",
                cursor: "pointer",
                border:
                  i === active
                    ? `2px solid ${theme.accentColor}`
                    : "2px solid transparent",
                transition: "border-color 0.2s",
              }}
              onClick={() => setActive(i)}
            >
              <GalleryTile
                url={it.url}
                alt={it.alt}
                onClick={() => setActive(i)}
                sx={{ borderRadius: 0 }}
              />
            </Box>
          ))}
        </Box>
      </Box>
      <Lightbox
        images={items}
        index={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
      />
    </Box>
  );
}

const GalleryBlock: React.FC<GalleryBlockProps> = ({
  data,
  theme,
  variant = "masonry",
}) => {
  if (!data.gallery?.length) return null;
  if (variant === "strip") return <StripGallery data={data} theme={theme} />;
  if (variant === "cinema") return <CinemaGallery data={data} theme={theme} />;
  return <MasonryGallery data={data} theme={theme} />;
};

export default GalleryBlock;
