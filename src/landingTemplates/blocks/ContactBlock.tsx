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

export interface ContactBlockProps {
  data: BusinessData;
  theme: TemplateTheme;
  variant?: "card" | "inline" | "dark";
}

interface FormState {
  name: string;
  email: string;
  message: string;
}

function useContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };
  return { form, submitted, handleChange, handleSubmit };
}

function CardContact({ data, theme }: Omit<ContactBlockProps, "variant">) {
  const { form, submitted, handleChange, handleSubmit } = useContactForm();
  const { contact } = data;
  return (
    <Box sx={{ bgcolor: theme.bgSecondary, py: { xs: 8, md: 12 }, px: 3 }}>
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
                      Send Message
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
  const { form, submitted, handleChange, handleSubmit } = useContactForm();
  const { contact } = data;
  return (
    <Box sx={{ bgcolor: theme.bgPrimary, py: { xs: 8, md: 12 }, px: 3 }}>
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
                    Send Message
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
  const { form, submitted, handleChange, handleSubmit } = useContactForm();
  const { contact } = data;
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
    <Box sx={{ bgcolor: theme.bgPrimary, py: { xs: 8, md: 12 }, px: 3 }}>
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
                    Send Message
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
