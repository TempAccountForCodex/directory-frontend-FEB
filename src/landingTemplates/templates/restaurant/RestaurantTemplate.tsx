import React from "react";
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
import { ArrowRight, Facebook, Instagram } from "lucide-react";
import { normalizeContactFormFields } from "../../../api/formSubmissions";
import type { TemplateProps } from "../../templateEngine/types";
import FadeIn from "../../blocks/FadeIn";
import { useTemplateContactForm } from "../../utils/useTemplateContactForm";
import {
  getSectionStyleDomProps,
  getSectionStyleSx,
  type SectionStyleValue,
} from "../../utils/sectionStyle";
import {
  EditableSection,
  EditableText,
  EditableButton,
  renderEditableMedia,
  EditorExtraBlocks,
} from "../../utils/editableComponents";
import { useWebsiteMenuNavLinks } from "../../hooks/useWebsiteMenuNavLinks";
import TemplatePageNavLinks from "../../components/TemplatePageNavLinks";
import { restaurantAssets } from "../../assets/restaurant/restaurant";

type TemplateSectionContent = Record<string, unknown> & {
  blockId?: string | number;
  sectionStyle?: SectionStyleValue;
};

const serifFont = '"Cormorant Garamond", Georgia, serif';
const bodyFont =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const brown = "#81563f";
const black = "#060606";
const cream = "#f4e7db";

const sectionOffset = 108;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - sectionOffset;
  window.scrollTo({ top: y, behavior: "smooth" });
}

