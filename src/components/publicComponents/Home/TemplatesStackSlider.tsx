import { Box, Typography, Stack } from "@mui/material";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const columns = [
  {
    speed: 1.1,
    images: [
      "/assets/publicAssets/images/home/TemplatesDisplay/1.webp",

      "/assets/publicAssets/images/home/TemplatesDisplay/2.webp",

      "/assets/publicAssets/images/home/TemplatesDisplay/4.webp",
    ],
  },

  {
    speed: 1.3,
    images: [
      "/assets/publicAssets/images/home/TemplatesDisplay/3.webp",

      "/assets/publicAssets/images/home/TemplatesDisplay/6.webp",

      "/assets/publicAssets/images/home/TemplatesDisplay/7.webp",

      "/assets/publicAssets/images/home/TemplatesDisplay/8.webp",
    ],
  },

  {
    speed: 1.3,
    images: [
      "/assets/publicAssets/images/home/TemplatesDisplay/11.webp",

      "/assets/publicAssets/images/home/TemplatesDisplay/10.webp",

      "/assets/publicAssets/images/home/TemplatesDisplay/13.webp",

      "/assets/publicAssets/images/home/TemplatesDisplay/12.webp",
    ],
  },

  {
    speed: 1.3,
    images: [
      "/assets/publicAssets/images/home/TemplatesDisplay/14.webp",

      "/assets/publicAssets/images/home/TemplatesDisplay/15.webp",

      "https://10web.io/wp-content/uploads/tenweb-theme/images/home/new/examples/example_artboard_2.png",

      "https://img.freepik.com/free-vector/flat-autumn-landing-page-template_23-2149023348.jpg",
    ],
  },

  {
    speed: 1.1,
    images: [
      "https://10web.io/wp-content/uploads/tenweb-theme/images/home/new/examples/example_artboard_4.jpg",

      "https://10web.io/wp-content/uploads/tenweb-theme/images/home/new/examples/example_artboard_10.png",

      "https://img.freepik.com/free-vector/flat-repair-shop-business-landing-page-template_23-2149545708.jpg",
    ],
  },
];
export default function TemplateScrollShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerIndex = 2;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        background: "#ffffffff",
        pt: 14,
        backgroundImage:
          "radial-gradient(rgba(214, 214, 214, 0.18) 10.6%, transparent 23.6%)",
        backgroundPosition: "10px 10px",
        backgroundSize: "8px 8px",
      }}
    >
      <Stack alignItems="center" textAlign="center" color="white" mb={10}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            fontSize: { xs: "2rem", md: "3.8rem" },
            lineHeight: 1.1,
            maxWidth: 900,
            color: "black",
            px: { xs: 2, sm: 0 },
            // textShadow: "0 4px 10px rgba(0,0,0,0.8)",
          }}
        >
          Launch Your Vision the Perfect Template Awaits.
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 400,
            mt: 2,
            mb: 4,
            maxWidth: 600,
            color: "black",
            // textShadow: "0 2px 5px rgba(0,0,0,0.8)",
            fontSize: { xs: "1rem", md: "1.2rem" },
          }}
        >
          Explore our curated gallery of customizable designs and start building
          your brand in minutes.
        </Typography>
        {/* <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              size="large"
              sx={{ py: 1.5, px: 4, textTransform: "none", fontWeight: 600 }}
            >
              Browse All Templates
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                py: 1.5,
                px: 4,
                color: "white",
                borderColor: "white",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              View Documentation
            </Button>
          </Stack> */}
      </Stack>

      <Box sx={{ pt: 35 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            alignItems: "flex-start",
          }}
        >
          {columns.map((col, index) => {
            const distanceFromCenter = Math.abs(index - centerIndex);

            // 🔹 Initial vertical offset (center highest)
            const initialY = distanceFromCenter * 120;

            // 🔥 SCROLL DISTANCE LOGIC (THIS IS THE KEY)
            const baseScroll = 520 * col.speed;
            const extraBoost = distanceFromCenter * 180;

            const targetY = initialY - (baseScroll + extraBoost);

            const y = useTransform(
              scrollYProgress,
              [0, 1],
              [initialY, targetY],
            );

            return (
              <motion.div key={index} style={{ y }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                  }}
                >
                  {col.images.map((src, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: { xs: 260, sm: 320 },
                        height: { xs: 180, sm: 220 },
                        borderRadius: "20px",
                        overflow: "hidden",
                        backgroundColor: "#fff",
                        boxShadow:
                          distanceFromCenter === 0
                            ? "0 40px 120px rgba(0,0,0,0.45)"
                            : "0 20px 60px rgba(0,0,0,0.35)",
                      }}
                    >
                      <Box
                        component="img"
                        src={src}
                        alt="Template preview"
                        loading="lazy"
                        decoding="async"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "top",
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </motion.div>
            );
          })}
        </Box>

        {/* Bottom fade */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "220px",
            background: "linear-gradient(to top, #000, transparent)",
            zIndex: 5,
            pointerEvents: "none",
          }}
        />
      </Box>
    </Box>
  );
}
