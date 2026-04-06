/**
 * Block Renderer - Renders individual blocks based on their type
 * This component displays the visual content for template blocks
 */

import React, { useState, lazy, Suspense } from "react";

// Lazy-load FormBuilderBlock for code splitting (Step 2.29.2)
const FormBuilderBlock = lazy(() => import("./dynamic/FormBuilderBlock"));

// Lazy-load BlogFeedBlock for code splitting (Step 2.23)
const BlogFeedBlock = lazy(() => import("./dynamic/BlogFeedBlock"));

// Lazy-load BlogArticleBlock for code splitting (Step 2.24)
const BlogArticleBlock = lazy(() => import("./dynamic/BlogArticleBlock"));

// Lazy-load ProductShowcaseBlock for code splitting (Step 2.26)
const ProductShowcaseBlock = lazy(
  () => import("./dynamic/ProductShowcaseBlock"),
);

// Lazy-load DirectoryListingBlock for code splitting (Step 2.27)
const DirectoryListingBlock = lazy(
  () => import("./dynamic/DirectoryListingBlock"),
);

// Lazy-load embed and menu display blocks for code splitting (Step 2.29B)
const SocialEmbedBlock = lazy(() => import("./blocks/SocialEmbedBlock"));
const EmbedBlock = lazy(() => import("./blocks/EmbedBlock"));
const MenuDisplayBlock = lazy(() => import("./blocks/MenuDisplayBlock"));

// Lazy-load newsletter and reviews blocks for code splitting (Step 2.28)
const NewsletterBlock = lazy(() => import("./blocks/NewsletterBlock"));
const ReviewsBlock = lazy(() => import("./dynamic/ReviewsBlock"));
// Lazy-load MapLocationBlock for code splitting (Step 2.28.1)
const MapLocationBlock = lazy(() => import("./blocks/MapLocationBlock"));

// Lazy-load EventsListBlock for code splitting (Step 2.29C)
const EventsListBlock = lazy(() => import("./dynamic/EventsListBlock"));

// Block components (Step 2.29A)
import BeforeAfterBlock from "./blocks/BeforeAfterBlock";
import AnnouncementBarBlock from "./blocks/AnnouncementBarBlock";
import LogoCarouselBlock from "./blocks/LogoCarouselBlock";
import CountdownBlock from "./blocks/CountdownBlock";
// Block components (Step 2.29A.1-2, 2.29A.7)
import TabsBlock from "./blocks/TabsBlock";
import StepsProcessBlock from "./blocks/StepsProcessBlock";
import TableBlock from "./blocks/TableBlock";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  TextField,
  Alert,
} from "@mui/material";
import DOMPurify from "dompurify";
import {
  Business as BusinessIcon,
  Build as BuildIcon,
  Support as SupportIcon,
  Verified as VerifiedIcon,
  Public as GlobalIcon,
  Lightbulb as InnovationIcon,
  Assessment as AnalyticsIcon,
  Computer as TechnologyIcon,
  School as TrainingIcon,
  Code as CodeIcon,
  Palette as PaletteIcon,
  Videocam as VideoIcon,
  TrendingUp as ChartIcon,
  Campaign as AdsIcon,
  Share as SocialIcon,
  Restaurant as ChefIcon,
  Home as HomeIcon,
  FitnessCenter as FitnessCenterIcon,
  MenuBook as CertIcon,
  Web as WebIcon,
  Star as StarIcon,
} from "@mui/icons-material";

interface Block {
  id: number;
  blockType: string;
  content: any;
  sortOrder: number;
}

interface BlockRendererProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
  onFormSubmit?: (formName: string, success: boolean) => void;
}