const RestaurantTemplate: React.FC<TemplateProps> = ({ data }) => {
  const reviews = data.reviews ?? [];

  const navItems = [
    { label: "Story", id: "story" },
    { label: "Menu", id: "menu" },
    { label: "Why Us", id: "why-us" },
    { label: "Reviews", id: "reviews" },
    { label: "Contact", id: "contact" },
  ];
  const pageNavLinks = useWebsiteMenuNavLinks(data.websiteId);

  const storyTopImage = restaurantAssets.frenchFries;
  const grillImage = restaurantAssets.grilledSteak;
  const burgerImage = restaurantAssets.gourmetBurger;
  const promoImage = restaurantAssets.classicBurger;
  const whyTopImage = restaurantAssets.restaurantTable;
  const whyBottomImage = restaurantAssets.restaurantInterior;
  const contactImage = restaurantAssets.luxuryDining;
  const heroBannerImage =
    data.heroBannerUrl || data.gallery?.[2]?.url || data.gallery?.[0]?.url;
  const content = (data.templateContent ?? {}) as Record<
    string,
    TemplateSectionContent | undefined
  >;
  const heroContent = content.hero ?? {};
  const storyContent = content.story ?? {};
  const locationContent = content.location ?? {};
  const whyUsContent = content.whyUs ?? {};
  const restaurantWhyItems: Array<Record<string, unknown>> =
    Array.isArray(whyUsContent.items) && (whyUsContent.items as unknown[]).length > 0
      ? (whyUsContent.items as Array<Record<string, unknown>>)
      : (data.services ?? []).length > 0
        ? (data.services ?? []).map((s: { name: string; description?: string }) => ({ name: s.name, description: s.description || "" }))
        : [
            { name: "Quality Ingredients", description: "We use fresh ingredients and bold seasoning to deliver full flavor in every dish." },
            { name: "Unique Flavors", description: "Our menu balances comfort favorites with recipes that feel distinctive and memorable." },
            { name: "Exceptional Service", description: "Fast, warm, and attentive hospitality is part of the experience from arrival to last bite." },
            { name: "Customer Satisfaction", description: "Guests return because the food, service, and atmosphere consistently deliver." },
            { name: "Crafted In-House", description: "From sauces to signature specials, much of what you taste is prepared with care in-house." },
          ];
  const reviewsContent = content.reviews ?? {};
  const contactContent = content.contact ?? {};
  const contactFields = normalizeContactFormFields(
    (contactContent as Record<string, unknown>).formFields,
    contactContent as Record<string, unknown>,
  );
  const { status, errorMessage, getFieldProps, handleSubmit } =
    useTemplateContactForm(
      contactFields,
      data.websiteId,
      "restaurant-contact-form",
      {
        formId: (data.templateContent?.contact as any)?.blockId,
        formName:
          (data.templateContent?.contact as any)?.heading || "Contact form",
      },
    );
  const extraBlocks = Array.isArray((content as Record<string, unknown>).extraBlocks)
    ? ((content as Record<string, unknown>).extraBlocks as Array<Record<string, any>>)
    : [];
  const defaultStorySubItems = [
    { title: "Our Mission", text: "Serve memorable food with warmth, speed, and consistency in every service." },
    { title: "Our Vision", text: "Create a dining experience that feels lively, welcoming, and worth returning to." },
    { title: "Our Promise", text: "Fresh ingredients, bold flavors, and hospitality that remains personal." },
  ];
  const storySubItems: Array<Record<string, unknown>> =
    Array.isArray(storyContent.subItems) && (storyContent.subItems as unknown[]).length > 0
      ? (storyContent.subItems as Array<Record<string, unknown>>)
      : defaultStorySubItems;

  return (
    <Box sx={{ bgcolor: black, color: "#fff", fontFamily: bodyFont }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: { xs: 0, md: 50 },
          bgcolor: `${brown}ee`,
          color: "#fff",
          boxShadow: "none",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1240,
            width: "100%",
            mx: "auto",
            px: { xs: 2, md: 3 },
            py: { xs: 1.15, md: 1.3 },
            minHeight: "auto !important",
            display: "grid",
            gridTemplateColumns: { xs: "1fr auto", md: "220px 1fr 150px" },
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: serifFont,
              fontSize: { xs: "1.1rem", md: "1.35rem" },
              fontWeight: 600,
            }}
          >
            Casa Bella
          </Typography>

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
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: bodyFont,
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </Box>
            ))}
            <TemplatePageNavLinks
              links={pageNavLinks}
              itemSx={{
                color: "#fff",
                cursor: "pointer",
                fontFamily: bodyFont,
                fontSize: "0.78rem",
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            />
          </Stack>

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={() => scrollToSection("contact")}
              sx={{
                bgcolor: black,
                color: "#fff",
                borderRadius: 999,
                px: 2.2,
                py: 0.8,
                fontWeight: 700,
                "&:hover": {
                  bgcolor: black,
                  color: "#fff",
                  filter: "brightness(1.14)",
                },
              }}
            >
              Reserve
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
          bgcolor: brown,
          textAlign: "center",
          px: 2,
          pt: { xs: 7, md: 9 },
          pb: { xs: 5, md: 6 },
        }}
      >
        <FadeIn>
          <EditableText
            field="heading"
            kind="multi"
            sx={{
              fontFamily: serifFont,
              fontSize: { xs: "2.5rem", md: "4rem" },
              lineHeight: 0.98,
              color: "#fff",
            }}
          >
            {(heroContent.heading as string) || "Taste the Difference"}
          </EditableText>
        </FadeIn>
        <FadeIn delay={0.08}>
          <EditableText
            field="subheading"
            kind="multi"
            sx={{
              mt: 1.5,
              maxWidth: 580,
              mx: "auto",
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.75,
            }}
          >
            {(heroContent.subheading as string) || "Bold comfort food, warm atmosphere, and dishes built to leave a lasting impression at every table."}
          </EditableText>
        </FadeIn>
        <FadeIn delay={0.16}>
          <EditableButton
            field="ctaText"
            variant="contained"
            sx={{
              mt: 3,
              bgcolor: black,
              color: "#fff",
              borderRadius: 999,
              px: 3,
              py: 0.95,
              fontWeight: 700,
              "&:hover": {
                bgcolor: black,
                color: "#fff",
                filter: "brightness(1.14)",
              },
            }}
          >
            {(heroContent.ctaText as string) || "Book Table"}
          </EditableButton>
        </FadeIn>
      </EditableSection>

      <Box sx={{ height: { xs: 120, md: 500 }, overflow: "hidden" }}>
        <FadeIn direction="up">
          {renderEditableMedia({
            blockId: heroContent.blockId,
            field: "image",
            label: "Hero image",
            src: heroBannerImage,
            alt: data.name,
            sx: {
              width: "100%",
              height: "100%",
              objectFit: "cover",
              backgroundAttachment: "fixed",
            },
          })}
        </FadeIn>
      </Box>

      <EditableSection
        id="story"
        blockId={storyContent.blockId}
        label="Story"
        {...getSectionStyleDomProps(storyContent)}
        sx={{ bgcolor: black, ...getSectionStyleSx(storyContent) }}
      >
        <Container
          maxWidth="lg"
          sx={{ px: { xs: 2, md: 3 }, py: { xs: 7, md: 9 } }}
        >
          <Grid container spacing={0}>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                p: { xs: 0, md: 4 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <FadeIn>
                <EditableText
                  field="heading"
                  kind="multi"
                  sx={{
                    fontFamily: serifFont,
                    fontSize: { xs: "2rem", md: "2.9rem" },
                    color: "#fff",
                    mb: 2,
                  }}
                >
                  {(storyContent.heading as string) || "Our Story"}
                </EditableText>
              </FadeIn>
              <FadeIn delay={0.08}>
                <EditableText
                  field="body"
                  kind="multi"
                  sx={{
                    color: "rgba(255,255,255,0.76)",
                    lineHeight: 1.9,
                    maxWidth: 360,
                  }}
                >
                  {(storyContent.body as string) || data.description}
                </EditableText>
              </FadeIn>
              <Stack spacing={2.6} sx={{ mt: 4.5, maxWidth: 360 }}>
                {storySubItems.map((subItem, index) => (
                  <FadeIn
                    key={index}
                    delay={0.16 + index * 0.08}
                    direction="right"
                  >
                    <Box>
                      <EditableText
                        field={`subItems.${index}.title`}
                        sx={{
                          color: cream,
                          fontFamily: serifFont,
                          fontSize: "1.45rem",
                          mb: 0.7,
                        }}
                      >
                        {(subItem.title as string) || ""}
                      </EditableText>
                      <EditableText
                        field={`subItems.${index}.text`}
                        kind="multi"
                        sx={{
                          color: "rgba(255,255,255,0.7)",
                          lineHeight: 1.8,
                          fontSize: "0.94rem",
                        }}
                      >
                        {(subItem.text as string) || ""}
                      </EditableText>
                    </Box>
                  </FadeIn>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <FadeIn delay={0.08} direction="left">
                <Box sx={{ overflow: "hidden", height: { xs: 340, md: 580 } }}>
                  {renderEditableMedia({
                    blockId: storyContent.blockId,
                    field: "image",
                    label: "Story image",
                    src:
                      (storyContent.image as string) ||
                      storyTopImage,
                    alt: "French fries tray",
                    sx: {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    },
                  })}
                </Box>
              </FadeIn>
            </Grid>

            <Grid item xs={12} md={6}>
              <FadeIn delay={0.12} direction="up">
                <Box sx={{ overflow: "hidden", height: { xs: 280, md: 320 } }}>
                  <Box
                    component="img"
                    src={grillImage}
                    alt="Grill burgers"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={6}>
              <FadeIn delay={0.16} direction="up">
                <Box sx={{ overflow: "hidden", height: { xs: 280, md: 320 } }}>
                  <Box
                    component="img"
                    src={burgerImage}
                    alt="Burger"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </EditableSection>

      <EditableSection
        id="menu"
        blockId={locationContent.blockId}
        label="Location"
        {...getSectionStyleDomProps(locationContent)}
        sx={{
          bgcolor: brown,
          color: "#fff",
          py: { xs: 6, md: 7 },
          ...getSectionStyleSx(locationContent),
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 5 }}>
            <Grid item xs={12} md={3}>
              <FadeIn>
                <EditableText
                  field="heading"
                  kind="multi"
                  sx={{ fontFamily: serifFont, fontSize: "2rem" }}
                >
                  {(locationContent.heading as string) || "Location"}
                </EditableText>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={4.5}>
              <FadeIn delay={0.08}>
                <EditableText
                  field="description"
                  kind="multi"
                  sx={{ lineHeight: 1.85, color: "rgba(255,255,255,0.82)" }}
                >
                  {(locationContent.description as string) || "Find us in the heart of the city where warm interiors, open-grill cooking, and late-evening energy come together in one memorable dining room."}
                </EditableText>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={4.5}>
              <FadeIn delay={0.16}>
                <Typography
                  sx={{ lineHeight: 1.85, color: "rgba(255,255,255,0.82)" }}
                >
                  {data.contact.address}
                  <br />
                  {data.contact.phone}
                  <br />
                  {data.contact.email}
                </Typography>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </EditableSection>

      <Box
        sx={{
          py: 1.1,
          bgcolor: black,
          color: cream,
          overflow: "hidden",
          whiteSpace: "nowrap",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Box
          sx={{
            display: "inline-block",
            minWidth: "100%",
            px: 2,
            letterSpacing: "0.08em",
            fontSize: "2.5rem",
            animation: "marquee 12s linear infinite",
          }}
        >
          Limited Time Offer ✦ Limited Time Offer ✦ Limited Time Offer ✦ Limited
          Time Offer ✦ Limited Time Offer ✦
        </Box>
      </Box>

      <Grid container sx={{ bgcolor: black }}>
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              minHeight: { xs: 260, md: 360 },
              display: "grid",
              placeItems: "center",
              px: 4,
              textAlign: "center",
            }}
          >
            <FadeIn>
              <Typography
                sx={{ color: "#fff", lineHeight: 1.9, maxWidth: 320 }}
              >
                Enjoy 25% off our menu for a limited time because great burgers
                taste even better with a deal.
              </Typography>
            </FadeIn>
            <FadeIn delay={0.1}>
              <Button
                variant="outlined"
                sx={{
                  mt: 2.6,
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.4)",
                  borderRadius: 999,
                  px: 2.4,
                  py: 0.8,
                }}
              >
                Order Now
              </Button>
            </FadeIn>
          </Box>
        </Grid>
        <Grid item xs={12} md={7}>
          <FadeIn delay={0.08} direction="left">
            <Box sx={{ height: { xs: 320, md: 360 }, overflow: "hidden" }}>
              <Box
                component="img"
                src={promoImage}
                alt="Burger offer"
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          </FadeIn>
        </Grid>
      </Grid>

      <EditableSection
        id="why-us"
        blockId={whyUsContent.blockId}
        label="Why Us"
        {...getSectionStyleDomProps(whyUsContent)}
        sx={{
          bgcolor: brown,
          color: "#fff",
          py: { xs: 7, md: 8 },
          ...getSectionStyleSx(whyUsContent),
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 6 }}>
            <Grid item xs={12} md={7}>
              <FadeIn>
                <EditableText
                  field="heading"
                  kind="multi"
                  sx={{
                    fontFamily: serifFont,
                    fontSize: { xs: "2rem", md: "3rem" },
                    mb: 2.5,
                  }}
                >
                  {(whyUsContent.heading as string) || "Why Us"}
                </EditableText>
              </FadeIn>
              {restaurantWhyItems.map((item, index) => (
                <FadeIn
                  key={index}
                  delay={0.08 + index * 0.08}
                  direction="right"
                >
                  <Box sx={{ mb: 2.3 }}>
                    <EditableText
                      field={`features.${index}.name`}
                      sx={{
                        fontFamily: serifFont,
                        fontSize: "1.35rem",
                        color: cream,
                      }}
                    >
                      {(item.name as string) || ""}
                    </EditableText>
                    <EditableText
                      field={`features.${index}.description`}
                      kind="multi"
                      sx={{
                        mt: 0.55,
                        color: "rgba(255,255,255,0.82)",
                        lineHeight: 1.8,
                        maxWidth: 460,
                      }}
                    >
                      {(item.description as string) || ""}
                    </EditableText>
                  </Box>
                </FadeIn>
              ))}
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack spacing={2.2}>
                <FadeIn delay={0.08} direction="left">
                  <Box sx={{ overflow: "hidden", height: 170 }}>
                    <Box
                      component="img"
                      src={whyTopImage}
                      alt="Restaurant seating"
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                </FadeIn>
                <FadeIn delay={0.16} direction="left">
                  <Box sx={{ overflow: "hidden", height: 170 }}>
                    <Box
                      component="img"
                      src={whyBottomImage}
                      alt="Restaurant dish"
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                </FadeIn>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </EditableSection>

      <EditableSection
        id="reviews"
        blockId={reviewsContent.blockId}
        label="Reviews"
        {...getSectionStyleDomProps(reviewsContent)}
        sx={{
          ...getSectionStyleSx(reviewsContent),
          bgcolor: black,
          color: "#fff",
          py: { xs: 7, md: 10 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <FadeIn>
            <EditableText
              field="heading"
              kind="multi"
              sx={{
                fontFamily: serifFont,
                fontSize: { xs: "2rem", md: "3rem" },
                mb: 5,
              }}
            >
              {(reviewsContent.heading as string) || "Customer Reviews"}
            </EditableText>
          </FadeIn>
          {reviews[0] && (
            <FadeIn delay={0.08}>
              <Typography
                sx={{
                  maxWidth: 480,
                  mx: "auto",
                  color: "rgba(255,255,255,0.82)",
                  lineHeight: 1.9,
                }}
              >
                {reviews[0].text}
              </Typography>
              <Typography
                sx={{
                  mt: 2.5,
                  color: cream,
                  fontFamily: serifFont,
                  fontSize: "1.2rem",
                }}
              >
                {reviews[0].author}
              </Typography>
            </FadeIn>
          )}
        </Container>
      </EditableSection>

      <EditableSection
        id="contact"
        blockId={contactContent.blockId}
        label="Contact"
        {...getSectionStyleDomProps(contactContent)}
        sx={{
          bgcolor: brown,
          color: "#fff",
          py: { xs: 7, md: 8 },
          ...getSectionStyleSx(contactContent),
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 5 }} alignItems="stretch">
            <Grid item xs={12} md={6}>
              <FadeIn direction="right">
                <Box
                  sx={{
                    overflow: "hidden",
                    minHeight: { xs: 260, md: 400 },
                    bgcolor: "#111",
                  }}
                >
                  <Box
                    component="img"
                    src={contactImage}
                    alt="Restaurant interior"
                    sx={{ width: "100%", height: "100%" }}
                  />
                </Box>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={6}>
              <FadeIn>
                <EditableText
                  field="heading"
                  kind="multi"
                  sx={{
                    fontFamily: serifFont,
                    fontSize: { xs: "2rem", md: "3rem" },
                    mb: 2,
                  }}
                >
                  {(contactContent.heading as string) || "Get in Touch Today"}
                </EditableText>
              </FadeIn>
              <Stack spacing={2}>
                {contactFields.map((field, index) => {
                  const isTextarea = field.fieldType === "textarea";
                  const inputType = ["email", "tel", "phone", "date", "time"].includes(field.fieldType)
                    ? field.fieldType === "phone"
                      ? "tel"
                      : field.fieldType
                    : "text";

                  return (
                    <FadeIn
                      key={field.key}
                      delay={0.08 + index * 0.06}
                      direction="left"
                    >
                      <TextField
                        fullWidth
                        multiline={isTextarea}
                        minRows={isTextarea ? 3 : undefined}
                        type={inputType}
                        placeholder={field.placeholder || field.label}
                        required={field.required}
                        select={field.fieldType === "dropdown"}
                        SelectProps={
                          field.fieldType === "dropdown"
                            ? { native: true }
                            : undefined
                        }
                        {...getFieldProps(field.label)}
                        variant="standard"
                        InputProps={{
                          disableUnderline: false,
                          sx: {
                            color: "#fff",
                            "&::before": {
                              borderBottomColor: "rgba(255,255,255,0.34)",
                            },
                            "&::after": { borderBottomColor: "#fff" },
                          },
                        }}
                        inputProps={{ sx: { color: "#fff" } }}
                      >
                        {field.fieldType === "dropdown"
                          ? [
                              <option key="" value="">
                                {field.placeholder || field.label}
                              </option>,
                              ...field.options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              )),
                            ]
                          : null}
                      </TextField>
                    </FadeIn>
                  );
                })}
              </Stack>
              {status === "success" && (
                <Typography sx={{ mt: 2, color: "#8fe28f", fontWeight: 600 }}>
                  Thanks! Your message has been sent.
                </Typography>
              )}
              {status === "error" && (
                <Typography sx={{ mt: 2, color: "#ffb4a2", fontWeight: 600 }}>
                  {errorMessage}
                </Typography>
              )}
              <FadeIn delay={0.46}>
                <EditableButton
                  field="buttonLabel"
                  variant="contained"
                  type="button"
                  disabled={status === "loading"}
                  onClick={handleSubmit}
                  sx={{
                    mt: 3,
                    bgcolor: "#fff",
                    color: black,
                    borderRadius: 0,
                    px: 5.5,
                    py: 1,
                    fontWeight: 700,
                    "&:hover": {
                      bgcolor: "#fff",
                      color: black,
                      filter: "brightness(0.96)",
                    },
                  }}
                >
                  {status === "loading"
                    ? "Sending…"
                    : (contactContent.buttonLabel as string) || "Send"}
                </EditableButton>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </EditableSection>

      <Box
        sx={{
          bgcolor: "#8a624b",
          color: "#fff",
          pt: { xs: 6, md: 7 },
          pb: { xs: 5, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <FadeIn>
                <Typography
                  sx={{ fontFamily: serifFont, fontSize: "1.8rem", mb: 1 }}
                >
                  B. Morgan
                </Typography>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.76)", lineHeight: 1.8 }}
                >
                  Restaurant operator focused on bold flavor, honest
                  hospitality, and a memorable dining room.
                </Typography>
                <Stack direction="row" spacing={1.2} sx={{ mt: 2 }}>
                  {[Facebook, Instagram].map((Icon, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 34,
                        height: 34,
                        display: "grid",
                        placeItems: "center",
                        border: "1px solid rgba(255,255,255,0.16)",
                      }}
                    >
                      <Icon size={15} />
                    </Box>
                  ))}
                </Stack>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={3}>
              <FadeIn delay={0.08}>
                <Typography sx={{ color: cream, fontWeight: 700, mb: 1.2 }}>
                  Say Hello
                </Typography>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}
                >
                  {data.contact.address}
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 1.8,
                    mt: 1,
                  }}
                >
                  {data.contact.phone}
                </Typography>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}
                >
                  {data.contact.email}
                </Typography>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={3}>
              <FadeIn delay={0.16}>
                <Typography sx={{ color: cream, fontWeight: 700, mb: 1.2 }}>
                  Opening Hours
                </Typography>
                {data.workingHours?.map((item) => (
                  <Typography
                    key={item.day}
                    sx={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}
                  >
                    {item.day}: {item.hours}
                  </Typography>
                ))}
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={3}>
              <FadeIn delay={0.24}>
                <Typography sx={{ color: cream, fontWeight: 700, mb: 1.2 }}>
                  Stay Connected
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter email address"
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.16)" },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  endIcon={<ArrowRight size={16} />}
                  sx={{
                    mt: 1.6,
                    bgcolor: "#fff",
                    color: black,
                    borderRadius: 0,
                    px: 3,
                    py: 0.9,
                    fontWeight: 700,
                    "&:hover": {
                      bgcolor: "#fff",
                      color: black,
                      filter: "brightness(0.96)",
                    },
                  }}
                >
                  Join
                </Button>
              </FadeIn>
            </Grid>
          </Grid>
          <FadeIn delay={0.32}>
            <Typography
              sx={{
                mt: 4.5,
                color: "rgba(255,255,255,0.72)",
                fontSize: "0.82rem",
              }}
            >
              © 2026 B. Morgan. Restaurant demo template.
            </Typography>
          </FadeIn>
        </Container>
      </Box>

      <EditorExtraBlocks
        blocks={extraBlocks}
        themeColor={String(data.primaryColor || brown)}
        fallbackImageSrc={String((data as any).heroBannerUrl || "")}
        headingFont={serifFont}
        websiteId={data.websiteId}
      />
    </Box>
  );
};

export default RestaurantTemplate;
