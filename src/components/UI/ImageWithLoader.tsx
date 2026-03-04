import React, { useState, useEffect } from "react";
import { Box, Skeleton } from "@mui/material";
import { alpha } from "@mui/material/styles";

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  borderRadius?: string | number;
  placeholder?: "wave" | "pulse" | "none";
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ImageWithLoader: React.FC<ImageWithLoaderProps> = ({
  src,
  alt,
  width = "100%",
  height = "auto",
  aspectRatio,
  objectFit = "cover",
  borderRadius = 0,
  placeholder = "wave",
  fallbackSrc,
  onLoad,
  onError,
  className,
  style,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setImageSrc(src);
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);

    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setError(false);
      setLoading(true);
    }

    onError?.();
  };

  const skeletonVariant = placeholder === "none" ? undefined : placeholder;

  return (
    <Box
      sx={{
        position: "relative",
        width,
        height: aspectRatio ? "auto" : height,
        aspectRatio,
        borderRadius,
        overflow: "hidden",
        bgcolor: alpha("#000", 0.05),
      }}
      className={className}
      style={style}
    >
      {loading && (
        <Skeleton
          variant="rectangular"
          animation={skeletonVariant}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius,
          }}
        />
      )}

      {!error && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: "100%",
            height: "100%",
            objectFit,
            display: loading ? "none" : "block",
            borderRadius,
          }}
        />
      )}

      {error && !fallbackSrc && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            bgcolor: alpha("#000", 0.05),
            color: alpha("#000", 0.3),
            fontSize: "0.875rem",
            textAlign: "center",
            p: 2,
          }}
        >
          Failed to load image
        </Box>
      )}
    </Box>
  );
};

export default ImageWithLoader;
