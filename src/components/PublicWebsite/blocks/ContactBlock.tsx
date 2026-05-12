/**
 * ContactBlock — Step 16.6
 *
 * Renders a contact section with three layout modes:
 *  - 'stacked' (default): single-column, existing behavior preserved
 *  - 'split-image': CSS Grid with image column + form column side-by-side
 *  - 'split-info': CSS Grid with info panel (address, phone, email + optional map)
 *    and configurable form side-by-side. `formFields` array allows custom fields.
 *
 * Fields:
 *   layout        'stacked' | 'split-image' | 'split-info'
 *   contactImage  URL — image shown in split-image layout
 *   imageRatio    'equal' | 'wide-image' | 'wide-form'
 *   infoPosition  'left' | 'right' — which side shows info (split-info)
 *   showMap       boolean — show map placeholder in info panel
 *   formFields    array — configurable form fields [{label, fieldType, required}]
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import DOMPurify from 'dompurify';
import { BlockWrapper } from '../BlockWrapper';
import { API_URL } from '@/config/api';

// ── Types ──────────────────────────────────────────────────────────────────

interface FormFieldConfig {
  label: string;
  fieldType: 'text' | 'email' | 'tel' | 'textarea';
  required?: boolean;
}

interface ContactContent {
  heading?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  showForm?: boolean;
  layout?: 'stacked' | 'split-image' | 'split-info';
  contactImage?: string;
  imageRatio?: 'equal' | 'wide-image' | 'wide-form';
  infoPosition?: 'left' | 'right';
  showMap?: boolean;
  formFields?: FormFieldConfig[];
  fieldVariant?: 'outlined' | 'standard' | 'filled';
  fieldColor?: string;
  websiteId?: string | number;
  [key: string]: unknown;
}

interface Block {
  id: number;
  blockType: string;
  content: ContactContent;
  sortOrder: number;
}

interface ContactBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onFormSubmit?: (formName: string, success: boolean) => void;
}

// ── Constants ──────────────────────────────────────────────────────────────

const RATIO_MAP: Record<string, string> = {
  equal: '1fr 1fr',
  'wide-image': '1.1fr 0.9fr',
  'wide-form': '0.9fr 1.1fr',
};

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
  // outlined (default)
  return {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: color },
    '& .MuiInputLabel-root.Mui-focused': { color },
  };
}

// ── API URL ───────────────────────────────────────────────────────────────


// ── Sub-components ─────────────────────────────────────────────────────────

const DEFAULT_FORM_FIELDS: FormFieldConfig[] = [
  { label: 'Name', fieldType: 'text', required: true },
  { label: 'Email', fieldType: 'email', required: true },
  { label: 'Message', fieldType: 'textarea', required: true },
];

interface ContactFormProps {
  primaryColor: string;
  fieldVariant?: 'outlined' | 'standard' | 'filled';
  fieldColor?: string;
  formFields?: FormFieldConfig[];
  content?: ContactContent;
  onFormSubmit?: (formName: string, success: boolean) => void;
}

function ContactForm({
  primaryColor,
  fieldVariant = 'outlined',
  fieldColor = '',
  formFields,
  content,
  onFormSubmit,
}: ContactFormProps) {
  const fields = formFields && formFields.length > 0 ? formFields : DEFAULT_FORM_FIELDS;
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach((f) => {
      init[f.label] = '';
    });
    return init;
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormStatus('loading');
      setErrorMessage('');

      try {
        // Build payload — map well-known labels to API fields, include all others as extra
        const nameVal = formData['Name'] || '';
        const emailVal = formData['Email'] || '';
        const messageVal = formData['Message'] || '';
        const phoneVal = formData['Phone'] || formData['Phone Number'] || '';
        const subjectVal = formData['Subject'] || '';

        const payload: Record<string, unknown> = {
          name: nameVal,
          email: emailVal,
          message: messageVal,
          source: 'contact-block',
        };
        if (phoneVal) payload.phone = phoneVal;
        if (subjectVal) payload.subject = subjectVal;
        if (content?.websiteId) payload.websiteId = content.websiteId;

        // Include any additional custom field values
        for (const field of fields) {
          const key = field.label;
          if (
            !['Name', 'Email', 'Message', 'Phone', 'Phone Number', 'Subject'].includes(key) &&
            formData[key]
          ) {
            payload[key] = formData[key];
          }
        }

        const res = await fetch(`${API_URL}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.status === 429) {
          setErrorMessage('Too many requests. Please try again later.');
          setFormStatus('error');
          return;
        }

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setErrorMessage((body as any).message || 'Failed to submit. Please try again.');
          setFormStatus('error');
          return;
        }

        setFormStatus('success');
        onFormSubmit?.('contact', true);
        const reset: Record<string, string> = {};
        fields.forEach((f) => {
          reset[f.label] = '';
        });
        setFormData(reset);
        setTimeout(() => setFormStatus('idle'), 5000);
      } catch {
        setErrorMessage('Unable to send message. Please check your connection and try again.');
        setFormStatus('error');
        onFormSubmit?.('contact', false);
      }
    },
    [formData, fields, content, onFormSubmit]
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {formStatus === 'success' && (
        <Alert severity="success">Thank you! Your message has been sent successfully.</Alert>
      )}
      {formStatus === 'error' && (
        <Alert severity="error">
          {errorMessage || 'Sorry, there was an error sending your message. Please try again.'}
        </Alert>
      )}
      {fields.map((field) => (
        <TextField
          key={field.label}
          fullWidth
          label={field.label}
          name={field.label}
          type={field.fieldType === 'email' ? 'email' : field.fieldType === 'tel' ? 'tel' : 'text'}
          value={formData[field.label] ?? ''}
          onChange={handleChange}
          required={field.required !== false}
          multiline={field.fieldType === 'textarea'}
          rows={field.fieldType === 'textarea' ? 4 : undefined}
          variant={fieldVariant}
          sx={getFieldColorSx(fieldVariant, fieldColor)}
          disabled={formStatus === 'loading'}
          inputProps={{ 'aria-label': field.label }}
        />
      ))}
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={formStatus === 'loading'}
        sx={{
          bgcolor: primaryColor,
          '&:hover': { bgcolor: primaryColor, opacity: 0.9 },
        }}
      >
        {formStatus === 'loading' ? <CircularProgress size={22} color="inherit" /> : 'Send Message'}
      </Button>
    </Box>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

const ContactBlock = React.memo(function ContactBlock({
  block,
  primaryColor = '#2563eb',
  headingColor = '#1e293b',
  bodyColor = '#475569',
  onFormSubmit,
}: ContactBlockProps) {
  const content = (block.content ?? {}) as ContactContent;

  const layout = content.layout ?? 'stacked';
  const contactImage = content.contactImage ?? '';
  const imageRatio = content.imageRatio ?? 'equal';
  const gridColumns = RATIO_MAP[imageRatio] ?? '1fr 1fr';
  const fieldVariant = content.fieldVariant ?? 'outlined';
  const fieldColor = content.fieldColor ?? '';

  const safeHeading = DOMPurify.sanitize(content.heading ?? 'Get In Touch');
  const safeDescription = DOMPurify.sanitize(content.description ?? '');

  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });

  // ── Contact info section (used in stacked layout) ──────────────────────
  const contactInfo = (
    <Box sx={{ mb: content.showForm ? 3 : 0 }}>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: bodyColor }}>
        Email: {content.email || 'contact@example.com'}
      </Typography>
      {content.phone && (
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: bodyColor }}>
          Phone: {content.phone}
        </Typography>
      )}
      {content.address && (
        <Typography variant="body2" sx={{ fontWeight: 500, color: bodyColor }}>
          Address: {content.address}
        </Typography>
      )}
    </Box>
  );

  // ── Split-image layout ──────────────────────────────────────────────────
  if (layout === 'split-image') {
    return (
      <BlockWrapper fields={content as unknown as import('../BlockWrapper').BlockWrapperFields}>
        <Box component="section" ref={ref} sx={{ overflow: 'hidden' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: gridColumns },
                minHeight: { xs: 'auto', md: 480 },
              }}
            >
              {/* Image cell */}
              <Box
                data-testid="contact-image-cell"
                sx={{
                  position: 'relative',
                  minHeight: { xs: 280, md: 400 },
                  overflow: 'hidden',
                }}
              >
                {contactImage ? (
                  <Box
                    component="img"
                    src={contactImage}
                    alt="Contact section"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No image
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Form cell */}
              <Box
                data-testid="contact-form-cell"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: { xs: 3, md: 6 },
                  py: { xs: 4, md: 6 },
                }}
              >
                <Box sx={{ width: '100%', maxWidth: 420 }}>
                  {safeHeading && (
                    <Typography
                      variant="h4"
                      component="h2"
                      sx={{ mb: 1, fontWeight: 700, color: headingColor }}
                    >
                      {safeHeading}
                    </Typography>
                  )}
                  {safeDescription && (
                    <Typography variant="body1" sx={{ mb: 2, color: bodyColor }}>
                      {safeDescription}
                    </Typography>
                  )}
                  {contactInfo}
                  {content.showForm !== false && (
                    <ContactForm
                      primaryColor={primaryColor}
                      fieldVariant={fieldVariant}
                      fieldColor={fieldColor}
                      content={content}
                      onFormSubmit={onFormSubmit}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </BlockWrapper>
    );
  }

  // ── Split-info layout ───────────────────────────────────────────────────
  if (layout === 'split-info') {
    const infoPosition = content.infoPosition ?? 'left';
    const showMap = content.showMap ?? false;
    const infoOnLeft = infoPosition === 'left';

    const infoPanel = (
      <Box
        data-testid="contact-info-panel"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 3,
          p: { xs: 3, md: 5 },
          bgcolor: 'grey.50',
          borderRadius: 2,
        }}
      >
        {safeHeading && (
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: headingColor }}>
            {safeHeading}
          </Typography>
        )}
        {safeDescription && (
          <Typography variant="body1" sx={{ color: bodyColor }}>
            {safeDescription}
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {content.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ color: '#fff', fontSize: 16 }}>✉</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: bodyColor, display: 'block' }}>
                  Email
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: headingColor }}>
                  {content.email}
                </Typography>
              </Box>
            </Box>
          )}
          {content.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ color: '#fff', fontSize: 16 }}>☎</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: bodyColor, display: 'block' }}>
                  Phone
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: headingColor }}>
                  {content.phone}
                </Typography>
              </Box>
            </Box>
          )}
          {content.address && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ color: '#fff', fontSize: 16 }}>⌂</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: bodyColor, display: 'block' }}>
                  Address
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: headingColor }}>
                  {content.address}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
        {showMap && (
          <Box
            data-testid="contact-map-placeholder"
            sx={{
              width: '100%',
              height: 180,
              bgcolor: 'grey.200',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Map
            </Typography>
          </Box>
        )}
      </Box>
    );

    const formPanel = (
      <Box
        data-testid="contact-form-panel"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 3, md: 5 },
        }}
      >
        {content.showForm !== false && (
          <ContactForm
            primaryColor={primaryColor}
            fieldVariant={fieldVariant}
            fieldColor={fieldColor}
            formFields={content.formFields}
            content={content}
            onFormSubmit={onFormSubmit}
          />
        )}
      </Box>
    );

    return (
      <BlockWrapper fields={content as unknown as import('../BlockWrapper').BlockWrapperFields}>
        <Box component="section" ref={ref} sx={{ overflow: 'hidden' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Container maxWidth="lg">
              <Box
                data-testid="contact-split-info"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: { xs: 0, md: 4 },
                  py: { xs: 4, md: 6 },
                }}
              >
                {infoOnLeft ? (
                  <>
                    {infoPanel}
                    {formPanel}
                  </>
                ) : (
                  <>
                    {formPanel}
                    {infoPanel}
                  </>
                )}
              </Box>
            </Container>
          </motion.div>
        </Box>
      </BlockWrapper>
    );
  }

  // ── Stacked layout (default) ────────────────────────────────────────────
  return (
    <BlockWrapper fields={content as unknown as import('../BlockWrapper').BlockWrapperFields}>
      <Box component="section" sx={{ py: { xs: 4, md: 6 }, bgcolor: 'background.default' }}>
        <Container maxWidth="md">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ mb: 4, fontWeight: 600, color: headingColor }}
            >
              {safeHeading}
            </Typography>
            <Card elevation={2} sx={{ p: 4 }}>
              {safeDescription && (
                <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: bodyColor }}>
                  {safeDescription}
                </Typography>
              )}
              {contactInfo}
              {content.showForm !== false && (
                <Box sx={{ mt: 3 }}>
                  <ContactForm
                    primaryColor={primaryColor}
                    fieldVariant={fieldVariant}
                    fieldColor={fieldColor}
                    content={content}
                    onFormSubmit={onFormSubmit}
                  />
                </Box>
              )}
            </Card>
          </motion.div>
        </Container>
      </Box>
    </BlockWrapper>
  );
});

export default ContactBlock;

