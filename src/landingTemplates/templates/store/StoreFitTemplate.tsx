import React from "react";
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FadeIn from "../../blocks/FadeIn";
import type { TemplateProps } from "../../templateEngine/types";

import heroImage from "./storeFitAssets/hero-clean.png";
import yogaImage from "./storeFitAssets/yoga-clean.png";
import productOne from "./storeFitAssets/product-1.png";
import productTwo from "./storeFitAssets/product-2.png";
import productThree from "./storeFitAssets/product-3.png";
import productFour from "./storeFitAssets/product-4.png";
import collageOne from "./storeFitAssets/collage-1.png";
import collageTwo from "./storeFitAssets/collage-2.png";
import collageThree from "./storeFitAssets/collage-3.png";
import collageFour from "./storeFitAssets/collage-4.png";
import personOne from "./storeFitAssets/person-1.png";
import personTwo from "./storeFitAssets/person-2.png";
import personThree from "./storeFitAssets/person-3.png";
import footerPhoto from "./storeFitAssets/footer-photo.png";

const palette = {
  blue: "#2435b8",
  blueDeep: "#1e2da8",
  blueShadow: "#162277",
  cyan: "#86e7ff",
  ink: "#080808",
  paper: "#ffffff",
  line: "rgba(255,255,255,0.2)",
  lightLine: "rgba(0,0,0,0.12)",
  mutedDark: "rgba(0,0,0,0.64)",
  mutedLight: "rgba(255,255,255,0.72)",
};

const sectionBlue = {
  background: "linear-gradient(180deg, #2435b8 0%, #2232b3 45%, #1e2da8 100%)",
};

const products = [
  { id: "fit-1", name: "Sculpt Tank", image: productOne },
  { id: "fit-2", name: "Performance Cap", image: productTwo },
  { id: "fit-3", name: "Velocity Hat", image: productThree },
  { id: "fit-4", name: "Essential Hoodie", image: productFour },
];

const stories = [
  {
    id: "story-1",
    image: personOne,
    title: "Fabric Story",
    body: "Thoughtful construction, soft compression, and movement-first cuts designed for long training days.",
  },
  {
    id: "story-2",
    image: personTwo,
    title: "Daily Motion",
    body: "Pieces built to transition from warm-up to streetwear with the same clean athletic silhouette.",
  },
  {
    id: "story-3",
    image: personThree,
    title: "Confidence Fit",
    body: "Balanced proportions, lightweight layers, and elevated color work inspired by editorial activewear campaigns.",
  },
];

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    bgcolor: "#fff",
    fontSize: "0.92rem",
    "& fieldset": {
      borderColor: "rgba(0,0,0,0.2)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0,0,0,0.45)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#000",
    },
  },
};

const footerLinks = [
  "Privacy Policy",
  "Accessibility",
  "Shipping Policy",
  "Terms & Conditions",
];

