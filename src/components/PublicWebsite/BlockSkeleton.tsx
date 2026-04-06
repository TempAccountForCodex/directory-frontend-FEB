/**
 * BlockSkeleton — Step 2.22
 *
 * Renders a MUI Skeleton placeholder that approximates the visual shape of a
 * given block type. Used while dynamic block data is being fetched.
 */

import React from "react";
import { Box, Skeleton, Container } from "@mui/material";

interface BlockSkeletonProps {
  /** The block type to approximate the skeleton shape for */
  blockType: string;
  /** Optional override height (used for the wrapping Box) */
  height?: number | string;
}

const BlockSkeleton: React.FC<BlockSkeletonProps> = ({ blockType, height }) => {
  const renderSkeleton = () => {
    switch (blockType) {
      case "HERO":
        return (
          <Box
            sx={{
              position: "relative",
              height: height ?? 400,
              overflow: "hidden",
            }}
          >
            <Skeleton variant="rectangular" width="100%" height="100%" />
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "60%",
                textAlign: "center",
              }}
            >
              <Skeleton variant="text" sx={{ fontSize: "3rem", mb: 2 }} />
              <Skeleton variant="text" sx={{ fontSize: "1.5rem", mb: 3 }} />
              <Skeleton
                variant="rectangular"
                width={160}
                height={48}
                sx={{ mx: "auto", borderRadius: 1 }}
              />
            </Box>
          </Box>
        );

      case "FEATURES":
        return (
          <Container sx={{ py: 6 }}>
            <Skeleton
              variant="text"
              sx={{ fontSize: "2rem", mb: 1, width: "40%", mx: "auto" }}
            />
            <Skeleton
              variant="text"
              sx={{ fontSize: "1rem", mb: 4, width: "60%", mx: "auto" }}
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 3,
              }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <Box key={i} sx={{ textAlign: "center" }}>
                  <Skeleton
                    variant="circular"
                    width={64}
                    height={64}
                    sx={{ mx: "auto", mb: 2 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    height={120}
                    sx={{ borderRadius: 2 }}
                  />
                </Box>
              ))}
            </Box>
          </Container>
        );

      case "TESTIMONIALS":
        return (
          <Container sx={{ py: 6 }}>
            <Skeleton
              variant="text"
              sx={{ fontSize: "2rem", mb: 4, width: "40%", mx: "auto" }}
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 3,
              }}
            >
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={160}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Box>
          </Container>
        );

      case "TEXT":
        return (
          <Container sx={{ py: 6 }}>
            <Skeleton
              variant="text"
              sx={{ fontSize: "2rem", mb: 2, width: "50%" }}
            />
            <Skeleton variant="text" sx={{ fontSize: "1rem", mb: 1 }} />
            <Skeleton variant="text" sx={{ fontSize: "1rem", mb: 1 }} />
            <Skeleton variant="text" sx={{ fontSize: "1rem", width: "80%" }} />
          </Container>
        );

      case "GALLERY":
        return (
          <Container sx={{ py: 6 }}>
            <Skeleton
              variant="text"
              sx={{ fontSize: "2rem", mb: 4, width: "40%", mx: "auto" }}
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={200}
                  sx={{ borderRadius: 1 }}
                />
              ))}
            </Box>
          </Container>
        );

      case "PRICING":
        return (
          <Container sx={{ py: 6 }}>
            <Skeleton
              variant="text"
              sx={{ fontSize: "2rem", mb: 4, width: "40%", mx: "auto" }}
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 3,
              }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={320}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Box>
          </Container>
        );

      case "FAQ":
        return (
          <Container sx={{ py: 6 }}>
            <Skeleton
              variant="text"
              sx={{ fontSize: "2rem", mb: 4, width: "40%", mx: "auto" }}
            />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="text"
                sx={{ fontSize: "1.25rem", mb: 1 }}
              />
            ))}
          </Container>
        );

      case "STATS":
        return (
          <Container sx={{ py: 6 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 3,
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={100}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Box>
          </Container>
        );

      case "TEAM":
        return (
          <Container sx={{ py: 6 }}>
            <Skeleton
              variant="text"
              sx={{ fontSize: "2rem", mb: 4, width: "40%", mx: "auto" }}
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 3,
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ textAlign: "center" }}>
                  <Skeleton
                    variant="circular"
                    width={80}
                    height={80}
                    sx={{ mx: "auto", mb: 1 }}
                  />
                  <Skeleton variant="text" sx={{ fontSize: "1rem", mb: 0.5 }} />
                  <Skeleton
                    variant="text"
                    sx={{ fontSize: "0.875rem", width: "70%", mx: "auto" }}
                  />
                </Box>
              ))}
            </Box>
          </Container>
        );

      case "BLOG_FEED":
        return (
          <Container sx={{ py: 6 }}>
            <Skeleton
              variant="text"
              sx={{ fontSize: "2rem", mb: 1, width: "40%", mx: "auto" }}
            />
            <Skeleton
              variant="text"
              sx={{ fontSize: "1rem", mb: 3, width: "60%", mx: "auto" }}
            />
            {/* Search skeleton */}
            <Skeleton
              variant="rectangular"
              height={56}
              sx={{ borderRadius: 1, mb: 3, maxWidth: 480, mx: "auto" }}
            />
            {/* Category chips skeleton */}
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width={80}
                  height={32}
                  sx={{ borderRadius: 4 }}
                />
              ))}
            </Box>
            {/* Cards skeleton */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 3,
              }}
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <Box key={i}>
                  <Skeleton
                    variant="rectangular"
                    height={200}
                    sx={{ borderRadius: 2, mb: 1 }}
                  />
                  <Skeleton
                    variant="text"
                    sx={{ fontSize: "1.1rem", mb: 0.5 }}
                  />
                  <Skeleton
                    variant="text"
                    sx={{ fontSize: "0.875rem", width: "80%" }}
                  />
                  <Skeleton
                    variant="text"
                    sx={{ fontSize: "0.875rem", width: "60%" }}
                  />
                </Box>
              ))}
            </Box>
          </Container>
        );

      case "PRODUCT_SHOWCASE":
        return (
          <Container sx={{ py: 6 }}>
            <Skeleton
              variant="text"
              sx={{ fontSize: "2rem", mb: 4, width: "40%", mx: "auto" }}
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 3,
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <Box key={i}>
                  <Skeleton
                    variant="rectangular"
                    height={160}
                    sx={{ borderRadius: 1, mb: 1 }}
                  />
                  <Skeleton variant="text" sx={{ fontSize: "1rem", mb: 0.5 }} />
                  <Skeleton
                    variant="text"
                    sx={{ fontSize: "0.875rem", width: "60%" }}
                  />
                </Box>
              ))}
            </Box>
          </Container>
        );

      case "DIRECTORY_LISTING":
        return (
          <Container sx={{ py: 6 }}>
            <Skeleton
              variant="text"
              sx={{ fontSize: "2rem", mb: 1, width: "40%", mx: "auto" }}
            />
            <Skeleton
              variant="rectangular"
              height={40}
              sx={{ borderRadius: 1, mb: 3, maxWidth: 480, mx: "auto" }}
            />
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width={90}
                  height={32}
                  sx={{ borderRadius: 4 }}
                />
              ))}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 3,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <Box key={i}>
                  <Skeleton
                    variant="rectangular"
                    height={180}
                    sx={{ borderRadius: 1, mb: 1 }}
                  />
                  <Skeleton variant="text" sx={{ fontSize: "1rem", mb: 0.5 }} />
                  <Skeleton
                    variant="text"
                    sx={{ fontSize: "0.875rem", width: "70%" }}
                  />
                  <Skeleton
                    variant="text"
                    sx={{ fontSize: "0.875rem", width: "50%" }}
                  />
                </Box>
              ))}
            </Box>
          </Container>
        );

      default:
        return (
          <Container sx={{ py: 4 }}>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={height ?? 200}
              sx={{ borderRadius: 2 }}
            />
          </Container>
        );
    }
  };

  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label={`Loading ${blockType} block`}
    >
      {renderSkeleton()}
    </Box>
  );
};

export default React.memo(BlockSkeleton);
