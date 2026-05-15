import React, { useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Stack,
  IconButton,
  Container,
  Grid,
  Paper,
} from "@mui/material";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Users,
  BadgeDollarSign,
  ArrowRight,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { TemplateProps } from "../../templateEngine/types";
import FadeIn from "../../blocks/FadeIn";

const plumbingHeroImage =
  "https://cdn.prod.website-files.com/68ce363cc9e814fa40d285fd/68ceeb8c65230295abdded06_hero-images.jpg";
const plumbingAboutImages = [
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
];
const plumbingWhyChooseImage =
  "https://cdn.prod.website-files.com/68d2042c46587205de9090c3/68d4a87ba83780e42c705cac_service-thumbnail%20(1).webp";
const plumbingScrollStackImages = [
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
];

const navItems = [
  { label: "Home", id: "hero" },
  { label: "About Us", id: "about" },
  { label: "Services", id: "services" },
  { label: "Contact", id: "contact" },
];

function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

type StackCardProps = {
  src: string;
  alt: string;
  scrollYProgress: MotionValue<number>;
  start: number;
  end: number;
  baseX: number;
  baseY: number;
  zIndex: number;
};

function StackCard({
  src,
  alt,
  scrollYProgress,
  start,
  end,
  baseX,
  baseY,
  zIndex,
}: StackCardProps) {
  const x = useTransform(scrollYProgress, [start, end], [baseX, baseX - 180]);
  const y = useTransform(scrollYProgress, [start, end], [baseY, baseY + 160]);
  const opacity = useTransform(
    scrollYProgress,
    [start, end - 0.05, end],
    [1, 1, 0],
  );
  const scale = useTransform(scrollYProgress, [start, end], [1, 0.9]);
  const rotate = useTransform(scrollYProgress, [start, end], [0, -6]);

  return (
    <Box
      component={motion.div}
      style={{ x, y, opacity, scale, rotate }}
      sx={{
        position: "absolute",
        inset: 0,
        zIndex,
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 28px 70px rgba(17,19,18,0.18)",
        border: "1px solid rgba(17,19,18,0.06)",
        bgcolor: "#ffffff",
      }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </Box>
  );
}

const PlumbingTemplate: React.FC<TemplateProps> = ({ data }) => {
  const stackSectionRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: stackSectionRef,
    offset: ["start start", "end end"],
  });
  const galleryItems = (data.gallery || []).slice(0, 6);
  const heroImage = data.heroBannerUrl;
  const aboutImage = galleryItems[0]?.url || plumbingAboutImages[0];
  const hours = data.workingHours?.slice(0, 4) || [
    { day: "Monday", hours: "8am - 6pm" },
    { day: "Tuesday", hours: "8am - 6pm" },
    { day: "Wednesday", hours: "8am - 6pm" },
    { day: "Saturday", hours: "Emergency only" },
  ];
  const projectImages = (
    galleryItems.length
      ? galleryItems
      : plumbingAboutImages.map((url) => ({ url }))
  ).slice(0, 5);
  const stackImages = [
    galleryItems[1]?.url || plumbingScrollStackImages[0],
    galleryItems[2]?.url || plumbingScrollStackImages[1],
    galleryItems[3]?.url || plumbingScrollStackImages[2],
    galleryItems[4]?.url || plumbingScrollStackImages[3],
  ];

  return (
    <Box sx={{ bgcolor: "#fbfaf7" }}>
      <Box
        id="hero"
        sx={{
          position: "relative",
          minHeight: { xs: 620, md: 760 },
          color: "#ffffff",
          overflow: "hidden",
          backgroundImage: `linear-gradient(180deg, rgba(4,5,7,0.2) 0%, rgba(4,5,7,0.35) 45%, rgba(4,5,7,0.52) 100%), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: { xs: "62% center", md: "center center" },
        }}
      >
        <AppBar
          position="absolute"
          elevation={0}
          sx={{
            top: { xs: 64, md: 28 },
            bgcolor: "transparent",
            boxShadow: "none",
          }}
        >
          <Toolbar
            sx={{
              maxWidth: 1280,
              mx: "auto",
              width: "100%",
              px: { xs: 2, md: 4 },
              py: 0,
              minHeight: "auto !important",
            }}
          >
            <Box
              sx={{
                width: "100%",
                px: 0,
                py: 0.5,
                display: "grid",
                gridTemplateColumns: { xs: "1fr auto", md: "260px 1fr 56px" },
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", minHeight: 44 }}
              >
                {data.logoUrl ? (
                  <Box
                    component="img"
                    src={data.logoUrl}
                    alt={`${data.name} logo`}
                    sx={{
                      height: { xs: 34, md: 42 },
                      width: "auto",
                      maxWidth: { xs: 140, md: 180 },
                      objectFit: "contain",
                      display: "block",
                      filter: "brightness(0) invert(1)",
                    }}
                  />
                ) : (
                  <Typography
                    sx={{
                      color: "#ffffff",
                      fontSize: { xs: "1.6rem", md: "2rem" },
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {data.name}
                  </Typography>
                )}
              </Box>

              <Stack
                direction="row"
                spacing={3}
                justifyContent="center"
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
                      p: 0,
                      bgcolor: "transparent",
                      color: "rgba(255,255,255,0.92)",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      "&:hover": { color: "#ffffff" },
                    }}
                  >
                    {item.label}
                  </Box>
                ))}
              </Stack>

              <Stack spacing={0.7} alignItems="flex-end" sx={{ pr: { md: 1 } }}>
                <Box
                  sx={{
                    width: 32,
                    height: 2,
                    bgcolor: "#ffffff",
                    borderRadius: 999,
                  }}
                />
                <Box
                  sx={{
                    width: 32,
                    height: 2,
                    bgcolor: "#ffffff",
                    borderRadius: 999,
                  }}
                />
                <Box
                  sx={{
                    width: 32,
                    height: 2,
                    bgcolor: "#ffffff",
                    borderRadius: 999,
                  }}
                />
              </Stack>
            </Box>
          </Toolbar>
        </AppBar>

        <Container
          maxWidth="xl"
          sx={{
            pt: { xs: 0, md: 1 },
            pb: { xs: 7, md: 6 },
            px: { xs: 2, md: 4 },
          }}
        >
          <Grid
            container
            alignItems="end"
            sx={{ minHeight: { xs: 520, md: 650 } }}
          >
            <Grid xs={12} md={8}>
              <Box sx={{ maxWidth: 840 }}>
                <FadeIn>
                  <Typography
                    sx={{
                      fontSize: { xs: "4.4rem", md: "8.2rem" },
                      lineHeight: 0.9,
                      letterSpacing: "-0.08em",
                      fontWeight: 400,
                      color: "#ffffff",
                    }}
                  >
                    Fast
                  </Typography>
                </FadeIn>
                <FadeIn delay={0.08}>
                  <Typography
                    sx={{
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontStyle: "italic",
                      fontSize: { xs: "3.5rem", md: "7.2rem" },
                      lineHeight: 0.88,
                      letterSpacing: "-0.06em",
                      fontWeight: 400,
                      color: "#ffffff",
                      ml: { xs: 6, md: 22 },
                      mt: { xs: -1.5, md: -2.5 },
                    }}
                  >
                    Reliable
                  </Typography>
                </FadeIn>
                <FadeIn delay={0.16}>
                  <Typography
                    sx={{
                      fontSize: { xs: "4.4rem", md: "8.2rem" },
                      lineHeight: 0.9,
                      letterSpacing: "-0.08em",
                      fontWeight: 400,
                      color: "#ffffff",
                      mt: { xs: -1.5, md: -3 },
                    }}
                  >
                    Repairs
                  </Typography>
                </FadeIn>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: { xs: 1, md: 2 } }}>
            <Grid xs={12} md={4.5}>
              <FadeIn delay={0.24}>
                <Typography
                  sx={{
                    maxWidth: 360,
                    color: "rgba(255,255,255,0.92)",
                    fontSize: { xs: "1rem", md: "1.02rem" },
                    lineHeight: 1.6,
                    mt: 2,
                  }}
                >
                  Home service overview. Trusted experts delivering fast,
                  reliable, and professional home repair solutions.
                </Typography>
              </FadeIn>
            </Grid>
            <Grid xs={12} md={3} />
          </Grid>
        </Container>
      </Box>

      <Container
        id="about"
        maxWidth="lg"
        sx={{ pt: { xs: 7, md: 20 }, pb: { xs: 7, md: 10 } }}
      >
        <Grid container spacing={{ xs: 5, md: 10 }} alignItems="center">
          <Grid xs={12} md={4}>
            <FadeIn direction="right">
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 320,
                  mx: { xs: "auto", md: 0 },
                  height: { xs: 360, md: 420 },
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 20px 48px rgba(16,24,40,0.12)",
                }}
              >
                <Box
                  component="img"
                  src={aboutImage}
                  alt="Plumbing specialist"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>
            </FadeIn>
          </Grid>
          <Grid xs={12} md={8} sx={{ pl: { md: 5 } }}>
            <FadeIn>
              <Typography
                sx={{
                  color: "#111111",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  mb: 2.5,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                About Us
                <Box
                  sx={{
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "9px solid #f26a2e",
                  }}
                />
              </Typography>
            </FadeIn>
            <FadeIn delay={0.08}>
              <Typography
                sx={{
                  color: "#050505",
                  fontSize: { xs: "2.2rem", md: "4rem" },
                  lineHeight: { xs: 1.16, md: 1.18 },
                  letterSpacing: "-0.05em",
                  fontWeight: 400,
                  maxWidth: 920,
                }}
              >
                From plumbing leaks to full-system fixes, {data.name} delivers
                dependable maintenance with a cleaner, calmer service
                experience.
              </Typography>
            </FadeIn>
          </Grid>
        </Grid>

        <Box
          sx={{
            pt: { xs: 7, md: 10 },
            mt: { xs: 5, md: 7 },
            textAlign: "center",
          }}
        >
          <FadeIn>
            <Typography
              sx={{
                color: "#080808",
                fontSize: { xs: "2.2rem", md: "4.2rem" },
                lineHeight: { xs: 1.18, md: 1.2 },
                letterSpacing: "-0.05em",
                fontWeight: 400,
                maxWidth: 980,
                mx: "auto",
              }}
            >
              <Box
                component="span"
                sx={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontStyle: "italic",
                  mr: 1.5,
                }}
              >
                Reliable,
              </Box>
              Professional Home
              <br />
              Repair Solutions Delivering
              <br />
              Proven
              <Box
                component="span"
                sx={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontStyle: "italic",
                  mx: 1.5,
                }}
              >
                Results Every
              </Box>
              Time
            </Typography>
          </FadeIn>

          <FadeIn delay={0.12}>
            <Button
              variant="contained"
              onClick={() => scrollToSection("contact")}
              sx={{
                mt: { xs: 4, md: 5 },
                borderRadius: 999,
                px: 3.4,
                py: 1.25,
                bgcolor: "#ff6b1a",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "1rem",
                boxShadow: "none",
                "&:hover": { bgcolor: "#ea5f14", boxShadow: "none" },
              }}
            >
              About Us
            </Button>
          </FadeIn>
        </Box>
      </Container>

      <Box sx={{ bgcolor: "#fbfaf7", py: { xs: 7, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid
            container
            rowSpacing={{ xs: 4, md: 4 }}
            columnSpacing={{ xs: 0, md: 6 }}
            alignItems="stretch"
          >
            <Grid xs={12} md={6}>
              <FadeIn>
                <Typography
                  sx={{
                    color: "#2b2b2b",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    mb: 1.8,
                  }}
                >
                  /Why Choose us
                </Typography>
              </FadeIn>
              <FadeIn delay={0.08}>
                <Typography
                  sx={{
                    color: "#101010",
                    fontSize: { xs: "2.2rem", md: "3.2rem" },
                    lineHeight: 1.12,
                    letterSpacing: "-0.05em",
                    fontWeight: 600,
                    maxWidth: 620,
                    mb: 2.2,
                  }}
                >
                  Why choose our Services
                </Typography>
              </FadeIn>
              <FadeIn delay={0.16}>
                <Typography
                  sx={{
                    color: "#2f2f2f",
                    fontSize: { xs: "1rem", md: "1.05rem" },
                    lineHeight: 1.7,
                    maxWidth: 520,
                    mb: 3.5,
                  }}
                >
                  We combine expertise, reliability, and care to deliver the
                  best experience every time.
                </Typography>
              </FadeIn>

              <Grid container spacing={2.2}>
                <Grid xs={12} sm={6}>
                  <FadeIn delay={0.22} direction="right">
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2.6, md: 3 },
                        borderRadius: 3,
                        border: "1px solid #e6e1d8",
                        bgcolor: "#ffffff",
                        height: "100%",
                      }}
                    >
                      <Users size={28} color="#111111" />
                      <Typography
                        sx={{
                          color: "#111111",
                          fontSize: { xs: "1.5rem", md: "1.15rem" },
                          fontWeight: 700,
                          mt: 3,
                          mb: 1.6,
                        }}
                      >
                        Insured Professionals
                      </Typography>
                      <Typography
                        sx={{
                          color: "#2f2f2f",
                          fontSize: "0.98rem",
                          lineHeight: 1.65,
                          maxWidth: 240,
                        }}
                      >
                        Our plumbers are trained experts who follow industry
                        standards on every job.
                      </Typography>
                    </Paper>
                  </FadeIn>
                </Grid>
                <Grid xs={12} sm={6}>
                  <FadeIn delay={0.3} direction="right">
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2.6, md: 3 },
                        borderRadius: 3,
                        border: "1px solid #e6e1d8",
                        bgcolor: "#ffffff",
                        height: "100%",
                      }}
                    >
                      <BadgeDollarSign size={28} color="#111111" />
                      <Typography
                        sx={{
                          color: "#111111",
                          fontSize: { xs: "1.5rem", md: "1.15rem" },
                          fontWeight: 700,
                          mt: 3,
                          mb: 1.6,
                        }}
                      >
                        Transparent Pricing
                      </Typography>
                      <Typography
                        sx={{
                          color: "#2f2f2f",
                          fontSize: "0.98rem",
                          lineHeight: 1.65,
                          maxWidth: 240,
                        }}
                      >
                        We believe in honesty. Every service comes with upfront
                        pricing before work begins.
                      </Typography>
                    </Paper>
                  </FadeIn>
                </Grid>
              </Grid>

              <FadeIn delay={0.38}>
                <Box
                  sx={{
                    mt: 2.2,
                    p: { xs: 2.6, md: 3 },
                    borderRadius: 3,
                    bgcolor: "#111312",
                    color: "#ffffff",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "1.4rem", md: "1.1rem" },
                      fontWeight: 700,
                      mb: 1.5,
                    }}
                  >
                    Work Backed by Customer Satisfaction
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "1rem",
                      lineHeight: 1.7,
                      maxWidth: 520,
                      mb: 3,
                    }}
                  >
                    We ensure everything works perfectly and you&apos;re
                    completely satisfied before we leave.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => scrollToSection("contact")}
                    endIcon={<ArrowRight size={18} />}
                    sx={{
                      borderRadius: 999,
                      pl: 2.4,
                      pr: 1.2,
                      py: 1.1,
                      bgcolor: "#ffffff",
                      color: "#111111",
                      fontWeight: 600,
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#f2f2f2", boxShadow: "none" },
                      "& .MuiButton-endIcon": {
                        ml: 1.5,
                        bgcolor: "#111111",
                        color: "#ffffff",
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    }}
                  >
                    Explore all our services
                  </Button>
                </Box>
              </FadeIn>
            </Grid>

            <Grid xs={12} md={6} sx={{ pl: { md: 2 } }}>
              <FadeIn delay={0.12} direction="left">
                <Box
                  sx={{
                    height: "100%",
                    minHeight: { xs: 420, md: "100%" },
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={plumbingWhyChooseImage}
                    alt="Professional worker"
                    sx={{
                      width: "100%",
                      height: { xs: 420, md: "100%" },
                      minHeight: { md: 640 },
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </Box>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        ref={stackSectionRef}
        sx={{
          position: "relative",
          minHeight: { xs: "auto", md: "220vh" },
          bgcolor: "#fbfaf7",
        }}
      >
        <Box
          sx={{
            position: { xs: "relative", md: "sticky" },
            top: { md: 24 },
            minHeight: { xs: "auto", md: "100vh" },
            display: "flex",
            alignItems: "center",
            py: { xs: 8, md: 0 },
          }}
        >
          <Container maxWidth="lg">
            <Grid
              container
              columnSpacing={{ xs: 0, md: 8 }}
              rowSpacing={{ xs: 5, md: 0 }}
              alignItems="center"
            >
              <Grid xs={12} md={6}>
                <FadeIn>
                  <Typography
                    sx={{
                      color: "#101010",
                      fontSize: { xs: "2.2rem", md: "4rem" },
                      lineHeight: { xs: 1.12, md: 1.08 },
                      letterSpacing: "-0.05em",
                      fontWeight: 500,
                      maxWidth: 560,
                      mb: { xs: 4, md: 5 },
                    }}
                  >
                    Delivering dependable home repair services with a personal
                    touch
                  </Typography>
                </FadeIn>

                <Grid container spacing={3} alignItems="stretch">
                  <Grid xs={12} sm={4.5}>
                    <Typography
                      sx={{
                        color: "#050505",
                        fontSize: { xs: "3.8rem", md: "4.4rem" },
                        lineHeight: 0.95,
                        fontWeight: 700,
                        letterSpacing: "-0.08em",
                      }}
                    >
                      85k
                    </Typography>
                    <Typography
                      sx={{
                        color: "#f3a515",
                        fontSize: "1.4rem",
                        lineHeight: 1,
                        mt: 1.8,
                      }}
                    >
                      ★★★★★
                    </Typography>
                    <Typography
                      sx={{
                        color: "#4d4d4d",
                        fontSize: "1rem",
                        mt: 1.2,
                        mb: 2.8,
                      }}
                    >
                      Clients worldwide
                    </Typography>
                    <Stack direction="row" spacing={-1.2}>
                      {stackImages.slice(0, 4).map((src, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 54,
                            height: 54,
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "3px solid #fbfaf7",
                            boxShadow: "0 8px 20px rgba(17,19,18,0.08)",
                          }}
                        >
                          <Box
                            component="img"
                            src={src}
                            alt="Customer avatar"
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Grid>

                  <Grid xs={12} sm={7.5}>
                    <FadeIn delay={0.12} direction="left">
                      <Box
                        sx={{
                          pl: { sm: 3.5, md: 4 },
                          borderLeft: { sm: "1px solid #ddd3c4" },
                          height: "100%",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#111111",
                            fontSize: { xs: "1.8rem", md: "2rem" },
                            lineHeight: 1.12,
                            letterSpacing: "-0.04em",
                            fontWeight: 500,
                            mb: 1.8,
                            maxWidth: 360,
                          }}
                        >
                          We treat your home like our own
                        </Typography>
                        <Typography
                          sx={{
                            color: "#555555",
                            fontSize: { xs: "1rem", md: "1.02rem" },
                            lineHeight: 1.75,
                            maxWidth: 420,
                            mb: 3.2,
                          }}
                        >
                          Careful repairs, cleaner finishes, and a more
                          dependable service rhythm from first call to final
                          check.
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => scrollToSection("contact")}
                          sx={{
                            borderRadius: 999,
                            px: 3.4,
                            py: 1.25,
                            bgcolor: "#49592f",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "0.98rem",
                            boxShadow: "none",
                            "&:hover": {
                              bgcolor: "#3f4d28",
                              boxShadow: "none",
                            },
                          }}
                        >
                          More About Us
                        </Button>
                      </Box>
                    </FadeIn>
                  </Grid>
                </Grid>
              </Grid>

              <Grid xs={12} md={6}>
                <FadeIn delay={0.08} direction="left">
                  <Box
                    sx={{
                      position: "relative",
                      ml: { md: 3 },
                      height: { xs: 520, md: 620 },
                      maxWidth: { xs: 420, md: 540 },
                      mx: { xs: "auto", md: 0 },
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 10,
                        width: { xs: "74%", md: "78%" },
                        height: { xs: 340, md: 460 },
                        borderRadius: 4,
                        bgcolor: "#d8ecff",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 42,
                        right: 36,
                        width: { xs: "80%", md: "82%" },
                        height: { xs: 360, md: 490 },
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 4,
                          overflow: "hidden",
                          boxShadow: "0 28px 70px rgba(17,19,18,0.18)",
                        }}
                      >
                        <Box
                          component="img"
                          src={stackImages[0]}
                          alt="Featured repair work"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </Box>
                      <StackCard
                        src={stackImages[1]}
                        alt="Repair specialist one"
                        scrollYProgress={scrollYProgress}
                        start={0.08}
                        end={0.34}
                        baseX={-30}
                        baseY={70}
                        zIndex={4}
                      />
                      <StackCard
                        src={stackImages[2]}
                        alt="Repair specialist two"
                        scrollYProgress={scrollYProgress}
                        start={0.34}
                        end={0.62}
                        baseX={-60}
                        baseY={34}
                        zIndex={3}
                      />
                      <StackCard
                        src={stackImages[3]}
                        alt="Repair specialist three"
                        scrollYProgress={scrollYProgress}
                        start={0.62}
                        end={0.88}
                        baseX={-92}
                        baseY={0}
                        zIndex={2}
                      />
                    </Box>
                  </Box>
                </FadeIn>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      <Box sx={{ bgcolor: "#090909", color: "#f6efe5", mt: { xs: 0, md: 0 } }}>
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
          <Grid
            container
            columnSpacing={{ xs: 0, md: 8 }}
            rowSpacing={{ xs: 4, md: 0 }}
            alignItems="start"
          >
            <Grid xs={12} md={6} sx={{ pt: { md: 1.5 }, pr: { md: 3 } }}>
              <FadeIn>
                <Typography
                  sx={{
                    color: "#9f5f3c",
                    fontSize: "0.74rem",
                    fontWeight: 800,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    mb: 1.3,
                  }}
                >
                  Professional Home Plumbing
                </Typography>
              </FadeIn>
              <FadeIn delay={0.08}>
                <Typography
                  sx={{
                    color: "#f6efe5",
                    fontSize: { xs: "2rem", md: "3rem" },
                    lineHeight: 1.04,
                    letterSpacing: "-0.04em",
                    fontWeight: 800,
                    mb: 3.4,
                  }}
                >
                  Working Hours
                </Typography>
              </FadeIn>
              <Stack spacing={1.6} sx={{ maxWidth: 520 }}>
                {hours.map((item, index) => (
                  <FadeIn
                    key={item.day}
                    delay={0.14 + index * 0.06}
                    direction="right"
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{
                        py: 1.3,
                        gap: 2,
                        borderBottom: "1px solid rgba(246,239,229,0.12)",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#f6efe5",
                          fontWeight: 600,
                          fontSize: "1.02rem",
                        }}
                      >
                        {item.day}
                      </Typography>
                      <Typography
                        sx={{
                          color: "rgba(246,239,229,0.68)",
                          fontSize: "0.98rem",
                          textAlign: "right",
                        }}
                      >
                        {item.hours}
                      </Typography>
                    </Stack>
                  </FadeIn>
                ))}
              </Stack>
            </Grid>
            <Grid
              id="contact"
              xs={12}
              md={6}
              sx={{
                display: "flex",
                justifyContent: { xs: "stretch", md: "flex-end" },
              }}
            >
              <FadeIn delay={0.08} direction="left">
                <Paper
                  elevation={0}
                  sx={{
                    width: "100%",
                    maxWidth: 520,
                    p: { xs: 2.4, md: 3.2 },
                    borderRadius: 0,
                    bgcolor: "#ffffff",
                    color: "#121722",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#b36c46",
                      fontSize: "0.74rem",
                      fontWeight: 800,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      mb: 1.1,
                    }}
                  >
                    Repair Form
                  </Typography>
                  <Typography
                    sx={{
                      color: "#161b24",
                      fontSize: { xs: "1.8rem", md: "2rem" },
                      lineHeight: 1.08,
                      fontWeight: 800,
                      mb: 2.6,
                    }}
                  >
                    Get A Repair Quote
                  </Typography>
                  <Stack spacing={1.6}>
                    {["Your Name", "Phone Number", "Service Needed"].map(
                      (label, index) => (
                        <FadeIn
                          key={label}
                          delay={0.14 + index * 0.06}
                          direction="left"
                        >
                          <Box
                            sx={{
                              px: 1.8,
                              py: 1.55,
                              border: "1px solid #e8dfd4",
                              color: "#6d7078",
                              fontSize: "0.98rem",
                            }}
                          >
                            {label}
                          </Box>
                        </FadeIn>
                      ),
                    )}
                    <FadeIn delay={0.34} direction="left">
                      <Box
                        sx={{
                          px: 1.8,
                          py: 1.55,
                          minHeight: 120,
                          border: "1px solid #e8dfd4",
                          color: "#6d7078",
                          fontSize: "0.98rem",
                        }}
                      >
                        Message
                      </Box>
                    </FadeIn>
                  </Stack>
                  <FadeIn delay={0.42}>
                    <Button
                      variant="contained"
                      sx={{
                        mt: 2.8,
                        borderRadius: 0,
                        px: 2.8,
                        py: 1.2,
                        bgcolor: "#111418",
                        color: "#ffffff",
                        fontWeight: 800,
                        "&:hover": { bgcolor: "#000000" },
                      }}
                    >
                      Submit
                    </Button>
                  </FadeIn>
                </Paper>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: "#fbfaf7", py: { xs: 7, md: 9 } }}>
        <Container maxWidth="md">
          <Grid container spacing={3} alignItems="center">
            <Grid xs={12} md={7}>
              <FadeIn>
                <Typography
                  sx={{
                    color: "#131823",
                    fontSize: { xs: "1.7rem", md: "2.4rem" },
                    lineHeight: 1.08,
                    letterSpacing: "-0.04em",
                    fontWeight: 800,
                    mb: 1.2,
                  }}
                >
                  Repairs your home can depend on.
                </Typography>
              </FadeIn>
              <FadeIn delay={0.08}>
                <Typography
                  sx={{ color: "#6d7078", maxWidth: 440, lineHeight: 1.8 }}
                >
                  Minimal hassle, faster scheduling, and a cleaner finish from
                  quote to repair.
                </Typography>
              </FadeIn>
            </Grid>
            <Grid xs={12} md={5}>
              <FadeIn delay={0.12} direction="left">
                <Stack
                  direction="row"
                  spacing={1.5}
                  justifyContent={{ xs: "flex-start", md: "flex-end" }}
                >
                  {[0, 1].map((index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 112,
                        height: 112,
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "0 14px 28px rgba(16,24,40,0.09)",
                      }}
                    >
                      <Box
                        component="img"
                        src={
                          projectImages[index]?.url ||
                          plumbingAboutImages[index]
                        }
                        alt="Plumbing detail"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: "#0a0a0a", py: 6, px: 3, textAlign: "center" }}>
        <FadeIn>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: "#fff", mb: 1 }}
          >
            {data.name}
          </Typography>
        </FadeIn>
        {data.contact.address && (
          <FadeIn delay={0.08}>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.54)", mb: 3 }}
            >
              {data.contact.address}
            </Typography>
          </FadeIn>
        )}
        <FadeIn delay={0.16}>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ mb: 3 }}
          >
            {data.socialLinks?.facebook && (
              <IconButton size="small" sx={{ color: "rgba(255,255,255,0.62)" }}>
                <Facebook size={18} />
              </IconButton>
            )}
            {data.socialLinks?.instagram && (
              <IconButton size="small" sx={{ color: "rgba(255,255,255,0.62)" }}>
                <Instagram size={18} />
              </IconButton>
            )}
            {data.socialLinks?.twitter && (
              <IconButton size="small" sx={{ color: "rgba(255,255,255,0.62)" }}>
                <Twitter size={18} />
              </IconButton>
            )}
            {data.socialLinks?.linkedin && (
              <IconButton size="small" sx={{ color: "rgba(255,255,255,0.62)" }}>
                <Linkedin size={18} />
              </IconButton>
            )}
          </Stack>
        </FadeIn>
        <FadeIn delay={0.24}>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.38)" }}
          >
            © {new Date().getFullYear()} {data.name}. All rights reserved.
          </Typography>
        </FadeIn>
      </Box>
    </Box>
  );
};

export default PlumbingTemplate;
