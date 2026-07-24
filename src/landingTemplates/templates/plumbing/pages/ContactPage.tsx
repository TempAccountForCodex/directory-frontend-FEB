import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Mail, MapPin, Phone } from "lucide-react";
import {
  TemplateInnerContainer,
  TemplateSectionBoundary,
} from "../../../components/TemplateSectionLayout";
import { getEditableTextProps } from "../../../utils/editableProps";
import {
  isFullWidthContactField,
  renderTemplateContactField,
} from "../../../utils/renderTemplateContactField";
import { rgba } from "../../company/theme";
import type { ContactFormField } from "../../../../api/formSubmissions";
import type { TemplateFormStatus } from "../../../utils/useTemplateContactForm";
import {
  asArray,
  asRecord,
  containerProps,
  plumbingProUnderHeaderSx,
  resolveLink,
  type PlumbingProTheme,
} from "../plumbingProShared";

type ContactFormApi = {
  status: TemplateFormStatus;
  errorMessage: string;
  getFieldProps: (label: string) => Record<string, unknown>;
  handleSubmit: (event: React.FormEvent) => void;
};

type ContactPageProps = {
  theme: PlumbingProTheme;
  contactBody: Record<string, any>;
  form: ContactFormApi;
  fields: ContactFormField[];
  siteSlug?: string;
};

