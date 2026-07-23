import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
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
  AccentHeading,
  asArray,
  asRecord,
  containerProps,
  eyebrowSx,
  MotionBox,
  revealProps,
  type GardeningProTheme,
} from "../gardeningProShared";

type ContactFormApi = {
  status: TemplateFormStatus;
  errorMessage: string;
  getFieldProps: (label: string) => Record<string, unknown>;
  handleSubmit: (event: React.FormEvent) => void;
};

type ContactPageProps = {
  theme: GardeningProTheme;
  contactBody: Record<string, any>;
  form: ContactFormApi;
  /** Dynamic contact fields, sourced from the CONTACT block's persisted `formFields`. */
  fields: ContactFormField[];
};

const inputSx = (forest: string, ink: string, inkSoft: string, bodyFont: string) => ({
  width: "100%",
  bgcolor: "#fff",
  border: `1px solid ${rgba(forest, 0.14)}`,
  borderRadius: 0,
  px: 2,
  py: 1.45,
  color: ink,
  fontSize: "0.92rem",
  fontFamily: bodyFont,
  outline: "none",
  "&::placeholder": { color: inkSoft },
  "&:focus": { borderColor: rgba(forest, 0.45) },
});

const ContactPage: React.FC<ContactPageProps> = ({
  theme,
  contactBody,
  form,
  fields,
}) => {
  const {
    forest,
    forestDeep,
    cream,
    creamSoft,
    lime,
    ink,
    inkSoft,
    headingFont,
    bodyFont,
  } = theme;

  const intro = asRecord(contactBody.intro);
  const contact = asRecord(contactBody.contact || contactBody);
  const {
    status: contactStatus,
    errorMessage: contactError,
    getFieldProps,
    handleSubmit,
  } = form;

  const hoursItems = asArray(contact.hours || contact.items, [
    { heading: "Monday – Friday", description: "8:00 AM – 6:00 PM" },
    { heading: "Saturday", description: "9:00 AM – 2:00 PM" },
    { heading: "Sunday", description: "Closed" },
  ]);

  const contactCards = [
    {
      icon: Phone,
      field: "phone",
      label: "Phone",
      value: contact.phone || "+1 (555) 214-0890",
      fallbackLabel: "Call us",
    },
    {
      icon: Mail,
      field: "email",
      label: "Email",
      value: contact.email || "hello@greenth.studio",
      fallbackLabel: "Write to us",
    },
    {
      icon: MapPin,
      field: "address",
      label: "Studio",
      value: contact.address || "184 Orchard Lane, Greenfield",
      fallbackLabel: "Visit the studio",
    },
  ];

  return (
    <>
      {/* ── Contact intro ── */}
      <TemplateSectionBoundary
        blockId={intro.blockId || contact.blockId}
        label="Contact intro"
        sectionKey="contact-intro"
        content={intro.blockId ? intro : contact}
        sx={{ bgcolor: cream, pt: { xs: 10, md: 14 }, pb: { xs: 4, md: 5 } }}
      >
        <TemplateInnerContainer>
          <MotionBox {...revealProps()} sx={{ maxWidth: 680 }}>
            <Typography
              {...getEditableTextProps(
                intro.blockId || contact.blockId,
                "eyebrow",
                "single",
              )}
              sx={eyebrowSx(forest, bodyFont)}
            >
              {intro.eyebrow || contact.eyebrow || "Get in touch"}
            </Typography>
            <AccentHeading
              blockId={intro.blockId || contact.blockId}
              heading={intro.heading || contact.heading}
              accent={intro.headingAccent || contact.headingAccent}
              fallbackHeading="Let's talk about your"
              fallbackAccent="garden"
              headingFont={headingFont}
              accentColor={forest}
              component="h1"
              sx={{
                mt: 2,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                color: ink,
              }}
            />
            <Typography
              {...getEditableTextProps(
                intro.blockId || contact.blockId,
                "body",
                "multi",
              )}
              sx={{
                mt: 2.5,
                color: inkSoft,
                fontSize: "1.05rem",
                lineHeight: 1.8,
                maxWidth: 520,
              }}
            >
              {intro.body ||
                contact.description ||
                "Share a few details about your land and how you want to live outdoors. We'll respond within one business day."}
            </Typography>
            <Typography sx={{ mt: 2, color: rgba(forest, 0.5), fontSize: "0.88rem" }}>
              Home /{" "}
              <Box component="span" sx={{ color: forest, fontWeight: 600 }}>
                Contact
              </Box>
            </Typography>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      {/* ── Direct contact + hours + form ── */}
      <TemplateSectionBoundary
        blockId={contact.blockId}
        label="Contact"
        sectionKey="contact-body"
        content={contact}
        sx={{ bgcolor: creamSoft, py: { xs: 6, md: 10 } }}
      >
        <TemplateInnerContainer>
          <MotionBox
            {...revealProps()}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "0.9fr 1.1fr" },
              gap: { xs: 4, md: 5 },
              alignItems: "start",
            }}
          >
            {/* Left: contact cards + hours */}
            <Stack spacing={2.5}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                {contactCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Box
                      key={card.field}
                      {...containerProps(
                        contact.blockId,
                        `contact.${card.field}-card`,
                        card.label,
                        "card",
                      )}
                      sx={{
                        bgcolor: "#fff",
                        p: 2.8,
                        border: `1px solid ${rgba(forest, 0.08)}`,
                        gridColumn:
                          card.field === "address" ? { sm: "1 / -1" } : undefined,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: rgba(lime, 0.35),
                          color: forestDeep,
                          display: "grid",
                          placeItems: "center",
                          mb: 1.8,
                        }}
                      >
                        <Icon size={18} />
                      </Box>
                      <Typography
                        sx={{
                          ...eyebrowSx(rgba(forest, 0.55), bodyFont),
                          fontSize: "0.68rem",
                        }}
                      >
                        {card.fallbackLabel}
                      </Typography>
                      <Typography
                        {...getEditableTextProps(
                          contact.blockId,
                          card.field,
                          "single",
                        )}
                        sx={{
                          mt: 0.8,
                          fontFamily: headingFont,
                          fontSize: "1.15rem",
                          color: ink,
                          fontWeight: 500,
                          lineHeight: 1.4,
                        }}
                      >
                        {card.value}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <Box
                {...containerProps(
                  contact.blockId,
                  "contact.hours",
                  "Working hours",
                  "card",
                )}
                sx={{
                  bgcolor: forestDeep,
                  color: "#fff",
                  p: { xs: 3, md: 3.5 },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2.5 }}>
                  <Clock size={18} color={lime} />
                  <Typography
                    {...getEditableTextProps(contact.blockId, "hoursHeading", "single")}
                    sx={{
                      fontFamily: headingFont,
                      fontSize: "1.2rem",
                      fontWeight: 500,
                    }}
                  >
                    {contact.hoursHeading || "Working Hours"}
                  </Typography>
                </Box>
                <Stack spacing={1.6}>
                  {hoursItems.map((item: Record<string, any>, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        borderBottom: `1px solid ${rgba("#ffffff", 0.1)}`,
                        pb: 1.4,
                        "&:last-of-type": { borderBottom: "none", pb: 0 },
                      }}
                    >
                      <Typography
                        {...getEditableTextProps(
                          contact.blockId,
                          `items.${index}.heading`,
                          "single",
                        )}
                        sx={{ fontSize: "0.9rem", color: rgba("#ffffff", 0.7) }}
                      >
                        {item.heading}
                      </Typography>
                      <Typography
                        {...getEditableTextProps(
                          contact.blockId,
                          `items.${index}.description`,
                          "single",
                        )}
                        sx={{
                          fontSize: "0.9rem",
                          color: lime,
                          fontWeight: 600,
                          textAlign: "right",
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>

            {/* Right: contact form */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              {...containerProps(
                contact.blockId,
                "contact.form",
                "Contact form",
                "card",
              )}
              sx={{
                bgcolor: "#fff",
                p: { xs: 3, md: 4 },
                border: `1px solid ${rgba(forest, 0.08)}`,
              }}
            >
              <Typography
                {...getEditableTextProps(contact.blockId, "formHeading", "single")}
                sx={{
                  fontFamily: headingFont,
                  fontWeight: 500,
                  fontSize: "1.55rem",
                  color: ink,
                }}
              >
                {contact.formHeading || "Send a Message"}
              </Typography>
              <Typography
                {...getEditableTextProps(contact.blockId, "formDescription", "multi")}
                sx={{ mt: 0.8, color: inkSoft, fontSize: "0.9rem", lineHeight: 1.65 }}
              >
                {contact.formDescription ||
                  "Tell us about your project — we'll get back within one business day."}
              </Typography>

              <Box
                sx={{
                  mt: 3,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                {fields.map((field) => (
                  <Box
                    key={field.key || field.label}
                    sx={{
                      gridColumn: isFullWidthContactField(field)
                        ? "1 / -1"
                        : undefined,
                    }}
                  >
                    {renderTemplateContactField({
                      field,
                      fieldProps: getFieldProps(field.label),
                      inputSx: inputSx(forest, ink, inkSoft, bodyFont),
                      textColor: ink,
                      mutedColor: inkSoft,
                    })}
                  </Box>
                ))}
              </Box>
              <Button
                type="submit"
                disabled={contactStatus === "loading"}
                {...getEditableTextProps(contact.blockId, "buttonLabel", "single")}
                sx={{
                  mt: 2.5,
                  bgcolor: forest,
                  color: cream,
                  borderRadius: 0,
                  px: 3.5,
                  py: 1.4,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { bgcolor: forestDeep },
                  "&:disabled": { opacity: 0.7, color: cream },
                }}
              >
                {contactStatus === "loading"
                  ? "Sending…"
                  : contact.buttonLabel || "Send Message"}
              </Button>
              {contactStatus === "success" && (
                <Typography
                  sx={{ mt: 1.5, color: forest, fontSize: "0.85rem", fontWeight: 600 }}
                >
                  Thanks — we received your message.
                </Typography>
              )}
              {contactStatus === "error" && (
                <Typography
                  sx={{ mt: 1.5, color: "#b42318", fontSize: "0.85rem", fontWeight: 600 }}
                >
                  {contactError}
                </Typography>
              )}
            </Box>
          </MotionBox>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    </>
  );
};

export default ContactPage;
