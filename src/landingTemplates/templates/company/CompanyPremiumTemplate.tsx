import React from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Quote,
  Twitter,
} from "lucide-react";
import FadeIn from "../../blocks/FadeIn";
import type { TemplateProps } from "../../templateEngine/types";

const editorialImages = {
  hero: "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=1600&q=80",
  heroAccent:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
  collectionOne:
    "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=900&q=80",
  collectionTwo:
    "https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=900&q=80",
  collectionThree:
    "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=900&q=80",
  occasion:
    "https://img.freepik.com/free-photo/wedding-photography-southern-cross-guest-ranch-madison-ga_181624-9113.jpg",
  servicesLeft:
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1100&q=80",
  servicesRight:
    "https://images.unsplash.com/photo-1460036521480-ff49c08c2781?auto=format&fit=crop&w=1100&q=80",
  detailLeft:
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1000&q=80",
  detailRight:
    "https://images.unsplash.com/photo-1459666644539-a9755287d6b0?auto=format&fit=crop&w=1000&q=80",
};

const serifFont = '"Bodoni Moda", "Didot", "Times New Roman", serif';
const sansFont =
  '"Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif';

const CompanyPremiumTemplate: React.FC<TemplateProps> = ({ data }) => {
  const primary = data.primaryColor || "#101010";
  const secondary = data.secondaryColor || "#f3ede3";
  const features = data.features?.slice(0, 6) || [];
  const stats = data.stats?.slice(0, 3) || [];
  const reviews = data.reviews?.slice(0, 2) || [];
  const team = data.team?.slice(0, 3) || [];

  const socialIcons = [
    { key: "instagram", icon: Instagram },
    { key: "linkedin", icon: Linkedin },
    { key: "twitter", icon: Twitter },
    { key: "facebook", icon: Facebook },
  ].filter((item) =>
    Boolean(data.socialLinks?.[item.key as keyof typeof data.socialLinks]),
  );

  const featuredCards = [
    {
      title: features[0]?.title || "Signature consulting",
      description:
        features[0]?.description ||
        "Direction for spaces, launches, and client-facing brand experiences.",
      image: data.gallery?.[0]?.url || editorialImages.collectionOne,
    },
    {
      title: features[1]?.title || "Occasion styling",
      description:
        features[1]?.description ||
        "Seasonal edits, event presentation, and premium styling with a soft editorial finish.",
      image: data.gallery?.[1]?.url || editorialImages.collectionTwo,
    },
    {
      title: features[2]?.title || "Custom installs",
      description:
        features[2]?.description ||
        "Bespoke compositions and on-site finishing for hospitality, retail, and brand activations.",
      image: data.gallery?.[2]?.url || editorialImages.collectionThree,
    },
  ];

  const serviceTiles = [
    {
      title: features[3]?.title || "Private clients",
      description:
        features[3]?.description ||
        "Refined support for homes, personal milestones, and intimate gatherings.",
      image: editorialImages.servicesLeft,
    },
    {
      title: features[4]?.title || "Gifting",
      description:
        features[4]?.description ||
        "High-consideration gifting programs for brands, teams, and executive relationships.",
      image: editorialImages.heroAccent,
    },
    {
      title: features[5]?.title || "Installations",
      description:
        features[5]?.description ||
        "Visual moments built for launches, receptions, and memorable brand storytelling.",
      image: editorialImages.servicesRight,
    },
  ];

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navItems = [
    { label: "About", id: "about" },
    { label: "Services", id: "services" },
    { label: "Work", id: "work" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f0e8",
        color: "#141414",
        fontFamily: sansFont,
      }}
    >
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          bgcolor: "rgba(244,240,232,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(20,20,20,0.08)",
        }}
      >
        <FadeIn direction="down">
          <Box
            sx={{
              maxWidth: 1280,
              mx: "auto",
              px: { xs: 2, md: 4 },
              py: 1.75,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Stack
              direction="row"
              spacing={2.5}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              {navItems.map((item) => (
                <Box
                  key={item.id}
                  component="button"
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    border: 0,
                    background: "transparent",
                    p: 0,
                    cursor: "pointer",
                    fontFamily: sansFont,
                    fontSize: "0.76rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(20,20,20,0.68)",
                  }}
                >
                  {item.label}
                </Box>
              ))}
            </Stack>

            <Typography
              sx={{
                fontFamily: serifFont,
                fontSize: { xs: "1.2rem", md: "1.5rem" },
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              {data.name}
            </Typography>

            <Button
              onClick={() => scrollToSection("contact")}
              variant="text"
              endIcon={<ArrowRight size={14} />}
              sx={{
                color: "#111",
                fontFamily: sansFont,
                fontSize: "0.76rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                px: 0,
                minWidth: 0,
              }}
            >
              Book a consultation
            </Button>
          </Box>
        </FadeIn>
      </Box>

      <Box
        id="about"
        sx={{
          position: "relative",
          minHeight: { xs: "auto", md: "78vh" },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
          alignItems: "stretch",
          "& > .company-premium-hero-left": {
            height: "100%",
          },
          "& > .company-premium-hero-right": {
            height: "100%",
          },
        }}
      >
        <FadeIn className="company-premium-hero-left">
          <Box
            sx={{
              position: "relative",
              minHeight: { xs: 540, md: "78vh" },
              display: "flex",
              alignItems: "center",
              px: { xs: 2, sm: 4, md: 7 },
              py: { xs: 8, md: 10 },
              color: "#f9f6ef",
              backgroundImage: `linear-gradient(90deg, rgba(19,19,19,0.5) 0%, rgba(19,19,19,0.18) 46%, rgba(19,19,19,0.1) 100%), url(${data.gallery?.[0]?.url || editorialImages.hero})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <Box sx={{ maxWidth: 560 }}>
              <Typography
                sx={{
                  fontSize: "0.74rem",
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "rgba(249,246,239,0.72)",
                  mb: 2,
                }}
              >
                Premium company presentation
              </Typography>
              <Typography
                sx={{
                  fontFamily: serifFont,
                  fontSize: { xs: "3.5rem", sm: "4.3rem", md: "5.8rem" },
                  lineHeight: 0.9,
                  letterSpacing: "-0.05em",
                }}
              >
                {data.tagline || "Beautiful presentation for modern brands."}
              </Typography>
              <Typography
                sx={{
                  mt: 2.5,
                  maxWidth: 470,
                  fontSize: { xs: "1rem", md: "1.08rem" },
                  lineHeight: 1.85,
                  color: "rgba(249,246,239,0.82)",
                }}
              >
                {data.description}
              </Typography>
              <Button
                onClick={() => scrollToSection("services")}
                variant="contained"
                sx={{
                  mt: 4,
                  px: 3.25,
                  py: 1.5,
                  borderRadius: 0,
                  bgcolor: "#f8f2e8",
                  color: "#121212",
                  boxShadow: "none",
                  fontFamily: sansFont,
                  fontSize: "0.76rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  "&:hover": {
                    bgcolor: "#f8f2e8",
                    boxShadow: "none",
                    opacity: 0.92,
                  },
                }}
              >
                Explore our work
              </Button>
            </Box>
          </Box>
        </FadeIn>

        <Box
          sx={{
            position: "relative",
            minHeight: { xs: 360, md: "78vh" },
            backgroundColor: "#d9d0c1",
            overflow: "hidden",
          }}
        >
          <Box sx={{ width: "100%", height: "100%" }}>
            <Box sx={{ width: "100%", height: "100%" }}>
              <Box
                component="img"
                src={data.gallery?.[1]?.url || editorialImages.heroAccent}
                alt={data.name}
                sx={{
                  width: "100%",
                  minHeight: { xs: 360, md: "78vh" },
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ bgcolor: "#40461c", color: "#f6f1e8" }}>
        <FadeIn>
          <Box
            sx={{
              maxWidth: 1280,
              mx: "auto",
              px: { xs: 2, md: 4 },
              py: { xs: 3, md: 3.5 },
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "120px 1fr auto" },
              gap: 3,
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: serifFont,
                fontSize: { xs: "2rem", md: "2.6rem" },
                lineHeight: 0.9,
              }}
            ></Typography>
            <Typography
              sx={{
                maxWidth: 760,
                lineHeight: 1.9,
                color: "rgba(246,241,232,0.82)",
              }}
            >
              {data.name} works with a deliberately small roster of clients,
              shaping premium brand experiences, spaces, and presentation
              systems with detail, restraint, and a polished editorial point of
              view.
            </Typography>
          </Box>
        </FadeIn>
      </Box>

      <Box
        id="work"
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 7, md: 10 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
          gap: { xs: 4, md: 6 },
        }}
      >
        <FadeIn>
          <Box>
            <Typography
              sx={{
                fontFamily: serifFont,
                fontSize: { xs: "2.8rem", md: "4.4rem" },
                lineHeight: 0.95,
              }}
            >
              Featured
              <br />
              selections
            </Typography>
            <Typography
              sx={{ mt: 2, color: "rgba(20,20,20,0.7)", lineHeight: 1.85 }}
            >
              A premium showcase for signature offerings, designed to feel
              elevated and editorial without turning the page into a storefront.
            </Typography>
            <Button
              onClick={() => scrollToSection("contact")}
              variant="contained"
              sx={{
                mt: 4,
                borderRadius: 0,
                bgcolor: "#0f1110",
                color: "#fff",
                px: 3,
                py: 1.4,
                fontSize: "0.76rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#0f1110",
                  boxShadow: "none",
                  opacity: 0.92,
                },
              }}
            >
              Start a project
            </Button>
          </Box>
        </FadeIn>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 3,
          }}
        >
          {featuredCards.map((card, index) => (
            <FadeIn key={card.title} delay={index * 0.08}>
              <Box>
                <Box
                  component="img"
                  src={card.image}
                  alt={card.title}
                  sx={{
                    width: "100%",
                    aspectRatio: index === 1 ? "0.85 / 1" : "0.82 / 1",
                    objectFit: "cover",
                    display: "block",
                    bgcolor: "#ddd6c9",
                  }}
                />
                <Typography
                  sx={{ mt: 1.5, fontFamily: serifFont, fontSize: "1.35rem" }}
                >
                  {card.title}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.75,
                    color: "rgba(20,20,20,0.7)",
                    lineHeight: 1.7,
                  }}
                >
                  {card.description}
                </Typography>
              </Box>
            </FadeIn>
          ))}
        </Box>
      </Box>

      <Box sx={{ bgcolor: secondary }}>
        <Box
          sx={{
            maxWidth: 1280,
            mx: "auto",
            px: { xs: 2, md: 4 },
            py: { xs: 7, md: 9 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
            gap: { xs: 4, md: 6 },
            alignItems: "center",
          }}
        >
          <FadeIn direction="right">
            <Box
              component="img"
              src={data.gallery?.[3]?.url || editorialImages.occasion}
              alt="Editorial composition"
              sx={{
                width: "100%",
                minHeight: { xs: 320, md: 520 },
                objectFit: "cover",
                display: "block",
              }}
            />
          </FadeIn>

          <FadeIn delay={0.08}>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.74rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(20,20,20,0.58)",
                }}
              >
                Brand occasions
              </Typography>
              <Typography
                sx={{
                  mt: 1.5,
                  fontFamily: serifFont,
                  fontSize: { xs: "3rem", md: "4.5rem" },
                  lineHeight: 0.94,
                  letterSpacing: "-0.04em",
                }}
              >
                Direction for launches, events, and polished company moments.
              </Typography>
              <Typography
                sx={{
                  mt: 2.5,
                  maxWidth: 470,
                  lineHeight: 1.9,
                  color: "rgba(20,20,20,0.72)",
                }}
              >
                Built for premium service companies, studios, consultancies, and
                boutique brands that need visual storytelling rather than
                product-cart behavior.
              </Typography>
              <Typography
                sx={{
                  mt: 2,
                  maxWidth: 470,
                  lineHeight: 1.9,
                  color: "rgba(20,20,20,0.72)",
                }}
              >
                Use this section for campaigns, seasonal messaging, private
                appointments, or company capabilities without introducing any
                checkout or add-to-cart flow.
              </Typography>
            </Box>
          </FadeIn>
        </Box>
      </Box>

      <Box
        id="services"
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 7, md: 10 },
          textAlign: "center",
        }}
      >
        <FadeIn>
          <Typography
            sx={{
              fontFamily: serifFont,
              fontSize: { xs: "3rem", md: "4.4rem" },
              lineHeight: 0.95,
            }}
          >
            What we do
          </Typography>
        </FadeIn>
        <FadeIn delay={0.08}>
          <Typography
            sx={{
              mt: 1.5,
              maxWidth: 720,
              mx: "auto",
              color: "rgba(20,20,20,0.68)",
              lineHeight: 1.85,
            }}
          >
            A premium multi-section template for company storytelling, services,
            and trust-building. It is structured around enquiries, not
            e-commerce actions.
          </Typography>
        </FadeIn>

        <Box
          sx={{
            mt: 5,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3,
          }}
        >
          {serviceTiles.map((tile, index) => (
            <FadeIn key={tile.title} delay={index * 0.08}>
              <Box>
                <Box
                  component="img"
                  src={tile.image}
                  alt={tile.title}
                  sx={{
                    width: "100%",
                    aspectRatio: "0.82 / 1",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <Typography
                  sx={{ mt: 1.6, fontFamily: serifFont, fontSize: "1.4rem" }}
                >
                  {tile.title}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.75,
                    color: "rgba(20,20,20,0.72)",
                    lineHeight: 1.75,
                  }}
                >
                  {tile.description}
                </Typography>
              </Box>
            </FadeIn>
          ))}
        </Box>
      </Box>

      <Box
        id="contact"
        sx={{
          bgcolor: "#e4ded2",
          color: "#141414",
        }}
      >
        <Box
          sx={{
            maxWidth: 1280,
            mx: "auto",
            px: { xs: 2, md: 4 },
            py: { xs: 6, md: 5 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.8fr 1.2fr" },
            gap: { xs: 4, md: 6 },
            alignItems: "start",
          }}
        >
          <FadeIn>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.74rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(20,20,20,0.58)",
                }}
              >
                Contact
              </Typography>
              <Typography
                sx={{
                  mt: 1.5,
                  fontFamily: serifFont,
                  fontSize: { xs: "2.8rem", md: "4rem" },
                  lineHeight: 0.96,
                }}
              >
                Let&apos;s shape something memorable.
              </Typography>

              <Stack spacing={1.4} sx={{ mt: 3.5 }}>
                {data.contact.address && (
                  <FadeIn delay={0.08}>
                    <Stack
                      direction="row"
                      spacing={1.4}
                      alignItems="flex-start"
                    >
                      <MapPin size={18} />
                      <Typography sx={{ lineHeight: 1.8 }}>
                        {data.contact.address}
                      </Typography>
                    </Stack>
                  </FadeIn>
                )}
                {data.contact.email && (
                  <FadeIn delay={0.14}>
                    <Stack direction="row" spacing={1.4} alignItems="center">
                      <Mail size={18} />
                      <Typography>{data.contact.email}</Typography>
                    </Stack>
                  </FadeIn>
                )}
                {data.contact.phone && (
                  <FadeIn delay={0.2}>
                    <Stack direction="row" spacing={1.4} alignItems="center">
                      <Phone size={18} />
                      <Typography>{data.contact.phone}</Typography>
                    </Stack>
                  </FadeIn>
                )}
              </Stack>
            </Box>
          </FadeIn>

          <FadeIn delay={0.08}>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.74rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(20,20,20,0.58)",
                }}
              >
                Join the mailing list
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                sx={{ mt: 2.5, alignItems: "stretch" }}
              >
                <TextField
                  fullWidth
                  placeholder="Email address"
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      minHeight: 58,
                      borderRadius: 0,
                      bgcolor: "#f7f2e8",
                      "& fieldset": {
                        borderColor: "rgba(20,20,20,0.14)",
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      px: 2,
                      py: 2,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    minHeight: 58,
                    px: 3.2,
                    borderRadius: 0,
                    bgcolor: "#111",
                    color: "#fff",
                    boxShadow: "none",
                    fontSize: "0.76rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    "&:hover": {
                      bgcolor: "#111",
                      boxShadow: "none",
                      opacity: 0.92,
                    },
                  }}
                >
                  Sign up
                </Button>
              </Stack>

              {socialIcons.length > 0 && (
                <Stack direction="row" spacing={1.1} sx={{ mt: 3 }}>
                  {socialIcons.map(({ key, icon: Icon }, index) => (
                    <FadeIn key={key} delay={index * 0.06}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid rgba(20,20,20,0.14)",
                          bgcolor: "#f7f2e8",
                        }}
                      >
                        <Icon size={16} />
                      </Box>
                    </FadeIn>
                  ))}
                </Stack>
              )}
            </Box>
          </FadeIn>
        </Box>
      </Box>
    </Box>
  );
};

export default CompanyPremiumTemplate;
