/**
 * CollageBlock — Step 14.6
 *
 * Asymmetric image collage with optional center text panel.
 * Three layout variants:
 *   - left-center-right : 12-col CSS Grid, left 3 cols (2 stacked images),
 *                          center 6 cols (text + CTA), right 3 cols (2 stacked images)
 *   - two-column        : configurable column ratio side-by-side images
 *   - scattered         : images at arbitrary grid spans, text overlay on largest
 *
 * Mobile: all variants collapse to single column (grid-template-columns: 1fr).
 */

import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { BlockWrapper } from '../BlockWrapper';
import { getStaggerDelay } from '../hooks/useBlockAnimation';

// ── Types ──────────────────────────────────────────────────────────────────────

interface CollageImage {
  image: string;
  caption?: string;
  link?: string;
}

interface CollageTextContent {
  heading?: string;
  body?: string;
}

interface CollageBlockProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  headingColor?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COLUMN_RATIO_MAP: Record<string, string> = {
  equal: '1fr 1fr',
  'wide-left': '1.15fr 0.85fr',
  'wide-right': '0.85fr 1.15fr',
};

const STAGGER_EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

// ── Security: sanitize image src — allow http/https/relative only ─────────────

const sanitizeImageSrc = (src: string): string => {
  if (!src) return '';
  if (/^(https?:\/\/|\/)/i.test(src)) return src;
  return '';
};

// ── Shared: animated image item wrapper ──────────────────────────────────────

interface AnimatedImageProps {
  img: CollageImage;
  index: number;
  height: number | { xs: number; md: number | string };
  sx?: object;
}

const AnimatedImage: React.FC<AnimatedImageProps> = ({ img, index, height, sx }) => {
  const src = sanitizeImageSrc(img.image);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px 0px' }}
      transition={{
        duration: 0.5,
        delay: getStaggerDelay(index, 0, 80) / 1000,
        ease: STAGGER_EASE,
      }}
      style={{ position: 'relative' }}
    >
      {src ? (
        <Box
          component="img"
          src={src}
          alt={img.caption || `Collage image ${index + 1}`}
          sx={{
            width: '100%',
            height,
            objectFit: 'cover',
            borderRadius: '8px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            display: 'block',
            ...sx,
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height,
            borderRadius: '8px',
            bgcolor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...sx,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No image
          </Typography>
        </Box>
      )}
    </motion.div>
  );
};

// ── Layout: left-center-right ─────────────────────────────────────────────────

interface LeftCenterRightProps {
  images: CollageImage[];
  textContent?: CollageTextContent;
  ctaText?: string;
  ctaLink?: string;
}

const LeftCenterRightLayout: React.FC<LeftCenterRightProps> = ({
  images,
  textContent,
  ctaText,
  ctaLink,
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
      gap: 2,
    }}
  >
    {/* Left panel: images[0] and images[1] stacked */}
    <Box
      sx={{
        gridColumn: { xs: '1 / -1', md: '1 / 4' },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {images[0] && (
        <Box sx={{ mb: 2 }}>
          <AnimatedImage img={images[0]} index={0} height={200} />
        </Box>
      )}
      {images[1] && <AnimatedImage img={images[1]} index={1} height={200} />}
    </Box>

    {/* Center panel: text + CTA */}
    <Box
      sx={{
        gridColumn: { xs: '1 / -1', md: '4 / 10' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 0, md: 4 },
        py: { xs: 3, md: 0 },
      }}
    >
      {textContent?.heading && (
        <Typography
          variant="h3"
          component="h3"
          gutterBottom
          sx={{ fontWeight: 700, textAlign: 'center' }}
        >
          {textContent.heading}
        </Typography>
      )}
      {textContent?.body && (
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 3 }}>
          {textContent.body}
        </Typography>
      )}
      {ctaText && ctaLink && (
        <Button variant="contained" href={ctaLink} size="medium">
          {ctaText}
        </Button>
      )}
    </Box>

    {/* Right panel: images[3] and images[4] stacked */}
    <Box
      sx={{
        gridColumn: { xs: '1 / -1', md: '10 / 13' },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {images[3] && (
        <Box sx={{ mb: 2 }}>
          <AnimatedImage img={images[3]} index={3} height={200} />
        </Box>
      )}
      {images[4] && <AnimatedImage img={images[4]} index={4} height={200} />}
    </Box>
  </Box>
);

// ── Layout: two-column ────────────────────────────────────────────────────────

interface TwoColumnProps {
  images: CollageImage[];
  columnRatio: string;
}

const TwoColumnLayout: React.FC<TwoColumnProps> = ({ images, columnRatio }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        md: COLUMN_RATIO_MAP[columnRatio] ?? COLUMN_RATIO_MAP.equal,
      },
      gap: 3,
    }}
  >
    {/* Left: single large image */}
    <Box>{images[0] && <AnimatedImage img={images[0]} index={0} height={340} />}</Box>

    {/* Right: two stacked smaller images */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {images[1] && <AnimatedImage img={images[1]} index={1} height={160} />}
      {images[2] && <AnimatedImage img={images[2]} index={2} height={160} />}
    </Box>
  </Box>
);

