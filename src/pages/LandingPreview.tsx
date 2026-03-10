import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import TemplateEngine from "../landingTemplates/templateEngine/TemplateEngine";
import { BusinessData } from "../landingTemplates/types/BusinessData";
import { getIndustryEntry, getIndustryKeys } from "../components/publicComponents/Home/industryPreview/industryRegistry";

// ─── Sample data per template category ────────────────────────────────────────

const SERVICE_DATA: BusinessData = {
  name: "Apex Studio",
  tagline: "Creative design and digital strategy for forward-thinking brands.",
  description: "A full-service creative studio specializing in branding, web design, and digital marketing.",
  primaryColor: "#378C92",
  secondaryColor: "#D3EB63",
  services: [
    { name: "Brand Identity", description: "Logo, color systems, typography, and brand guidelines.", price: "From $1,500" },
    { name: "Web Design & Dev", description: "Beautiful, performant websites built on modern frameworks.", price: "From $3,000" },
    { name: "Digital Marketing", description: "SEO, content strategy, and paid media campaigns.", price: "From $800/mo" },
    { name: "UI/UX Design", description: "Research-backed interfaces that convert and delight.", price: "From $2,000" },
    { name: "Photography", description: "Commercial and editorial photography for brands.", price: "From $500/day" },
    { name: "Motion Graphics", description: "Animations and video content for social and web.", price: "From $1,000" },
  ],
  gallery: [
    { url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800", caption: "Brand work" },
    { url: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800", caption: "Web design" },
    { url: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800", caption: "Campaign" },
    { url: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800", caption: "Identity" },
    { url: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800", caption: "UI design" },
    { url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800", caption: "Motion" },
  ],
  reviews: [
    { author: "Alex T.", rating: 5, text: "Apex transformed our brand. Sales increased by 40% within 6 months.", date: "Jan 2026" },
    { author: "Sarah M.", rating: 5, text: "Best investment we ever made. The website converts like crazy.", date: "Dec 2025" },
    { author: "James L.", rating: 5, text: "Creative, professional, always on time. Highly recommend.", date: "Nov 2025" },
  ],
  contact: { phone: "(555) 100-2030", email: "hello@apexstudio.co", address: "230 Design District, Miami, FL 33127" },
  location: { address: "230 Design District, Miami, FL 33127" },
  socialLinks: { facebook: "#", instagram: "#", twitter: "#", linkedin: "#" },
  workingHours: [
    { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM – 3:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ],
};

const BLOG_DATA: BusinessData = {
  name: "The Techie Tribe Blog",
  tagline: "Insights, guides, and stories for the modern digital builder.",
  description: "Stay up to date with the latest in tech, business, and digital entrepreneurship.",
  primaryColor: "#378C92",
  secondaryColor: "#D3EB63",
  contact: { email: "hello@techietribe.com" },
  socialLinks: { twitter: "#", instagram: "#", linkedin: "#" },
};

const PORTFOLIO_DATA: BusinessData = {
  name: "Studio Volta",
  tagline: "Design at the intersection of art and technology.",
  description: "An award-winning creative studio building brands, digital products, and experiences.",
  primaryColor: "#111",
  secondaryColor: "#f59e0b",
  contact: { email: "hello@studiovolta.com", phone: "(555) 240-8800" },
  socialLinks: { dribbble: "#", instagram: "#", linkedin: "#", github: "#", twitter: "#" },
  stats: [
    { label: "Projects Delivered", value: "180+" },
    { label: "Happy Clients", value: "90+" },
    { label: "Awards Won", value: "24" },
    { label: "Years Active", value: "8" },
  ],
  services: [
    { name: "Brand Identity", description: "Strategy, identity systems, and visual language." },
    { name: "Web & App Design", description: "High-fidelity UI and front-end development." },
    { name: "Motion & Animation", description: "Brand films, UI motion, and interactive experiences." },
    { name: "Art Direction", description: "Visual storytelling and campaign direction." },
    { name: "Packaging Design", description: "Product packaging and retail experience." },
    { name: "UX Strategy", description: "Research, information architecture, and usability." },
  ],
  portfolioItems: [
    { title: "Nova Brand Identity", category: "Branding", client: "Nova Finance", year: "2025", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800", description: "Full brand system including logo, typography, color palette, and brand guidelines for a fintech startup.", tags: ["Branding", "Identity", "Fintech"] },
    { title: "Pulse App Redesign", category: "UI/UX", client: "Pulse Health", year: "2025", image: "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800", description: "Complete mobile app redesign focusing on accessibility and user delight.", tags: ["UI/UX", "Mobile", "Healthcare"] },
    { title: "Arcadia E-commerce", category: "Web", client: "Arcadia Goods", year: "2024", image: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800", description: "Custom e-commerce experience with editorial art direction.", tags: ["Web", "E-commerce", "Art Direction"] },
    { title: "Bloom Campaign", category: "Motion", client: "Bloom Cosmetics", year: "2024", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", description: "360° campaign including video, social, and experiential elements.", tags: ["Motion", "Campaign", "Beauty"] },
    { title: "Origin Packaging", category: "Packaging", client: "Origin Coffee", year: "2024", image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800", description: "Sustainable packaging system for a specialty coffee brand.", tags: ["Packaging", "Sustainability"] },
    { title: "Vertex SaaS Platform", category: "UI/UX", client: "Vertex Labs", year: "2023", image: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800", description: "Full product design for a B2B analytics platform.", tags: ["UI/UX", "SaaS", "Dashboard"] },
  ],
};

const STORE_DATA: BusinessData = {
  name: "Forma Shop",
  tagline: "Curated essentials for the modern workspace.",
  description: "Minimal, functional products designed to elevate your everyday environment.",
  primaryColor: "#1a1a2e",
  secondaryColor: "#378C92",
  contact: { email: "shop@formashop.co", phone: "(555) 340-9090" },
  socialLinks: { instagram: "#", twitter: "#", facebook: "#" },
  storeCategories: ["All", "Desk", "Lighting", "Storage", "Accessories"],
  reviews: [
    { author: "Lena K.", rating: 5, text: "Outstanding quality. My desk has never looked this clean and organized.", date: "Jan 2026" },
    { author: "Tom R.", rating: 5, text: "Fast shipping and the products are even better in person.", date: "Dec 2025" },
    { author: "Ava M.", rating: 4, text: "Love the minimalist design. Great value for the quality.", date: "Nov 2025" },
  ],
  products: [
    { id: "p1", name: "Oak Desk Organizer", category: "Desk", price: "$48", originalPrice: "$65", image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600", badge: "Sale", rating: 4.8, reviewCount: 124, description: "Handcrafted solid oak desk organizer with 6 compartments." },
    { id: "p2", name: "Minimal Desk Lamp", category: "Lighting", price: "$89", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600", badge: "New", rating: 4.9, reviewCount: 89, description: "Adjustable LED desk lamp with 3 color temperatures." },
    { id: "p3", name: "Cable Management Box", category: "Storage", price: "$34", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600", rating: 4.6, reviewCount: 203, description: "Clean cable box to hide power strips and cables." },
    { id: "p4", name: "Monitor Riser Stand", category: "Desk", price: "$62", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600", badge: "Popular", rating: 4.7, reviewCount: 156, description: "Bamboo monitor stand with drawer storage." },
    { id: "p5", name: "Wireless Charging Pad", category: "Accessories", price: "$29", image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600", badge: "New", rating: 4.5, reviewCount: 67, description: "Slim 15W wireless charging pad for all Qi devices." },
    { id: "p6", name: "Felt Desk Mat", category: "Desk", price: "$38", originalPrice: "$50", image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600", badge: "Sale", rating: 4.9, reviewCount: 312, description: "Premium merino wool felt desk mat, 90x40cm." },
    { id: "p7", name: "Pegboard Wall Kit", category: "Storage", price: "$95", image: "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=600", rating: 4.8, reviewCount: 78, description: "Complete wall-mounted pegboard storage system." },
    { id: "p8", name: "Pen & Card Holder", category: "Accessories", price: "$22", image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=600", rating: 4.4, reviewCount: 45, description: "Concrete pen holder with business card slot." },
  ],
};

const COMPANY_DATA: BusinessData = {
  name: "Vela",
  tagline: "Ship faster. Scale smarter.",
  description: "The all-in-one platform that helps modern teams plan, build, and launch products at speed — without the complexity.",
  primaryColor: "#4f46e5",
  secondaryColor: "#a3e635",
  contact: { email: "hello@vela.io", phone: "(555) 980-4400", address: "101 Tech Ave, San Francisco, CA 94107" },
  socialLinks: { twitter: "#", linkedin: "#", instagram: "#" },
  stats: [
    { label: "Teams Using Vela", value: "12,000+" },
    { label: "Features Shipped", value: "800K+" },
    { label: "Uptime SLA", value: "99.99%" },
    { label: "Customer Satisfaction", value: "4.9 / 5" },
  ],
  features: [
    { title: "Visual Roadmaps", description: "Drag-and-drop roadmaps that keep your whole team aligned on what's next.", icon: "🗺️" },
    { title: "Real-time Collaboration", description: "Work together live with multiplayer editing, comments, and presence indicators.", icon: "👥" },
    { title: "AI Task Assistant", description: "Auto-generate task breakdowns, acceptance criteria, and time estimates.", icon: "✨" },
    { title: "Smart Integrations", description: "Connect with GitHub, Figma, Slack, and 60+ tools your team already uses.", icon: "🔗" },
    { title: "Advanced Analytics", description: "Velocity tracking, burndown charts, and cycle time reports built in.", icon: "📊" },
    { title: "Custom Workflows", description: "Build any workflow with custom statuses, fields, and automations.", icon: "⚙️" },
  ],
  pricingPlans: [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for small teams just getting started.",
      features: ["Up to 5 members", "3 active projects", "Basic roadmaps", "Email support"],
      cta: "Get Started Free",
    },
    {
      name: "Pro",
      price: "$18",
      period: "user/mo",
      description: "For growing teams that need more power.",
      features: ["Unlimited members", "Unlimited projects", "AI task assistant", "Advanced analytics", "Priority support", "Custom workflows"],
      highlighted: true,
      cta: "Start Free Trial",
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations with advanced needs.",
      features: ["SSO / SAML", "Dedicated CSM", "SLA guarantees", "Custom integrations", "Audit logs", "Volume pricing"],
      cta: "Contact Sales",
    },
  ],
  team: [
    { name: "Arjun Mehta", role: "CEO & Co-founder", bio: "Former engineering lead at Stripe. Passionate about developer tools.", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" },
    { name: "Sofia Reyes", role: "CPO & Co-founder", bio: "Previously led product at Notion. Obsessed with simplicity.", avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=200" },
    { name: "James Liu", role: "CTO", bio: "Infrastructure architect with 15 years in distributed systems.", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" },
    { name: "Priya Nair", role: "Head of Design", bio: "Award-winning designer focused on complex product simplification.", avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200" },
  ],
  reviews: [
    { author: "Marcus D., VP Engineering", rating: 5, text: "Vela replaced 4 tools in our stack. Our sprint velocity increased 30% in the first quarter.", date: "Feb 2026" },
    { author: "Leila P., Product Lead", rating: 5, text: "The AI task assistant alone saves my team 3+ hours per week. Genuinely impressive.", date: "Jan 2026" },
    { author: "Ben T., CTO", rating: 5, text: "The most intuitive planning tool we've used. Onboarding takes minutes, not days.", date: "Dec 2025" },
  ],
};

// ─── Template slug → data mapping ─────────────────────────────────────────────

const TEMPLATE_DATA_MAP: Record<string, { templateId: string; data: BusinessData }> = {
  modern:              { templateId: "modern",              data: SERVICE_DATA },
  minimal:             { templateId: "minimal",             data: SERVICE_DATA },
  premium:             { templateId: "premium",             data: SERVICE_DATA },
  blog:                { templateId: "blog",                data: BLOG_DATA },
  "portfolio-creative":{ templateId: "portfolio-creative",  data: PORTFOLIO_DATA },
  "portfolio-agency":  { templateId: "portfolio-agency",    data: PORTFOLIO_DATA },
  "store-grid":        { templateId: "store-grid",          data: STORE_DATA },
  "store-catalog":     { templateId: "store-catalog",       data: STORE_DATA },
  company:             { templateId: "company",             data: COMPANY_DATA },
};

const ALL_TEMPLATE_SLUGS = Object.keys(TEMPLATE_DATA_MAP);

// Groups for the preview bar switcher
const TEMPLATE_GROUPS = [
  { label: "Service",   slugs: ["modern", "minimal", "premium"] },
  { label: "Blog",      slugs: ["blog"] },
  { label: "Portfolio", slugs: ["portfolio-creative", "portfolio-agency"] },
  { label: "Store",     slugs: ["store-grid", "store-catalog"] },
  { label: "Company",   slugs: ["company"] },
];

function resolveSlug(slug: string): { templateId: string; data: BusinessData } {
  // 1. Direct template slug
  if (TEMPLATE_DATA_MAP[slug]) return TEMPLATE_DATA_MAP[slug];

  // 2. Industry slug (e.g. "education", "gardening")
  const industryKeys = getIndustryKeys();
  const matchedIndustry = industryKeys.find((k) => k.toLowerCase() === slug.toLowerCase());
  if (matchedIndustry) {
    const entry = getIndustryEntry(matchedIndustry);
    return { templateId: entry.templateId, data: entry.data };
  }

  // 3. Fallback
  return { templateId: "modern", data: SERVICE_DATA };
}

// ─── Preview top bar ──────────────────────────────────────────────────────────

type PreviewDevice = "desktop" | "mobile";

const PreviewBar: React.FC<{
  slug: string;
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
}> = ({ slug, device, onDeviceChange }) => {
  const navigate = useNavigate();
  const industryKeys = getIndustryKeys();
  const isIndustry = industryKeys.some((k) => k.toLowerCase() === slug.toLowerCase());

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 9999,
        bgcolor: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: { xs: 2, md: 3 },
        py: 1,
        flexWrap: "wrap",
        minHeight: 48,
      }}
    >
      <IconButton
        size="small"
        onClick={() => navigate(-1)}
        sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff" }, flexShrink: 0 }}
      >
        <ArrowBackIcon fontSize="small" />
      </IconButton>

      {/* Device switcher */}
      <Stack direction="row" spacing={0.5} sx={{ mr: 0.5, flexShrink: 0 }}>
        <IconButton
          size="small"
          onClick={() => onDeviceChange("desktop")}
          aria-label="Desktop preview"
          sx={{
            color: device === "desktop" ? "#fff" : "rgba(255,255,255,0.45)",
            bgcolor: device === "desktop" ? "rgba(255,255,255,0.16)" : "transparent",
            border: "1px solid",
            borderColor: device === "desktop" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
            borderRadius: 1,
            "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.12)" },
          }}
        >
          <DesktopWindowsOutlinedIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDeviceChange("mobile")}
          aria-label="Mobile preview"
          sx={{
            color: device === "mobile" ? "#fff" : "rgba(255,255,255,0.45)",
            bgcolor: device === "mobile" ? "rgba(255,255,255,0.16)" : "transparent",
            border: "1px solid",
            borderColor: device === "mobile" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
            borderRadius: 1,
            "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.12)" },
          }}
        >
          <SmartphoneOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* Industry chips (only when viewing an industry) */}
      {isIndustry && (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {industryKeys.map((k) => (
            <Chip
              key={k}
              label={k}
              size="small"
              onClick={() => navigate(`/landing-preview/${k.toLowerCase()}`, { replace: true })}
              sx={{
                bgcolor: k.toLowerCase() === slug ? "#378C92" : "rgba(255,255,255,0.08)",
                color: k.toLowerCase() === slug ? "#fff" : "rgba(255,255,255,0.55)",
                fontWeight: k.toLowerCase() === slug ? 700 : 400,
                cursor: "pointer",
                "&:hover": { bgcolor: k.toLowerCase() === slug ? "#378C92" : "rgba(255,255,255,0.15)" },
              }}
            />
          ))}
        </Stack>
      )}

      {/* Template group switcher */}
      {!isIndustry && (
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          {TEMPLATE_GROUPS.map((group) => (
            <Box key={group.label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)", mr: 0.5, letterSpacing: 1, fontSize: "0.6rem", textTransform: "uppercase" }}>
                {group.label}
              </Typography>
              {group.slugs.map((s) => {
                const shortLabel = s.replace(`${group.label.toLowerCase()}-`, "").replace("portfolio-", "");
                return (
                  <Chip
                    key={s}
                    label={s === "blog" ? "Blog" : s === "company" ? "Company" : shortLabel.charAt(0).toUpperCase() + shortLabel.slice(1)}
                    size="small"
                    onClick={() => navigate(`/landing-preview/${s}`, { replace: true })}
                    sx={{
                      bgcolor: s === slug ? "#378C92" : "rgba(255,255,255,0.08)",
                      color: s === slug ? "#fff" : "rgba(255,255,255,0.55)",
                      fontWeight: s === slug ? 700 : 400,
                      cursor: "pointer",
                      "&:hover": { bgcolor: s === slug ? "#378C92" : "rgba(255,255,255,0.15)" },
                      fontSize: "0.7rem",
                    }}
                  />
                );
              })}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

// ─── Page ──────────────────────────────────────────────────────────────────────

const LandingPreview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { templateId: slug = "modern" } = useParams<{ templateId: string }>();
  const isEmbeddedPreview = searchParams.get("embed") === "1";
  const { templateId, data } = resolveSlug(slug);
  const [device, setDevice] = React.useState<PreviewDevice>("desktop");

  if (isEmbeddedPreview) {
    return <TemplateEngine templateId={templateId} data={data} />;
  }

  return (
    <>
      <PreviewBar slug={slug} device={device} onDeviceChange={setDevice} />
      {device === "desktop" ? (
        <Box sx={{ pt: "48px" }}>
          <TemplateEngine templateId={templateId} data={data} />
        </Box>
      ) : (
        <Box
          sx={{
            pt: "56px",
            minHeight: "100vh",
            bgcolor: "#0d0f12",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            px: 2,
            pb: 3,
          }}
        >
          <Box
            sx={{
              width: 390,
              maxWidth: "100%",
              height: "calc(100vh - 72px)",
              bgcolor: "#000",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
            }}
          >
            <Box
              component="iframe"
              title="Mobile template preview"
              src={`/landing-preview/${slug}?embed=1`}
              loading="eager"
              sx={{
                border: 0,
                width: "100%",
                height: "100%",
                display: "block",
                bgcolor: "#fff",
              }}
            />
          </Box>
        </Box>
      )}
    </>
  );
};

export default LandingPreview;