/**
 * Maps icon names from templates to Material-UI icon components
 */
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType> = {
    business: BusinessIcon,
    build: BuildIcon,
    support: SupportIcon,
    verified: VerifiedIcon,
    global: GlobalIcon,
    innovation: InnovationIcon,
    analytics: AnalyticsIcon,
    technology: TechnologyIcon,
    training: TrainingIcon,
    code: CodeIcon,
    palette: PaletteIcon,
    video: VideoIcon,
    chart: ChartIcon,
    ads: AdsIcon,
    social: SocialIcon,
    chef: ChefIcon,
    home: HomeIcon,
    fitness: FitnessCenterIcon,
    cert: CertIcon,
    web: WebIcon,
    integrity: VerifiedIcon,
    excellence: StarIcon,
    consulting: BusinessIcon,
    strategy: AnalyticsIcon,
    design: PaletteIcon,
    local: HomeIcon,
    ambiance: StarIcon,
    rent: HomeIcon,
    invest: ChartIcon,
    class: FitnessCenterIcon,
    nutrition: FitnessCenterIcon,
    expert: StarIcon,
    flexible: StarIcon,
    automation: BuildIcon,
    integration: TechnologyIcon,
  };

  return iconMap[iconName.toLowerCase()] || StarIcon;
};

