/**
 * Block Renderer - Renders individual blocks based on their type
 * This component displays the visual content for template blocks
 */

import React, { useState } from "react";
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
