/**
 * FooterBlock — Step 10.6 FOOTER Multi-Column, Social Links & Logo
 *
 * 3 variants:
 *  - simple:       Dark bg, centered logo, copyright, and social icons row
 *  - multi-column: (default) Logo top-left, grid of link columns, social row, copyright bar
 *  - centered:     Everything horizontally centered — logo, inline links, social, copyright
 *
 * Features:
 * - Social icons (Facebook, X/Twitter, Instagram, LinkedIn, YouTube) with target="_blank"
 * - Optional logo image
 * - Optional newsletter inline form (showNewsletter)
 * - BlockWrapper integration for design token passthrough
 * - React.memo for performance
 */

import React, { memo, useState, useCallback } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Typography,
  Stack,
  TextField,
  Button,
} from '@mui/material';
import Facebook from '@mui/icons-material/Facebook';
import Twitter from '@mui/icons-material/Twitter';
import Instagram from '@mui/icons-material/Instagram';
import LinkedIn from '@mui/icons-material/LinkedIn';
import YouTube from '@mui/icons-material/YouTube';
import X from '@mui/icons-material/X';
import { BlockWrapper } from '../BlockWrapper';

// ── Constants ─────────────────────────────────────────────────────────────────

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Types ──────────────────────────────────────────────────────────────────────

interface FooterLink {
  label: string;
  url: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  platform: string;
  url: string;
}

interface FooterBlockProps {
  content: {
    variant?: 'simple' | 'multi-column' | 'centered';
    copyright?: string;
    logo?: string;
    columns?: FooterColumn[];
    socialLinks?: SocialLink[];
    showNewsletter?: boolean;
    newsletterHeading?: string;
    newsletterPlaceholder?: string;
    websiteId?: number;
    // design token fields (passed to BlockWrapper)
    [key: string]: unknown;
  };
}

// ── Social Icon Map ────────────────────────────────────────────────────────────

type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube';

const SOCIAL_ICONS: Record<SocialPlatform, React.ComponentType<{ fontSize?: 'small' | 'medium' | 'large' | 'inherit' }>> = {
  facebook: Facebook,
  twitter: X,
  instagram: Instagram,
  linkedin: LinkedIn,
  youtube: YouTube,
};

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

interface SocialIconsRowProps {
  socialLinks: SocialLink[];
  justify?: 'center' | 'flex-start' | 'flex-end';
}

const SocialIconsRow: React.FC<SocialIconsRowProps> = ({ socialLinks, justify = 'center' }) => {
  if (!socialLinks || socialLinks.length === 0) return null;

  return (
    <Stack direction="row" spacing={0.5} justifyContent={justify} flexWrap="wrap">
      {socialLinks.map((link, idx) => {
        const platform = link.platform as SocialPlatform;
        const IconComponent = SOCIAL_ICONS[platform];
        const label = SOCIAL_LABELS[platform] ?? link.platform;

        if (!IconComponent) {
          // Fallback text label
          return (
            <IconButton
              key={idx}
              component="a"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              size="small"
              sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
            >
              <Typography
                variant="caption"
                sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}
              >
                {label.slice(0, 1)}
              </Typography>
            </IconButton>
          );
        }

        return (
          <IconButton
            key={idx}
            component="a"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            size="small"
            sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
          >
            <IconComponent fontSize="small" />
          </IconButton>
        );
      })}
    </Stack>
  );
};

interface NewsletterFormProps {
  heading: string;
  placeholder: string;
  websiteId?: number;
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({ heading, placeholder, websiteId }) => {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Honeypot check — silently succeed for bots
      if (honeypot) {
        setStatus('success');
        return;
      }

      // Client-side email validation
      if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
        setErrorMessage('Please enter a valid email address.');
        setStatus('error');
        return;
      }

      setStatus('loading');

