/**
 * GalleryBlock — Step 10.2 Masonry & Carousel Variants
 *                Step 14.9 Gallery Masonry Enhancement
 *
 * Renders the GALLERY block in 3 variants:
 *   - grid     (default): MUI Grid layout, fixed 200px image height
 *   - masonry  : CSS multi-column, natural image heights
 *   - carousel : Horizontal scroll with snap + arrow navigation
 *
 * Step 14.9 additions:
 *   - imageGap field (sm/md/lg → 8/16/24px) applied to masonry column-gap + grid spacing
 *   - imageBorderRadius field (0/4/8/16px) applied to all image cards
 *   - imageAspectRatio field (auto/square/landscape/portrait) applied to grid images
 *   - Fullscreen lightbox modal with prev/next/close navigation (implements existing lightbox boolean)
 *   - Hover scale effect (transform: scale(1.02)) on all images
 *   - Lazy loading: first 2 images eager, rest lazy
 */

import React, { useRef, useCallback, useState, useEffect, memo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Modal,
  Fade,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import { BlockWrapper } from '../BlockWrapper';
import AnimatedList from '../utils/AnimatedList';

// ── Types ──────────────────────────────────────────────────────────────────────

interface GalleryImage {
  image: string;
  caption?: string;
  itemAspectRatio?: string;
}

interface GalleryBlockProps {
  content: any;
  variant?: string; // 'grid' | 'masonry' | 'carousel'
  headingColor?: string;
}

// ── Gap / Radius / AspectRatio helpers ────────────────────────────────────────

const GAP_MAP: Record<string, number> = { sm: 8, md: 16, lg: 24 };
const RADIUS_MAP: Record<string, number> = { '0': 0, '4': 4, '8': 8, '16': 16 };
const ASPECT_MAP: Record<string, string> = {
  auto: 'unset',
  square: '1 / 1',
  landscape: '16 / 9',
  portrait: '3 / 4',
};

const resolveGap = (v?: string): number => GAP_MAP[v ?? ''] ?? 16;
const resolveRadius = (v?: string): number => RADIUS_MAP[v ?? ''] ?? 0;
const resolveAspect = (v?: string): string => ASPECT_MAP[v ?? ''] ?? 'unset';

// ── Security: sanitize image src — allow http/https/relative only ────────────

const sanitizeImageSrc = (src: string): string => {
  if (!src) return '';
  if (/^(https?:)?\/\//i.test(src) || !/^[a-z][a-z0-9+\-.]*:/i.test(src)) {
    return src.replace(/[()'"\\]/g, '');
  }
  return '';
};

// ── Shared: placeholder when image URL is missing ────────────────────────────

const ImagePlaceholder: React.FC = () => (
  <Box
    sx={{
      width: '100%',
      height: 200,
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
);

// ── Shared: optional section heading ─────────────────────────────────────────

interface HeadingProps {
  text?: string;
  color?: string;
}

const SectionHeading: React.FC<HeadingProps> = ({ text, color }) => {
  if (!text) return null;
  return (
    <Typography
      variant="h3"
      component="h2"
      align="center"
      gutterBottom
      sx={{ mb: 6, fontWeight: 600, color: color || 'text.primary' }}
    >
      {text}
    </Typography>
  );
};

// ── Lightbox Modal ────────────────────────────────────────────────────────────

interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const LightboxModal: React.FC<LightboxProps> = memo(
  ({ images, currentIndex, open, onClose, onPrev, onNext }) => {
    const current = images[currentIndex];
    if (!current) return null;

    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-label="image lightbox"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Fade in={open} unmountOnExit>
          <Box
            data-testid="lightbox-modal"
            sx={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              outline: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Close button */}
            <IconButton
              aria-label="close lightbox"
              onClick={onClose}
              sx={{
                position: 'absolute',
                top: -48,
                right: 0,
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Prev arrow */}
            {images.length > 1 && (
              <IconButton
                aria-label="lightbox previous"
                onClick={onPrev}
                sx={{
                  position: 'absolute',
                  left: -56,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                }}
              >
                <ArrowBackIosNewIcon />
              </IconButton>
            )}

            {/* Image */}
            <Box
              component="img"
              src={sanitizeImageSrc(current.image)}
              alt={current.caption || `Gallery image ${currentIndex + 1}`}
              sx={{
                maxWidth: '90vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: 1,
                display: 'block',
              }}
            />

            {/* Caption */}
            {current.caption && (
              <Typography variant="body2" sx={{ color: 'white', mt: 1, textAlign: 'center' }}>
                {current.caption}
              </Typography>
            )}

            {/* Next arrow */}
            {images.length > 1 && (
              <IconButton
                aria-label="lightbox next"
                onClick={onNext}
                sx={{
                  position: 'absolute',
                  right: -56,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            )}
          </Box>
        </Fade>
      </Modal>
    );
  }
);

LightboxModal.displayName = 'LightboxModal';

// ── Grid variant ─────────────────────────────────────────────────────────────

interface GridVariantProps {
  images: GalleryImage[];
  columns: number;
  headingColor?: string;
  imageGap?: string;
  imageBorderRadius?: string;
  imageAspectRatio?: string;
  lightbox?: boolean;
  itemLayout?: Array<{ colSpan?: number; rowSpan?: number; aspectRatio?: string }>;
}

const GridVariant: React.FC<GridVariantProps> = memo(
  ({
    images,
    columns,
    headingColor,
    imageGap,
    imageBorderRadius,
    imageAspectRatio,
    lightbox,
    itemLayout,
  }) => {
    const mdCols = Math.max(1, 12 / Math.min(columns, 6));
    const gap = resolveGap(imageGap);
    const radius = resolveRadius(imageBorderRadius);
    const aspect = resolveAspect(imageAspectRatio);
    const spacingUnits = Math.max(1, Math.round(gap / 8));

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = useCallback(
      (idx: number) => {
        if (!lightbox) return;
        setLightboxIndex(idx);
        setLightboxOpen(true);
      },
      [lightbox]
    );

    const closeLightbox = useCallback(() => setLightboxOpen(false), []);
    const prevImage = useCallback(
      () => setLightboxIndex((i) => (i - 1 + images.length) % images.length),
      [images.length]
    );
    const nextImage = useCallback(
      () => setLightboxIndex((i) => (i + 1) % images.length),
      [images.length]
    );

    if (images.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No images to display
          </Typography>
        </Box>
      );
    }

    // ── CSS Grid path: activated when itemLayout is a non-empty array ──────────
    const hasItemLayout = Array.isArray(itemLayout) && itemLayout.length > 0;

    if (hasItemLayout) {
      return (
        <>
          <Box
            data-testid="css-grid-container"
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: `${gap}px`,
            }}
          >
            {images.map((img, idx) => {
              const layout = itemLayout![idx];
              const colSpan = Math.min(Math.max(layout?.colSpan ?? 1, 1), 4);
              const rowSpan = Math.min(Math.max(layout?.rowSpan ?? 1, 1), 2);
              const imgAspect = img.itemAspectRatio ? img.itemAspectRatio : aspect;
              return (
                <Box
                  key={idx}
                  sx={{
                    gridColumn: { xs: 'span 1', md: `span ${colSpan}` },
                    gridRow: `span ${rowSpan}`,
                  }}
                >
                  <Card
                    elevation={1}
                    sx={{
                      height: '100%',
                      overflow: 'hidden',
                      borderRadius: `${radius}px`,
                      cursor: lightbox ? 'pointer' : 'default',
                      transition: 'transform 0.2s ease',
                      '&:hover': { transform: 'scale(1.02)' },
                    }}
                    onClick={() => openLightbox(idx)}
                  >
                    {sanitizeImageSrc(img.image) ? (
                      <Box
                        component="img"
                        src={sanitizeImageSrc(img.image)}
                        alt={img.caption || `Gallery image ${idx + 1}`}
                        loading={idx < 2 ? 'eager' : 'lazy'}
                        sx={{
                          width: '100%',
                          height: imgAspect === 'unset' ? 200 : 'auto',
                          aspectRatio: imgAspect !== 'unset' ? imgAspect : undefined,
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                    {img.caption && (
                      <CardContent sx={{ py: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {img.caption}
                        </Typography>
                      </CardContent>
                    )}
                  </Card>
                </Box>
              );
            })}
          </Box>

          {lightbox && lightboxOpen && (
            <LightboxModal
              images={images}
              currentIndex={lightboxIndex}
              open={lightboxOpen}
              onClose={closeLightbox}
              onPrev={prevImage}
              onNext={nextImage}
            />
          )}
        </>
      );
    }

    // ── MUI Grid path (default — no itemLayout) ────────────────────────────────
    return (
      <>
        <Grid container spacing={spacingUnits}>
          <AnimatedList staggerMs={80} wrapperStyle={{ display: 'contents' }}>
            {images.map((img, idx) => (
              <Grid item xs={12} sm={6} md={mdCols as any} key={idx}>
                <Card
                  elevation={1}
                  sx={{
                    overflow: 'hidden',
                    borderRadius: `${radius}px`,
                    cursor: lightbox ? 'pointer' : 'default',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scale(1.02)' },
                  }}
                  onClick={() => openLightbox(idx)}
                >
                  {sanitizeImageSrc(img.image) ? (
                    <Box
                      component="img"
                      src={sanitizeImageSrc(img.image)}
                      alt={img.caption || `Gallery image ${idx + 1}`}
                      loading={idx < 2 ? 'eager' : 'lazy'}
                      sx={{
                        width: '100%',
                        height: aspect === 'unset' ? 200 : 'auto',
                        aspectRatio: aspect !== 'unset' ? aspect : undefined,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <ImagePlaceholder />
                  )}
                  {img.caption && (
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {img.caption}
                      </Typography>
                    </CardContent>
                  )}
                </Card>
              </Grid>
            ))}
          </AnimatedList>
        </Grid>

        {lightbox && lightboxOpen && (
          <LightboxModal
            images={images}
            currentIndex={lightboxIndex}
            open={lightboxOpen}
            onClose={closeLightbox}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </>
    );
  }
);

GridVariant.displayName = 'GridVariant';

// ── Masonry variant ───────────────────────────────────────────────────────────

interface MasonryVariantProps {
  images: GalleryImage[];
  columns: number;
  imageGap?: string;
  imageBorderRadius?: string;
  lightbox?: boolean;
}

const MasonryVariant: React.FC<MasonryVariantProps> = memo(
  ({ images, columns, imageGap, imageBorderRadius, lightbox }) => {
    const colCount = Math.min(Math.max(1, columns), 4);
    const gap = resolveGap(imageGap);
    const radius = resolveRadius(imageBorderRadius);

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = useCallback(
      (idx: number) => {
        if (!lightbox) return;
        setLightboxIndex(idx);
        setLightboxOpen(true);
      },
      [lightbox]
    );

    const closeLightbox = useCallback(() => setLightboxOpen(false), []);
    const prevImage = useCallback(
      () => setLightboxIndex((i) => (i - 1 + images.length) % images.length),
      [images.length]
    );
    const nextImage = useCallback(
      () => setLightboxIndex((i) => (i + 1) % images.length),
      [images.length]
    );

    if (images.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No images to display
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <Box
          data-testid="masonry-container"
          sx={{
            columnCount: colCount,
            columnGap: `${gap}px`,
          }}
        >
          <AnimatedList staggerMs={60}>
            {images.map((img, idx) => (
              <Box
                key={idx}
                sx={{
                  breakInside: 'avoid',
                  marginBottom: `${gap}px`,
                  cursor: lightbox ? 'pointer' : 'default',
                }}
                onClick={() => openLightbox(idx)}
              >
                <Card
                  elevation={1}
                  sx={{
                    overflow: 'hidden',
                    borderRadius: `${radius}px`,
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scale(1.02)' },
                  }}
                >
                  {sanitizeImageSrc(img.image) ? (
                    <Box
                      component="img"
                      src={sanitizeImageSrc(img.image)}
                      alt={img.caption || `Gallery image ${idx + 1}`}
                      loading={idx < 2 ? 'eager' : 'lazy'}
                      sx={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  ) : (
                    <ImagePlaceholder />
                  )}
                  {img.caption && (
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {img.caption}
                      </Typography>
                    </CardContent>
                  )}
                </Card>
              </Box>
            ))}
          </AnimatedList>
        </Box>

        {lightbox && lightboxOpen && (
          <LightboxModal
            images={images}
            currentIndex={lightboxIndex}
            open={lightboxOpen}
            onClose={closeLightbox}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </>
    );
  }
);

MasonryVariant.displayName = 'MasonryVariant';

// ── Carousel variant ──────────────────────────────────────────────────────────

const SCROLL_STEP = 300;

interface CarouselVariantProps {
  images: GalleryImage[];
  imageBorderRadius?: string;
  autoRotate?: boolean;
  autoRotateInterval?: number;
}

const CarouselVariant: React.FC<CarouselVariantProps> = memo(
  ({ images, imageBorderRadius, autoRotate = false, autoRotateInterval = 5000 }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isPaused = useRef(false);
    const radius = resolveRadius(imageBorderRadius);
    const interval = Math.min(15000, Math.max(2000, autoRotateInterval));

    const scrollLeft = useCallback(() => {
      scrollRef.current?.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
    }, []);

    const scrollRight = useCallback(() => {
      scrollRef.current?.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
    }, []);

    // Auto-rotate: scroll right, wrap to start at end
    useEffect(() => {
      if (!autoRotate || images.length <= 1) return;
      const timer = setInterval(() => {
        if (isPaused.current) return;
        const el = scrollRef.current;
        if (!el) return;
        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
        if (atEnd) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
        }
      }, interval);
      return () => clearInterval(timer);
    }, [autoRotate, interval, images.length]);

    const handleMouseEnter = useCallback(() => {
      isPaused.current = true;
    }, []);
    const handleMouseLeave = useCallback(() => {
      isPaused.current = false;
    }, []);

    if (images.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No images to display
          </Typography>
        </Box>
      );
    }

    return (
      <Box position="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {/* Left arrow */}
        <IconButton
          aria-label="scroll gallery left"
          onClick={scrollLeft}
          sx={{
            position: 'absolute',
            left: -20,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': { bgcolor: 'grey.100' },
          }}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>

        {/* Scrollable track */}
        <Box
          ref={scrollRef}
          data-testid="carousel-scroll-container"
          sx={{
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            gap: 2,
            pb: 1,
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {images.map((img, idx) => (
            <Box
              key={idx}
              sx={{
                flexShrink: 0,
                width: { xs: '85%', sm: '45%', md: '30%' },
                scrollSnapAlign: 'start',
              }}
            >
              <Card
                elevation={1}
                sx={{
                  overflow: 'hidden',
                  borderRadius: `${radius}px`,
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'scale(1.02)' },
                }}
              >
                {img.image ? (
                  <Box
                    component="img"
                    src={img.image}
                    alt={img.caption || `Gallery image ${idx + 1}`}
                    loading={idx < 2 ? 'eager' : 'lazy'}
                    sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                ) : (
                  <ImagePlaceholder />
                )}
                {img.caption && (
                  <CardContent sx={{ py: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {img.caption}
                    </Typography>
                  </CardContent>
                )}
              </Card>
            </Box>
          ))}
        </Box>

        {/* Right arrow */}
        <IconButton
          aria-label="scroll gallery right"
          onClick={scrollRight}
          sx={{
            position: 'absolute',
            right: -20,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': { bgcolor: 'grey.100' },
          }}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }
);

CarouselVariant.displayName = 'CarouselVariant';

// ── Main component ────────────────────────────────────────────────────────────

const GalleryBlock: React.FC<GalleryBlockProps> = memo(
  ({ content, variant = 'grid', headingColor }) => {
    const images: GalleryImage[] = content?.images ?? [];
    const columns = Math.max(1, Number(content?.columns) || 3);

    const renderVariant = () => {
      switch (variant) {
        case 'masonry':
          return (
            <MasonryVariant
              images={images}
              columns={columns}
              imageGap={content?.imageGap}
              imageBorderRadius={content?.imageBorderRadius}
              lightbox={content?.lightbox}
            />
          );
        case 'carousel':
          return (
            <CarouselVariant
              images={images}
              imageBorderRadius={content?.imageBorderRadius}
              autoRotate={content?.autoRotate}
              autoRotateInterval={content?.autoRotateInterval}
            />
          );
        default:
          return (
            <GridVariant
              images={images}
              columns={columns}
              headingColor={headingColor}
              imageGap={content?.imageGap}
              imageBorderRadius={content?.imageBorderRadius}
              imageAspectRatio={content?.imageAspectRatio}
              lightbox={content?.lightbox}
              itemLayout={content?.itemLayout}
            />
          );
      }
    };

    return (
      <BlockWrapper fields={content ?? {}}>
        <Box sx={{ bgcolor: 'background.default' }}>
          <Container maxWidth="lg">
            <SectionHeading text={content?.heading} color={headingColor} />
            {renderVariant()}
          </Container>
        </Box>
      </BlockWrapper>
    );
  }
);

GalleryBlock.displayName = 'GalleryBlock';

export default GalleryBlock;
