import React from "react";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Mail, MapPin, Phone } from "lucide-react";
import type { TemplateProps } from "../../templateEngine/types";
import { buildModernTheme } from "../modern/modernTheme";
import { FadeIn } from "../../blocks";
import {
  getSectionStyleDomProps,
  getSectionStyleSx,
  type SectionStyleValue,
} from "../../utils/sectionStyle";
import {
  EditableSection,
  EditableText,
  EditableButton,
  EditableCard,
  EditableImage,
  EditorExtraBlocks,
} from "../../utils/editableComponents";

type TemplateSectionContent = Record<string, unknown> & {
  blockId?: string | number;
  sectionStyle?: SectionStyleValue;
};

const sectionOffset = 110;

function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const y =
    section.getBoundingClientRect().top + window.scrollY - sectionOffset;
  window.scrollTo({ top: y, behavior: "smooth" });
}

const EducationTemplate: React.FC<TemplateProps> = ({ data }) => {
  const theme = {
    ...buildModernTheme(data.primaryColor, data.secondaryColor),
    bgPrimary: "#f7faff",
    bgSecondary: "#eef4ff",
    surfaceColor: "#ffffff",
  };

  const navItems = [
    { label: "Programs", id: "programs" },
    { label: "Highlights", id: "highlights" },
    { label: "Gallery", id: "gallery" },
    { label: "Contact", id: "contact" },
  ];

  const heroImage = data.heroBannerUrl;
  const gallery = data.gallery ?? [];
  const reviews = data.reviews ?? [];
  const services = data.services ?? [];
  const content = (data.templateContent ?? {}) as Record<
    string,
    TemplateSectionContent | undefined
  >;
  const heroContent = content.hero ?? {};
  const programsContent = content.programs ?? {};
  const programServices =
    Array.isArray(programsContent.items) &&
    (programsContent.items as unknown[]).length > 0
      ? (programsContent.items as Array<Record<string, unknown>>)
      : services.map((s) => ({
          name: s.name,
          description: s.description,
          price: s.price,
        }));
  const highlightsContent = content.highlights ?? {};
  const defaultHighlightPoints = [
    "Certified instructors and subject specialists",
    "Progress tracking shared with families",
    "Flexible in-person and online formats",
    "Confidence-building beyond grades alone",
  ];
  const highlightItems: Array<Record<string, unknown>> =
    Array.isArray(highlightsContent.items) &&
    (highlightsContent.items as unknown[]).length > 0
      ? (highlightsContent.items as Array<Record<string, unknown>>)
      : defaultHighlightPoints.map((name) => ({ name }));
  const galleryContent = content.gallery ?? {};
  const reviewsContent = content.reviews ?? {};
  const contactContent = content.contact ?? {};
  const campusContent = content.campus ?? {};
  const extraBlocks = Array.isArray(
    (content as Record<string, unknown>).extraBlocks,
  )
    ? ((content as Record<string, unknown>).extraBlocks as Array<
        Record<string, any>
      >)
    : [];

  const defaultReviewItems = (data.reviews ?? []).slice(0, 3).map((r) => ({
    rating: r.rating || 5,
    text: r.text || r.comment || "",
    author: r.author || r.name || "",
    date: r.date || "",
  }));
  const reviewItems: Array<Record<string, unknown>> =
    Array.isArray(reviewsContent.items) &&
    (reviewsContent.items as unknown[]).length > 0
      ? (reviewsContent.items as Array<Record<string, unknown>>)
      : defaultReviewItems;

  const defaultGalleryItems = (data.gallery ?? []).slice(0, 5).map((g) => ({
    url: g.url || "",
    caption: g.caption || "",
  }));
  const galleryItems: Array<Record<string, unknown>> =
    Array.isArray(galleryContent.items) &&
    (galleryContent.items as unknown[]).length > 0
      ? (galleryContent.items as Array<Record<string, unknown>>)
      : defaultGalleryItems;

  return (
    <Box sx={{ bgcolor: theme.bgPrimary, fontFamily: theme.fontFamily }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: { xs: 0, md: 50 },
          bgcolor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(28, 54, 114, 0.08)",
          color: theme.headingColor,
        }}
      >
        <Toolbar
          sx={{
            minHeight: "auto !important",
            maxWidth: 1240,
            width: "100%",
            mx: "auto",
            px: { xs: 2, md: 3 },
            py: { xs: 1.2, md: 1.4 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr auto", md: "260px 1fr 220px" },
            gap: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            {data.logoUrl && (
              <Box
                component="img"
                src={data.logoUrl}
                alt={data.name}
                sx={{
                  width: { xs: 42, md: 50 },
                  height: { xs: 42, md: 50 },
                  objectFit: "contain",
                  borderRadius: 2,
                  bgcolor: "#fff",
                  p: 0.35,
                  border: "1px solid rgba(37,99,235,0.12)",
                }}
              />
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  color: "#1b3266",
                  fontSize: { xs: "0.98rem", md: "1.08rem" },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {data.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  color: "#6277a3",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Learning with clarity
              </Typography>
            </Box>
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
                  cursor: "pointer",
                  color: "#243b6b",
                  fontWeight: 700,
                  fontFamily: theme.fontFamily,
                  fontSize: "0.82rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  transition: "color 160ms ease",
                  "&:hover": { color: theme.primaryColor },
                }}
              >
                {item.label}
              </Box>
            ))}
          </Stack>

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              href={
                data.contact.phone ? `tel:${data.contact.phone}` : undefined
              }
              sx={{
                bgcolor: theme.primaryColor,
                color: "#fff",
                borderRadius: 999,
                px: { xs: 2.4, md: 3.2 },
                py: 1,
                fontWeight: 700,
                boxShadow: "0 12px 28px rgba(37,99,235,0.22)",
                "&:hover": {
                  bgcolor: theme.primaryColor,
                  color: "#fff",
                  filter: "brightness(0.94)",
                },
              }}
            >
              Enroll Now
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <EditableSection
        id="hero"
        blockId={heroContent.blockId}
        label="Hero"
        {...getSectionStyleDomProps(heroContent)}
        sx={{
          ...getSectionStyleSx(heroContent),
          position: "relative",
          overflow: "hidden",
          minHeight: { xs: "auto", md: "88vh" },
          display: "flex",
          alignItems: "stretch",
          backgroundColor: "#0f2450",
          backgroundImage: heroImage
            ? `linear-gradient(110deg, rgba(7, 20, 47, 0.88) 0%, rgba(7, 20, 47, 0.76) 34%, rgba(7, 20, 47, 0.42) 58%, rgba(7, 20, 47, 0.72) 100%), url(${heroImage})`
            : "linear-gradient(135deg, #0f2450 0%, #1f4c9f 100%)",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(96,165,250,0.24), transparent 28%), radial-gradient(circle at bottom left, rgba(59,130,246,0.2), transparent 34%)",
            pointerEvents: "none",
          }}
        />
        <Container
          maxWidth="xl"
          sx={{
            position: "relative",
            zIndex: 1,
            px: { xs: 2, md: 4 },
            py: { xs: 6, md: 8 },
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 700,
              px: { xs: 1.5, sm: 2, md: 0 },
              py: { xs: 2, md: 3 },
            }}
          >
            <FadeIn>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.6,
                  py: 0.9,
                  mb: 2.5,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,0.14)",
                  color: "#e8f1ff",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontSize: "0.72rem",
                }}
              >
                Admissions open for new term
              </Box>
            </FadeIn>

            <FadeIn delay={0.08}>
              <EditableText
                field="heading"
                kind="multi"
                sx={{
                  color: "#ffffff",
                  fontSize: { xs: "2.6rem", md: "5.2rem" },
                  lineHeight: { xs: 1, md: 0.95 },
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  maxWidth: 680,
                  textShadow: "0 10px 28px rgba(0,0,0,0.24)",
                }}
              >
                {(heroContent.heading as string) ||
                  "A brighter learning journey starts here."}
              </EditableText>
            </FadeIn>

            <FadeIn delay={0.14}>
              <EditableText
                field="subheading"
                kind="multi"
                sx={{
                  mt: 2.5,
                  maxWidth: 600,
                  color: "rgba(235, 243, 255, 0.88)",
                  fontSize: { xs: "1rem", md: "1.12rem" },
                  lineHeight: 1.8,
                }}
              >
                {(heroContent.subheading as string) || data.description}
              </EditableText>
            </FadeIn>

            <FadeIn delay={0.2}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mt: 4 }}
              >
                <EditableButton
                  field="ctaText"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => scrollToSection("programs")}
                  sx={{
                    bgcolor: "#ffffff",
                    color: "#10244c",
                    borderRadius: 999,
                    px: 4,
                    py: 1.55,
                    fontWeight: 800,
                    "&:hover": {
                      bgcolor: "#ffffff",
                      color: "#10244c",
                      filter: "brightness(0.94)",
                    },
                  }}
                >
                  {(heroContent.ctaText as string) || "Explore Programs"}
                </EditableButton>
                <EditableButton
                  field="secondaryCtaText"
                  variant="outlined"
                  onClick={() => scrollToSection("contact")}
                  sx={{
                    borderColor: "rgba(255,255,255,0.4)",
                    color: "#ffffff",
                    borderRadius: 999,
                    px: 4,
                    py: 1.55,
                    fontWeight: 700,
                    bgcolor: "rgba(255,255,255,0.04)",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.7)",
                      bgcolor: "rgba(255,255,255,0.08)",
                    },
                  }}
                >
                  {(heroContent.secondaryCtaText as string) ||
                    "Talk to Admissions"}
                </EditableButton>
              </Stack>
            </FadeIn>
          </Box>
        </Container>
      </EditableSection>

      <EditableSection
        id="programs"
        blockId={programsContent.blockId}
        label="Programs"
        {...getSectionStyleDomProps(programsContent)}
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: "#ffffff",
          ...getSectionStyleSx(programsContent),
        }}
      >
        <Container maxWidth="lg">
          <FadeIn>
            <EditableText
              field="sectionLabel"
              sx={{
                textAlign: "center",
                color: theme.primaryColor,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontSize: "0.78rem",
              }}
            >
              {(programsContent.sectionLabel as string) || "Signature Programs"}
            </EditableText>
            <EditableText
              field="heading"
              kind="multi"
              sx={{
                textAlign: "center",
                mt: 1.5,
                color: "#10244c",
                fontWeight: 900,
                fontSize: { xs: "2rem", md: "3.25rem" },
                lineHeight: 1.05,
              }}
            >
              {(programsContent.heading as string) ||
                "Built for real academic momentum."}
            </EditableText>
            <EditableText
              field="description"
              kind="multi"
              sx={{
                textAlign: "center",
                mt: 2,
                maxWidth: 760,
                mx: "auto",
                color: "#62718e",
                lineHeight: 1.8,
              }}
            >
              {(programsContent.description as string) ||
                "Each learning track is structured to combine expert instruction, targeted practice, and ongoing mentorship so students keep progressing with clarity."}
            </EditableText>
          </FadeIn>

          <Grid container spacing={3} sx={{ mt: 3 }}>
            {programServices.map((item, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <FadeIn delay={index * 0.06}>
                  <EditableCard
                    elevation={0}
                    field={`features.${index}`}
                    label={`Program ${index + 1}`}
                    sx={{
                      height: "100%",
                      borderRadius: 4,
                      border: "1px solid rgba(31, 72, 152, 0.08)",
                      background:
                        "linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)",
                    }}
                  >
                    <CardContent sx={{ p: 3.2 }}>
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2.5,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "rgba(37,99,235,0.1)",
                          color: theme.primaryColor,
                          fontWeight: 900,
                          mb: 2.2,
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </Box>
                      <EditableText
                        field={`features.${index}.name`}
                        sx={{
                          color: "#12264f",
                          fontWeight: 800,
                          fontSize: "1.18rem",
                        }}
                      >
                        {(item.name as string) || ""}
                      </EditableText>
                      <EditableText
                        field={`features.${index}.description`}
                        kind="multi"
                        sx={{ mt: 1.1, color: "#62718e", lineHeight: 1.75 }}
                      >
                        {(item.description as string) || ""}
                      </EditableText>
                      {item.price && (
                        <EditableText
                          field={`features.${index}.price`}
                          sx={{
                            mt: 2.2,
                            color: theme.primaryColor,
                            fontWeight: 800,
                          }}
                        >
                          {(item.price as string) || ""}
                        </EditableText>
                      )}
                    </CardContent>
                  </EditableCard>
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </EditableSection>

      <EditableSection
        id="highlights"
        blockId={highlightsContent.blockId}
        label="Why Choose Us"
        {...getSectionStyleDomProps(highlightsContent)}
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: theme.bgSecondary,
          ...getSectionStyleSx(highlightsContent),
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={5}>
              <FadeIn>
                <EditableText
                  field="sectionLabel"
                  sx={{
                    color: theme.primaryColor,
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    fontSize: "0.78rem",
                  }}
                >
                  {(highlightsContent.sectionLabel as string) ||
                    "Why Families Choose Us"}
                </EditableText>
                <EditableText
                  field="heading"
                  kind="multi"
                  sx={{
                    mt: 1.5,
                    color: "#10244c",
                    fontWeight: 900,
                    fontSize: { xs: "2rem", md: "3rem" },
                    lineHeight: 1.08,
                  }}
                >
                  {(highlightsContent.heading as string) ||
                    "Support that feels personal, structured, and ambitious."}
                </EditableText>
                <EditableText
                  field="description"
                  kind="multi"
                  sx={{ mt: 2, color: "#62718e", lineHeight: 1.85 }}
                >
                  {(highlightsContent.description as string) ||
                    "We combine high-touch mentorship with clear academic systems so students know what to work on, why it matters, and how to keep moving forward."}
                </EditableText>
              </FadeIn>
            </Grid>

            <Grid item xs={12} md={7}>
              <Grid container spacing={2}>
                {highlightItems.map((item, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <FadeIn delay={index * 0.06}>
                      <EditableCard
                        elevation={0}
                        field={`features.${index}`}
                        label={`Highlight ${index + 1}`}
                        sx={{
                          borderRadius: 4,
                          border: "1px solid rgba(37,99,235,0.08)",
                          bgcolor: "#ffffff",
                          height: "100%",
                        }}
                      >
                        <CardContent sx={{ p: 2.6 }}>
                          <CheckCircleIcon
                            sx={{ color: theme.primaryColor, mb: 1.4 }}
                          />
                          <EditableText
                            field={`features.${index}.name`}
                            sx={{
                              color: "#12264f",
                              fontWeight: 800,
                              lineHeight: 1.45,
                            }}
                          >
                            {(item.name as string) || ""}
                          </EditableText>
                        </CardContent>
                      </EditableCard>
                    </FadeIn>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </EditableSection>

      <EditableSection
        id="gallery"
        blockId={galleryContent.blockId}
        label="Gallery"
        {...getSectionStyleDomProps(galleryContent)}
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: "#ffffff",
          ...getSectionStyleSx(galleryContent),
        }}
      ></EditableSection>

      <EditableSection
        id="reviews"
        blockId={reviewsContent.blockId}
        label="Reviews"
        {...getSectionStyleDomProps(reviewsContent)}
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: theme.bgSecondary,
          ...getSectionStyleSx(reviewsContent),
        }}
      >
        <Container maxWidth="lg">
          <FadeIn>
            <EditableText
              field="sectionLabel"
              sx={{
                textAlign: "center",
                color: theme.primaryColor,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontSize: "0.78rem",
              }}
            >
              {(reviewsContent.sectionLabel as string) || "Parent Feedback"}
            </EditableText>
            <EditableText
              field="heading"
              kind="multi"
              sx={{
                textAlign: "center",
                mt: 1.5,
                color: "#10244c",
                fontWeight: 900,
                fontSize: { xs: "2rem", md: "3rem" },
              }}
            >
              {(reviewsContent.heading as string) ||
                "Trusted by families who want more than tutoring."}
            </EditableText>
          </FadeIn>

          <Grid container spacing={3} sx={{ mt: 3 }}>
            {reviewItems.map((review, index) => (
              <Grid item xs={12} md={4} key={index}>
                <FadeIn delay={index * 0.06}>
                  <EditableCard
                    elevation={0}
                    field={`items.${index}`}
                    label={`Review ${index + 1}`}
                    sx={{
                      height: "100%",
                      borderRadius: 4,
                      border: "1px solid rgba(37,99,235,0.08)",
                      bgcolor: "#ffffff",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <EditableText
                        field={`items.${index}.rating`}
                        sx={{
                          color: "#f4b400",
                          letterSpacing: "0.12em",
                          fontWeight: 800,
                        }}
                      >
                        {"★".repeat(Number(review.rating) || 5)}
                      </EditableText>
                      <EditableText
                        field={`items.${index}.text`}
                        kind="multi"
                        sx={{ mt: 1.8, color: "#4d5d79", lineHeight: 1.85 }}
                      >
                        {(review.text as string) || ""}
                      </EditableText>
                      <EditableText
                        field={`items.${index}.author`}
                        sx={{ mt: 2.4, color: "#12264f", fontWeight: 800 }}
                      >
                        {(review.author as string) || ""}
                      </EditableText>
                      {review.date && (
                        <EditableText
                          field={`items.${index}.date`}
                          sx={{ mt: 0.4, color: "#7b8aa6", fontSize: "0.9rem" }}
                        >
                          {(review.date as string) || ""}
                        </EditableText>
                      )}
                    </CardContent>
                  </EditableCard>
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
          py: { xs: 8, md: 12 },
          bgcolor: "#0f2450",
          ...getSectionStyleSx(contactContent),
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="stretch">
            <Grid item xs={12} md={6}>
              <FadeIn>
                <EditableText
                  field="sectionLabel"
                  sx={{
                    color: "#8eb5ff",
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    fontSize: "0.78rem",
                  }}
                >
                  {(contactContent.sectionLabel as string) || "Admissions Desk"}
                </EditableText>
                <EditableText
                  field="heading"
                  kind="multi"
                  sx={{
                    mt: 1.5,
                    color: "#ffffff",
                    fontWeight: 900,
                    fontSize: { xs: "2rem", md: "3rem" },
                    lineHeight: 1.08,
                    maxWidth: 540,
                  }}
                >
                  {(contactContent.heading as string) ||
                    "Let’s find the right program for your learner."}
                </EditableText>
                <EditableText
                  field="description"
                  kind="multi"
                  sx={{
                    mt: 2,
                    color: "rgba(255,255,255,0.76)",
                    lineHeight: 1.9,
                    maxWidth: 560,
                  }}
                >
                  {(contactContent.description as string) ||
                    "Speak with our team about goals, schedules, and the best next step. We’ll help you choose a path that matches academic needs and learning style."}
                </EditableText>
              </FadeIn>
            </Grid>

            <Grid item xs={12} md={6}>
              <FadeIn delay={0.08}>
                <EditableCard
                  elevation={0}
                  field="contactCard"
                  label="Contact Card"
                  sx={{
                    borderRadius: 4,
                    bgcolor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <CardContent sx={{ p: 3.2 }}>
                    {[
                      {
                        icon: <Phone size={18} />,
                        fieldLabel: "phoneLabel",
                        fieldValue: "phone",
                        label: "Call us",
                        value: data.contact.phone,
                        last: false,
                      },
                      {
                        icon: <Mail size={18} />,
                        fieldLabel: "emailLabel",
                        fieldValue: "email",
                        label: "Email",
                        value: data.contact.email,
                        last: false,
                      },
                      {
                        icon: <MapPin size={18} />,
                        fieldLabel: "addressLabel",
                        fieldValue: "address",
                        label: "Visit",
                        value: data.contact.address,
                        last: true,
                      },
                    ].map((item) => (
                      <Stack
                        key={item.label}
                        direction="row"
                        spacing={1.6}
                        alignItems="flex-start"
                        sx={{
                          py: 1.4,
                          borderBottom: item.last
                            ? "none"
                            : "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <Box sx={{ color: "#9ac0ff", mt: 0.2 }}>
                          {item.icon}
                        </Box>
                        <Box>
                          <EditableText
                            field={item.fieldLabel}
                            sx={{
                              color: "#9ac0ff",
                              fontSize: "0.82rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.14em",
                            }}
                          >
                            {(contactContent[item.fieldLabel] as string) ||
                              item.label}
                          </EditableText>
                          <EditableText
                            field={item.fieldValue}
                            sx={{ mt: 0.6, color: "#ffffff", lineHeight: 1.7 }}
                          >
                            {(contactContent[item.fieldValue] as string) ||
                              item.value ||
                              ""}
                          </EditableText>
                        </Box>
                      </Stack>
                    ))}

                    <EditableButton
                      field="buttonLabel"
                      variant="contained"
                      fullWidth
                      href={
                        data.contact.phone
                          ? `tel:${data.contact.phone}`
                          : undefined
                      }
                      sx={{
                        mt: 2.6,
                        bgcolor: "#ffffff",
                        color: "#15316b",
                        fontWeight: 800,
                        borderRadius: 999,
                        py: 1.4,
                        "&:hover": {
                          bgcolor: "#ffffff",
                          color: "#15316b",
                          filter: "brightness(0.97)",
                        },
                      }}
                    >
                      {(contactContent.buttonLabel as string) ||
                        "Schedule a Consultation"}
                    </EditableButton>
                  </CardContent>
                </EditableCard>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </EditableSection>

      <EditableSection
        id="location"
        blockId={campusContent.blockId}
        label="Campus"
        {...getSectionStyleDomProps(campusContent)}
        sx={{
          ...getSectionStyleSx(campusContent),
          py: { xs: 8, md: 12 },
          bgcolor: "#f7faff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -120,
            right: -100,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(96,165,250,0.18) 0%, rgba(96,165,250,0) 70%)",
          }}
        />
        <Container maxWidth="lg">
          <FadeIn>
            <EditableText
              field="sectionLabel"
              sx={{
                textAlign: "center",
                color: theme.primaryColor,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontSize: "0.78rem",
              }}
            >
              {(campusContent.sectionLabel as string) || "Visit Our Campus"}
            </EditableText>
            <EditableText
              field="heading"
              kind="multi"
              sx={{
                textAlign: "center",
                mt: 1.5,
                color: "#10244c",
                fontWeight: 900,
                fontSize: { xs: "2rem", md: "3rem" },
                lineHeight: 1.08,
              }}
            >
              {(campusContent.heading as string) ||
                "Find us, visit us, and talk with our team."}
            </EditableText>
            <EditableText
              field="description"
              kind="multi"
              sx={{
                textAlign: "center",
                mt: 2,
                maxWidth: 760,
                mx: "auto",
                color: "#62718e",
                lineHeight: 1.8,
              }}
            >
              {(campusContent.description as string) ||
                "Our learning center is designed to feel welcoming, focused, and easy to access for students and families throughout the week."}
            </EditableText>
          </FadeIn>

          <Grid
            container
            spacing={{ xs: 3, md: 4 }}
            sx={{ mt: 4 }}
            alignItems="stretch"
          >
            <Grid item xs={12} md={12}>
              <FadeIn direction="left">
                <Box
                  sx={{
                    position: "relative",
                    height: { xs: 340, md: 500 },
                    overflow: "hidden",
                    borderRadius: "32px",
                    border: "1px solid rgba(31,72,152,0.08)",
                    bgcolor: "#dfeaff",
                    boxShadow: "0 32px 70px rgba(35, 72, 150, 0.10)",
                  }}
                >
                  {data.location?.embedUrl ? (
                    <Box
                      component="iframe"
                      src={data.location.embedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="Campus location map"
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "grid",
                        placeItems: "center",
                        color: "#5570a5",
                        fontWeight: 700,
                      }}
                    >
                      Map unavailable
                    </Box>
                  )}

                  {data.location?.address && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 20,
                        right: 20,
                        bottom: 20,
                        p: 2,
                        borderRadius: 4,
                        bgcolor: "rgba(16,36,76,0.78)",
                        color: "#ffffff",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.2}
                        alignItems="flex-start"
                      >
                        <MapPin size={18} />
                        <Box>
                          <EditableText
                            field="campusName"
                            sx={{ fontWeight: 800, fontSize: "0.95rem" }}
                          >
                            {(campusContent.campusName as string) ||
                              "Bright Minds Campus"}
                          </EditableText>
                          <EditableText
                            field="mapAddress"
                            sx={{
                              mt: 0.4,
                              color: "rgba(255,255,255,0.82)",
                              lineHeight: 1.6,
                            }}
                          >
                            {(campusContent.mapAddress as string) ||
                              data.location?.address ||
                              ""}
                          </EditableText>
                        </Box>
                      </Stack>
                    </Box>
                  )}
                </Box>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </EditableSection>

      <EditorExtraBlocks
        blocks={extraBlocks}
        themeColor={String(data.primaryColor || "#2563eb")}
        fallbackImageSrc={String(
          (data as any).heroBannerUrl || (data as any).coverImage || "",
        )}
        websiteId={data.websiteId}
      />
    </Box>
  );
};

export default EducationTemplate;