// ── Layout: scattered ─────────────────────────────────────────────────────────

interface ScatteredProps {
  images: CollageImage[];
  textContent?: CollageTextContent;
  ctaText?: string;
  ctaLink?: string;
}

const ScatteredLayout: React.FC<ScatteredProps> = ({ images, textContent, ctaText, ctaLink }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: 'repeat(6, 1fr)' },
      gridTemplateRows: { xs: 'auto', md: 'repeat(3, 140px)' },
      gap: 2,
    }}
  >
    {/* images[0] — LARGEST, occupies 3 cols × 2 rows, has text overlay */}
    {images[0] && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px 0px' }}
        transition={{ duration: 0.5, delay: getStaggerDelay(0, 0, 80) / 1000, ease: STAGGER_EASE }}
        style={{
          gridColumn: 'span 1',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            gridColumn: { xs: '1 / -1', md: '1 / 4' },
            gridRow: { xs: 'auto', md: '1 / 3' },
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '8px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            height: { xs: 220, md: '100%' },
          }}
        >
          {sanitizeImageSrc(images[0].image) ? (
            <Box
              component="img"
              src={sanitizeImageSrc(images[0].image)}
              alt={images[0].caption || 'Collage image 1'}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No image
              </Typography>
            </Box>
          )}
          {/* Text overlay on largest image */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              background: 'rgba(0,0,0,0.55)',
            }}
          >
            {textContent?.heading && (
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                {textContent.heading}
              </Typography>
            )}
            {ctaText && ctaLink && (
              <Button href={ctaLink} variant="contained" size="small" sx={{ mt: 1 }}>
                {ctaText}
              </Button>
            )}
          </Box>
        </Box>
      </motion.div>
    )}

    {/* images[1] — top right */}
    {images[1] && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px 0px' }}
        transition={{ duration: 0.5, delay: getStaggerDelay(1, 0, 80) / 1000, ease: STAGGER_EASE }}
        style={{ position: 'relative' }}
      >
        <Box
          sx={{
            gridColumn: { xs: '1 / -1', md: '4 / 7' },
            gridRow: { xs: 'auto', md: '1 / 2' },
            overflow: 'hidden',
            borderRadius: '8px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            height: { xs: 220, md: '100%' },
          }}
        >
          {sanitizeImageSrc(images[1].image) ? (
            <Box
              component="img"
              src={sanitizeImageSrc(images[1].image)}
              alt={images[1].caption || 'Collage image 2'}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.200' }} />
          )}
        </Box>
      </motion.div>
    )}

    {/* images[2] — mid right (4-6 cols, row 2) */}
    {images[2] && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px 0px' }}
        transition={{ duration: 0.5, delay: getStaggerDelay(2, 0, 80) / 1000, ease: STAGGER_EASE }}
        style={{ position: 'relative' }}
      >
        <Box
          sx={{
            gridColumn: { xs: '1 / -1', md: '4 / 6' },
            gridRow: { xs: 'auto', md: '2 / 3' },
            overflow: 'hidden',
            borderRadius: '8px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            height: { xs: 220, md: '100%' },
          }}
        >
          {sanitizeImageSrc(images[2].image) ? (
            <Box
              component="img"
              src={sanitizeImageSrc(images[2].image)}
              alt={images[2].caption || 'Collage image 3'}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.200' }} />
          )}
        </Box>
      </motion.div>
    )}

    {/* images[3] — narrow tall right column (col 6, rows 2-4) */}
    {images[3] && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px 0px' }}
        transition={{ duration: 0.5, delay: getStaggerDelay(3, 0, 80) / 1000, ease: STAGGER_EASE }}
        style={{ position: 'relative' }}
      >
        <Box
          sx={{
            gridColumn: { xs: '1 / -1', md: '6 / 7' },
            gridRow: { xs: 'auto', md: '2 / 4' },
            overflow: 'hidden',
            borderRadius: '8px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            height: { xs: 220, md: '100%' },
          }}
        >
          {sanitizeImageSrc(images[3].image) ? (
            <Box
              component="img"
              src={sanitizeImageSrc(images[3].image)}
              alt={images[3].caption || 'Collage image 4'}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.200' }} />
          )}
        </Box>
      </motion.div>
    )}

    {/* images[4] — bottom left (cols 1-3, row 3) */}
    {images[4] && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px 0px' }}
        transition={{ duration: 0.5, delay: getStaggerDelay(4, 0, 80) / 1000, ease: STAGGER_EASE }}
        style={{ position: 'relative' }}
      >
        <Box
          sx={{
            gridColumn: { xs: '1 / -1', md: '1 / 3' },
            gridRow: { xs: 'auto', md: '3 / 4' },
            overflow: 'hidden',
            borderRadius: '8px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            height: { xs: 220, md: '100%' },
          }}
        >
          {sanitizeImageSrc(images[4].image) ? (
            <Box
              component="img"
              src={sanitizeImageSrc(images[4].image)}
              alt={images[4].caption || 'Collage image 5'}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.200' }} />
          )}
        </Box>
      </motion.div>
    )}

    {/* images[5] — bottom mid (cols 3-6, row 3) */}
    {images[5] && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px 0px' }}
        transition={{ duration: 0.5, delay: getStaggerDelay(5, 0, 80) / 1000, ease: STAGGER_EASE }}
        style={{ position: 'relative' }}
      >
        <Box
          sx={{
            gridColumn: { xs: '1 / -1', md: '3 / 6' },
            gridRow: { xs: 'auto', md: '3 / 4' },
            overflow: 'hidden',
            borderRadius: '8px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            height: { xs: 220, md: '100%' },
          }}
        >
          {sanitizeImageSrc(images[5].image) ? (
            <Box
              component="img"
              src={sanitizeImageSrc(images[5].image)}
              alt={images[5].caption || 'Collage image 6'}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.200' }} />
          )}
        </Box>
      </motion.div>
    )}
  </Box>
);

