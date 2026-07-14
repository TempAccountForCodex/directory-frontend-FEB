import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  InputAdornment,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import type { BusinessData } from "../types/BusinessData";
import type { TemplateTheme } from "../templateEngine/types";
import FadeIn from "./FadeIn";
import {
  isEditorPreviewEnvironment,
  isValidEmail,
  submitWebsiteFormSubmission,
} from "../../api/formSubmissions";

export interface ContactBlockProps {
  data: BusinessData;
  theme: TemplateTheme;
  variant?: "card" | "inline" | "dark";
}

const getTemplateBlockId = (
  data: BusinessData,
  key: string,
): string | number | undefined =>
  (data.templateContent as Record<string, any> | undefined)?.[key]?.blockId;

interface FormState {
  name: string;
  email: string;
  message: string;
}

function useContactForm(websiteId?: string | number) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Editor preview: never validate or persist while designing.
    if (isEditorPreviewEnvironment()) return;

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) {
      setErrorMessage("Please fill in all required fields.");
      setStatus("error");
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      setStatus("error");
      return;
    }
    if (!websiteId) {
      setErrorMessage("This form isn't connected yet. Please try again later.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    try {
      await submitWebsiteFormSubmission(websiteId, {
        submitterName: name,
        submitterEmail: email,
        source: "template-contact-block",
        formData: [
          { fieldName: "Name", fieldValue: name, fieldType: "text" },
          { fieldName: "Email", fieldValue: email, fieldType: "email" },
          { fieldName: "Message", fieldValue: message, fieldType: "textarea" },
        ],
      });
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return {
    form,
    status,
    errorMessage,
    submitted: status === "success",
    handleChange,
    handleSubmit,
  };
}

function CardContact({ data, theme }: Omit<ContactBlockProps, "variant">) {
  const { form, status, errorMessage, submitted, handleChange, handleSubmit } =
    useContactForm(data.websiteId);
  const { contact } = data;
  const contactBlockId = getTemplateBlockId(data, "contact");
  return (
    <Box
      data-preview-section="true"
      data-preview-label="Contact"
      data-preview-block-id={contactBlockId}
      data-preview-style-key="sectionStyle"
      sx={{ bgcolor: theme.bgSecondary, py: { xs: 8, md: 12 }, px: 3 }}
    >
      <Box
        sx={{
          maxWidth: 1000,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1.4fr" },
          gap: 4,
          bgcolor: theme.surfaceColor,
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${theme.borderColor}`,
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
        }}
      >
        <Box
          sx={{
            bgcolor: theme.primaryColor,
            p: 5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <FadeIn direction="left">
            <Typography
              variant="h4"
              sx={{
                fontFamily: theme.fontFamily,
                fontWeight: 800,
                color: "#fff",
                mb: 4,
              }}
            >
              Contact Us
            </Typography>
            {contact.phone && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <PhoneIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
                <Typography
                  sx={{ color: "#fff", fontFamily: theme.fontFamily }}
                >
                  {contact.phone}
                </Typography>
              </Box>
            )}
            {contact.email && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <EmailIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
                <Typography
                  sx={{ color: "#fff", fontFamily: theme.fontFamily }}
                >
                  {contact.email}
                </Typography>
              </Box>
            )}
            {contact.address && (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <LocationOnIcon
                  sx={{ color: "rgba(255,255,255,0.7)", mt: 0.3 }}
                />
                <Typography
                  sx={{ color: "#fff", fontFamily: theme.fontFamily }}
                >
                  {contact.address}
                </Typography>
              </Box>
            )}
          </FadeIn>
        </Box>
        <Box sx={{ p: 5 }}>
          <FadeIn direction="right">
            {submitted ? (
              <Alert severity="success">
                Thank you! We'll be in touch soon.
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  {status === "error" && (
                    <Grid item xs={12}>
                      <Alert severity="error">{errorMessage}</Alert>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      multiline
                      rows={4}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={status === "loading"}
                      sx={{
                        bgcolor: theme.primaryColor,
                        fontWeight: 700,
                        borderRadius: 2,
                        "&:hover": {
                          bgcolor: theme.primaryColor,
                          filter: "brightness(0.9)",
                        },
                      }}
                    >
                      {status === "loading" ? "Sending…" : "Send Message"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </FadeIn>
        </Box>
      </Box>
    </Box>
  );
}

function InlineContact({ data, theme }: Omit<ContactBlockProps, "variant">) {
  const { form, status, errorMessage, submitted, handleChange, handleSubmit } =
    useContactForm(data.websiteId);
  const { contact } = data;
  const contactBlockId = getTemplateBlockId(data, "contact");
  return (
    <Box
      data-preview-section="true"
      data-preview-label="Contact"
      data-preview-block-id={contactBlockId}
      data-preview-style-key="sectionStyle"
      sx={{ bgcolor: theme.bgPrimary, py: { xs: 8, md: 12 }, px: 3 }}
    >
      <Box sx={{ maxWidth: 760, mx: "auto" }}>
        <FadeIn>
          <Typography
            variant="h3"
            sx={{
              fontFamily: theme.fontFamily,
              fontWeight: 800,
              color: theme.headingColor,
              mb: 1,
            }}
          >
            Get in Touch
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 5 }}>
            {contact.phone && (
              <Typography
                sx={{ color: theme.bodyColor, fontFamily: theme.fontFamily }}
              >
                {contact.phone}
              </Typography>
            )}
            {contact.email && (
              <Typography
                sx={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
              >
                {contact.email}
              </Typography>
            )}
          </Box>
        </FadeIn>
        {submitted ? (
          <Alert severity="success">Thank you! We'll be in touch soon.</Alert>
        ) : (
          <FadeIn delay={0.15}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {status === "error" && (
                  <Grid item xs={12}>
                    <Alert severity="error">{errorMessage}</Alert>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    multiline
                    rows={4}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={status === "loading"}
                    sx={{
                      bgcolor: theme.primaryColor,
                      fontWeight: 700,
                      px: 5,
                      py: 1.5,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: theme.primaryColor,
                        filter: "brightness(0.9)",
                      },
                    }}
                  >
                    {status === "loading" ? "Sending…" : "Send Message"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </FadeIn>
        )}
      </Box>
    </Box>
  );
}

function DarkContact({ data, theme }: Omit<ContactBlockProps, "variant">) {
  const { form, status, errorMessage, submitted, handleChange, handleSubmit } =
    useContactForm(data.websiteId);
  const { contact } = data;
  const contactBlockId = getTemplateBlockId(data, "contact");
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: theme.headingColor,
      "& fieldset": { borderColor: theme.borderColor },
      "&:hover fieldset": { borderColor: theme.accentColor },
    },
    "& .MuiInputLabel-root": { color: theme.bodyColor },
    "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: theme.bodyColor },
  };
  return (
    <Box
      data-preview-section="true"
      data-preview-label="Contact"
      data-preview-block-id={contactBlockId}
      data-preview-style-key="sectionStyle"
      sx={{ bgcolor: theme.bgPrimary, py: { xs: 8, md: 12 }, px: 3 }}
    >
      <Box sx={{ maxWidth: 640, mx: "auto" }}>
        <FadeIn>
          <Typography
            variant="h3"
            sx={{
              fontFamily: theme.fontFamily,
              fontWeight: 800,
              color: theme.headingColor,
              textAlign: "center",
              mb: 1,
            }}
          >
            Contact Us
          </Typography>
          <Box
            sx={{
              width: 48,
              height: 3,
              bgcolor: theme.accentColor,
              mx: "auto",
              borderRadius: 999,
              mb: 5,
            }}
          />
        </FadeIn>
        {submitted ? (
          <Alert severity="success">Thank you! We'll be in touch soon.</Alert>
        ) : (
          <FadeIn delay={0.1}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2.5}>
                {status === "error" && (
                  <Grid item xs={12}>
                    <Alert severity="error">{errorMessage}</Alert>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    sx={inputSx}
                    InputProps={{
                      startAdornment: <InputAdornment position="start" />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    multiline
                    rows={4}
                    sx={inputSx}
                  />
                </Grid>
                {(contact.phone || contact.email) && (
                  <Grid item xs={12}>
                    <Box
                      sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 1 }}
                    >
                      {contact.phone && (
                        <Typography
                          sx={{ color: theme.bodyColor, fontSize: "0.875rem" }}
                        >
                          {contact.phone}
                        </Typography>
                      )}
                      {contact.email && (
                        <Typography
                          sx={{
                            color: theme.accentColor,
                            fontSize: "0.875rem",
                          }}
                        >
                          {contact.email}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={status === "loading"}
                    sx={{
                      bgcolor: theme.accentColor,
                      color: "#000",
                      fontWeight: 700,
                      borderRadius: 2,
                      py: 1.5,
                      "&:hover": {
                        bgcolor: theme.accentColor,
                        filter: "brightness(0.9)",
                      },
                    }}
                  >
                    {status === "loading" ? "Sending…" : "Send Message"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </FadeIn>
        )}
      </Box>
    </Box>
  );
}

const ContactBlock: React.FC<ContactBlockProps> = ({
  data,
  theme,
  variant = "card",
}) => {
  if (variant === "inline") return <InlineContact data={data} theme={theme} />;
  if (variant === "dark") return <DarkContact data={data} theme={theme} />;
  return <CardContact data={data} theme={theme} />;
};

export default ContactBlock;
