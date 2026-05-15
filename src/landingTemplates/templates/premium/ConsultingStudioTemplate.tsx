import React from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowRight,
  BriefcaseBusiness,
  Facebook,
  Instagram,
  Linkedin,
  Play,
  Twitter,
} from "lucide-react";
import FadeIn from "../../blocks/FadeIn";
import type { TemplateProps } from "../../templateEngine/types";

function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ConsultingStudioHeader({ data }: { data: TemplateProps["data"] }) {
  const navItems = [
    { label: "Home", id: "hero" },
    { label: "About", id: "about-us" },
    { label: "Approach", id: "strategy" },
    { label: "Process", id: "projects" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <Box
      component="header"
      sx={{
        position: "absolute",
        top: { xs: 70, md: 58 },
        left: 0,
        right: 0,
        zIndex: 140,
        px: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1180,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr auto", md: "180px 1fr auto" },
          alignItems: "center",
          gap: { xs: 1.5, md: 2 },
          minHeight: 72,
          px: { xs: 2.4, md: 3.2 },
          borderRadius: 999,
          bgcolor: "#ffffff",
          boxShadow: "0 18px 42px rgba(23, 32, 65, 0.12)",
        }}
      >
        <Typography
          sx={{
            color: "#2838f5",
            fontWeight: 800,
            fontSize: { xs: "1.45rem", md: "1.6rem" },
            letterSpacing: "-0.03em",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          OPTIMO
        </Typography>

        <Stack
          direction="row"
          spacing={2.4}
          justifyContent="center"
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {navItems.map((item) => (
            <Typography
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              sx={{
                color: "#44507a",
                cursor: "pointer",
                fontSize: "0.92rem",
                fontWeight: 600,
                "&:hover": { color: "#1f2b59" },
              }}
            >
              {item.label}
            </Typography>
          ))}
        </Stack>

        <Stack
          direction="row"
          spacing={1.1}
          alignItems="center"
          onClick={() => scrollToSection("contact")}
          sx={{
            cursor: "pointer",
          }}
        >
          <Typography
            sx={{ color: "#0f172f", fontWeight: 700, fontSize: "0.98rem" }}
          >
            Contact Us
          </Typography>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              bgcolor: "#2838f5",
              color: "#ffffff",
              fontSize: "1rem",
              boxShadow: "0 10px 24px rgba(40, 56, 245, 0.28)",
            }}
          >
            <ArrowRight size={16} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

function ConsultingStudioHero({ data }: { data: TemplateProps["data"] }) {
  const heroImage =
    "https://static.wixstatic.com/media/c837a6_66240e362627410599bbeee77e0bac94~mv2.jpg/v1/fill/w_1318,h_718,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/c837a6_66240e362627410599bbeee77e0bac94~mv2.jpg";

  return (
    <Box
      id="hero"
      sx={{
        position: "relative",
        minHeight: { xs: "88vh", md: "100vh" },
        px: { xs: 2, md: 4 },
        pt: { xs: 16, md: 18 },
        pb: { xs: 5, md: 6 },
        display: "flex",
        alignItems: "center",
        backgroundImage: `linear-gradient(90deg, rgba(12,18,38,0.46) 0%, rgba(12,18,38,0.18) 50%, rgba(12,18,38,0.1) 100%), url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box
        sx={{
          maxWidth: 1180,
          mx: "auto",
          width: "100%",
        }}
      >
        <FadeIn>
          <Box sx={{ maxWidth: 760, pt: { xs: 6, md: 10 } }}>
            <Typography
              sx={{
                color: "#ffffff",
                fontWeight: 800,
                fontSize: { xs: "2.8rem", md: "5.3rem" },
                lineHeight: { xs: 1.05, md: 1.02 },
                letterSpacing: "-0.05em",
              }}
            >
              Navigate Business
              <br />
              with{" "}
              <Box
                component="span"
                sx={{
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                }}
              >
                Confidence
              </Box>
            </Typography>
            <Typography
              sx={{
                mt: 2.2,
                color: "rgba(255,255,255,0.9)",
                fontSize: { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.75,
                maxWidth: 560,
              }}
            >
              Expert strategic consulting to drive sustainable growth,
              operational innovation, and lasting business transformation across
              industries and markets, maximizing impact.
            </Typography>
            <Stack
              direction="row"
              spacing={1.2}
              alignItems="center"
              sx={{ mt: 4 }}
            >
              <Button
                variant="contained"
                onClick={() => scrollToSection("contact")}
                sx={{
                  bgcolor: "#ffffff",
                  color: "#0f172f",
                  borderRadius: 999,
                  px: 2.8,
                  py: 1.15,
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "0 18px 44px rgba(10, 16, 34, 0.18)",
                  "&:hover": { bgcolor: "#f4f4f6" },
                }}
              >
                Book a Free Call
              </Button>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "#2838f5",
                  color: "#ffffff",
                  fontSize: "1.2rem",
                  boxShadow: "0 12px 30px rgba(40, 56, 245, 0.34)",
                }}
              >
                <ArrowRight size={16} />
              </Box>
            </Stack>
          </Box>
        </FadeIn>
      </Box>
    </Box>
  );
}

function ConsultingStudioBody({ data }: { data: TemplateProps["data"] }) {
  const aboutImages = (data.gallery ?? []).slice(0, 3);
  const projectCards = (data.gallery ?? []).slice(2, 5);
  const processSteps = [
    "Discovery workshop and business audit",
    "Custom roadmap with measurable milestones",
    "Weekly execution support and performance reporting",
  ];
  const spotlightImages = (data.gallery ?? []).slice(1, 3);

  return (
    <>
      <Box
        id="about-us"
        sx={{ px: { xs: 2, md: 4 }, py: { xs: 6, md: 7 }, bgcolor: "#ffffff" }}
      >
        <Box
          sx={{
            maxWidth: 1180,
            mx: "auto",
            p: { xs: 3, md: 4 },
            borderRadius: 5,
            border: "1px solid rgba(29, 43, 100, 0.08)",
            bgcolor: "#ffffff",
            boxShadow: "0 18px 40px rgba(42, 55, 118, 0.06)",
          }}
        >
          <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <FadeIn>
                <Typography
                  sx={{
                    color: "#3f57ff",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  About Us
                </Typography>
              </FadeIn>
              <FadeIn delay={0.08}>
                <Typography
                  sx={{
                    mt: 1.2,
                    color: "#172041",
                    fontWeight: 800,
                    fontSize: { xs: "1.85rem", md: "2.6rem" },
                    lineHeight: 1.08,
                    maxWidth: 520,
                  }}
                >
                  We help businesses make sharper decisions and move with more
                  confidence.
                </Typography>
              </FadeIn>
              <FadeIn delay={0.16}>
                <Typography
                  sx={{
                    mt: 1.8,
                    color: "#6f7898",
                    lineHeight: 1.75,
                    maxWidth: 520,
                  }}
                >
                  Clean strategy, strong positioning, and practical support for
                  growing brands.
                </Typography>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={7}>
                  <FadeIn delay={0.06} direction="left">
                    <Box
                      sx={{
                        minHeight: { xs: 260, md: 360 },
                        borderRadius: 5,
                        overflow: "hidden",
                        boxShadow: "0 26px 60px rgba(40, 55, 126, 0.12)",
                        bgcolor: "#edf1ff",
                      }}
                    >
                      {aboutImages[0]?.url && (
                        <Box
                          component="img"
                          src={aboutImages[0].url}
                          alt={data.name}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </Box>
                  </FadeIn>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <Stack spacing={2} sx={{ height: "100%" }}>
                    <FadeIn delay={0.14} direction="left">
                      <Box
                        sx={{
                          flex: 1,
                          minHeight: 170,
                          borderRadius: 4,
                          overflow: "hidden",
                          bgcolor: "#f6f8ff",
                          border: "1px solid rgba(29, 43, 100, 0.08)",
                        }}
                      >
                        {aboutImages[1]?.url && (
                          <Box
                            component="img"
                            src={aboutImages[1].url}
                            alt={`${data.name} team`}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </Box>
                    </FadeIn>
                    <FadeIn delay={0.22}>
                      <Box
                        sx={{
                          p: 2.4,
                          borderRadius: 4,
                          bgcolor: "#172041",
                          color: "#ffffff",
                          minHeight: 132,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: "1.05rem",
                            lineHeight: 1.35,
                          }}
                        >
                          Thoughtful strategy with a clean, modern approach.
                        </Typography>
                        <Typography
                          sx={{
                            color: "rgba(255,255,255,0.72)",
                            fontSize: "0.9rem",
                          }}
                        >
                          Built for reusable consulting brands.
                        </Typography>
                      </Box>
                    </FadeIn>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        id="strategy"
        sx={{
          px: { xs: 2, md: 4 },
          py: { xs: 7, md: 10 },
          bgcolor: "#ffffff",
          overflow: "hidden",
        }}
      >
        <Box sx={{ maxWidth: 1180, mx: "auto", position: "relative" }}>
          <Typography
            sx={{
              position: "absolute",
              top: { xs: -6, md: -34 },
              left: { xs: 0, md: -12 },
              color: "rgba(23, 32, 65, 0.04)",
              fontWeight: 800,
              fontSize: { xs: "3.6rem", md: "7.2rem" },
              letterSpacing: "-0.05em",
              lineHeight: 0.95,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            Business Goals
          </Typography>

          <Grid container spacing={{ xs: 5, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <FadeIn>
                <Typography
                  sx={{
                    color: "#3f57ff",
                    fontWeight: 800,
                    fontSize: "0.84rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  Just A Consultancy
                </Typography>
              </FadeIn>
              <FadeIn delay={0.08}>
                <Typography
                  sx={{
                    mt: 1.6,
                    color: "#172041",
                    fontWeight: 800,
                    fontSize: { xs: "2.25rem", md: "4rem" },
                    lineHeight: 1.04,
                    letterSpacing: "-0.04em",
                    maxWidth: 620,
                  }}
                >
                  We know how to manage business globally
                </Typography>
              </FadeIn>

              <Stack spacing={3.2} sx={{ mt: 4.2, maxWidth: 520 }}>
                {[
                  {
                    title: "Best Business Consulting",
                    text: "We help brands unlock better positioning, operations, and growth decisions.",
                  },
                  {
                    title: "24/7 Customer Support",
                    text: "Flexible support and practical consulting for teams moving through change.",
                  },
                ].map((item, index) => (
                  <FadeIn
                    key={item.title}
                    delay={0.16 + index * 0.08}
                    direction="right"
                  >
                    <Stack direction="row" spacing={2}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "#f3f6ff",
                          border: "1px solid rgba(63, 87, 255, 0.14)",
                          color: "#172041",
                          flexShrink: 0,
                        }}
                      >
                        <BriefcaseBusiness size={21} />
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            color: "#172041",
                            fontWeight: 800,
                            fontSize: "1.15rem",
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          sx={{ mt: 0.55, color: "#6f7898", lineHeight: 1.7 }}
                        >
                          {item.text}
                        </Typography>
                      </Box>
                    </Stack>
                  </FadeIn>
                ))}
              </Stack>

              <FadeIn delay={0.34}>
                <Stack
                  direction="row"
                  spacing={2.2}
                  alignItems="center"
                  sx={{ mt: 4.5 }}
                >
                  <Button
                    variant="contained"
                    onClick={() => scrollToSection("contact")}
                    sx={{
                      bgcolor: "#172041",
                      color: "#ffffff",
                      borderRadius: 2.5,
                      px: 3.2,
                      py: 1.35,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "1rem",
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#10182f", boxShadow: "none" },
                    }}
                  >
                    Contact Us
                  </Button>

                  <Box
                    sx={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      border: "1px solid rgba(23, 32, 65, 0.18)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "#f4f6fb",
                        color: "#172041",
                      }}
                    >
                      <Play size={18} fill="currentColor" />
                    </Box>
                  </Box>
                </Stack>
              </FadeIn>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{ position: "relative", minHeight: { xs: 420, md: 610 } }}
              >
                <FadeIn delay={0.08} direction="left">
                  <Box
                    sx={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      width: { xs: "100%", md: 450 },
                      height: { xs: 320, md: 545 },
                      borderRadius: 5,
                      overflow: "hidden",
                      bgcolor: "#eef1ff",
                    }}
                  >
                    {spotlightImages[1]?.url && (
                      <Box
                        component="img"
                        src={spotlightImages[1].url}
                        alt={`${data.name} consulting`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </Box>
                </FadeIn>

                <FadeIn delay={0.18} direction="right">
                  <Box
                    sx={{
                      position: "absolute",
                      left: { xs: 18, md: 0 },
                      bottom: { xs: 26, md: 36 },
                      width: { xs: 220, md: 290 },
                      height: { xs: 265, md: 410 },
                      borderRadius: 4.5,
                      overflow: "hidden",
                      border: "10px solid #ffffff",
                      boxShadow: "0 22px 54px rgba(25, 36, 84, 0.14)",
                      bgcolor: "#f3f6ff",
                    }}
                  >
                    {spotlightImages[0]?.url && (
                      <Box
                        component="img"
                        src={spotlightImages[0].url}
                        alt={`${data.name} strategy`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </Box>
                </FadeIn>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        id="projects"
        sx={{ px: { xs: 2, md: 4 }, py: { xs: 7, md: 9 }, bgcolor: "#ffffff" }}
      >
        <Box sx={{ maxWidth: 1180, mx: "auto" }}>
          <Grid container spacing={{ xs: 4, md: 5 }} alignItems="center">
            <Grid item xs={12} md={5}>
              <FadeIn>
                <Typography
                  sx={{
                    color: "#3f57ff",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  Proven Process
                </Typography>
              </FadeIn>
              <FadeIn delay={0.08}>
                <Typography
                  sx={{
                    mt: 1.4,
                    color: "#172041",
                    fontWeight: 800,
                    fontSize: { xs: "2rem", md: "3rem" },
                    lineHeight: 1.03,
                    maxWidth: 460,
                  }}
                >
                  A simple path to delivery.
                </Typography>
              </FadeIn>
              <Stack spacing={2.2} sx={{ mt: 3 }}>
                {processSteps.map((step, index) => (
                  <FadeIn
                    key={step}
                    delay={0.16 + index * 0.08}
                    direction="right"
                  >
                    <Stack
                      direction="row"
                      spacing={1.6}
                      alignItems="flex-start"
                    >
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "#3f57ff",
                          color: "#ffffff",
                          fontWeight: 800,
                          fontSize: "0.9rem",
                          flexShrink: 0,
                          mt: 0.2,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Typography sx={{ color: "#667092", lineHeight: 1.8 }}>
                        {step}
                      </Typography>
                    </Stack>
                  </FadeIn>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Grid container spacing={2.2}>
                {projectCards.map((card, index) => (
                  <Grid item xs={12} sm={index === 0 ? 12 : 6} key={card.url}>
                    <FadeIn delay={0.08 + index * 0.08} direction="left">
                      <Box
                        sx={{
                          height: "100%",
                          borderRadius: 4,
                          overflow: "hidden",
                          bgcolor: "#f6f8ff",
                          border: "1px solid rgba(29, 43, 100, 0.08)",
                        }}
                      >
                        <Box sx={{ height: index === 0 ? 300 : 220 }}>
                          <Box
                            component="img"
                            src={card.url}
                            alt={card.caption || data.name}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                        <Box sx={{ p: 2.2 }}>
                          <Typography
                            sx={{
                              color: "#172041",
                              fontWeight: 800,
                              fontSize: "1.02rem",
                            }}
                          >
                            {
                              [
                                "Growth planning session",
                                "Operations workshop",
                                "Leadership alignment",
                              ][index]
                            }
                          </Typography>
                          <Typography
                            sx={{ mt: 0.8, color: "#7b84a4", lineHeight: 1.7 }}
                          >
                            Clear scope and clean execution.
                          </Typography>
                        </Box>
                      </Box>
                    </FadeIn>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        id="contact"
        sx={{ px: { xs: 2, md: 4 }, py: { xs: 7, md: 10 }, bgcolor: "#ffffff" }}
      >
        <Box
          sx={{
            maxWidth: 1180,
            mx: "auto",
            p: { xs: 3, md: 4 },
            borderRadius: 5,
            bgcolor: "#ffffff",
            boxShadow: "0 18px 44px rgba(34, 47, 97, 0.06)",
            border: "1px solid rgba(23, 32, 65, 0.06)",
          }}
        >
          <Grid container spacing={{ xs: 4, md: 5 }} alignItems="stretch">
            <Grid item xs={12} md={7}>
              <Box sx={{ position: "relative", pr: { md: 2 } }}>
                <FadeIn>
                  <Typography
                    sx={{
                      position: "absolute",
                      top: { xs: -18, md: -30 },
                      left: { xs: 0, md: -8 },
                      color: "rgba(23, 32, 65, 0.04)",
                      fontWeight: 800,
                      fontSize: { xs: "3.6rem", md: "6.2rem" },
                      lineHeight: 0.95,
                      letterSpacing: "-0.05em",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    Hello
                  </Typography>
                </FadeIn>

                <FadeIn delay={0.06}>
                  <Typography
                    sx={{
                      color: "#3f57ff",
                      fontWeight: 800,
                      fontSize: "0.84rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                    }}
                  >
                    Make An Appointment
                  </Typography>
                </FadeIn>
                <FadeIn delay={0.12}>
                  <Typography
                    sx={{
                      mt: 1.4,
                      color: "#172041",
                      fontWeight: 800,
                      fontSize: { xs: "2.3rem", md: "3.6rem" },
                      lineHeight: 1.02,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    Request a free quote
                  </Typography>
                </FadeIn>

                <Grid container spacing={2} sx={{ mt: 3.5 }}>
                  <Grid item xs={12} sm={6}>
                    <FadeIn delay={0.18} direction="right">
                      <Box
                        component="input"
                        placeholder="Your Name"
                        sx={{
                          width: "100%",
                          height: 52,
                          px: 2,
                          borderRadius: 2.5,
                          border: "1px solid rgba(23, 32, 65, 0.08)",
                          bgcolor: "#f8f9fb",
                          color: "#172041",
                          fontSize: "1rem",
                          outline: "none",
                        }}
                      />
                    </FadeIn>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FadeIn delay={0.24} direction="right">
                      <Box
                        component="input"
                        placeholder="Number"
                        sx={{
                          width: "100%",
                          height: 52,
                          px: 2,
                          borderRadius: 2.5,
                          border: "1px solid rgba(23, 32, 65, 0.08)",
                          bgcolor: "#f8f9fb",
                          color: "#172041",
                          fontSize: "1rem",
                          outline: "none",
                        }}
                      />
                    </FadeIn>
                  </Grid>
                  <Grid item xs={12}>
                    <FadeIn delay={0.3} direction="right">
                      <Box
                        component="input"
                        placeholder="Email"
                        sx={{
                          width: "100%",
                          height: 52,
                          px: 2,
                          borderRadius: 2.5,
                          border: "1px solid rgba(23, 32, 65, 0.08)",
                          bgcolor: "#f8f9fb",
                          color: "#172041",
                          fontSize: "1rem",
                          outline: "none",
                        }}
                      />
                    </FadeIn>
                  </Grid>
                  <Grid item xs={12}>
                    <FadeIn delay={0.36} direction="right">
                      <Box
                        component="textarea"
                        placeholder="Type Your Message"
                        sx={{
                          width: "100%",
                          minHeight: 148,
                          px: 2,
                          py: 1.6,
                          borderRadius: 2.5,
                          border: "1px solid rgba(23, 32, 65, 0.08)",
                          bgcolor: "#f8f9fb",
                          color: "#172041",
                          fontSize: "1rem",
                          outline: "none",
                          resize: "none",
                          fontFamily: "inherit",
                        }}
                      />
                    </FadeIn>
                  </Grid>
                </Grid>

                <FadeIn delay={0.42}>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 3.2,
                      bgcolor: "#172041",
                      color: "#ffffff",
                      borderRadius: 2.5,
                      px: 3.4,
                      py: 1.25,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "1rem",
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#10182f", boxShadow: "none" },
                    }}
                  >
                    Submit Message
                  </Button>
                </FadeIn>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <FadeIn delay={0.12} direction="left">
                <Box
                  sx={{
                    position: "relative",
                    height: "100%",
                    minHeight: { xs: 340, md: 560 },
                    borderRadius: 4,
                    overflow: "hidden",
                    bgcolor: "#eef1ff",
                  }}
                >
                  {data.gallery?.[3]?.url ? (
                    <Box
                      component="img"
                      src={data.gallery[3].url}
                      alt={`${data.name} appointment`}
                      sx={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(135deg, #eef1ff 0%, #dce4ff 100%)",
                      }}
                    />
                  )}
                </Box>
              </FadeIn>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}

function ConsultingStudioFooter({ data }: { data: TemplateProps["data"] }) {
  const links = ["About", "Services", "Projects", "Contact"];
  const socialsData = data.socials ?? {};
  const socials = [
    { icon: Facebook, url: socialsData.facebook },
    { icon: Linkedin, url: socialsData.linkedin },
    { icon: Instagram, url: socialsData.instagram },
    { icon: Twitter, url: socialsData.twitter },
  ].filter((item) => item.url);

  return (
    <Box
      sx={{ px: { xs: 2, md: 4 }, py: { xs: 6, md: 7 }, bgcolor: "#10182f" }}
    >
      <Box sx={{ maxWidth: 1180, mx: "auto" }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={5}>
            <FadeIn>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#3f57ff",
                    color: "#ffffff",
                    fontWeight: 800,
                  }}
                >
                  M
                </Box>
                <Box>
                  <Typography sx={{ color: "#ffffff", fontWeight: 800 }}>
                    {data.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(224, 229, 255, 0.62)",
                      fontSize: "0.86rem",
                    }}
                  >
                    Modern consulting for ambitious teams.
                  </Typography>
                </Box>
              </Stack>
            </FadeIn>
          </Grid>
          <Grid item xs={12} md={4}>
            <FadeIn delay={0.08}>
              <Stack
                direction="row"
                spacing={2.4}
                justifyContent={{ xs: "flex-start", md: "center" }}
                flexWrap="wrap"
              >
                {links.map((item) => (
                  <Typography
                    key={item}
                    sx={{
                      color: "rgba(224, 229, 255, 0.76)",
                      fontWeight: 600,
                      fontSize: "0.92rem",
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </FadeIn>
          </Grid>
          <Grid item xs={12} md={3}>
            <FadeIn delay={0.16}>
              <Stack
                direction="row"
                spacing={1.1}
                justifyContent={{ xs: "flex-start", md: "flex-end" }}
              >
                {socials.map(({ icon: Icon, url }) => (
                  <IconButton
                    key={url}
                    component="a"
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2.5,
                      bgcolor: "rgba(255,255,255,0.08)",
                      color: "#ffffff",
                      "&:hover": { bgcolor: "#3f57ff" },
                    }}
                  >
                    <Icon size={18} />
                  </IconButton>
                ))}
              </Stack>
            </FadeIn>
          </Grid>
        </Grid>

        <FadeIn delay={0.22}>
          <Box
            sx={{
              mt: 4,
              pt: 2.6,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Typography
              sx={{ color: "rgba(224, 229, 255, 0.56)", fontSize: "0.86rem" }}
            >
              © {new Date().getFullYear()} {data.name}. All rights reserved.
            </Typography>
          </Box>
        </FadeIn>
      </Box>
    </Box>
  );
}

const ConsultingStudioTemplate: React.FC<TemplateProps> = ({ data }) => {
  return (
    <Box sx={{ fontFamily: "'Inter', sans-serif", bgcolor: "#ffffff" }}>
      <ConsultingStudioHeader data={data} />
      <ConsultingStudioHero data={data} />
      <ConsultingStudioBody data={data} />
      <ConsultingStudioFooter data={data} />
    </Box>
  );
};

export default ConsultingStudioTemplate;
