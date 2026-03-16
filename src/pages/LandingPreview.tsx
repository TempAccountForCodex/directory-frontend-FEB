import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import TemplateEngine from "../landingTemplates/templateEngine/TemplateEngine";
import { BusinessData } from "../landingTemplates/types/BusinessData";
import {
  getIndustryEntry,
  getIndustryKeys,
} from "../components/publicComponents/Home/industryPreview/industryRegistry";

// ─── Sample data per template category ────────────────────────────────────────

const SERVICE_DATA: BusinessData = {
  name: "Apex Studio",
  tagline: "Creative design and digital strategy for forward-thinking brands.",
  description:
    "A full-service creative studio specializing in branding, web design, and digital marketing.",
  primaryColor: "#378C92",
  secondaryColor: "#D3EB63",
  services: [
    {
      name: "Brand Identity",
      description: "Logo, color systems, typography, and brand guidelines.",
      price: "From $1,500",
    },
    {
      name: "Web Design & Dev",
      description: "Beautiful, performant websites built on modern frameworks.",
      price: "From $3,000",
    },
    {
      name: "Digital Marketing",
      description: "SEO, content strategy, and paid media campaigns.",
      price: "From $800/mo",
    },
    {
      name: "UI/UX Design",
      description: "Research-backed interfaces that convert and delight.",
      price: "From $2,000",
    },
    {
      name: "Photography",
      description: "Commercial and editorial photography for brands.",
      price: "From $500/day",
    },
    {
      name: "Motion Graphics",
      description: "Animations and video content for social and web.",
      price: "From $1,000",
    },
  ],
  gallery: [
    {
      url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
      caption: "Brand work",
    },
    {
      url: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800",
      caption: "Web design",
    },
    {
      url: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800",
      caption: "Campaign",
    },
    {
      url: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800",
      caption: "Identity",
    },
    {
      url: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800",
      caption: "UI design",
    },
    {
      url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800",
      caption: "Motion",
    },
  ],
  reviews: [
    {
      author: "Alex T.",
      rating: 5,
      text: "Apex transformed our brand. Sales increased by 40% within 6 months.",
      date: "Jan 2026",
    },
    {
      author: "Sarah M.",
      rating: 5,
      text: "Best investment we ever made. The website converts like crazy.",
      date: "Dec 2025",
    },
    {
      author: "James L.",
      rating: 5,
      text: "Creative, professional, always on time. Highly recommend.",
      date: "Nov 2025",
    },
  ],
  contact: {
    phone: "(555) 100-2030",
    email: "hello@apexstudio.co",
    address: "230 Design District, Miami, FL 33127",
  },
  location: { address: "230 Design District, Miami, FL 33127" },
  socialLinks: { facebook: "#", instagram: "#", twitter: "#", linkedin: "#" },
  workingHours: [
    { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM – 3:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ],
};

const BLOG_DATA: BusinessData = {
  name: "Agrob",
  tagline: "Sustainable insights for modern agricultural growth.",
  description:
    "We share common trends and strategies for improving your rental making sure in high demand of service unique blocks, you can nd making sure you stay.",
  primaryColor: "#97c93c",
  secondaryColor: "#dcebb9",
  contact: { email: "hello@agrob.com" },
  socialLinks: { twitter: "#", instagram: "#", linkedin: "#" },
  blogPosts: [
    {
      id: "blog-1",
      title: "How Soil Health Planning Creates More Resilient Harvest Cycles",
      description:
        "A practical framework for improving crop consistency through better planning, monitoring, and regenerative field decisions.",
      content:
        "Healthy soil strategy is one of the strongest predictors of consistent agricultural output. This article explores monitoring, crop rotation support, nutrient discipline, and how seasonal planning decisions affect long-term resilience.",
      image:
        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80",
      category: "Soil Health",
      publishedAt: "2026-02-24T09:00:00.000Z",
      author: "Agro Insight Team",
      slug: "soil-health-planning-harvest-cycles",
    },
    {
      id: "blog-2",
      title: "Delivery Windows and Field Operations: What Teams Need to Track",
      description:
        "A cleaner operating model for scheduling field work, equipment availability, and supplier coordination.",
      content:
        "Operational predictability improves when delivery schedules and field tasks are treated as one system. This guide explains the checkpoints teams should use to reduce missed windows and unnecessary idle time.",
      image:
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
      category: "Operations",
      publishedAt: "2026-02-19T09:00:00.000Z",
      author: "Mariam Yusuf",
      slug: "delivery-windows-field-operations",
    },
    {
      id: "blog-3",
      title: "Seedling Quality Control Before Planting Season Scales",
      description:
        "What experienced growers check before expanding planting volume across multiple zones.",
      content:
        "Seedling readiness affects later yield far more than most teams account for. This article covers staging, inspection, handling, and the early signals that help teams intervene before losses compound.",
      image:
        "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80",
      category: "Crop Planning",
      publishedAt: "2026-02-12T09:00:00.000Z",
      author: "Ayaan Rehman",
      slug: "seedling-quality-control",
    },
    {
      id: "blog-4",
      title: "What Modern Farm Visibility Looks Like for High-Trust Brands",
      description:
        "From product presentation to educational content, trust now begins before the first inquiry.",
      content:
        "Modern agriculture brands need visibility that feels credible and easy to understand. This piece explains how content, imagery, and clear storytelling improve market trust and buying confidence.",
      image:
        "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=80",
      category: "Brand Growth",
      publishedAt: "2026-02-07T09:00:00.000Z",
      author: "Agro Insight Team",
      slug: "modern-farm-visibility",
    },
    {
      id: "blog-5",
      title: "Equipment Readiness Checklists for Faster Seasonal Turnarounds",
      description:
        "A compact maintenance checklist that helps field teams reduce preventable downtime.",
      content:
        "Small readiness gaps often become expensive interruptions during peak weeks. This article outlines inspection routines, scheduling practices, and simple reporting habits that improve reliability.",
      image:
        "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80",
      category: "Equipment",
      publishedAt: "2026-01-31T09:00:00.000Z",
      author: "Hassan Noor",
      slug: "equipment-readiness-checklists",
    },
    {
      id: "blog-6",
      title: "How Smarter Water Planning Supports Better Field Performance",
      description:
        "An overview of irrigation discipline, seasonal forecasting, and practical monitoring systems.",
      content:
        "Water planning works best when operational discipline and environmental forecasting are connected. This article explores the routines teams use to improve consistency while reducing waste.",
      image:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      category: "Irrigation",
      publishedAt: "2026-01-24T09:00:00.000Z",
      author: "Agro Insight Team",
      slug: "smarter-water-planning",
    },
  ],
};

const BLOG_PREMIUM_DATA: BusinessData = {
  name: "indise.",
  tagline:
    "Premium insights for modern founders, operators, and finance teams.",
  description:
    "A premium editorial blog template for business strategy, finance operations, and practical startup guidance.",
  primaryColor: "#49d56b",
  secondaryColor: "#d8caea",
  contact: { email: "hello@indise.com", phone: "(555) 240-1188" },
  socialLinks: { twitter: "#", instagram: "#", linkedin: "#" },
  blogPosts: [
    {
      id: "blog-1",
      title: "Everything you need to know about VAT for your business",
      description:
        "A practical breakdown of registration, reporting, and operating habits that keep growing companies compliant.",
      content:
        "VAT becomes easier to manage once ownership, invoicing, filing cadence, and documentation standards are made explicit inside the company.",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
      category: "Business Creators",
      publishedAt: "2026-03-05T09:00:00.000Z",
      author: "Indise. Editorial",
      slug: "vat-for-your-business",
    },
    {
      id: "blog-2",
      title: "What are the tax obligations for companies in their first year?",
      description:
        "The first 12 months set the tone for every filing, payroll, and bookkeeping decision that follows.",
      content:
        "New companies benefit from early clarity on filings, reserves, payroll setup, and entity-specific deadlines before complexity compounds.",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
      category: "Creators",
      publishedAt: "2026-03-03T09:00:00.000Z",
      author: "Rhea Morgan",
      slug: "first-year-tax-obligations",
    },
    {
      id: "blog-3",
      title: "Everything you need to know about VAT for your small business",
      description:
        "A tighter framework for founders who need to manage compliance without a full finance team.",
      content:
        "Small teams need a lean process with clear invoice rules, filing reminders, and one visible owner for tax operations.",
      image:
        "https://img.freepik.com/free-photo/business-people-shaking-hands-together_53876-13391.jpg",
      category: "Creators",
      publishedAt: "2026-02-28T09:00:00.000Z",
      author: "Sana Patel",
      slug: "vat-small-business",
    },
    {
      id: "blog-4",
      title:
        "2026 startup finance checklist for founders hiring their first team",
      description:
        "Cash controls, payroll planning, and tax hygiene before operating complexity compounds.",
      content:
        "Hiring adds payroll, benefits, approvals, expense policies, and more frequent reporting cycles that need structure early.",
      image:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
      category: "Operations",
      publishedAt: "2026-02-23T09:00:00.000Z",
      author: "Indise. Editorial",
      slug: "startup-finance-checklist",
    },
    {
      id: "blog-5",
      title: "Quarterly bookkeeping habits that stop year-end panic",
      description:
        "A straightforward review rhythm for revenue, expenses, liabilities, and documentation quality.",
      content:
        "Teams that close cleanly each quarter spend less time fixing historical errors and more time making better decisions.",
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
      category: "Accounting",
      publishedAt: "2026-02-18T09:00:00.000Z",
      author: "Milo Chen",
      slug: "bookkeeping-habits",
    },
    {
      id: "blog-6",
      title: "How finance teams prepare investor-ready reporting packs",
      description:
        "The metrics, narrative structure, and supporting detail that make updates useful instead of noisy.",
      content:
        "Investor reporting depends on consistent metrics, concise explanations, and a repeatable pack that updates quickly.",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
      category: "Finance",
      publishedAt: "2026-02-14T09:00:00.000Z",
      author: "Nina Roberts",
      slug: "investor-reporting-packs",
    },
  ],
};

const PORTFOLIO_DATA: BusinessData = {
  name: "Studio Volta",
  tagline: "Design at the intersection of art and technology.",
  description:
    "An award-winning creative studio building brands, digital products, and experiences.",
  primaryColor: "#111",
  secondaryColor: "#f59e0b",
  contact: { email: "hello@studiovolta.com", phone: "(555) 240-8800" },
  socialLinks: {
    dribbble: "#",
    instagram: "#",
    linkedin: "#",
    github: "#",
    twitter: "#",
  },
  stats: [
    { label: "Projects Delivered", value: "180+" },
    { label: "Happy Clients", value: "90+" },
    { label: "Awards Won", value: "24" },
    { label: "Years Active", value: "8" },
  ],
  services: [
    {
      name: "Brand Identity",
      description: "Strategy, identity systems, and visual language.",
    },
    {
      name: "Web & App Design",
      description: "High-fidelity UI and front-end development.",
    },
    {
      name: "Motion & Animation",
      description: "Brand films, UI motion, and interactive experiences.",
    },
    {
      name: "Art Direction",
      description: "Visual storytelling and campaign direction.",
    },
    {
      name: "Packaging Design",
      description: "Product packaging and retail experience.",
    },
    {
      name: "UX Strategy",
      description: "Research, information architecture, and usability.",
    },
  ],
  portfolioItems: [
    {
      title: "Nova Brand Identity",
      category: "Branding",
      client: "Nova Finance",
      year: "2025",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
      description:
        "Full brand system including logo, typography, color palette, and brand guidelines for a fintech startup.",
      tags: ["Branding", "Identity", "Fintech"],
    },
    {
      title: "Pulse App Redesign",
      category: "UI/UX",
      client: "Pulse Health",
      year: "2025",
      image: "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800",
      description:
        "Complete mobile app redesign focusing on accessibility and user delight.",
      tags: ["UI/UX", "Mobile", "Healthcare"],
    },
    {
      title: "Arcadia E-commerce",
      category: "Web",
      client: "Arcadia Goods",
      year: "2024",
      image:
        "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800",
      description: "Custom e-commerce experience with editorial art direction.",
      tags: ["Web", "E-commerce", "Art Direction"],
    },
    {
      title: "Bloom Campaign",
      category: "Motion",
      client: "Bloom Cosmetics",
      year: "2024",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      description:
        "360° campaign including video, social, and experiential elements.",
      tags: ["Motion", "Campaign", "Beauty"],
    },
    {
      title: "Origin Packaging",
      category: "Packaging",
      client: "Origin Coffee",
      year: "2024",
      image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800",
      description: "Sustainable packaging system for a specialty coffee brand.",
      tags: ["Packaging", "Sustainability"],
    },
    {
      title: "Vertex SaaS Platform",
      category: "UI/UX",
      client: "Vertex Labs",
      year: "2023",
      image:
        "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800",
      description: "Full product design for a B2B analytics platform.",
      tags: ["UI/UX", "SaaS", "Dashboard"],
    },
  ],
};

const STORE_DATA: BusinessData = {
  name: "Forma Shop",
  tagline: "Curated essentials for the modern workspace.",
  description:
    "Minimal, functional products designed to elevate your everyday environment.",
  primaryColor: "#1a1a2e",
  secondaryColor: "#378C92",
  contact: { email: "shop@formashop.co", phone: "(555) 340-9090" },
  socialLinks: { instagram: "#", twitter: "#", facebook: "#" },
  storeCategories: ["All", "Desk", "Lighting", "Storage", "Accessories"],
  reviews: [
    {
      author: "Lena K.",
      rating: 5,
      text: "Outstanding quality. My desk has never looked this clean and organized.",
      date: "Jan 2026",
    },
    {
      author: "Tom R.",
      rating: 5,
      text: "Fast shipping and the products are even better in person.",
      date: "Dec 2025",
    },
    {
      author: "Ava M.",
      rating: 4,
      text: "Love the minimalist design. Great value for the quality.",
      date: "Nov 2025",
    },
  ],
  products: [
    {
      id: "p1",
      name: "Oak Desk Organizer",
      category: "Desk",
      price: "$48",
      originalPrice: "$65",
      image:
        "https://img.freepik.com/free-photo/interior-lifestyle-decoration-room-white_1203-4467.jpg?uid=R205766258&ga=GA1.1.355267885.1764683677&semt=ais_rp_progressive&w=740&q=80",
      badge: "Sale",
      rating: 4.8,
      reviewCount: 124,
      description: "Handcrafted solid oak desk organizer with 6 compartments.",
    },
    {
      id: "p2",
      name: "Minimal Desk Lamp",
      category: "Lighting",
      price: "$89",
      image:
        "https://img.freepik.com/free-photo/desk-lamp-lit_1203-252.jpg?uid=R205766258&ga=GA1.1.355267885.1764683677&semt=ais_rp_progressive&w=740&q=80",
      badge: "New",
      rating: 4.9,
      reviewCount: 89,
      description: "Adjustable LED desk lamp with 3 color temperatures.",
    },
    {
      id: "p3",
      name: "Cable Management Box",
      category: "Storage",
      price: "$34",
      image: "https://img.freepik.com/free-photo/wingback-couch_1203-346.jpg",
      rating: 4.6,
      reviewCount: 203,
      description: "Clean cable box to hide power strips and cables.",
    },
    {
      id: "p4",
      name: "Monitor Riser Stand",
      category: "Desk",
      price: "$62",
      image:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600",
      badge: "Popular",
      rating: 4.7,
      reviewCount: 156,
      description: "Bamboo monitor stand with drawer storage.",
    },
    {
      id: "p5",
      name: "Wireless Charging Pad",
      category: "Accessories",
      price: "$29",
      image:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600",
      badge: "New",
      rating: 4.5,
      reviewCount: 67,
      description: "Slim 15W wireless charging pad for all Qi devices.",
    },
    {
      id: "p6",
      name: "Felt Desk Mat",
      category: "Desk",
      price: "$38",
      originalPrice: "$50",
      image:
        "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600",
      badge: "Sale",
      rating: 4.9,
      reviewCount: 312,
      description: "Premium merino wool felt desk mat, 90x40cm.",
    },
    {
      id: "p7",
      name: "Pegboard Wall Kit",
      category: "Storage",
      price: "$95",
      image:
        "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=600",
      rating: 4.8,
      reviewCount: 78,
      description: "Complete wall-mounted pegboard storage system.",
    },
    {
      id: "p8",
      name: "Pen & Card Holder",
      category: "Accessories",
      price: "$22",
      image:
        "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=600",
      rating: 4.4,
      reviewCount: 45,
      description: "Concrete pen holder with business card slot.",
    },
  ],
};

const STORE_PREMIUM_DATA: BusinessData = {
  name: "D. Valera",
  tagline: "Natural delights for cats",
  description:
    "D. Valera is demo content for a reusable premium store template. The structure works for pet products today, but can be adapted to beauty, fashion, home, wellness, gifting, or any curated product brand.",
  primaryColor: "#f0bc3f",
  secondaryColor: "#efe6d6",
  logoUrl: "https://cdn-icons-png.freepik.com/128/616/616408.png",
  contact: {
    email: "hello@dvalera.co",
    phone: "(555) 840-2211",
    address: "58 Mercer Street, Manhattan, New York",
  },
  socialLinks: { instagram: "#", facebook: "#", twitter: "#" },
  gallery: [
    {
      url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=2000&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?auto=format&fit=crop&w=2000&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=900&q=80",
    },
  ],
  products: [
    {
      id: "sp1",
      name: "Chicken & Salmon Feast",
      category: "Dry Food",
      price: "$29",
      badge: "Best seller",
      image:
        "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "sp2",
      name: "Healthy Crunch Blend",
      category: "Dry Food",
      price: "$24",
      badge: "New",
      image:
        "https://images.unsplash.com/photo-1604542031658-5799ca5d7936?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "sp3",
      name: "Ocean Protein Mix",
      category: "Nutrition",
      price: "$37",
      badge: "Top pick",
      image:
        "https://images.unsplash.com/photo-1571566882372-1598d88abd90?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "sp4",
      name: "Indoor Balance Formula",
      category: "Wellness",
      price: "$35",
      badge: "New",
      image:
        "https://images.unsplash.com/photo-1548681528-6a5c45b66b42?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "sp5",
      name: "Daily Vitality Bites",
      category: "Daily Use",
      price: "$31",
      badge: "Sale",
      image:
        "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80",
    },
  ],
};

const COMPANY_DATA: BusinessData = {
  name: "Atelier North",
  tagline:
    "Interior studio for residential, hospitality, and workplace projects",
  description:
    "Atelier North creates calm interior environments with a focus on materials, proportion, and everyday usability across homes, hospitality spaces, and modern workplaces.",
  primaryColor: "#111111",
  secondaryColor: "#ececec",
  contact: {
    email: "studio@ateliernorth.co",
    phone: "(415) 555-0162",
    address: "214 Howard Street, Floor 2, San Francisco, CA 94105",
  },
  socialLinks: { twitter: "#", linkedin: "#", instagram: "#", facebook: "#" },
  stats: [
    { label: "Projects completed", value: "85+" },
    { label: "Cities served", value: "12" },
    { label: "Years in practice", value: "9" },
  ],
  features: [
    {
      title: "Interior direction",
      description:
        "Concept development, palette definition, and material planning for spaces that feel refined and long-lasting.",
      icon: "◼",
    },
    {
      title: "Space planning",
      description:
        "Layouts shaped around movement, comfort, and practical day-to-day use in residential and commercial settings.",
      icon: "◼",
    },
    {
      title: "Furniture sourcing",
      description:
        "Selection support for custom pieces, lighting, textiles, and finishing elements that fit the overall concept.",
      icon: "◼",
    },
    {
      title: "Project coordination",
      description:
        "Guidance through vendor coordination, styling decisions, and on-site execution from concept to completion.",
      icon: "◼",
    },
    {
      title: "Residential projects",
      description:
        "Private homes shaped with clean lines, warm materials, and an emphasis on comfort and quiet detail.",
      icon: "◼",
    },
    {
      title: "Commercial spaces",
      description:
        "Studios, hospitality venues, and workplace interiors designed to feel clear, calm, and memorable.",
      icon: "◼",
    },
  ],
  team: [
    {
      name: "Mila Harper",
      role: "Creative director",
      bio: "Leads concept development, client direction, and the overall design language of the studio.",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=200",
    },
    {
      name: "Jonas Reed",
      role: "Project lead",
      bio: "Oversees planning, vendor coordination, and the practical side of delivery across active sites.",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    },
    {
      name: "Naomi Ellis",
      role: "Interior stylist",
      bio: "Shapes furniture, textiles, and styling layers that make each interior feel complete.",
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    },
  ],
  reviews: [
    {
      author: "Hospitality client",
      rating: 5,
      text: "The studio translated our brief into a space that feels calm, memorable, and highly functional for guests.",
      date: "March 2026",
    },
    {
      author: "Residential client",
      rating: 5,
      text: "Every room feels balanced and considered. The material choices made the whole project feel warmer and more refined.",
      date: "February 2026",
    },
  ],
};

// ─── Template slug → data mapping ─────────────────────────────────────────────

const TEMPLATE_DATA_MAP: Record<
  string,
  { templateId: string; data: BusinessData }
> = {
  blog: { templateId: "blog", data: BLOG_PREMIUM_DATA },
  "blog-premium": { templateId: "blog-premium", data: BLOG_DATA },
  "portfolio-creative": {
    templateId: "portfolio-creative",
    data: PORTFOLIO_DATA,
  },
  "portfolio-agency": { templateId: "portfolio-agency", data: PORTFOLIO_DATA },
  "store-basic": { templateId: "store-basic", data: STORE_DATA },
  "store-premium": { templateId: "store-premium", data: STORE_PREMIUM_DATA },
  company: { templateId: "company", data: COMPANY_DATA },
  "company-premium": { templateId: "company-premium", data: COMPANY_DATA },
};

const ALL_TEMPLATE_SLUGS = Object.keys(TEMPLATE_DATA_MAP);

// Groups for the preview bar switcher
const TEMPLATE_GROUPS = [
  { label: "Blog", slugs: ["blog", "blog-premium"] },
  {
    label: "Services",
    slugs: getIndustryKeys().map((key) => key.toLowerCase()),
  },
  { label: "Portfolio", slugs: ["portfolio-creative", "portfolio-agency"] },
  { label: "Store", slugs: ["store-basic", "store-premium"] },
  { label: "Company", slugs: ["company", "company-premium"] },
];

function resolveSlug(slug: string): { templateId: string; data: BusinessData } {
  // 1. Direct template slug
  if (TEMPLATE_DATA_MAP[slug]) return TEMPLATE_DATA_MAP[slug];

  // 2. Industry slug (e.g. "education", "gardening")
  const industryKeys = getIndustryKeys();
  const matchedIndustry = industryKeys.find(
    (k) => k.toLowerCase() === slug.toLowerCase(),
  );
  if (matchedIndustry) {
    const entry = getIndustryEntry(matchedIndustry);
    return { templateId: entry.templateId, data: entry.data };
  }

  // 3. Fallback
  return { templateId: "company", data: COMPANY_DATA };
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
  const industryLabelMap = new Map(
    industryKeys.map((key) => [key.toLowerCase(), key]),
  );

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
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
        sx={{
          color: "rgba(255,255,255,0.6)",
          "&:hover": { color: "#fff" },
          flexShrink: 0,
        }}
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
            bgcolor:
              device === "desktop" ? "rgba(255,255,255,0.16)" : "transparent",
            border: "1px solid",
            borderColor:
              device === "desktop"
                ? "rgba(255,255,255,0.35)"
                : "rgba(255,255,255,0.12)",
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
            bgcolor:
              device === "mobile" ? "rgba(255,255,255,0.16)" : "transparent",
            border: "1px solid",
            borderColor:
              device === "mobile"
                ? "rgba(255,255,255,0.35)"
                : "rgba(255,255,255,0.12)",
            borderRadius: 1,
            "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.12)" },
          }}
        >
          <SmartphoneOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        {TEMPLATE_GROUPS.map((group) => (
          <Box
            key={group.label}
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.35)",
                mr: 0.5,
                letterSpacing: 1,
                fontSize: "0.6rem",
                textTransform: "uppercase",
              }}
            >
              {group.label}
            </Typography>
            {group.slugs.map((s) => {
              const shortLabel = s
                .replace(`${group.label.toLowerCase()}-`, "")
                .replace("portfolio-", "");
              const chipLabel =
                industryLabelMap.get(s) ||
                (s === "blog"
                  ? "Blog"
                  : s === "blog-premium"
                    ? "Premium"
                    : s === "company"
                      ? "Company"
                      : s === "company-premium"
                        ? "Premium"
                        : shortLabel.charAt(0).toUpperCase() +
                          shortLabel.slice(1));

              return (
                <Chip
                  key={s}
                  label={chipLabel}
                  size="small"
                  onClick={() =>
                    navigate(`/landing-preview/${s}`, { replace: true })
                  }
                  sx={{
                    bgcolor: s === slug ? "#378C92" : "rgba(255,255,255,0.08)",
                    color: s === slug ? "#fff" : "rgba(255,255,255,0.55)",
                    fontWeight: s === slug ? 700 : 400,
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor:
                        s === slug ? "#378C92" : "rgba(255,255,255,0.15)",
                    },
                    fontSize: "0.7rem",
                  }}
                />
              );
            })}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

// ─── Page ──────────────────────────────────────────────────────────────────────

const LandingPreview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { templateId: slug = "company" } = useParams<{ templateId: string }>();
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
