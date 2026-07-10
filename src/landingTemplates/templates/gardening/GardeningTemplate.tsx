import React, { useRef } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import type { TemplateProps } from "../../templateEngine/types";
import { buildModernTheme } from "../modern/modernTheme";
import { useTemplateContactForm } from "../../utils/useTemplateContactForm";
import FadeIn from "../../blocks/FadeIn";
import {
  getSectionStyleDomProps,
  getSectionStyleSx,
  type SectionStyleValue,
} from "../../utils/sectionStyle";
import {
  EditableSection,
  EditableText,
  EditableButton,
  EditorExtraBlocks,
} from "../../utils/editableComponents";

type TemplateSectionContent = Record<string, unknown> & {
  blockId?: string | number;
  sectionStyle?: SectionStyleValue;
};

const serifFont = '"Cormorant Garamond", Georgia, serif';
const bodyFont =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const sectionOffset = 108;

function ScrollZoomImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "end 30%"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1.16, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [22, 0]);

  return (
    <Box ref={ref} sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <Box
        component={motion.img}
        src={src}
        alt={alt}
        style={{ scale, y }}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          willChange: "transform",
        }}
      />
    </Box>
  );
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - sectionOffset;
  window.scrollTo({ top: y, behavior: "smooth" });
}

const GARDENING_CONTACT_FIELDS = [
  { label: "Name" },
  { label: "Email" },
  { label: "Phone" },
  { label: "Project Type" },
  { label: "Message" },
];

const GardeningTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { status, errorMessage, getFieldProps, handleSubmit } =
    useTemplateContactForm(
      GARDENING_CONTACT_FIELDS,
      data.websiteId,
      "gardening-contact-form",
    );
  const theme = {
    ...buildModernTheme(data.primaryColor, data.secondaryColor),
    bgPrimary: "#f7f4ea",
    bgSecondary: "#edf6df",
    surfaceColor: "#fbf8ef",
    headingColor: "#224c24",
    bodyColor: "#51634f",
    borderColor: "rgba(34,76,36,0.12)",
  };

  const gallery = data.gallery ?? [];
  const services = data.services ?? [];
  const reviews = data.reviews ?? [];

  const navItems = [
    { label: "About", id: "about" },
    { label: "Portfolio", id: "portfolio" },
    { label: "Services", id: "services" },
    { label: "Testimonials", id: "testimonials" },
    { label: "Contact", id: "contact" },
  ];

  const heroImage =
    data.heroBannerUrl ||
    "https://img.freepik.com/free-photo/portrait-young-male-female-gardener-couple-working-garden_23-2148165278.jpg?t=st=1774468898~exp=1774472498~hmac=60c21f6a33e6297a520419e4534e1cea0a128e100ab8846e22760e6b18376a3d&w=2000";

  const aboutImage =
    gallery[1]?.url ||
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80";

  const portfolioImages = [
    gallery[0]?.url || heroImage,
    gallery[2]?.url || aboutImage,
    gallery[3]?.url || heroImage,
    gallery[4]?.url || aboutImage,
    gallery[5]?.url || heroImage,
  ];

  const serviceImages = [
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80",
  ];
  const content = (data.templateContent ?? {}) as Record<
    string,
    TemplateSectionContent | undefined
  >;
  const heroContent = content.hero ?? {};
  const aboutContent = content.about ?? {};
  const portfolioContent = content.portfolio ?? {};
  const servicesContent = content.services ?? {};
  const gardenServices = (
    Array.isArray(servicesContent.items) && (servicesContent.items as unknown[]).length > 0
      ? (servicesContent.items as Array<Record<string, unknown>>)
      : services.map((s) => ({ name: s.name, description: s.description, price: s.price }))
  );
  const testimonialsContent = content.testimonials ?? {};
  const contactContent = content.contact ?? {};
  const extraBlocks = Array.isArray((content as Record<string, unknown>).extraBlocks)
    ? ((content as Record<string, unknown>).extraBlocks as Array<Record<string, any>>)
    : [];

  return (
    <Box
      sx={{
        bgcolor: theme.bgPrimary,
        color: theme.headingColor,
        fontFamily: bodyFont,
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: { xs: 0, md: 50 },
          bgcolor: "rgba(247,244,234,0.88)",
          color: theme.headingColor,
          backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${theme.borderColor}`,
          boxShadow: "none",
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1240,
            width: "100%",
            mx: "auto",
            px: { xs: 2, md: 3 },
            py: { xs: 1.15, md: 1.4 },
            minHeight: "auto !important",
            display: "grid",
            gridTemplateColumns: { xs: "1fr auto", md: "220px 1fr 180px" },
            gap: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={1.1}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            {data.logoUrl && (
              <Box
                component="img"
                src={data.logoUrl}
                alt={data.name}
                sx={{
                  width: { xs: 38, md: 44 },
                  height: { xs: 38, md: 44 },
                  objectFit: "contain",
                  borderRadius: 1.5,
                }}
              />
            )}
            <Typography
              sx={{
                fontFamily: serifFont,
                fontSize: { xs: "1.1rem", md: "1.28rem" },
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              Green Roots
            </Typography>
          </Stack>

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
                  color: theme.headingColor,
                  cursor: "pointer",
                  fontFamily: bodyFont,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </Box>
            ))}
          </Stack>

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={() => scrollToSection("contact")}
              sx={{
                bgcolor: "#2f6b2a",
                color: "#fff",
                borderRadius: 999,
                px: 2.6,
                py: 0.9,
                fontWeight: 700,
                "&:hover": {
                  bgcolor: "#2f6b2a",
                  color: "#fff",
                  filter: "brightness(0.95)",
                },
              }}
            >
              Contact Us
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="lg"
        sx={{ px: { xs: 2, md: 3 }, pt: { xs: 3, md: 4 } }}
      >
        <EditableSection
          id="hero"
          blockId={heroContent.blockId}
          label="Hero"
          {...getSectionStyleDomProps(heroContent)}
          sx={getSectionStyleSx(heroContent)}
        >
          <FadeIn>
            <Box
              sx={{
                overflow: "hidden",
                borderRadius: { xs: 4, md: "28px" },
                height: { xs: 280, md: 570 },
              }}
            >
              <ScrollZoomImage src={heroImage} alt={data.name} />
            </Box>
          </FadeIn>

          <Grid
            container
            spacing={2}
            sx={{ pt: { xs: 3, md: 4 }, alignItems: "end" }}
          >
            <Grid item xs={12} md={9}>
              <FadeIn delay={0.06}>
                <EditableText
                  field="heading"
                  kind="multi"
                  sx={{
                    fontFamily: serifFont,
                    fontSize: { xs: "2.8rem", md: "4.45rem" },
                    lineHeight: 0.96,
                    color: "#235322",
                    letterSpacing: "-0.03em",
                    fontWeight: 500,
                    maxWidth: 780,
                  }}
                >
                  {(heroContent.heading as string) || "Bringing Nature Home"}
                </EditableText>
                <EditableText
                  field="subheading"
                  kind="multi"
                  sx={{
                    mt: 1.6,
                    maxWidth: 520,
                    color: theme.bodyColor,
                    lineHeight: 1.8,
                    fontSize: { xs: "0.98rem", md: "1.02rem" },
                  }}
                >
                  {(heroContent.subheading as string) || "We create calm outdoor environments that feel natural, refined, and deeply connected to everyday living."}
                </EditableText>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={3}>
              <FadeIn delay={0.12}>
                <Stack
                  direction="row"
                  justifyContent={{ xs: "flex-start", md: "flex-end" }}
                >
                  <EditableButton
                    field="ctaText"
                    variant="contained"
                    onClick={() => scrollToSection("portfolio")}
                    sx={{
                      bgcolor: "#2f6b2a",
                      color: "#fff",
                      borderRadius: 999,
                      px: 2.6,
                      py: 0.95,
                      fontWeight: 700,
                      "&:hover": {
                        bgcolor: "#2f6b2a",
                        color: "#fff",
                        filter: "brightness(0.95)",
                      },
                    }}
                  >
                    {(heroContent.ctaText as string) || "View Portfolio"}
                  </EditableButton>
                </Stack>
              </FadeIn>
            </Grid>
          </Grid>
        </EditableSection>
      </Container>

      <Box
        sx={{
          mt: { xs: 5, md: 6 },
          py: 1.2,
          bgcolor: "#2f6b2a",
          color: "#eef7dc",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <Box
          sx={{
            display: "inline-block",
            minWidth: "100%",
            fontSize: "0.78rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            px: 3,
          }}
        >
          Sustainable Landscape Design • Garden Styling Studio • Outdoor Space
          Planning • Seasonal Planting • Landscape Care
        </Box>
      </Box>

      <EditableSection
        id="about"
        blockId={aboutContent.blockId}
        label="About"
        {...getSectionStyleDomProps(aboutContent)}
        sx={{
          ...getSectionStyleSx(aboutContent),
          py: { xs: 8, md: 12 },
          background: "linear-gradient(180deg, #edf6df 0%, #f7f4ea 100%)",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            <Grid item xs={12} md={5}>
              <FadeIn>
                <EditableText
                  field="heading"
                  kind="multi"
                  sx={{
                    fontFamily: serifFont,
                    fontSize: { xs: "2.2rem", md: "3.2rem" },
                    fontWeight: 500,
                    color: "#224c24",
                  }}
                >
                  {(aboutContent.heading as string) || "About"}
                </EditableText>
                <EditableText
                  field="body"
                  kind="multi"
                  sx={{
                    mt: 2,
                    color: theme.bodyColor,
                    lineHeight: 1.9,
                    maxWidth: 420,
                  }}
                >
                  {(aboutContent.body as string) || "We shape outdoor spaces with a careful balance of structure, softness, and plant-led calm. Every garden is designed to feel lived-in, seasonal, and quietly memorable."}
                </EditableText>
                <EditableButton
                  field="buttonLabel"
                  variant="contained"
                  sx={{
                    mt: 3,
                    bgcolor: "#2f6b2a",
                    color: "#fff",
                    borderRadius: 999,
                    px: 2.4,
                    py: 0.9,
                    fontWeight: 700,
                    "&:hover": {
                      bgcolor: "#2f6b2a",
                      color: "#fff",
                      filter: "brightness(0.95)",
                    },
                  }}
                >
                  {(aboutContent.buttonLabel as string) || "Learn More"}
                </EditableButton>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={7}>
              <FadeIn delay={0.08}>
                <Box
                  sx={{
                    overflow: "hidden",
                    borderRadius: "24px",
                    height: { xs: 280, md: 420 },
                  }}
                >
                  <ScrollZoomImage src={aboutImage} alt="About Green Roots" />
                </Box>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </EditableSection>

      <EditableSection
        id="portfolio"
        blockId={portfolioContent.blockId}
        label="Portfolio"
        {...getSectionStyleDomProps(portfolioContent)}
        sx={{
          py: { xs: 8, md: 11 },
          bgcolor: theme.bgPrimary,
          ...getSectionStyleSx(portfolioContent),
        }}
      >
        <Container maxWidth="lg">
          <FadeIn>
            <EditableText
              field="heading"
              kind="multi"
              sx={{
                textAlign: "center",
                fontFamily: serifFont,
                fontSize: { xs: "2.3rem", md: "3.3rem" },
                color: "#224c24",
              }}
            >
              {(portfolioContent.heading as string) || "Portfolio"}
            </EditableText>
            <EditableText
              field="description"
              kind="multi"
              sx={{
                textAlign: "center",
                mt: 1.2,
                color: theme.bodyColor,
                maxWidth: 620,
                mx: "auto",
                lineHeight: 1.8,
              }}
            >
              {(portfolioContent.description as string) || "Selected gardens, courtyards, and outdoor compositions designed to feel balanced, bright, and deeply rooted in place."}
            </EditableText>
          </FadeIn>

          <Grid container spacing={2.2} sx={{ mt: 4 }}>
            <Grid item xs={12} md={5}>
              <FadeIn delay={0.04}>
                <Box
                  sx={{
                    overflow: "hidden",
                    borderRadius: "24px",
                    height: { xs: 230, md: 290 },
                  }}
                >
                  <ScrollZoomImage
                    src={portfolioImages[0]}
                    alt="Portfolio garden 1"
                  />
                </Box>
              </FadeIn>
              <Grid container spacing={2.2} sx={{ mt: 0.1 }}>
                <Grid item xs={6}>
                  <FadeIn delay={0.08}>
                    <Box
                      sx={{
                        overflow: "hidden",
                        borderRadius: "24px",
                        height: 120,
                      }}
                    >
                      <ScrollZoomImage
                        src={portfolioImages[1]}
                        alt="Portfolio garden 2"
                      />
                    </Box>
                  </FadeIn>
                </Grid>
                <Grid item xs={6}>
                  <FadeIn delay={0.12}>
                    <Box
                      sx={{
                        overflow: "hidden",
                        borderRadius: "24px",
                        height: 120,
                      }}
                    >
                      <ScrollZoomImage
                        src={portfolioImages[2]}
                        alt="Portfolio garden 3"
                      />
                    </Box>
                  </FadeIn>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={7}>
              <Grid container spacing={2.2}>
                <Grid item xs={12} sm={6}>
                  <FadeIn delay={0.08}>
                    <Box
                      sx={{
                        overflow: "hidden",
                        borderRadius: "24px",
                        height: 120,
                      }}
                    >
                      <ScrollZoomImage
                        src={portfolioImages[3]}
                        alt="Portfolio garden 4"
                      />
                    </Box>
                  </FadeIn>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FadeIn delay={0.12}>
                    <Box
                      sx={{
                        overflow: "hidden",
                        borderRadius: "24px",
                        height: 120,
                      }}
                    >
                      <ScrollZoomImage
                        src={portfolioImages[4]}
                        alt="Portfolio garden 5"
                      />
                    </Box>
                  </FadeIn>
                </Grid>
              </Grid>
              <FadeIn delay={0.16}>
                <Box
                  sx={{
                    mt: 2.2,
                    overflow: "hidden",
                    borderRadius: "28px",
                    height: { xs: 240, md: 290 },
                  }}
                >
                  <ScrollZoomImage
                    src={portfolioImages[0]}
                    alt="Portfolio feature garden"
                  />
                </Box>
              </FadeIn>
            </Grid>
          </Grid>

          <Stack direction="row" justifyContent="center" sx={{ mt: 3.5 }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#2f6b2a",
                color: "#fff",
                borderRadius: 999,
                px: 2.8,
                py: 0.95,
                fontWeight: 700,
                "&:hover": {
                  bgcolor: "#2f6b2a",
                  color: "#fff",
                  filter: "brightness(0.95)",
                },
              }}
            >
              View All
            </Button>
          </Stack>
        </Container>
      </EditableSection>

      <EditableSection
        id="services"
        blockId={servicesContent.blockId}
        label="Services"
        {...getSectionStyleDomProps(servicesContent)}
        sx={{
          ...getSectionStyleSx(servicesContent),
          py: { xs: 8, md: 11 },
          background: "linear-gradient(180deg, #f7f4ea 0%, #edf6df 100%)",
        }}
      >
        <Container maxWidth="lg">
          <FadeIn>
            <EditableText
              field="heading"
              kind="multi"
              sx={{
                fontFamily: serifFont,
                fontSize: { xs: "2.35rem", md: "3.4rem" },
                color: "#224c24",
                mb: 5.5,
              }}
            >
              {(servicesContent.heading as string) || "Our Services"}
            </EditableText>
          </FadeIn>

          {gardenServices.slice(0, 3).map((item, index) => {
            const reverse = index % 2 === 1;
            const name = (item.name as string) || "";
            return (
              <Grid
                container
                spacing={{ xs: 3, md: 7 }}
                alignItems="center"
                key={index}
                sx={{
                  mb: { xs: 6, md: 8 },
                  flexDirection: reverse ? { md: "row-reverse" } : undefined,
                }}
              >
                <Grid item xs={12} md={6}>
                  <FadeIn delay={index * 0.06}>
                    <Box
                      sx={{
                        overflow: "hidden",
                        borderRadius: "26px",
                        height: { xs: 260, md: 320 },
                      }}
                    >
                      <ScrollZoomImage
                        src={serviceImages[index] || heroImage}
                        alt={name}
                      />
                    </Box>
                  </FadeIn>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FadeIn delay={index * 0.08}>
                    <EditableText
                      field={`features.${index}.name`}
                      sx={{
                        fontFamily: serifFont,
                        fontSize: { xs: "2rem", md: "2.65rem" },
                        color: "#224c24",
                        mb: 1.5,
                      }}
                    >
                      {name.replace("& ", "")}
                    </EditableText>
                    <EditableText
                      field={`features.${index}.description`}
                      kind="multi"
                      sx={{ color: theme.bodyColor, lineHeight: 1.9, maxWidth: 420 }}
                    >
                      {(item.description as string) || ""}
                    </EditableText>
                    {item.price && (
                      <EditableText
                        field={`features.${index}.price`}
                        sx={{ mt: 1.5, color: "#2f6b2a", fontWeight: 700 }}
                      >
                        {(item.price as string) || ""}
                      </EditableText>
                    )}
                  </FadeIn>
                </Grid>
              </Grid>
            );
          })}
        </Container>
      </EditableSection>

      <EditableSection
        id="testimonials"
        blockId={testimonialsContent.blockId}
        label="Testimonials"
        {...getSectionStyleDomProps(testimonialsContent)}
        sx={{
          py: { xs: 8, md: 10 },
          bgcolor: theme.bgPrimary,
          ...getSectionStyleSx(testimonialsContent),
        }}
      >
        <Container maxWidth="lg">
          <FadeIn>
            <EditableText
              field="heading"
              kind="multi"
              sx={{
                fontFamily: serifFont,
                fontSize: { xs: "2.2rem", md: "3.2rem" },
                color: "#224c24",
              }}
            >
              {(testimonialsContent.heading as string) || "Testimonials"}
            </EditableText>
          </FadeIn>

          <Grid container spacing={3} sx={{ mt: 1.5 }}>
            {reviews.map((review, index) => (
              <Grid item xs={12} md={4} key={review.author}>
                <FadeIn delay={index * 0.08}>
                  <Box sx={{ pt: 1.5 }}>
                    <Typography
                      sx={{
                        color: theme.bodyColor,
                        lineHeight: 1.85,
                        minHeight: 126,
                      }}
                    >
                      {review.text}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 2.2,
                        color: "#224c24",
                        fontWeight: 700,
                        fontFamily: serifFont,
                        fontSize: "1.15rem",
                      }}
                    >
                      {review.author}
                    </Typography>
                  </Box>
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </EditableSection>

      <EditableSection
        id="contact"
        blockId={contactContent.blockId}
        label="Contact"
        {...getSectionStyleDomProps(contactContent)}
        sx={{
          py: { xs: 8, md: 11 },
          bgcolor: theme.bgPrimary,
          ...getSectionStyleSx(contactContent),
        }}
      >
        <Container maxWidth="md">
          <FadeIn>
            <EditableText
              field="heading"
              kind="multi"
              sx={{
                textAlign: "center",
                fontFamily: serifFont,
                fontSize: { xs: "2.3rem", md: "3.1rem" },
                color: "#224c24",
              }}
            >
              {(contactContent.heading as string) || "Contact Us"}
            </EditableText>
            <EditableText
              field="description"
              kind="multi"
              sx={{
                textAlign: "center",
                mt: 1.2,
                color: theme.bodyColor,
                maxWidth: 560,
                mx: "auto",
                lineHeight: 1.8,
              }}
            >
              {(contactContent.description as string) || "Share your space, goals, and style direction. We’ll help shape an outdoor environment that feels effortless and alive."}
            </EditableText>
          </FadeIn>

          <FadeIn delay={0.08}>
            <Box sx={{ mt: 4.5, maxWidth: 620, mx: "auto" }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    placeholder="Name"
                    variant="outlined"
                    {...getFieldProps("Name")}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    placeholder="Email"
                    variant="outlined"
                    {...getFieldProps("Email")}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    placeholder="Phone"
                    variant="outlined"
                    {...getFieldProps("Phone")}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    placeholder="Project Type"
                    variant="outlined"
                    {...getFieldProps("Project Type")}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    placeholder="Message"
                    variant="outlined"
                    {...getFieldProps("Message")}
                  />
                </Grid>
              </Grid>
              {status === "success" && (
                <Typography
                  sx={{ mt: 2, textAlign: "center", color: "#2f6b2a", fontWeight: 600 }}
                >
                  Thanks! Your message has been sent.
                </Typography>
              )}
              {status === "error" && (
                <Typography
                  sx={{ mt: 2, textAlign: "center", color: "#b3261e", fontWeight: 600 }}
                >
                  {errorMessage}
                </Typography>
              )}
              <Stack direction="row" justifyContent="center">
                <EditableButton
                  field="buttonLabel"
                  variant="contained"
                  type="button"
                  disabled={status === "loading"}
                  onClick={handleSubmit}
                  sx={{
                    mt: 2.8,
                    bgcolor: "#2f6b2a",
                    color: "#fff",
                    borderRadius: 999,
                    px: 3.5,
                    py: 0.95,
                    fontWeight: 700,
                    "&:hover": {
                      bgcolor: "#2f6b2a",
                      color: "#fff",
                      filter: "brightness(0.95)",
                    },
                  }}
                >
                  {status === "loading"
                    ? "Sending…"
                    : (contactContent.buttonLabel as string) || "Submit"}
                </EditableButton>
              </Stack>
            </Box>
          </FadeIn>
        </Container>
      </EditableSection>

      <Box
        sx={{
          pt: { xs: 6, md: 8 },
          pb: { xs: 5, md: 6 },
          bgcolor: "#f3efdf",
          borderTop: `1px solid ${theme.borderColor}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography
                sx={{
                  fontFamily: serifFont,
                  fontSize: "1.8rem",
                  color: "#224c24",
                }}
              >
                D. Chen
              </Typography>
              <Typography
                sx={{ mt: 1.3, color: theme.bodyColor, lineHeight: 1.8 }}
              >
                Landscape designer creating gardens that feel calm, rooted, and
                naturally elegant.
              </Typography>
              <Stack direction="row" spacing={1.1} sx={{ mt: 2 }}>
                {[Facebook, Instagram, Twitter].map((Icon, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      border: `1px solid ${theme.borderColor}`,
                      color: "#224c24",
                    }}
                  >
                    <Icon size={15} />
                  </Box>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography sx={{ fontWeight: 700, color: "#224c24", mb: 1.5 }}>
                Say Hello
              </Typography>
              <Stack spacing={1.3}>
                <Stack direction="row" spacing={1.1} alignItems="center">
                  <Phone size={16} />
                  <Typography sx={{ color: theme.bodyColor }}>
                    {data.contact.phone}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.1} alignItems="center">
                  <Mail size={16} />
                  <Typography sx={{ color: theme.bodyColor }}>
                    {data.contact.email}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.1} alignItems="center">
                  <MapPin size={16} />
                  <Typography sx={{ color: theme.bodyColor }}>
                    {data.contact.address}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography sx={{ fontWeight: 700, color: "#224c24", mb: 1.5 }}>
                Newsletter
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your email address"
                variant="outlined"
              />
              <Button
                variant="contained"
                endIcon={<ArrowRight size={16} />}
                sx={{
                  mt: 1.5,
                  bgcolor: "#2f6b2a",
                  color: "#fff",
                  borderRadius: 999,
                  px: 3,
                  py: 0.95,
                  fontWeight: 700,
                  "&:hover": {
                    bgcolor: "#2f6b2a",
                    color: "#fff",
                    filter: "brightness(0.95)",
                  },
                }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <EditorExtraBlocks
        blocks={extraBlocks}
        themeColor={String(data.primaryColor || "#2f6b2a")}
        fallbackImageSrc={String((data as any).heroBannerUrl || "")}
        websiteId={data.websiteId}
      />
    </Box>
  );
};

export default GardeningTemplate;