      try {
        const res = await fetch(`${API_URL}/newsletter/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), websiteId, source: 'footer' }),
        });

        if (res.status === 429) {
          setErrorMessage('Too many requests. Please try again later.');
          setStatus('error');
          return;
        }

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setErrorMessage(body.message || 'Something went wrong. Please try again.');
          setStatus('error');
          return;
        }

        setStatus('success');
        setEmail('');
      } catch {
        setErrorMessage('Unable to subscribe. Please check your connection.');
        setStatus('error');
      }
    },
    [email, honeypot, websiteId]
  );

  return (
    <Box
      sx={{
        mt: 4,
        pt: 3,
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {heading && (
        <Typography
          variant="subtitle2"
          sx={{ color: 'grey.300', mb: 1.5, fontWeight: 600, textAlign: 'center' }}
        >
          {heading}
        </Typography>
      )}

      {status === 'success' && (
        <Alert
          severity="success"
          sx={{
            mb: 1.5,
            bgcolor: 'transparent',
            '& .MuiAlert-message': { color: 'success.light' },
          }}
        >
          Thanks for subscribing!
        </Alert>
      )}
      {status === 'error' && (
        <Alert
          severity="error"
          sx={{ mb: 1.5, bgcolor: 'transparent', '& .MuiAlert-message': { color: 'error.light' } }}
        >
          {errorMessage}
        </Alert>
      )}

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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHoneypot(e.target.value)}
          aria-hidden="true"
          tabIndex={-1}
          autoComplete="off"
          style={{
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            display: 'none',
          }}
        />

        {status !== 'success' && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center">
            <TextField
              size="small"
              type="email"
              placeholder={placeholder}
              value={email}
              onChange={handleChange}
              disabled={status === 'loading'}
              inputProps={{ 'aria-label': 'Email address' }}
              sx={{
                bgcolor: 'grey.800',
                borderRadius: 1,
                '& .MuiInputBase-input': { color: 'grey.200' },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'grey.700',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'grey.500',
                },
                minWidth: { sm: 220 },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={status === 'loading'}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {status === 'loading' ? <CircularProgress size={18} color="inherit" /> : 'Subscribe'}
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

// ── Variant Renderers ──────────────────────────────────────────────────────────

interface VariantProps {
  copyright?: string;
  logo?: string;
  columns?: FooterColumn[];
  socialLinks?: SocialLink[];
  showNewsletter?: boolean;
  newsletterHeading: string;
  newsletterPlaceholder: string;
  websiteId?: number;
}

const SimpleVariant: React.FC<VariantProps> = ({
  copyright,
  logo,
  socialLinks = [],
  showNewsletter = false,
  newsletterHeading,
  newsletterPlaceholder,
  websiteId,
}) => (
  <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'grey.300', py: 4 }}>
    <Container maxWidth="md">
      <Stack spacing={2} alignItems="center">
        {logo && (
          <Box
            component="img"
            src={logo}
            alt="Footer logo"
            data-testid="footer-logo"
            sx={{ maxHeight: 48, maxWidth: 160, objectFit: 'contain' }}
          />
        )}

        <SocialIconsRow socialLinks={socialLinks} justify="center" />

        {copyright && (
          <Typography variant="body2" sx={{ color: 'grey.500', textAlign: 'center' }}>
            {copyright}
          </Typography>
        )}
      </Stack>

      {showNewsletter && (
        <NewsletterForm
          heading={newsletterHeading}
          placeholder={newsletterPlaceholder}
          websiteId={websiteId}
        />
      )}
    </Container>
  </Box>
);

const MultiColumnVariant: React.FC<VariantProps> = ({
  copyright,
  logo,
  columns = [],
  socialLinks = [],
  showNewsletter = false,
  newsletterHeading,
  newsletterPlaceholder,
  websiteId,
}) => (
  <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'grey.300', pt: 6, pb: 3 }}>
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        {/* Logo column */}
        {logo && (
          <Grid item xs={12} sm={12} md={3}>
            <Box
              component="img"
              src={logo}
              alt="Footer logo"
              data-testid="footer-logo"
              sx={{ maxHeight: 48, maxWidth: 160, objectFit: 'contain', mb: 2 }}
            />
          </Grid>
        )}

        {/* Link columns */}
        {columns.map((col, idx) => (
          <Grid item xs={12} sm={6} md key={idx}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: 'white' }}>
              {col.title}
            </Typography>
            {col.links?.map((link, linkIdx) => (
              <Typography
                key={linkIdx}
                component="a"
                href={link.url}
                display="block"
                sx={{
                  color: 'grey.400',
                  textDecoration: 'none',
                  mb: 0.5,
                  '&:hover': { color: 'white' },
                }}
              >
                {link.label}
              </Typography>
            ))}
          </Grid>
        ))}
      </Grid>

      {/* Newsletter section */}
      {showNewsletter && (
        <NewsletterForm
          heading={newsletterHeading}
          placeholder={newsletterPlaceholder}
          websiteId={websiteId}
        />
      )}

      {/* Bottom bar */}
      <Box
        sx={{
          mt: 4,
          pt: 3,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {copyright && (
          <Typography variant="body2" sx={{ color: 'grey.500' }}>
            {copyright}
          </Typography>
        )}
        <SocialIconsRow socialLinks={socialLinks} justify="flex-end" />
      </Box>
    </Container>
  </Box>
);

const CenteredVariant: React.FC<VariantProps> = ({
  copyright,
  logo,
  columns = [],
  socialLinks = [],
  showNewsletter = false,
  newsletterHeading,
  newsletterPlaceholder,
  websiteId,
}) => {
  // Flatten all links from all columns into a single inline list
  const allLinks: FooterLink[] = columns.flatMap((col) => col.links ?? []);

  return (
    <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'grey.300', py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={2} alignItems="center">
          {logo && (
            <Box
              component="img"
              src={logo}
              alt="Footer logo"
              data-testid="footer-logo"
              sx={{ maxHeight: 48, maxWidth: 160, objectFit: 'contain' }}
            />
          )}

          {/* Inline horizontal links */}
          {allLinks.length > 0 && (
            <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
              {allLinks.map((link, idx) => (
                <Typography
                  key={idx}
                  component="a"
                  href={link.url}
                  variant="body2"
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Stack>
          )}

          <SocialIconsRow socialLinks={socialLinks} justify="center" />

          {copyright && (
            <Typography variant="body2" sx={{ color: 'grey.500', textAlign: 'center' }}>
              {copyright}
            </Typography>
          )}
        </Stack>

        {showNewsletter && (
          <NewsletterForm
            heading={newsletterHeading}
            placeholder={newsletterPlaceholder}
            websiteId={websiteId}
          />
        )}
      </Container>
    </Box>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const FooterBlockBase: React.FC<FooterBlockProps> = ({ content }) => {
  const {
    variant = 'multi-column',
    copyright,
    logo,
    columns = [],
    socialLinks = [],
    showNewsletter = false,
    newsletterHeading = 'Stay in the loop',
    newsletterPlaceholder = 'Enter your email',
    websiteId,
    ...rest
  } = content;

  const sharedProps: VariantProps = {
    copyright,
    logo,
    columns,
    socialLinks,
    showNewsletter,
    newsletterHeading,
    newsletterPlaceholder,
    websiteId: websiteId as number | undefined,
  };

  const renderVariant = () => {
    switch (variant) {
      case 'simple':
        return <SimpleVariant {...sharedProps} />;
      case 'centered':
        return <CenteredVariant {...sharedProps} />;
      case 'multi-column':
      default:
        return <MultiColumnVariant {...sharedProps} />;
    }
  };

  return <BlockWrapper fields={{ ...rest }}>{renderVariant()}</BlockWrapper>;
};

FooterBlockBase.displayName = 'FooterBlock';

const FooterBlock = memo(FooterBlockBase);
FooterBlock.displayName = 'FooterBlock';

export { Twitter, X, SOCIAL_ICONS };
export default FooterBlock;