const ContactPage: React.FC<ContactPageProps> = ({
  theme,
  contactBody,
  form,
  fields,
  siteSlug,
}) => {
  const { blue, yellow, navy, softGray, ink, inkSoft, headingFont, bodyFont } =
    theme;

  const banner = asRecord(contactBody.banner);
  const cards = asRecord(contactBody.cards);
  const contact = asRecord(contactBody.contact || contactBody);
  const cta = asRecord(contactBody.cta);
  const {
    status: contactStatus,
    errorMessage: contactError,
    getFieldProps,
    handleSubmit,
  } = form;

  const contactCards = asArray(cards.contactCards || cards.items || cards.features, [
    {
      title: "Office address",
      description: contact.address || "Moonshine St. 14/05 Light City, UK",
      icon: "address",
    },
    {
      title: "Call us",
      description: contact.phone || "+1-394-598-4958",
      icon: "phone",
    },
    {
      title: "Send us email",
      description: contact.email || "hello@quickfix.com",
      icon: "email",
    },
  ]);

  const inputSx = {
    width: "100%",
    bgcolor: "#fff",
    border: `1px solid ${rgba(navy, 0.12)}`,
    borderRadius: "12px",
    px: 2,
    py: 1.45,
    color: ink,
    fontSize: "0.92rem",
    fontFamily: bodyFont,
    outline: "none",
    "&::placeholder": { color: inkSoft },
    "&:focus": { borderColor: rgba(blue, 0.55) },
  };

  const iconFor = (icon?: string) => {
    if (icon === "phone") return <Phone size={20} color="#fff" />;
    if (icon === "email") return <Mail size={20} color="#fff" />;
    return <MapPin size={20} color="#fff" />;
  };

  return (
    <>
      <TemplateSectionBoundary
        blockId={banner.blockId}
        label="Contact banner"
        sectionKey="banner"
        content={banner}
        sx={{
          ...plumbingProUnderHeaderSx,
          bgcolor: blue,
          color: "#fff",
          py: { xs: 7, md: 9 },
          textAlign: "center",
        }}
      >
        <TemplateInnerContainer sx={{ maxWidth: 720 }}>
          <Typography
            component="h1"
            {...getEditableTextProps(banner.blockId, "heading", "multi")}
            sx={{
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "2.2rem", md: "3rem" },
              mb: 1.5,
            }}
          >
            {banner.heading || "Contact Us"}
          </Typography>
          <Typography
            {...getEditableTextProps(banner.blockId, "body", "multi")}
            sx={{ color: rgba("#fff", 0.9), lineHeight: 1.7 }}
          >
            {banner.body ||
              "Reliable, trustworthy, and affordable plumbing solutions for your home or business"}
          </Typography>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={cards.blockId}
        label="Contact cards"
        sectionKey="cards"
        content={cards}
        sx={{ bgcolor: softGray, py: { xs: 5, md: 7 } }}
      >
        <TemplateInnerContainer
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2.5,
          }}
        >
          {contactCards.map((card, index) => (
            <Box
              key={index}
              {...containerProps(
                cards.blockId,
                `cards.contactCards.${index}`,
                card.title || "Contact",
                "card",
              )}
              sx={{
                bgcolor: "#fff",
                borderRadius: "16px",
                p: 3,
                boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "10px",
                  bgcolor: blue,
                  display: "grid",
                  placeItems: "center",
                  mb: 2,
                }}
              >
                {iconFor(card.icon)}
              </Box>
              <Typography
                {...getEditableTextProps(cards.blockId, `contactCards.${index}.title`, "single")}
                sx={{ fontFamily: headingFont, fontWeight: 800, mb: 0.8, color: ink }}
              >
                {card.title}
              </Typography>
              <Typography
                {...getEditableTextProps(
                  cards.blockId,
                  `contactCards.${index}.description`,
                  "multi",
                )}
                sx={{ color: inkSoft, lineHeight: 1.6, whiteSpace: "pre-line" }}
              >
                {card.description}
              </Typography>
            </Box>
          ))}
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={contact.blockId}
        label="Contact form"
        sectionKey="contact"
        content={contact}
        sx={{ bgcolor: "#fff", py: { xs: 6, md: 8 } }}
      >
        <TemplateInnerContainer sx={{ maxWidth: 860 }}>
          <Typography
            component="h2"
            {...getEditableTextProps(contact.blockId, "heading", "multi")}
            sx={{
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "1.6rem", md: "2rem" },
              mb: 3,
              color: ink,
            }}
          >
            {contact.heading || "Send us a message"}
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              {fields.map((field) => {
                const fullWidth = isFullWidthContactField(field);
                return (
                  <Box
                    key={field.key || field.label}
                    sx={{ gridColumn: fullWidth ? "1 / -1" : "auto" }}
                  >
                    {renderTemplateContactField({
                      field,
                      fieldProps: getFieldProps(field.label),
                      inputSx,
                      textColor: ink,
                      mutedColor: inkSoft,
                    })}
                  </Box>
                );
              })}
            </Box>
            <Button
              type="submit"
              disabled={contactStatus === "loading"}
              {...getEditableTextProps(contact.blockId, "buttonLabel", "single")}
              sx={{
                mt: 3,
                bgcolor: yellow,
                color: navy,
                borderRadius: 999,
                px: 3.5,
                py: 1.35,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                "&:hover": { bgcolor: yellow, opacity: 0.92 },
              }}
            >
              {contactStatus === "loading"
                ? "Sending…"
                : contact.buttonLabel || "SEND MESSAGE"}
            </Button>
            {contactStatus === "success" && (
              <Typography sx={{ mt: 1.5, color: blue, fontWeight: 600 }}>
                Message sent successfully.
              </Typography>
            )}
            {contactStatus === "error" && (
              <Typography sx={{ mt: 1.5, color: "#c62828", fontWeight: 600 }}>
                {contactError}
              </Typography>
            )}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={cta.blockId}
        label="Contact CTA"
        sectionKey="cta"
        content={cta}
        sx={{ bgcolor: navy, color: "#fff" }}
      >
        <TemplateInnerContainer
          sx={{
            py: { xs: 4, md: 5 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            justifyContent: "space-between",
            alignItems: { md: "center" },
          }}
        >
          <Typography
            {...getEditableTextProps(cta.blockId, "heading", "multi")}
            sx={{
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "1.5rem", md: "2rem" },
              maxWidth: 480,
            }}
          >
            {cta.heading || "Looking for a reliable plumbing service?"}
          </Typography>
          <Button
            href={resolveLink(cta.ctaLink || `tel:${cta.phone || "+13945984958"}`, siteSlug)}
            startIcon={<Phone size={18} />}
            {...getEditableTextProps(cta.blockId, "ctaText", "single")}
            sx={{
              bgcolor: yellow,
              color: navy,
              borderRadius: 999,
              px: 3,
              py: 1.4,
              fontWeight: 800,
              textTransform: "none",
              "&:hover": { bgcolor: yellow, opacity: 0.92 },
            }}
          >
            {cta.ctaText || cta.phone || "BOOK A FREE VISITING"}
          </Button>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    </>
  );
};

export default ContactPage;
