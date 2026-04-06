/**
 * NewsletterBlock — Step 2.28.3
 *
 * Email subscription block with 3 layouts: inline, stacked, card.
 * POSTs to /api/newsletter/subscribe with email, optional name, websiteId, source.
 *
 * Features:
 * - 3 layouts: inline (side-by-side), stacked (vertical), card (elevated Card wrapper)
 * - Honeypot field 'website' for bot detection
 * - Client-side email validation
 * - Success/error state via MUI Alert
 * - Rate limit (429) feedback
 * - Loading state with CircularProgress
 * - Optional name field (showNameField)
 * - Framer Motion entrance animation (whileInView, viewport once:true)
 *
 * Security: DOMPurify.sanitize() on heading and description
 * Performance: React.memo
 * Accessibility: aria-labels, semantic HTML
 */

import React, { useState, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NewsletterContent {
  heading?: string;
  description?: string;
  buttonText?: string;
  placeholder?: string;
  successMessage?: string;
  layout?: "inline" | "stacked" | "card";
  showNameField?: boolean;
  spacingPaddingTop?: string;
  spacingPaddingBottom?: string;
}

interface Block {
  id: number;
  blockType: string;
  content: NewsletterContent;
  sortOrder: number;
}

interface NewsletterBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5001/api";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Main Component ────────────────────────────────────────────────────────────

const NewsletterBlockBase: React.FC<NewsletterBlockProps> = ({
  block,
  primaryColor = "#378C92",
  headingColor = "#1e293b",
  bodyColor = "#475569",
}) => {
  const {
    heading = "Stay Updated",
    description = "Subscribe to our newsletter for the latest updates.",
    buttonText = "Subscribe",
    placeholder = "Enter your email",
    successMessage = "Thanks for subscribing!",
    layout = "stacked",
    showNameField = false,
  } = block.content;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState(""); // bot trap
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Honeypot check — if filled, silently succeed (bot trap)
      if (honeypot) {
        setStatus("success");
        return;
      }

      // Client-side email validation
      if (!email.trim()) {
        setEmailError("Email address is required.");
        return;
      }
      if (!EMAIL_REGEX.test(email.trim())) {
        setEmailError("Please enter a valid email address.");
        return;
      }
      setEmailError("");
      setStatus("loading");

      try {
        const payload: Record<string, any> = {
          email: email.trim(),
          websiteId: block.id,
          source: "block",
        };
        if (showNameField && name.trim()) {
          payload.name = name.trim();
        }

        const res = await fetch(`${API_URL}/newsletter/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.status === 429) {
          setErrorMessage("Too many requests. Please try again later.");
          setStatus("error");
          return;
        }

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setErrorMessage(
            body.message || "Something went wrong. Please try again.",
          );
          setStatus("error");
          return;
        }

        setStatus("success");
        setEmail("");
        setName("");
      } catch {
        setErrorMessage(
          "Unable to subscribe. Please check your connection and try again.",
        );
        setStatus("error");
      }
    },
    [email, honeypot, name, block.id, showNameField],
  );

  const safeHeading = DOMPurify.sanitize(heading);
  const safeDescription = DOMPurify.sanitize(description);

  const formContent = (
    <Box
      component="form"
      onSubmit={handleSubmit}
      aria-label="Newsletter subscription form"
      noValidate
    >
      {/* Honeypot — hidden from real users, catches bots */}
      <Box
        component="input"
        name="website"
        value={honeypot}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setHoneypot(e.target.value)
        }
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          display: "none",
        }}
      />

      {status === "success" && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {safeDescription ? successMessage : successMessage}
        </Alert>
      )}
      {status === "error" && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {status !== "success" && (
        <Stack
          direction={
            layout === "inline" ? { xs: "column", sm: "row" } : "column"
          }
          spacing={2}
          alignItems={layout === "inline" ? { sm: "flex-start" } : "stretch"}
        >
          {showNameField && (
            <TextField
              fullWidth
              label="Name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === "loading"}
              size="small"
              inputProps={{ "aria-label": "Name" }}
            />
          )}
          <TextField
            fullWidth
            label="Email"
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError("");
            }}
            error={Boolean(emailError)}
            helperText={emailError}
            disabled={status === "loading"}
            required
            size="small"
            inputProps={{ "aria-label": "Email address" }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={status === "loading"}
            size="medium"
            sx={{
              bgcolor: primaryColor,
              whiteSpace: "nowrap",
              minWidth: layout === "inline" ? "auto" : "100%",
              "&:hover": { bgcolor: primaryColor, opacity: 0.9 },
            }}
          >
            {status === "loading" ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              buttonText
            )}
          </Button>
        </Stack>
      )}
    </Box>
  );

  const innerContent = (
    <Box>
      {safeHeading && (
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          align="center"
          sx={{ fontWeight: 700, color: headingColor, mb: 1 }}
        >
          {safeHeading}
        </Typography>
      )}
      {safeDescription && (
        <Typography
          variant="body1"
          align="center"
          sx={{ color: bodyColor, mb: 3 }}
        >
          {safeDescription}
        </Typography>
      )}
      {formContent}
    </Box>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Box
        component="section"
        aria-label={safeHeading || "Newsletter subscription"}
        sx={{ py: 6 }}
      >
        <Container maxWidth="md">
          {layout === "card" ? (
            <Card elevation={3} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 4 }}>{innerContent}</CardContent>
            </Card>
          ) : (
            innerContent
          )}
        </Container>
      </Box>
    </motion.div>
  );
};

NewsletterBlockBase.displayName = "NewsletterBlock";

const NewsletterBlock = React.memo(NewsletterBlockBase);
NewsletterBlock.displayName = "NewsletterBlock";

export default NewsletterBlock;
