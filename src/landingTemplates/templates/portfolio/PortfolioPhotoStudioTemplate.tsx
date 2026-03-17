import React, { useMemo } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import {
  ArrowUpRight,
  Camera,
  Instagram,
  Mail,
  Star,
  Twitter,
} from "lucide-react";
import { TemplateProps } from "../../templateEngine/types";

const headingFont = '"Space Grotesk", "Avenir Next", "Segoe UI", sans-serif';
const bodyFont = '"Inter", "Segoe UI", sans-serif';

const fallbackImages = {
  hero: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=80",
  introOne:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  introTwo:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
  service:
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
  story:
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  collageOne:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  collageTwo:
    "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=900&q=80",
  collageThree:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  collageFour:
    "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=900&q=80",
  footer:
    "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1200&q=80",
};

const fallbackFaq = [
  {
    q: "Do you work on both studio and outdoor shoots?",
    a: "Yes. This template supports portrait, editorial, family, fashion, and lifestyle photography services.",
  },
  {
    q: "Can this layout work for any photo niche?",
    a: "Yes. The structure is reusable for wedding, newborn, product, travel, or commercial photography businesses.",
  },
  {
    q: "How do clients usually enquire?",
    a: "The template is enquiry-first, so the CTAs are built around consultations, booking requests, and direct contact.",
  },
];

const brandMarks = [
  "LOOK",
  "FRAME",
  "MUSE",
  "AVENUE",
  "PIXEL",
  "LUXE",
  "VOGUE",
  "TONE",
];

