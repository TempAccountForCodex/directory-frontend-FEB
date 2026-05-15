"use client";

import { Box, Typography, Stack, Container } from "@mui/material";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
const star = "/assets/publicAssets/images/common/star.svg";
const darkhole = "assets/publicAssets/images/common/darkhole.svg";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const columns = [
  {
    speed: 0.9,
    images: [
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206710-R9JvajbcitvBarX3Yy3V88gPeNmgJS.webp&w=828&q=75",
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206704-lUNM0Y6VoyKzW7LBQYptONEERw341h.webp&w=828&q=75",
    ],
  },
  {
    speed: 1.0,
    images: [
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206706-bLP2smyzGJq0saWfbuqQ2jNDb6uxeB.webp&w=828&q=75",
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206707-O0hJzwvglBuycOai8OoXQEdamtYVu9.webp&w=828&q=75",
    ],
  },
  {
    speed: 1.1,
    images: [
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206708-jakUphO8nsKObLHypuwrLU3I9oCrbk.webp&w=828&q=75",
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206697-uGa2Fo0gUp04LiqObFmVVQzLADSXLZ.webp&w=828&q=75",
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206713-tquEPApSRkzBQ07VhPLryUpLcvjIxc.webp&w=828&q=75",
    ],
  },
  {
    speed: 1.25,
    images: [
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206693-u32qRgXpyxNILSn1OEQfUinn1vPhbZ.webp&w=828&q=75",
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206694-S6Ggn6Hn52BmbD5gHQYLwUJbE29vIs.webp&w=828&q=75",
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206707-O0hJzwvglBuycOai8OoXQEdamtYVu9.webp&w=828&q=75",
    ],
  },
  {
    speed: 1.1,
    images: [
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206698-x0M6bgMw73Sh0BDjbPwIH2emzbD5tV.webp&w=828&q=75",
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206709-LdaDi6zcWI9s9puPNoW3iSjivGnj4S.webp&w=828&q=75",
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206712-8dBQeyHmuOV7DBmFyOXBvz2aKYo11K.webp&w=828&q=75",
    ],
  },
  {
    speed: 1.0,
    images: [
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206703-IrmQ8sOyWpwTpBt8ykamJ2KFTh34NT.webp&w=828&q=75",
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206704-lUNM0Y6VoyKzW7LBQYptONEERw341h.webp&w=828&q=75",
    ],
  },
  {
    speed: 0.9,
    images: [
      "https://durable.co/_next/image?url=https%3A%2F%2Frjdavx8ozyznxeyh.public.blob.vercel-storage.com%2Fproduction%2Fpages%2Fabout%2FRectangle%25206705-F28LUDYfT0bISctKshftmQolxjGEVC.webp&w=828&q=75",
    ],
  },
];

export default function AboutUsHeroScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerIndex = 3;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const visibleColumns = isMobile
    ? columns.slice(centerIndex - 1, centerIndex + 2)
    : columns;

  const effectiveCenter = isMobile ? 1 : centerIndex;

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        height: "80vh",
        overflow: "hidden",
        backgroundColor: "#000000ff",
        backgroundImage: `url(${star})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          height: "auto",
          zIndex: 0,
          backgroundImage: `url("${darkhole}")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          aspectRatio: "2074 / 1333",
          top: "12%",
          left: "-70%",
          width: "280%",

          "@media (min-width: 640px)": {
            top: "-4%",
            width: "130%",
            left: "-15%",
          },
        }}
      />
      <Container maxWidth="lg">
        {/* ======================
            HERO CONTENT
        ====================== */}
        <Stack
          alignItems="center"
          textAlign="center"
          sx={{
            pt: { xs: 10, md: 10 },
            pb: 4,
            position: "relative",
            zIndex: 3,
          }}
        >
          <Typography
            sx={{
              // fontFamily: '"Playfair Display", serif',
              fontSize: { xs: "2rem", sm: "2.5rem", md: "4.4rem" },
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              maxWidth: 900,
              color: "#ffffffff",
            }}
          >
            Building the future of
            <br />
            business ownership
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#fff",
              maxWidth: 720,
              lineHeight: 1.7,
              mt: 1.5,
              fontSize: { xs: "1rem", sm: "1.4rem" },
            }}
          >
            We’re creating simple tools that give businesses full control,
            visibility, and ownership of their online presence.
          </Typography>
        </Stack>

        {/* ======================
            IMAGE GRID (CONSTRAINED)
        ====================== */}
        <Box
          sx={{
            pt: 36,
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: { xs: "14px", md: "26px" },
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            {columns.map((col, index) => {
              const effectiveCenter = centerIndex; // always 3
              const distanceFromCenter = Math.abs(index - effectiveCenter);
              const initialY = distanceFromCenter * 140;

              const baseScroll = 540 * col.speed;
              const extraBoost = distanceFromCenter * 200;
              const targetY = initialY - (baseScroll + extraBoost);

              const y = useTransform(
                scrollYProgress,
                [0, 1],
                [initialY, targetY],
              );

              // 👇 hide columns on mobile (only show 3 center ones)
              const shouldHide =
                isMobile &&
                (index < centerIndex - 1 || index > centerIndex + 1);

              return (
                <motion.div
                  key={index}
                  style={{
                    y,
                    flex: 1,
                    display: shouldHide ? "none" : "block",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "26px",
                    }}
                  >
                    {col.images.map((src, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: "100%",
                          maxWidth: 300,
                          aspectRatio: "3 / 4",
                          mx: "auto",
                          borderRadius: "22px",
                          overflow: "hidden",
                          backgroundColor: "#111",
                          boxShadow:
                            distanceFromCenter === 0
                              ? "0 50px 140px rgba(0,0,0,0.55)"
                              : "0 25px 70px rgba(0,0,0,0.4)",
                        }}
                      >
                        <Box
                          component="img"
                          src={src}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </motion.div>
              );
            })}
          </Box>

          {/* ======================
              BOTTOM FADE
          ====================== */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "320px",
              background:
                "linear-gradient(to top, rgb(0 0 0) 20%, rgb(0 0 0 / 60%) 55%, #00000000 100%)",
              zIndex: 5,
              pointerEvents: "none",
            }}
          />
        </Box>
      </Container>
    </Box>
  );
}
