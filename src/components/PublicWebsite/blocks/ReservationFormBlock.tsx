/**
 * ReservationFormBlock — Step 11.4 / Step 14.12
 *
 * Renders an online reservation / booking form with:
 * - Configurable visible fields (name, email, phone, date, time, party size, message)
 * - Submit to endpoint (POST JSON) or mailto fallback
 * - Success / error Alert states
 * - Button disabled while submitting
 * - React.memo + Framer Motion entrance animation + useInView
 * - DOMPurify sanitization for heading / description display
 * - MUI DatePicker / TimePicker (Step 14.12 — replaces raw HTML5 inputs)
 * - MUI Select for party size (1–20)
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import DOMPurify from 'dompurify';

// ── Types ──────────────────────────────────────────────────────────────────

interface FieldFlags {
  showName?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showDate?: boolean;
  showTime?: boolean;
  showPartySize?: boolean;
  showMessage?: boolean;
}

interface ReservationFormContent {
  heading?: string;
  description?: string;
  fields?: FieldFlags;
  submitText?: string;
  successMessage?: string;
  submitEndpoint?: string;
  submitEmail?: string;
  openTime?: string; // e.g. '09:00' — restricts TimePicker minTime
  closeTime?: string; // e.g. '22:00' — restricts TimePicker maxTime
  fieldVariant?: 'outlined' | 'standard' | 'filled';
  fieldColor?: string;
}

interface Block {
  id: number;
  blockType: string;
  content: ReservationFormContent;
  sortOrder: number;
}

interface ReservationFormBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onFormSubmit?: (formName: string, success: boolean) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  message: string;
}

// ── Field color sx helper ──────────────────────────────────────────────────

function getFieldColorSx(variant: string, color: string): object {
  if (!color) return {};
  if (variant === 'standard') {
    return {
      '& .MuiInput-underline:after': { borderBottomColor: color },
      '& .MuiInputLabel-root.Mui-focused': { color },
    };
  }
  if (variant === 'filled') {
    return {
      '& .MuiFilledInput-root:after': { borderBottomColor: color },
      '& .MuiInputLabel-root.Mui-focused': { color },
    };
  }
  return {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: color },
    '& .MuiInputLabel-root.Mui-focused': { color },
  };
}

// ── Component ──────────────────────────────────────────────────────────────

const ReservationFormBlock = React.memo(function ReservationFormBlock({
  block,
  primaryColor = '#2563eb',
  headingColor = '#1e293b',
  bodyColor = '#475569',
  onFormSubmit,
}: ReservationFormBlockProps) {
  const content = (block.content ?? {}) as ReservationFormContent;

  const fieldFlags: FieldFlags = content.fields ?? {
    showName: true,
    showEmail: true,
    showPhone: true,
    showDate: true,
    showTime: true,
    showPartySize: true,
    showMessage: true,
  };

  const heading = content.heading ?? 'Make a Reservation';
  const description = content.description ?? '';
  const submitText = content.submitText ?? 'Reserve Now';
  const successMessage = content.successMessage ?? 'Your reservation has been received.';
  const submitEndpoint = content.submitEndpoint ?? '';
  const submitEmail = content.submitEmail ?? '';
  const openTime = content.openTime;
  const closeTime = content.closeTime;
  const fieldVariant = content.fieldVariant ?? 'outlined';
  const fieldColor = content.fieldColor ?? '';
  const fieldColorSx = getFieldColorSx(fieldVariant, fieldColor);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    partySize: 2,
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);

  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSelectChange = useCallback((e: SelectChangeEvent<number>) => {
    setFormData((prev) => ({ ...prev, partySize: e.target.value as number }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitting(true);
      setStatus(null);

      try {
        if (submitEndpoint) {
          const res = await fetch(submitEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            signal: AbortSignal.timeout(10000),
          });
          if (!res.ok) throw new Error('Submission failed');
        } else if (submitEmail) {
          const body = encodeURIComponent(JSON.stringify(formData, null, 2));
          window.location.href = `mailto:${submitEmail}?subject=Reservation Request&body=${body}`;
        }
        setStatus('success');
        onFormSubmit?.('RESERVATION_FORM', true);
      } catch {
        setStatus('error');
        onFormSubmit?.('RESERVATION_FORM', false);
      } finally {
        setSubmitting(false);
      }
    },
    [submitEndpoint, submitEmail, formData, onFormSubmit]
  );

  const safeHeading = DOMPurify.sanitize(heading);
  const safeDescription = DOMPurify.sanitize(description);

  return (
    <Box component="section" sx={{ py: { xs: 4, md: 6 }, bgcolor: 'background.default' }}>
      <Container maxWidth="sm">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {/* Heading */}
          {safeHeading && (
            <Typography
              variant="h4"
              component="h2"
              sx={{ mb: 1, fontWeight: 700, color: headingColor }}
            >
              {safeHeading}
            </Typography>
          )}

          {/* Description */}
          {safeDescription && (
            <Typography variant="body1" sx={{ mb: 3, color: bodyColor }}>
              {safeDescription}
            </Typography>
          )}

          {/* Success state */}
          {status === 'success' && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}

          {/* Error state */}
          {status === 'error' && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Something went wrong. Please try again.
            </Alert>
          )}

          {/* Form (hide after success) */}
          {status !== 'success' && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                {/* Name */}
                {fieldFlags.showName !== false && (
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    variant={fieldVariant}
                    sx={fieldColorSx}
                    inputProps={{ 'aria-label': 'Name' }}
                  />
                )}

                {/* Email */}
                {fieldFlags.showEmail !== false && (
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    variant={fieldVariant}
                    sx={fieldColorSx}
                    inputProps={{ 'aria-label': 'Email' }}
                  />
                )}

                {/* Phone */}
                {fieldFlags.showPhone !== false && (
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    variant={fieldVariant}
                    sx={fieldColorSx}
                    inputProps={{ 'aria-label': 'Phone' }}
                  />
                )}

                {/* Date */}
                {fieldFlags.showDate !== false && (
                  <DatePicker
                    label="Date"
                    value={formData.date ? new Date(formData.date) : null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        date: newValue ? newValue.toISOString().split('T')[0] : '',
                      }));
                    }}
                    disablePast
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: fieldVariant,
                        sx: fieldColorSx,
                        inputProps: { 'aria-label': 'Date' },
                      },
                    }}
                  />
                )}

                {/* Time */}
                {fieldFlags.showTime !== false && (
                  <TimePicker
                    label="Time"
                    value={formData.time ? new Date(`1970-01-01T${formData.time}`) : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        const hours = String(newValue.getHours()).padStart(2, '0');
                        const minutes = String(newValue.getMinutes()).padStart(2, '0');
                        setFormData((prev) => ({ ...prev, time: `${hours}:${minutes}` }));
                      } else {
                        setFormData((prev) => ({ ...prev, time: '' }));
                      }
                    }}
                    minutesStep={15}
                    minTime={openTime ? new Date(`1970-01-01T${openTime}`) : undefined}
                    maxTime={closeTime ? new Date(`1970-01-01T${closeTime}`) : undefined}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: fieldVariant,
                        sx: fieldColorSx,
                        inputProps: { 'aria-label': 'Time' },
                      },
                    }}
                  />
                )}

                {/* Party Size */}
                {fieldFlags.showPartySize !== false && (
                  <FormControl fullWidth>
                    <InputLabel id="party-size-label">Party Size</InputLabel>
                    <Select
                      labelId="party-size-label"
                      name="partySize"
                      value={formData.partySize}
                      onChange={handleSelectChange}
                      label="Party Size"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                        <MenuItem key={n} value={n}>
                          {n}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Message */}
                {fieldFlags.showMessage !== false && (
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    multiline
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    variant={fieldVariant}
                    sx={fieldColorSx}
                    inputProps={{ 'aria-label': 'Message' }}
                  />
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  sx={{
                    mt: 1,
                    bgcolor: primaryColor,
                    '&:hover': { bgcolor: primaryColor, filter: 'brightness(0.9)' },
                    fontWeight: 600,
                    py: 1.5,
                  }}
                  startIcon={
                    submitting ? <CircularProgress size={16} color="inherit" /> : undefined
                  }
                >
                  {submitText}
                </Button>
              </Box>
            </LocalizationProvider>
          )}
        </motion.div>
      </Container>
    </Box>
  );
});

export default ReservationFormBlock;