const PortfolioPhotoStudioTemplate: React.FC<TemplateProps> = ({ data }) => {
  const gallery = data.gallery?.length ? data.gallery : [];
  const portfolioItems = useMemo(
    () =>
      (data.portfolioItems?.length ? data.portfolioItems : [])
        .slice(0, 8)
        .map((item, index) => ({
          ...item,
          image:
            item.image ||
            [
              fallbackImages.collageOne,
              fallbackImages.collageTwo,
              fallbackImages.collageThree,
              fallbackImages.collageFour,
            ][index % 4],
        })),
    [data.portfolioItems],
  );

  const services = data.services?.slice(0, 5) || [
    {
      name: "Portrait Photography",
      description: "Editorial and personal portrait sessions.",
    },
    {
      name: "Brand Shoots",
      description: "Visual identity photography for modern brands.",
    },
    {
      name: "Family Sessions",
      description: "Warm, expressive storytelling for families.",
    },
    {
      name: "Fashion Editorial",
      description: "Campaign imagery with strong visual direction.",
    },
    {
      name: "Studio Retouching",
      description: "Polished color and detail refinement.",
    },
  ];

  const stats = data.stats?.slice(0, 3) || [
    { label: "Projects", value: "240+" },
    { label: "Client rating", value: "5%" },
    { label: "Years", value: "10+" },
  ];

  const reviews = data.reviews?.slice(0, 1) || [
    {
      author: "Studio client",
      rating: 5,
      text: "The shoot felt effortless and the final images carried exactly the mood we wanted.",
      date: "2026",
    },
  ];

  const socialLinks = [
    { key: "instagram", icon: Instagram },
    { key: "twitter", icon: Twitter },
  ].filter((item) =>
    Boolean(data.socialLinks?.[item.key as keyof typeof data.socialLinks]),
  );

  const heroImage =
    data.heroBannerUrl || gallery[0]?.url || fallbackImages.hero;
  const recentWorkImage =
    portfolioItems[0]?.image || fallbackImages.collageThree;

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box sx={{ bgcolor: "#f3f3f3", color: "#111", fontFamily: bodyFont }}>
      <Box
        sx={{
          minHeight: { xs: "92vh", md: "100vh" },
          position: "relative",
          color: "#fff",
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.62) 100%), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: { xs: "100% 100%", md: "25% 100%" },
            pointerEvents: "none",
            opacity: 0.5,
          }}
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1440,
            mx: "auto",
            px: { xs: 2, md: 4 },
            pt: { xs: 2, md: 2.2 },
            pb: { xs: 3, md: 3.5 },
            minHeight: { xs: "92vh", md: "100vh" },
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
          }}
        >
          <Box
            component="header"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
              alignItems: "start",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  lineHeight: 1.3,
                }}
              >
                {data.contact?.email || "hello@studio.com"}
              </Typography>
              <Typography
                sx={{
                  mt: 0.3,
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  lineHeight: 1.3,
                }}
              >
                {data.contact?.phone || "+234 123 456 7890"}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="center"
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              <Camera size={20} />
              <Typography
                sx={{
                  fontFamily: headingFont,
                  fontSize: "1.05rem",
                  fontWeight: 700,
                }}
              >
                TARGET
              </Typography>
            </Stack>

            <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
              <Typography sx={{ fontSize: { xs: "1rem", md: "1.05rem" } }}>
                Photographer
              </Typography>
              <Typography
                sx={{
                  mt: 0.3,
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                Nigeria, Netherlands.
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "260px 1fr 240px" },
              gap: { xs: 3, md: 2.5 },
              alignItems: "stretch",
              pt: { xs: 4, md: 5 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", md: "center" },
              }}
            >
              <Box
                sx={{
                  width: { xs: 220, md: 260 },
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Box
                  component="img"
                  src={recentWorkImage}
                  alt="Recent work"
                  sx={{
                    width: "100%",
                    aspectRatio: "1.1 / 1",
                    objectFit: "cover",
                    borderRadius: 1.3,
                  }}
                />
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  Recent Work
                </Typography>
              </Box>
            </Box>

            <Box sx={{ position: "relative", minHeight: { md: 560 } }}>
              <Box
                sx={{
                  position: { md: "absolute" },
                  right: { md: 88 },
                  top: { md: 180 },
                  maxWidth: 340,
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "1.15rem", md: "1rem" },
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  Capturing timeless moments that tell stories of emotion,
                  beauty, and truth in every frame and every pose.
                </Typography>
              </Box>

              <Box
                sx={{
                  position: { md: "absolute" },
                  left: 0,
                  bottom: 0,
                  mt: { xs: 6, md: 0 },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: headingFont,
                    fontSize: { xs: "4rem", sm: "5.5rem", md: "9.4rem" },
                    lineHeight: 0.88,
                    letterSpacing: "-0.09em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    background:
                      "linear-gradient(90deg, #ffffff 0%, #f7fbff 10%, #85e8ff 27%, #00c8ff 38%, #ffffff 56%, #f4d8ea 74%, #eef4ff 88%, #ffffff 100%)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    textShadow: "0 0 28px rgba(255,255,255,0.08)",
                  }}
                >
                  Photographer
                </Typography>
              </Box>
            </Box>

            <Stack
              spacing={4}
              sx={{
                alignItems: { xs: "flex-start", md: "flex-end" },
                justifyContent: "space-between",
              }}
            >
              <Stack spacing={3} sx={{ pt: { md: 8 } }}>
                {[
                  { label: "Portfolio", id: "works" },
                  { label: "About me", id: "about" },
                  { label: "My shots", id: "works" },
                  { label: "Contact", id: "contact" },
                ].map((item) => (
                  <Box
                    key={item.label}
                    component="button"
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    sx={{
                      border: 0,
                      p: 0,
                      bgcolor: "transparent",
                      cursor: "pointer",
                      color: "#fff",
                      textDecoration: "underline",
                      textUnderlineOffset: "8px",
                      fontFamily: headingFont,
                      fontSize: { xs: "1.3rem", md: "1.05rem" },
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {item.label}
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Stack spacing={1}>
              <Box
                component="a"
                href="#"
                sx={{
                  color: "#fff",
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                ↗ Instagram
              </Box>
              <Box
                component="a"
                href="#"
                sx={{
                  color: "#fff",
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                ↗ Dribbble
              </Box>
            </Stack>
            <Box sx={{ display: "none" }} />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: 1320,
          mx: "auto",
          px: { xs: 2, md: 3 },
          pt: { xs: 6, md: 7 },
          pb: { xs: 6, md: 7 },
        }}
      >
        <Box
          id="about"
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.8fr 1.2fr" },
            gap: 4,
          }}
        >
          <Box>
            <Typography
              sx={{ maxWidth: 300, fontSize: "1rem", lineHeight: 1.8 }}
            >
              Working with {data.name}, you get bold portrait direction, clean
              editorial taste, and imagery shaped to feel modern, memorable, and
              alive.
            </Typography>
            <Button
              variant="contained"
              sx={{
                mt: 3,
                bgcolor: "#111",
                color: "#fff",
                borderRadius: 999,
                boxShadow: "none",
                px: 2.5,
                fontSize: "0.72rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                "&:hover": { bgcolor: "#111", boxShadow: "none" },
              }}
            >
              Book a shoot
            </Button>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr" },
              gap: 2,
              alignItems: "start",
            }}
          >
            <Box
              component="img"
              src={gallery[1]?.url || fallbackImages.introOne}
              alt="Portrait"
              sx={{
                width: "100%",
                aspectRatio: "0.9 / 1",
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
            <Box
              component="img"
              src={gallery[2]?.url || fallbackImages.introTwo}
              alt="Portrait"
              sx={{
                width: "100%",
                aspectRatio: "0.9 / 1.15",
                objectFit: "cover",
                borderRadius: 2,
                mt: { md: 4 },
              }}
            />
            <Box sx={{ display: { xs: "none", md: "block" }, pt: 2 }}>
              <Typography
                sx={{
                  fontSize: "1rem",
                  lineHeight: 1.9,
                  color: "rgba(17,17,17,0.78)",
                }}
              >
                Professional portrait and lifestyle photography with a strong
                visual signature, modern lighting, and emotionally rich
                storytelling.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 6,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
            gap: 4,
            alignItems: "start",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: headingFont,
                fontSize: "1.7rem",
                letterSpacing: "-0.04em",
              }}
            >
              Services I offer
            </Typography>
            <Stack spacing={1.3} sx={{ mt: 2.2 }}>
              {services.map((service, index) => (
                <Box
                  key={service.name}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr",
                    gap: 1.5,
                    py: 1.1,
                    borderBottom: "1px solid rgba(17,17,17,0.12)",
                  }}
                >
                  <Typography
                    sx={{
                      color: index === 2 ? "#ff5a1f" : "rgba(17,17,17,0.36)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {service.name}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.45,
                        fontSize: "0.88rem",
                        color: "rgba(17,17,17,0.7)",
                        maxWidth: 420,
                      }}
                    >
                      {service.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            component="img"
            src={gallery[3]?.url || fallbackImages.story}
            alt="Service"
            sx={{
              width: "100%",
              maxWidth: 360,
              ml: { md: "auto" },
              aspectRatio: "1.2 / 1",
              objectFit: "cover",
              borderRadius: 2,
            }}
          />
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography
            sx={{
              fontFamily: headingFont,
              fontSize: "1.55rem",
              letterSpacing: "-0.04em",
            }}
          >
            Notable collaborations
          </Typography>
          <Box
            sx={{
              mt: 2,
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 1,
            }}
          >
            {brandMarks.map((mark) => (
              <Box
                key={mark}
                sx={{
                  py: 2,
                  px: 2.4,
                  border: "1px solid rgba(17,17,17,0.12)",
                  bgcolor: "#fff",
                  textAlign: "center",
                  fontSize: "0.82rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                {mark}
              </Box>
            ))}
          </Box>
        </Box>

        <Box id="works" sx={{ mt: 6 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography
              sx={{
                fontFamily: headingFont,
                fontSize: "1.75rem",
                letterSpacing: "-0.04em",
              }}
            >
              My works
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#111",
                color: "#fff",
                borderRadius: 999,
                boxShadow: "none",
                px: 2.4,
                fontSize: "0.7rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                "&:hover": { bgcolor: "#111", boxShadow: "none" },
              }}
            >
              View gallery
            </Button>
          </Box>

          <Box
            sx={{
              mt: 2.5,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {portfolioItems.slice(0, 4).map((item, index) => (
              <Box
                key={item.title}
                sx={{
                  p: 1,
                  bgcolor: "#fff",
                  borderRadius: 2,
                  boxShadow: "0 10px 28px rgba(15,15,15,0.05)",
                }}
              >
                <Box
                  component="img"
                  src={item.image}
                  alt={item.title}
                  sx={{
                    width: "100%",
                    aspectRatio: index % 2 === 0 ? "1.25 / 1" : "1 / 1",
                    objectFit: "cover",
                    borderRadius: 1.5,
                  }}
                />
                <Typography sx={{ mt: 1.2, fontWeight: 700 }}>
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.4,
                    fontSize: "0.84rem",
                    color: "rgba(17,17,17,0.7)",
                    lineHeight: 1.7,
                  }}
                >
                  {item.description ||
                    "A premium photography story shaped through composition, light, and mood."}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography
            sx={{
              textAlign: "center",
              fontFamily: headingFont,
              fontSize: "1.9rem",
              letterSpacing: "-0.04em",
            }}
          >
            Capture Beyond the Frame
          </Typography>
          <Box
            sx={{
              mt: 2.4,
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 1,
            }}
          >
            {[
              portfolioItems[4]?.image || fallbackImages.collageOne,
              portfolioItems[5]?.image || fallbackImages.collageTwo,
              portfolioItems[6]?.image || fallbackImages.collageThree,
              portfolioItems[7]?.image || fallbackImages.collageFour,
            ].map((image, index) => (
              <Box
                key={image + index}
                component="img"
                src={image}
                alt="Gallery"
                sx={{
                  width: "100%",
                  aspectRatio: index === 0 ? "1.2 / 1" : "1 / 1",
                  objectFit: "cover",
                  borderRadius: 1.5,
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ bgcolor: "#0a0a0a", color: "#fff", py: { xs: 6, md: 7 } }}>
        <Box
          sx={{
            maxWidth: 1320,
            mx: "auto",
            px: { xs: 2, md: 3 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.7fr 1.3fr" },
            gap: 4,
            alignItems: "start",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: headingFont,
                fontSize: "2rem",
                letterSpacing: "-0.05em",
                lineHeight: 0.95,
              }}
            >
              Don&apos;t Trust Me,
              <br />
              Trust Them
            </Typography>
            <Box
              component="img"
              src={gallery[4]?.url || fallbackImages.footer}
              alt="Testimonial"
              sx={{
                mt: 2.5,
                width: "100%",
                maxWidth: 260,
                aspectRatio: "0.82 / 1",
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
          </Box>

          <Box>
            <Stack
              direction="row"
              spacing={{ xs: 2, md: 4 }}
              sx={{ mb: 3, flexWrap: "wrap" }}
            >
              {stats.map((stat) => (
                <Box key={stat.label}>
                  <Typography
                    sx={{
                      fontFamily: headingFont,
                      fontSize: "2rem",
                      color: "#ff7a1a",
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.66)" }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Typography
              sx={{
                maxWidth: 560,
                lineHeight: 1.9,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              {reviews[0]?.text}
            </Typography>
            <Stack
              direction="row"
              spacing={1.2}
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <Box sx={{ display: "flex", color: "#ff7a1a" }}>
                <Star size={14} fill="currentColor" />
              </Box>
              <Typography
                sx={{ fontSize: "0.86rem", color: "rgba(255,255,255,0.82)" }}
              >
                {reviews[0]?.author}{" "}
                {reviews[0]?.date ? `• ${reviews[0].date}` : ""}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Box
        id="faq"
        sx={{
          maxWidth: 1320,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: { xs: 6, md: 7 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
          gap: 4,
          alignItems: "start",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: headingFont,
              fontSize: "1.7rem",
              letterSpacing: "-0.04em",
            }}
          >
            FAQs
          </Typography>
          <Stack spacing={1.2} sx={{ mt: 2 }}>
            {fallbackFaq.map((item) => (
              <Box
                key={item.q}
                sx={{
                  p: 1.6,
                  border: "1px solid rgba(17,17,17,0.12)",
                  borderRadius: 2,
                  bgcolor: "#fff",
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>{item.q}</Typography>
                <Typography
                  sx={{
                    mt: 0.7,
                    fontSize: "0.88rem",
                    lineHeight: 1.8,
                    color: "rgba(17,17,17,0.74)",
                  }}
                >
                  {item.a}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Box
          component="img"
          src={gallery[5]?.url || fallbackImages.introOne}
          alt="FAQ visual"
          sx={{
            width: "100%",
            maxWidth: 360,
            ml: { md: "auto" },
            aspectRatio: "0.9 / 1",
            objectFit: "cover",
            borderRadius: 2,
          }}
        />
      </Box>

      <Box
        sx={{
          maxWidth: 1320,
          mx: "auto",
          px: { xs: 2, md: 3 },
          pb: { xs: 6, md: 7 },
        }}
      >
        <Typography
          sx={{
            fontFamily: headingFont,
            fontSize: "1.7rem",
            letterSpacing: "-0.04em",
          }}
        >
          See Through My Lens
        </Typography>
        <Box
          sx={{
            mt: 2.2,
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
            gap: 1,
          }}
        >
          {[
            gallery[6]?.url || fallbackImages.collageOne,
            gallery[7]?.url || fallbackImages.collageTwo,
            gallery[8]?.url || fallbackImages.collageThree,
            gallery[9]?.url || fallbackImages.collageFour,
            gallery[10]?.url || fallbackImages.introOne,
            gallery[11]?.url || fallbackImages.introTwo,
            gallery[12]?.url || fallbackImages.service,
            gallery[13]?.url || fallbackImages.story,
            gallery[14]?.url || fallbackImages.collageOne,
            gallery[15]?.url || fallbackImages.collageTwo,
          ].map((image, index) => (
            <Box
              key={image + index}
              component="img"
              src={image}
              alt="Lens work"
              sx={{
                width: "100%",
                aspectRatio: index % 3 === 0 ? "0.8 / 1.1" : "1 / 1",
                objectFit: "cover",
                borderRadius: 1.5,
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ bgcolor: "#111", color: "#fff", py: { xs: 6, md: 7 } }}>
        <Box
          id="contact"
          sx={{
            maxWidth: 1320,
            mx: "auto",
            px: { xs: 2, md: 3 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
            gap: 4,
            alignItems: "end",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: headingFont,
                fontSize: { xs: "2rem", md: "3rem" },
                lineHeight: 0.96,
                letterSpacing: "-0.05em",
              }}
            >
              Every Frame Tells a Story;
              <br />
              Let&apos;s Tell Yours.
            </Typography>
            <Button
              variant="contained"
              sx={{
                mt: 2.4,
                bgcolor: "#fff",
                color: "#111",
                borderRadius: 999,
                boxShadow: "none",
                px: 2.6,
                fontSize: "0.72rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                "&:hover": { bgcolor: "#fff", boxShadow: "none" },
              }}
            >
              Book now
            </Button>
            <Typography sx={{ mt: 4, fontSize: "1.35rem", color: "#ff7a1a" }}>
              {data.contact?.email || "hello@studio.com"}
            </Typography>
          </Box>

          <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.66)",
                lineHeight: 1.9,
              }}
            >
              {data.contact?.phone || "+1 (555) 220 1188"}
              <br />
              {data.contact?.address || "245 Mercer Street, New York, NY"}
            </Typography>
            <Stack
              direction="row"
              spacing={1.2}
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
              sx={{ mt: 2 }}
            >
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Box
                    key={item.key}
                    component="a"
                    href={
                      data.socialLinks?.[
                        item.key as keyof typeof data.socialLinks
                      ] || "#"
                    }
                    target="_blank"
                    rel="noreferrer"
                    sx={{ color: "#fff", display: "flex" }}
                  >
                    <Icon size={16} />
                  </Box>
                );
              })}
              {data.contact?.email ? (
                <Box
                  component="a"
                  href={`mailto:${data.contact.email}`}
                  sx={{ color: "#fff", display: "flex" }}
                >
                  <Mail size={16} />
                </Box>
              ) : null}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PortfolioPhotoStudioTemplate;