const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  primaryColor = "#2563eb",
  secondaryColor = "#64748b",
  headingColor = "#1e293b",
  bodyColor = "#475569",
  onCtaClick,
  onFormSubmit,
}) => {
  const { blockType, content } = block;
  const navigate = useNavigate();
  const basePrimaryColor =
    primaryColor.length === 9 ? primaryColor.slice(0, 7) : primaryColor;

  /**
   * Check if a URL is internal (relative or same domain)
   */
  const isInternalLink = (url: string): boolean => {
    if (!url) return false;
    // Relative paths are internal
    if (url.startsWith("/")) return true;
    // Hash links are internal
    if (url.startsWith("#")) return true;
    // External links start with http:// or https://
    if (url.startsWith("http://") || url.startsWith("https://")) return false;
    // Everything else is considered internal
    return true;
  };

  /**
   * Handle CTA button clicks - navigate for internal links, open in same tab for external
   */
  const handleCtaClick = (url: string, ctaText?: string) => {
    if (!url || url === "#") return;

    // Track CTA click if analytics is enabled
    if (onCtaClick && ctaText) {
      onCtaClick(blockType, ctaText);
    }

    if (isInternalLink(url)) {
      navigate(url);
    } else {
      window.location.href = url;
    }
  };

  switch (blockType) {
    case "HERO":
      return (
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${basePrimaryColor}dd 100%)`,
            color: "white",
            py: 8,
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                color: "white",
              }}
            >
              {content.heading || "Welcome"}
            </Typography>
            <Typography
              variant="h5"
              sx={{ mb: 4, opacity: 0.9, maxWidth: "600px", color: "white" }}
            >
              {content.subheading || "Discover amazing content"}
            </Typography>
            {content.ctaText && (
              <Button
                variant="contained"
                size="large"
                onClick={() => handleCtaClick(content.ctaLink, content.ctaText)}
                sx={{
                  bgcolor: "white",
                  color: primaryColor,
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.9)",
                  },
                }}
              >
                {content.ctaText}
              </Button>
            )}
          </Container>
        </Box>
      );

    case "FEATURES":
      return (
        <Box sx={{ py: 8, bgcolor: "background.default" }}>
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ mb: 6, fontWeight: 600, color: headingColor }}
            >
              {content.heading || "Features"}
            </Typography>
            <Grid container spacing={4}>
              {content.features?.map((feature: any, index: number) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card
                    elevation={2}
                    sx={{
                      height: "100%",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {feature.icon &&
                        (() => {
                          const IconComponent = getIconComponent(feature.icon);
                          return (
                            <Avatar
                              sx={{
                                bgcolor: primaryColor,
                                width: 56,
                                height: 56,
                                mb: 2,
                              }}
                            >
                              <IconComponent />
                            </Avatar>
                          );
                        })()}
                      <Typography
                        variant="h5"
                        component="h3"
                        gutterBottom
                        sx={{ color: primaryColor, fontWeight: 600 }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: bodyColor }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      );

    case "TESTIMONIALS":
      return (
        <Box sx={{ py: 8, bgcolor: "grey.50" }}>
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ mb: 6, fontWeight: 600, color: headingColor }}
            >
              {content.heading || "What Our Clients Say"}
            </Typography>
            <Grid container spacing={4}>
              {content.testimonials?.map((testimonial: any, index: number) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card elevation={1} sx={{ p: 3 }}>
                    <Typography
                      variant="body1"
                      sx={{ mb: 2, fontStyle: "italic", color: bodyColor }}
                    >
                      "{testimonial.quote}"
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: headingColor }}
                    >
                      {testimonial.author}
                    </Typography>
                    {(testimonial.position || testimonial.role) && (
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.position || testimonial.role}
                      </Typography>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      );

    case "CTA":
      return (
        <Box
          sx={{
            py: 10,
            background: `linear-gradient(135deg, ${basePrimaryColor}ee 0%, ${primaryColor} 100%)`,
            color: "white",
            textAlign: "center",
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 700, mb: 3, color: "white" }}
            >
              {content.heading || "Ready to Get Started?"}
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, opacity: 0.95, color: "white" }}
            >
              {content.subheading ||
                "Join us today and transform your business"}
            </Typography>
            {content.ctaText && (
              <Button
                variant="contained"
                size="large"
                onClick={() => handleCtaClick(content.ctaLink, content.ctaText)}
                sx={{
                  bgcolor: "white",
                  color: primaryColor,
                  px: 5,
                  py: 2,
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.9)",
                  },
                }}
              >
                {content.ctaText}
              </Button>
            )}
          </Container>
        </Box>
      );

    case "CONTACT":
      // Form state
      const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
      });
      const [formStatus, setFormStatus] = useState<
        "idle" | "success" | "error"
      >("idle");

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual form submission to backend
        console.log("Contact form submitted:", formData);
        const success = true; // Would be based on actual API response
        setFormStatus("success");

        // Track form submission
        if (onFormSubmit) {
          onFormSubmit("contact", success);
        }

        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setFormStatus("idle"), 5000);
      };

      const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      return (
        <Box sx={{ py: 8 }}>
          <Container maxWidth="md">
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ mb: 4, fontWeight: 600, color: headingColor }}
            >
              {content.heading || "Get In Touch"}
            </Typography>
            <Card elevation={2} sx={{ p: 4 }}>
              <Typography
                variant="body1"
                sx={{ mb: 3, textAlign: "center", color: bodyColor }}
              >
                {content.description || "Contact us for more information"}
              </Typography>

              {/* Contact Information */}
              <Box sx={{ mb: content.showForm ? 3 : 0 }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 500, color: bodyColor }}
                >
                  Email: {content.email || "contact@example.com"}
                </Typography>
                {content.phone && (
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: 500, color: bodyColor }}
                  >
                    Phone: {content.phone}
                  </Typography>
                )}
                {content.address && (
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: bodyColor }}
                  >
                    Address: {content.address}
                  </Typography>
                )}
              </Box>

              {/* Contact Form - Only show if showForm is true */}
              {content.showForm && (
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mt: 3,
                  }}
                >
                  {formStatus === "success" && (
                    <Alert severity="success">
                      Thank you! Your message has been sent successfully.
                    </Alert>
                  )}
                  {formStatus === "error" && (
                    <Alert severity="error">
                      Sorry, there was an error sending your message. Please try
                      again.
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    multiline
                    rows={4}
                    variant="outlined"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: primaryColor,
                      "&:hover": {
                        bgcolor: primaryColor,
                        opacity: 0.9,
                      },
                    }}
                  >
                    Send Message
                  </Button>
                </Box>
              )}
            </Card>
          </Container>
        </Box>
      );

    case "TEXT":
      return (
        <Box sx={{ py: 6 }}>
          <Container maxWidth="md">
            {content.heading && (
              <Typography
                variant="h3"
                component="h2"
                gutterBottom
                sx={{ mb: 4, fontWeight: 600, color: headingColor }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(content.heading),
                }}
              />
            )}
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.8,
                fontSize: "1.1rem",
                color: bodyColor,
              }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(content.body || ""),
              }}
            />
          </Container>
        </Box>
      );

    case "FORM_BUILDER":
      return (
        <Suspense
          fallback={
            <Box sx={{ py: 8 }}>
              <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary">
                  Loading form…
                </Typography>
              </Container>
            </Box>
          }
        >
          <FormBuilderBlock block={block} primaryColor={primaryColor} />
        </Suspense>
      );

    case "BEFORE_AFTER":
      return (
        <BeforeAfterBlock
          block={block}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          headingColor={headingColor}
          bodyColor={bodyColor}
          onCtaClick={onCtaClick}
        />
      );

    case "ANNOUNCEMENT_BAR":
      return (
        <AnnouncementBarBlock
          block={block}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          headingColor={headingColor}
          bodyColor={bodyColor}
          onCtaClick={onCtaClick}
        />
      );

    case "LOGO_CAROUSEL":
      return (
        <LogoCarouselBlock
          block={block}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          headingColor={headingColor}
          bodyColor={bodyColor}
          onCtaClick={onCtaClick}
        />
      );

    case "COUNTDOWN":
      return (
        <CountdownBlock
          block={block}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          headingColor={headingColor}
          bodyColor={bodyColor}
          onCtaClick={onCtaClick}
        />
      );

    case "TABS":
      return (
        <TabsBlock
          block={block}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          headingColor={headingColor}
          bodyColor={bodyColor}
          onCtaClick={onCtaClick}
        />
      );

    case "STEPS_PROCESS":
      return (
        <StepsProcessBlock
          block={block}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          headingColor={headingColor}
          bodyColor={bodyColor}
          onCtaClick={onCtaClick}
        />
      );

    case "TABLE":
      return (
        <TableBlock
          block={block}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          headingColor={headingColor}
          bodyColor={bodyColor}
          onCtaClick={onCtaClick}
        />
      );

    case "BLOG_FEED":
      return (
        <Suspense
          fallback={
            <Box sx={{ py: 8 }}>
              <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary">
                  Loading blog feed…
                </Typography>
              </Container>
            </Box>
          }
        >
          <BlogFeedBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </Suspense>
      );

    case "BLOG_ARTICLE":
      return (
        <Suspense
          fallback={
            <Box sx={{ py: 8 }}>
              <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary">
                  Loading article…
                </Typography>
              </Container>
            </Box>
          }
        >
          <BlogArticleBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </Suspense>
      );

    case "PRODUCT_SHOWCASE":
      return (
        <Suspense
          fallback={
            <Box sx={{ py: 8 }}>
              <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary">
                  Loading products…
                </Typography>
              </Container>
            </Box>
          }
        >
          <ProductShowcaseBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </Suspense>
      );

    case "DIRECTORY_LISTING":
      return (
        <Suspense
          fallback={
            <Box sx={{ py: 8 }}>
              <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary">
                  Loading directory…
                </Typography>
              </Container>
            </Box>
          }
        >
          <DirectoryListingBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </Suspense>
      );

    case "SOCIAL_EMBED":
      return (
        <Suspense
          fallback={
            <Box sx={{ py: 8 }}>
              <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary">
                  Loading social embeds…
                </Typography>
              </Container>
            </Box>
          }
        >
          <SocialEmbedBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </Suspense>
      );

    case "EMBED":
      return (
        <Suspense
          fallback={
            <Box sx={{ py: 8 }}>
              <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary">
                  Loading embed…
                </Typography>
              </Container>
            </Box>
          }
        >
          <EmbedBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </Suspense>
      );

    case "MENU_DISPLAY":
      return (
        <Suspense
          fallback={
            <Box sx={{ py: 8 }}>
              <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary">
                  Loading menu…
                </Typography>
              </Container>
            </Box>
          }
        >
          <MenuDisplayBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </Suspense>
      );

    case "EVENTS_LIST":
      return (
        <Suspense
          fallback={
            <Box sx={{ py: 8 }}>
              <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary">
                  Loading events…
                </Typography>
              </Container>
            </Box>
          }
        >
          <EventsListBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </Suspense>
      );

    case "MAP_LOCATION":
      return (
        <Suspense
          fallback={
            <Box sx={{ py: 8 }}>
              <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary">
                  Loading map…
                </Typography>
              </Container>
            </Box>
          }
        >
          <MapLocationBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </Suspense>
      );

    case "NEWSLETTER":
      return (
        <Suspense
          fallback={
            <Box sx={{ py: 8 }}>
              <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary">
                  Loading newsletter…
                </Typography>
              </Container>
            </Box>
          }
        >
          <NewsletterBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </Suspense>
      );

    case "REVIEWS":
      return (
        <Suspense
          fallback={
            <Box sx={{ py: 8 }}>
              <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary">
                  Loading reviews…
                </Typography>
              </Container>
            </Box>
          }
        >
          <ReviewsBlock
            block={block}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingColor={headingColor}
            bodyColor={bodyColor}
            onCtaClick={onCtaClick}
          />
        </Suspense>
      );

    case "IMAGE":
      return (
        <Box sx={{ py: 6, textAlign: content.alignment || "center" }}>
          <Container maxWidth="lg">
            {content.heading && (
              <Typography
                variant="h3"
                component="h2"
                gutterBottom
                sx={{ fontWeight: 600, color: headingColor }}
              >
                {content.heading}
              </Typography>
            )}
            {content.image ? (
              <Box
                component="img"
                src={content.image}
                alt={content.alt || "Image"}
                sx={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 1,
                }}
              />
            ) : (
              <Box
                sx={{
                  py: 4,
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No image set
                </Typography>
              </Box>
            )}
            {content.caption && (
              <Typography
                variant="body2"
                sx={{ mt: 1, color: bodyColor, fontStyle: "italic" }}
              >
                {content.caption}
              </Typography>
            )}
          </Container>
        </Box>
      );

    case "NAVBAR":
      return (
        <Box
          component="nav"
          sx={{
            py: 1.5,
            px: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
            ...(content.sticky
              ? { position: "sticky", top: 0, zIndex: 1100 }
              : {}),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {content.logo && (
              <Box
                component="img"
                src={content.logo}
                alt={content.brandName || "Logo"}
                sx={{ height: 36 }}
              />
            )}
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: headingColor }}
            >
              {content.brandName || "Brand"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
            {content.navigationItems?.map(
              (item: { label: string; link: string }, idx: number) => (
                <Typography
                  key={idx}
                  component="a"
                  href={item.link}
                  sx={{
                    textDecoration: "none",
                    color: bodyColor,
                    fontWeight: 500,
                    "&:hover": { color: primaryColor },
                  }}
                >
                  {item.label}
                </Typography>
              ),
            )}
            {content.ctaText && (
              <Button
                variant="contained"
                size="small"
                onClick={() => handleCtaClick(content.ctaLink, content.ctaText)}
                sx={{ bgcolor: primaryColor }}
              >
                {content.ctaText}
              </Button>
            )}
          </Box>
        </Box>
      );

    case "FOOTER":
      return (
        <Box
          component="footer"
          sx={{ py: 6, bgcolor: "grey.900", color: "grey.300" }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              {content.columns?.map(
                (
                  col: {
                    title: string;
                    links: { label: string; url: string }[];
                  },
                  idx: number,
                ) => (
                  <Grid item xs={12} sm={6} md key={idx}>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 700, color: "white" }}
                    >
                      {col.title}
                    </Typography>
                    {col.links?.map(
                      (
                        link: { label: string; url: string },
                        linkIdx: number,
                      ) => (
                        <Typography
                          key={linkIdx}
                          component="a"
                          href={link.url}
                          display="block"
                          sx={{
                            color: "grey.400",
                            textDecoration: "none",
                            mb: 0.5,
                            "&:hover": { color: "white" },
                          }}
                        >
                          {link.label}
                        </Typography>
                      ),
                    )}
                  </Grid>
                ),
              )}
            </Grid>
            {content.copyright && (
              <Typography
                variant="body2"
                sx={{
                  mt: 4,
                  pt: 3,
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  textAlign: "center",
                  color: "grey.500",
                }}
              >
                {content.copyright}
              </Typography>
            )}
          </Container>
        </Box>
      );

    case "GALLERY":
      return (
        <Box sx={{ py: 8, bgcolor: "background.default" }}>
          <Container maxWidth="lg">
            {content.heading && (
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{ mb: 6, fontWeight: 600, color: headingColor }}
              >
                {content.heading}
              </Typography>
            )}
            <Grid container spacing={2}>
              {content.images?.map(
                (img: { image: string; caption?: string }, idx: number) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={12 / Math.min(Number(content.columns) || 3, 6)}
                    key={idx}
                  >
                    <Card elevation={1} sx={{ overflow: "hidden" }}>
                      {img.image ? (
                        <Box
                          component="img"
                          src={img.image}
                          alt={img.caption || `Gallery image ${idx + 1}`}
                          sx={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: 200,
                            bgcolor: "grey.200",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No image
                          </Typography>
                        </Box>
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
                ),
              )}
            </Grid>
          </Container>
        </Box>
      );

    case "PRICING":
      return (
        <Box sx={{ py: 8, bgcolor: "grey.50" }}>
          <Container maxWidth="lg">
            {content.heading && (
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{ mb: 6, fontWeight: 600, color: headingColor }}
              >
                {content.heading}
              </Typography>
            )}
            <Grid container spacing={4} justifyContent="center">
              {content.plans?.map(
                (
                  plan: {
                    name: string;
                    price: string;
                    features: string[];
                    ctaText?: string;
                    ctaLink?: string;
                    highlighted?: boolean;
                  },
                  idx: number,
                ) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Card
                      elevation={plan.highlighted ? 8 : 2}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        border: plan.highlighted
                          ? `2px solid ${primaryColor}`
                          : "none",
                        position: "relative",
                        overflow: "visible",
                      }}
                    >
                      {plan.highlighted && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: -12,
                            left: "50%",
                            transform: "translateX(-50%)",
                            bgcolor: primaryColor,
                            color: "white",
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          Popular
                        </Box>
                      )}
                      <CardContent
                        sx={{
                          p: 4,
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 700, mb: 1, color: headingColor }}
                        >
                          {plan.name}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{ fontWeight: 700, mb: 3, color: primaryColor }}
                        >
                          {plan.price}
                        </Typography>
                        <Box sx={{ flex: 1, mb: 3 }}>
                          {plan.features?.map((f: string, fIdx: number) => (
                            <Typography
                              key={fIdx}
                              variant="body2"
                              sx={{ py: 0.5, color: bodyColor }}
                            >
                              {f}
                            </Typography>
                          ))}
                        </Box>
                        {plan.ctaText && (
                          <Button
                            variant={
                              plan.highlighted ? "contained" : "outlined"
                            }
                            fullWidth
                            onClick={() =>
                              handleCtaClick(plan.ctaLink || "#", plan.ctaText)
                            }
                            sx={
                              plan.highlighted
                                ? { bgcolor: primaryColor }
                                : {
                                    borderColor: primaryColor,
                                    color: primaryColor,
                                  }
                            }
                          >
                            {plan.ctaText}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ),
              )}
            </Grid>
          </Container>
        </Box>
      );

    case "FAQ":
      return (
        <Box sx={{ py: 8 }}>
          <Container maxWidth="md">
            {content.heading && (
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{ mb: 6, fontWeight: 600, color: headingColor }}
              >
                {content.heading}
              </Typography>
            )}
            {content.items?.map(
              (item: { question: string; answer: string }, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    mb: 3,
                    pb: 3,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1, color: headingColor }}
                  >
                    {item.question}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: bodyColor, lineHeight: 1.8 }}
                  >
                    {item.answer}
                  </Typography>
                </Box>
              ),
            )}
          </Container>
        </Box>
      );

    case "STATS":
      return (
        <Box sx={{ py: 8, bgcolor: primaryColor, color: "white" }}>
          <Container maxWidth="lg">
            {content.heading && (
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{ mb: 6, fontWeight: 700, color: "white" }}
              >
                {content.heading}
              </Typography>
            )}
            <Grid container spacing={4} justifyContent="center">
              {content.stats?.map(
                (
                  stat: {
                    number: string;
                    label: string;
                    prefix?: string;
                    suffix?: string;
                  },
                  idx: number,
                ) => (
                  <Grid
                    item
                    xs={6}
                    md={4}
                    key={idx}
                    sx={{ textAlign: "center" }}
                  >
                    <Typography
                      variant="h2"
                      sx={{ fontWeight: 800, color: "white" }}
                    >
                      {stat.prefix || ""}
                      {stat.number}
                      {stat.suffix || ""}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ opacity: 0.85, color: "white" }}
                    >
                      {stat.label}
                    </Typography>
                  </Grid>
                ),
              )}
            </Grid>
          </Container>
        </Box>
      );

    case "TEAM":
      return (
        <Box sx={{ py: 8, bgcolor: "background.default" }}>
          <Container maxWidth="lg">
            {content.heading && (
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{ mb: 6, fontWeight: 600, color: headingColor }}
              >
                {content.heading}
              </Typography>
            )}
            <Grid container spacing={4} justifyContent="center">
              {content.members?.map(
                (
                  member: {
                    name: string;
                    role: string;
                    bio?: string;
                    avatar?: string;
                  },
                  idx: number,
                ) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Card elevation={2} sx={{ textAlign: "center", p: 3 }}>
                      <Avatar
                        src={member.avatar || undefined}
                        sx={{
                          width: 80,
                          height: 80,
                          mx: "auto",
                          mb: 2,
                          bgcolor: primaryColor,
                          fontSize: "2rem",
                        }}
                      >
                        {!member.avatar && member.name?.[0]}
                      </Avatar>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: headingColor }}
                      >
                        {member.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: primaryColor, mb: 1 }}
                      >
                        {member.role}
                      </Typography>
                      {member.bio && (
                        <Typography variant="body2" sx={{ color: bodyColor }}>
                          {member.bio}
                        </Typography>
                      )}
                    </Card>
                  </Grid>
                ),
              )}
            </Grid>
          </Container>
        </Box>
      );

    case "VIDEO":
      return (
        <Box sx={{ py: 6 }}>
          <Container
            maxWidth={
              content.maxWidth === "small"
                ? "sm"
                : content.maxWidth === "medium"
                  ? "md"
                  : "lg"
            }
          >
            {content.heading && (
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{ mb: 4, fontWeight: 600, color: headingColor }}
              >
                {content.heading}
              </Typography>
            )}
            {content.videoUrl ? (
              <Box
                sx={{
                  position: "relative",
                  paddingTop:
                    content.aspectRatio === "4:3"
                      ? "75%"
                      : content.aspectRatio === "1:1"
                        ? "100%"
                        : "56.25%",
                  overflow: "hidden",
                  borderRadius: 1,
                }}
              >
                {content.videoUrl.includes("youtube") ||
                content.videoUrl.includes("vimeo") ? (
                  <Box
                    component="iframe"
                    src={content.videoUrl}
                    title={content.heading || "Video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                  />
                ) : (
                  <Box
                    component="video"
                    src={content.videoUrl}
                    controls={content.showControls !== false}
                    autoPlay={content.autoplay || false}
                    muted={content.muted !== false}
                    loop={content.loop || false}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  py: 8,
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No video URL set
                </Typography>
              </Box>
            )}
            {content.caption && (
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  textAlign: "center",
                  color: bodyColor,
                  fontStyle: "italic",
                }}
              >
                {content.caption}
              </Typography>
            )}
          </Container>
        </Box>
      );

    default:
      return (
        <Box sx={{ py: 4, bgcolor: "warning.light" }}>
          <Container>
            <Typography variant="body2">
              Unknown block type: {blockType}
            </Typography>
          </Container>
        </Box>
      );
  }
};

export default BlockRenderer;