// ── Main component ────────────────────────────────────────────────────────────

const CollageBlock = React.memo(function CollageBlock({
  content,
  headingColor,
}: CollageBlockProps) {
  const {
    heading,
    description,
    images = [],
    textContent,
    ctaText,
    ctaLink,
    layout = 'left-center-right',
    columnRatio = 'equal',
  } = content;

  const renderLayout = () => {
    if (images.length === 0) return null;

    switch (layout) {
      case 'two-column':
        return <TwoColumnLayout images={images} columnRatio={columnRatio} />;
      case 'scattered':
        return (
          <ScatteredLayout
            images={images}
            textContent={textContent}
            ctaText={ctaText}
            ctaLink={ctaLink}
          />
        );
      case 'left-center-right':
      default:
        return (
          <LeftCenterRightLayout
            images={images}
            textContent={textContent}
            ctaText={ctaText}
            ctaLink={ctaLink}
          />
        );
    }
  };

  return (
    <BlockWrapper fields={content}>
      <Container maxWidth="lg">
        {heading && (
          <Typography
            variant="h2"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 2,
              color: headingColor || 'text.primary',
            }}
          >
            {heading}
          </Typography>
        )}
        {description && (
          <Typography variant="body1" align="center" sx={{ mb: 6, color: 'text.secondary' }}>
            {description}
          </Typography>
        )}
        {renderLayout()}
      </Container>
    </BlockWrapper>
  );
});

export default CollageBlock;
