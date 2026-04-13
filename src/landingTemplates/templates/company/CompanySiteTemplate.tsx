import React from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import FadeIn from '../../blocks/FadeIn';
import type { TemplateProps } from '../../templateEngine/types';
import { buildCompanyTheme, rgba } from './theme';

const editorialImages = {
  hero: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  projectOne:
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  projectTwo:
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
  fullWidth:
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
  detail:
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80',
};

const defaultHeadingFont = '"Plus Jakarta Sans", "Inter", sans-serif';
const defaultBodyFont = '"Inter", "Segoe UI", sans-serif';

const CompanySiteTemplate: React.FC<TemplateProps> = ({ data }) => {
  const theme = buildCompanyTheme({
    data,
    defaultPrimary: '#161616',
    defaultSecondary: '#efefef',
    defaultHeadingFont,
    defaultBodyFont,
  });
  const services = data.features?.slice(0, 4) || [];
  const heroImage = data.gallery?.[0]?.url || editorialImages.hero;

  const socialIcons = [
    { key: 'twitter', icon: Twitter },
    { key: 'linkedin', icon: Linkedin },
    { key: 'instagram', icon: Instagram },
    { key: 'facebook', icon: Facebook },
  ].filter((item) => Boolean(data.socialLinks?.[item.key as keyof typeof data.socialLinks]));

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.pageBackground,
        color: theme.ink,
        fontFamily: theme.bodyFont,
        scrollBehavior: 'smooth',
      }}
    >
      <Box sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        <FadeIn direction="down">
          <Box
            component="header"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              mb: { xs: 4, md: 6 },
            }}
          >
            <Typography
              sx={{
                fontFamily: theme.headingFont,
                fontSize: '1.3rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              {data.name.toUpperCase()}
            </Typography>

            <Stack
              direction="row"
              spacing={3}
              sx={{
                display: { xs: 'none', md: 'flex' },
                color: theme.inkSoft,
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {[
                { label: 'Studio', href: '#studio' },
                { label: 'Projects', href: '#projects' },
                { label: 'Contact', href: '#contact' },
              ].map((item) => (
                <Box
                  key={item.label}
                  component="button"
                  type="button"
                  onClick={() => scrollToSection(item.href.replace('#', ''))}
                  sx={{
                    fontSize: '0.82rem',
                    color: 'inherit',
                    textDecoration: 'none',
                    background: 'transparent',
                    border: 0,
                    p: 0,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    '&:hover': { opacity: 0.7 },
                  }}
                >
                  {item.label}
                </Box>
              ))}
            </Stack>

            <Box
              component="button"
              type="button"
              onClick={() => scrollToSection('contact')}
              sx={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: theme.ink,
                textDecoration: 'none',
                background: 'transparent',
                border: 0,
                p: 0,
                cursor: 'pointer',
                fontFamily: 'inherit',
                '&:hover': { opacity: 0.7 },
              }}
            >
              Info
            </Box>
          </Box>
        </FadeIn>

        <FadeIn>
          <Box
            id="projects"
            sx={{
              position: 'relative',
              minHeight: { xs: 460, md: 660 },
              borderRadius: 3,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-end',
              px: { xs: 3, md: 5 },
              py: { xs: 4, md: 5 },
              backgroundImage: `linear-gradient(180deg, ${rgba(
                theme.darkest,
                0.12,
              )} 0%, ${rgba(theme.dark, 0.56)} 72%, ${rgba(
                theme.darkest,
                0.78,
              )} 100%), url(${heroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: `0 24px 60px ${rgba(theme.darkest, 0.16)}`,
            }}
          >
            <Box sx={{ maxWidth: 620 }}>
              <Typography
                sx={{
                  fontFamily: theme.headingFont,
                  color: theme.light,
                  fontSize: { xs: '3rem', md: '6.2rem' },
                  lineHeight: 0.9,
                  letterSpacing: '-0.07em',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  textShadow: '0 12px 30px rgba(0,0,0,0.18)',
                }}
              >
                {data.name}
              </Typography>
              <Typography
                sx={{
                  mt: 1.6,
                  maxWidth: 360,
                  color: rgba(theme.light, 0.82),
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  lineHeight: 1.7,
                }}
              >
                Calm spaces. Strong identity.
              </Typography>
              <Stack direction="row" spacing={1.2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => scrollToSection('studio')}
                  sx={{
                    bgcolor: theme.light,
                    color: theme.ink,
                    px: 2.6,
                    py: 1.05,
                    borderRadius: 999,
                    textTransform: 'none',
                    fontWeight: 700,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: theme.light, boxShadow: 'none', opacity: 0.92 },
                  }}
                >
                  View Studio
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => scrollToSection('contact')}
                  sx={{
                    color: theme.light,
                    borderColor: rgba(theme.light, 0.55),
                    px: 2.6,
                    py: 1.05,
                    borderRadius: 999,
                    textTransform: 'none',
                    fontWeight: 700,
                    '&:hover': {
                      borderColor: theme.light,
                      bgcolor: rgba(theme.light, 0.08),
                    },
                  }}
                >
                  Contact
                </Button>
              </Stack>
            </Box>
          </Box>
        </FadeIn>

        <Box
          sx={{
            mt: { xs: 5, md: 7 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '0.75fr 1.25fr' },
            gap: { xs: 4, md: 8 },
            alignItems: 'start',
          }}
        >
          <FadeIn>
            <Box>
              <Box
                sx={{
                  height: { xs: 420, md: 520 },
                  backgroundImage: `url(${editorialImages.projectOne})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <Typography sx={{ mt: 1.2, fontSize: '0.82rem', color: theme.ink }}>
                Hospitality interiors
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: theme.inkSoft }}>
                Boutique lounge concept
              </Typography>
            </Box>
          </FadeIn>

          <FadeIn delay={0.08}>
            <Box>
              <Box
                sx={{
                  height: { xs: 420, md: 680 },
                  backgroundImage: `url(${editorialImages.projectTwo})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <Typography sx={{ mt: 1.2, fontSize: '0.82rem', color: theme.ink }}>
                Residential styling
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: theme.inkSoft }}>
                Warm minimal living
              </Typography>
            </Box>
          </FadeIn>
        </Box>

        <FadeIn delay={0.08}>
          <Box
            sx={{
              mt: { xs: 5, md: 8 },
              height: { xs: 260, md: 420 },
              backgroundImage: `url(${editorialImages.fullWidth})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </FadeIn>

        <Box
          id="studio"
          sx={{
            mt: { xs: 5, md: 8 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '0.8fr 1.2fr' },
            gap: { xs: 3, md: 6 },
            alignItems: 'start',
          }}
        >
          <FadeIn>
            <Box sx={{ pt: { md: 2 } }}>
              <Typography
                sx={{
                  fontFamily: theme.headingFont,
                  fontSize: { xs: '2.8rem', md: '4.6rem' },
                  lineHeight: 0.94,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.06em',
                }}
              >
                Studio
              </Typography>
              <Typography sx={{ mt: 1.5, maxWidth: 360, color: theme.inkSoft, lineHeight: 1.8 }}>
                {data.tagline}
              </Typography>

              <Stack spacing={2} sx={{ mt: 4 }}>
                {services.map((service, index) => (
                  <FadeIn key={service.title} delay={index * 0.08}>
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: theme.headingFont,
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                        }}
                      >
                        {service.title}
                      </Typography>
                      <Typography sx={{ mt: 0.5, color: theme.inkSoft, lineHeight: 1.7 }}>
                        {service.description}
                      </Typography>
                    </Box>
                  </FadeIn>
                ))}
              </Stack>
            </Box>
          </FadeIn>

          <FadeIn delay={0.08} direction="left">
            <Box
              sx={{
                height: { xs: 380, md: 620 },
                backgroundImage: `url(${editorialImages.detail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </FadeIn>
        </Box>
      </Box>

      <Box id="contact" sx={{ background: `linear-gradient(180deg, ${theme.dark} 0%, ${theme.darkest} 100%)`, color: theme.light, mt: { xs: 6, md: 8 } }}>
        <Box sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 4, md: 5 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
              gap: 3,
              alignItems: 'center',
              pb: 4,
              borderBottom: `1px solid ${rgba(theme.light, 0.14)}`,
            }}
          >
            <FadeIn>
              <Box>
                <Typography
                  sx={{
                    fontFamily: theme.headingFont,
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  Newsletter Sign Up
                </Typography>
                <Typography
                  sx={{ mt: 1, maxWidth: 500, color: rgba(theme.light, 0.72), lineHeight: 1.7 }}
                >
                  Occasional updates about projects, spaces, and the studio&apos;s latest work.
                </Typography>
              </Box>
            </FadeIn>

            <FadeIn delay={0.08}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.2}
                sx={{ width: '100%', maxWidth: 520, minWidth: { md: 420 }, alignItems: 'stretch' }}
              >
                <TextField
                  placeholder="Email address"
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: theme.light,
                      color: theme.ink,
                      borderRadius: 0,
                      minHeight: 58,
                      fontSize: '1rem',
                      '& input': {
                        px: 2.2,
                        py: 1.8,
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: theme.accent,
                    color: theme.light,
                    borderRadius: 0,
                    minWidth: { xs: '100%', sm: 132 },
                    minHeight: 58,
                    px: 2.5,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: theme.accent, boxShadow: 'none', opacity: 0.9 },
                  }}
                >
                  Sign Up
                </Button>
              </Stack>
            </FadeIn>
          </Box>

          <Box
            sx={{
              pt: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              borderTop: `1px solid ${rgba(theme.light, 0.14)}`,
            }}
          >
            <FadeIn>
              <Box>
                <Typography
                  sx={{
                    fontFamily: theme.headingFont,
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  {data.name}
                </Typography>
                <Typography sx={{ mt: 0.8, color: rgba(theme.light, 0.7), fontSize: '0.9rem' }}>
                  {data.contact.email} · {data.contact.phone}
                </Typography>
              </Box>
            </FadeIn>

            <FadeIn delay={0.08}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                {socialIcons.map(({ key, icon: Icon }, index) => (
                  <FadeIn key={key} delay={index * 0.06}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${rgba(theme.light, 0.18)}`,
                        color: theme.light,
                      }}
                    >
                      <Icon size={15} />
                    </Box>
                  </FadeIn>
                ))}
              </Stack>
            </FadeIn>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CompanySiteTemplate;