const StoreFitTemplate: React.FC<TemplateProps> = ({ data }) => {
  const brand = "L.SANTOS";
  const contactEmail = data.contact.email || "info@mysite.com";
  const contactPhone = data.contact.phone || "123-456-7890";
  const contactAddress =
    data.contact.address || "500 Terry Francine St. San Francisco, CA 94158";

  const handleContact = () => {
    if (data.contact.email) {
      window.location.href = `mailto:${data.contact.email}`;
      return;
    }

    if (data.contact.phone) {
      window.location.href = `tel:${data.contact.phone}`;
    }
  };

  return (
    <Box sx={{ bgcolor: palette.paper, color: "#000", overflow: "hidden" }}>
      <Box
        sx={{
          ...sectionBlue,
          color: "#fff",
        }}
      >
        <Container
          maxWidth={false}
          sx={{ maxWidth: 1440, px: { xs: 2, md: 3 } }}
        >
          <Box
            data-preview-section="true"
            data-preview-label="Hero"
            sx={{
              minHeight: { xs: "auto", md: "100vh" },
              pt: { xs: 2, md: 1.5 },
              pb: { xs: 6, md: 7 },
            }}
          >
            <Typography
              sx={{
                textAlign: "center",
                fontSize: "0.65rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                mb: { xs: 2.5, md: 1 },
              }}
            >
              {brand}
            </Typography>

            <FadeIn>
              <Typography
                sx={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 500,
                  fontSize: {
                    xs: "4rem",
                    sm: "5.5rem",
                    md: "8rem",
                    lg: "9rem",
                  },
                  letterSpacing: "-0.08em",
                  lineHeight: 0.85,
                  textAlign: "left",
                  textTransform: "uppercase",
                  whiteSpace: { xs: "normal", md: "nowrap" },
                }}
              >
                Find Your Fit
              </Typography>
            </FadeIn>

            <Box
              sx={{
                mt: { xs: 2, md: 2.5 },
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 420px" },
                gap: { xs: 2, md: 2.5 },
                alignItems: "start",
              }}
            >
              <Box
                sx={{
                  width: { xs: "100%", md: 720 },
                  maxWidth: "100%",
                  mx: { xs: "auto", md: "auto" },
                }}
              >
                <Box
                  component="img"
                  src={heroImage}
                  alt="Reference hero"
                  sx={{
                    width: "100%",
                    display: "block",
                    objectFit: "cover",
                    boxShadow: "0 30px 80px rgba(0,0,0,0.18)",
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 220,
                  pt: 1.5,
                }}
              >
                <Typography
                  sx={{
                    maxWidth: 280,
                    fontSize: "0.85rem",
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.88)",
                  }}
                >
                  Experience the perfect blend of style and performance with our
                  exclusive activewear collection.
                </Typography>
                <Button
                  sx={{
                    alignSelf: "flex-start",
                    px: 2.2,
                    py: 0.9,
                    bgcolor: palette.cyan,
                    color: "#000",
                    borderRadius: 0,
                    textTransform: "none",
                    fontSize: "0.82rem",
                    "&:hover": { bgcolor: palette.cyan },
                  }}
                >
                  Shop Now
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box
        data-preview-section="true"
        data-preview-label="Intro"
        sx={{ bgcolor: "#fff", py: { xs: 3, md: 4.5 } }}
      >
        <Container
          maxWidth={false}
          sx={{ maxWidth: 1440, px: { xs: 2, md: 3 } }}
        >
          <Box
            sx={{
              border: `1px solid ${palette.lightLine}`,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "260px 1fr 420px" },
              minHeight: { xs: "auto", md: 220 },
              alignItems: "stretch",
            }}
          >
            <Box
              sx={{
                borderRight: {
                  xs: "none",
                  md: `1px solid ${palette.lightLine}`,
                },
                p: { xs: 2, md: 2.2 },
                display: "grid",
                gap: 1.6,
                alignContent: "start",
              }}
            >
              <Typography
                sx={{ fontSize: "0.72rem", color: palette.mutedDark }}
              >
                New Collection
              </Typography>
              <Typography
                sx={{ fontSize: "0.72rem", color: palette.mutedDark }}
              >
                Women
              </Typography>
              <Button
                sx={{
                  mt: 1.5,
                  justifySelf: "start",
                  minWidth: 0,
                  px: 1.8,
                  py: 0.65,
                  fontSize: "0.78rem",
                  bgcolor: "#9feaff",
                  color: "#000",
                  borderRadius: 0,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#9feaff" },
                }}
              >
                Shop
              </Button>
            </Box>

            <Box
              sx={{
                px: { xs: 2, md: 3 },
                py: { xs: 2.5, md: 0 },
                display: "grid",
                placeItems: "center",
                borderTop: { xs: `1px solid ${palette.lightLine}`, md: "none" },
                borderRight: {
                  xs: "none",
                  md: `1px solid ${palette.lightLine}`,
                },
              }}
            >
              <Typography
                sx={{
                  maxWidth: 360,
                  textAlign: "center",
                  fontSize: { xs: "0.86rem", md: "0.92rem" },
                  color: "rgba(0,0,0,0.58)",
                  lineHeight: 1.6,
                }}
              >
                Discover a new standard of movement with clean silhouettes,
                polished fabrics, and a modern performance attitude.
              </Typography>
            </Box>

            <Box sx={{ minHeight: 220, overflow: "hidden" }}>
              <Box
                component="img"
                src={yogaImage}
                alt="Editorial campaign"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      <Box
        data-preview-section="true"
        data-preview-label="Shop Now"
        sx={{ bgcolor: "#fff", pt: { xs: 4, md: 5 }, pb: { xs: 6, md: 7 } }}
      >
        <Container
          maxWidth={false}
          sx={{ maxWidth: 1440, px: { xs: 2, md: 3 } }}
        >
          <Typography
            sx={{
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontWeight: 500,
              fontSize: { xs: "3.2rem", sm: "5rem", md: "7rem", lg: "7.9rem" },
              lineHeight: 0.85,
              letterSpacing: "-0.09em",
              textTransform: "uppercase",
            }}
          >
            Shop Now
          </Typography>

          <Box
            sx={{
              mt: { xs: 3, md: 4.5 },
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: { xs: 2, md: 3 },
              alignItems: "start",
            }}
          >
            {products.map((product) => (
              <FadeIn key={product.id}>
                <Box>
                  <Box
                    sx={{
                      bgcolor: "#fff",
                      minHeight: { xs: 160, md: 260 },
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Box
                      component="img"
                      src={product.image}
                      alt={product.name}
                      sx={{
                        width: "100%",
                        maxWidth: { xs: 120, md: 180 },
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      mt: 1.5,
                      textAlign: "center",
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    }}
                  >
                    {product.name}
                  </Typography>
                </Box>
              </FadeIn>
            ))}
          </Box>

          <Typography
            sx={{
              mt: 3,
              textAlign: "center",
              maxWidth: 480,
              mx: "auto",
              fontSize: { xs: "0.9rem", md: "1rem" },
              lineHeight: 1.45,
              color: "rgba(0,0,0,0.72)",
            }}
          >
            Experience the perfect blend of style and performance with our
            exclusive activewear collection.
          </Typography>
        </Container>
      </Box>

      <Box
        data-preview-section="true"
        data-preview-label="Collage Feature"
        sx={{
          ...sectionBlue,
          py: { xs: 6, md: 8 },
          color: "#fff",
        }}
      >
        <Container
          maxWidth={false}
          sx={{ maxWidth: 1440, px: { xs: 2, md: 3 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(12, 1fr)" },
              gap: { xs: 2, md: 2.5 },
              alignItems: "center",
            }}
          >
            <Box
              sx={{ gridColumn: { md: "1 / span 3" }, display: "grid", gap: 2 }}
            >
              <Box
                component="img"
                src={collageOne}
                alt="Editorial product detail"
                sx={smallImageStyles}
              />
              <Box
                component="img"
                src={collageThree}
                alt="Editorial product detail"
                sx={{
                  ...smallImageStyles,
                  width: { xs: "60%", md: "72%" },
                  ml: { md: "auto" },
                }}
              />
            </Box>

            <Box
              sx={{
                gridColumn: { md: "4 / span 6" },
                textAlign: "center",
                px: { md: 4 },
              }}
            >
              <FadeIn>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: palette.mutedLight,
                  }}
                >
                  Best Sellers
                </Typography>
                <Typography
                  sx={{
                    mt: 2,
                    fontSize: { xs: "1.8rem", md: "2.5rem" },
                    lineHeight: 1.05,
                    letterSpacing: "-0.05em",
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    textTransform: "uppercase",
                  }}
                >
                  Designed for movement. Styled for everyday confidence.
                </Typography>
                <Typography
                  sx={{
                    mt: 2,
                    maxWidth: 420,
                    mx: "auto",
                    fontSize: "0.92rem",
                    lineHeight: 1.7,
                    color: palette.mutedLight,
                  }}
                >
                  Minimal lines, bright performance color, and a campaign-led
                  product story inspired directly by the reference layout.
                </Typography>
                <Button
                  sx={{
                    mt: 3,
                    px: 2.4,
                    py: 0.9,
                    bgcolor: palette.cyan,
                    color: "#000",
                    borderRadius: 0,
                    textTransform: "none",
                    "&:hover": { bgcolor: palette.cyan },
                  }}
                >
                  Shop Collection
                </Button>
              </FadeIn>
            </Box>

            <Box
              sx={{
                gridColumn: { md: "10 / span 3" },
                display: "grid",
                gap: 2,
                justifyItems: { md: "end" },
              }}
            >
              <Box
                component="img"
                src={collageTwo}
                alt="Editorial crop"
                sx={{ ...smallImageStyles, width: { xs: "46%", md: "56%" } }}
              />
              <Box
                component="img"
                src={collageFour}
                alt="Editorial crop"
                sx={{ ...smallImageStyles, width: { xs: "65%", md: "72%" } }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      <Box
        data-preview-section="true"
        data-preview-label="Stories"
        sx={{
          ...sectionBlue,
          color: "#fff",
          py: { xs: 6, md: 8 },
        }}
      >
        <Container
          maxWidth={false}
          sx={{ maxWidth: 1440, px: { xs: 2, md: 3 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "360px 1fr" },
              gap: { xs: 4, md: 8 },
            }}
          >
            <Box sx={{ display: "grid", gap: 3 }}>
              {stories.map((story) => (
                <Box
                  key={story.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "92px 1fr",
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="img"
                    src={story.image}
                    alt={story.title}
                    sx={{
                      width: 92,
                      height: 120,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      {story.title}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: "grid", gap: 4 }}>
              {stories.map((story) => (
                <FadeIn key={story.id}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "220px 1fr" },
                      gap: { xs: 1, md: 3 },
                      alignItems: "start",
                      minHeight: 120,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.92rem",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.68)",
                      }}
                    >
                      {story.title}
                    </Typography>
                    <Typography
                      sx={{
                        maxWidth: 360,
                        fontSize: "0.92rem",
                        lineHeight: 1.7,
                        color: "rgba(255,255,255,0.86)",
                      }}
                    >
                      {story.body}
                    </Typography>
                  </Box>
                </FadeIn>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      <Box
        data-preview-section="true"
        data-preview-label="Contact Split"
        sx={{ bgcolor: "#fff" }}
      >
        <Container
          maxWidth={false}
          sx={{ maxWidth: 1440, px: { xs: 0, md: 0 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
              alignItems: "stretch",
            }}
          >
            <Box sx={{ minHeight: { xs: 280, md: 520 }, overflow: "hidden" }}>
              <Box
                component="img"
                src={footerPhoto}
                alt="Athletes editorial"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>

            <Box
              sx={{
                bgcolor: "#fff",
                px: { xs: 2, md: 6 },
                py: { xs: 4, md: 5 },
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box sx={{ width: "100%", maxWidth: 420, mx: "auto" }}>
                <Typography
                  sx={{
                    textAlign: "center",
                    fontSize: "0.72rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: palette.mutedDark,
                  }}
                >
                  Contact Us
                </Typography>
                <Typography
                  sx={{
                    mt: 1,
                    textAlign: "center",
                    fontSize: "0.96rem",
                    color: "rgba(0,0,0,0.62)",
                  }}
                >
                  Reach out for sizing help, stock questions, or private
                  shopping support.
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 3 }}>
                  <TextField
                    placeholder="Name"
                    fullWidth
                    size="small"
                    sx={fieldStyles}
                  />
                  <TextField
                    placeholder="Email"
                    fullWidth
                    size="small"
                    sx={fieldStyles}
                  />
                  <TextField
                    placeholder="Message"
                    fullWidth
                    size="small"
                    multiline
                    minRows={4}
                    sx={fieldStyles}
                  />
                  <Button
                    onClick={handleContact}
                    fullWidth
                    sx={{
                      py: 1.15,
                      bgcolor: "#000",
                      color: "#fff",
                      borderRadius: 0,
                      textTransform: "none",
                      "&:hover": { bgcolor: "#000" },
                    }}
                  >
                    Submit
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box
        component="footer"
        data-preview-section="true"
        data-preview-label="Footer"
        sx={{ bgcolor: palette.ink, color: "#fff", py: { xs: 3, md: 3.5 } }}
      >
        <Container
          maxWidth={false}
          sx={{ maxWidth: 1440, px: { xs: 2, md: 3 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr 1fr auto" },
              gap: 3,
              alignItems: "start",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "1.4rem", md: "1.7rem" },
                letterSpacing: "-0.04em",
                fontWeight: 500,
              }}
            >
              {brand}
            </Typography>

            <Box>
              <Typography sx={footerMetaStyles}>{contactPhone}</Typography>
              <Typography sx={footerMetaStyles}>{contactEmail}</Typography>
            </Box>

            <Box>
              <Typography sx={footerMetaStyles}>{contactAddress}</Typography>
            </Box>

            <Stack
              spacing={0.45}
              sx={{ alignItems: { xs: "flex-start", md: "flex-end" } }}
            >
              {footerLinks.map((link) => (
                <Typography key={link} sx={footerMetaStyles}>
                  {link}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: `1px solid ${palette.line}`,
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.62)" }}
            >
              © 2035 by {brand}. Powered and secured by Wix.
            </Typography>
            <Stack direction="row" spacing={1}>
              {["ig", "fb", "x"].map((item) => (
                <Box
                  key={item}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.34)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "0.62rem",
                    color: "rgba(255,255,255,0.8)",
                    textTransform: "uppercase",
                  }}
                >
                  {item}
                </Box>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

const smallImageStyles = {
  width: { xs: "48%", md: "58%" },
  display: "block",
  objectFit: "cover",
  boxShadow: "0 18px 48px rgba(0,0,0,0.14)",
};

const footerMetaStyles = {
  fontSize: "0.86rem",
  lineHeight: 1.45,
  color: "rgba(255,255,255,0.9)",
};

export default StoreFitTemplate;
