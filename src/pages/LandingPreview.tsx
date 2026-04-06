import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import TemplateEngine from "../landingTemplates/templateEngine/TemplateEngine";
import type { BusinessData } from "../landingTemplates/types/BusinessData";
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

const PHOTO_STUDIO_DATA: BusinessData = {
  name: "Tim Joel",
  tagline: "Portrait and lifestyle photography",
  description:
    "Tim Joel is a portrait and lifestyle photographer focused on expressive editorial imagery, family storytelling, and premium studio sessions with clean visual direction.",
  heroBannerUrl:
    "https://framerusercontent.com/images/prLWrousqsCtNYW0tDFZqBVBBY.png?width=1320&height=992",
  primaryColor: "#111111",
  secondaryColor: "#ff7a1a",
  contact: {
    email: "hello@timjoel.com",
    phone: "(555) 240-8818",
    address: "233 Spring Street, New York, NY 10013",
  },
  socialLinks: { instagram: "#", twitter: "#" },
  services: [
    {
      name: "Portrait Photography",
      description:
        "Editorial and personal portrait sessions with a clean modern feel.",
    },
    {
      name: "Brand Shoots",
      description:
        "Photography for founders, campaigns, and visual brand systems.",
    },
    {
      name: "Family Sessions",
      description:
        "Warm and expressive storytelling for families and milestones.",
    },
    {
      name: "Fashion Editorial",
      description:
        "Creative direction, lighting, and imagery for premium fashion stories.",
    },
    {
      name: "Retouching & Finishing",
      description: "Color, skin, and detail refinement with a natural finish.",
    },
  ],
  stats: [
    { label: "Projects", value: "240+" },
    { label: "Client rating", value: "5★" },
    { label: "Years", value: "10+" },
  ],
  reviews: [
    {
      author: "Editorial client",
      rating: 5,
      text: "Tim brought clarity, energy, and a strong visual mood to the shoot. The final images felt premium and very alive.",
      date: "March 2026",
    },
  ],
  gallery: [
    {
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
    },
    {
      url: "https://thanksfortoday.studio/veren/wp-content/uploads/sites/95/2026/02/beauty-in-red-attractive-young-lady-with-glamorou-2026-01-09-00-22-56-utc-1.jpg",
    },
    {
      url: "https://thanksfortoday.studio/veren/wp-content/uploads/sites/95/2026/02/portrait-fashion-and-mock-up-with-a-woman-on-a-re-2026-01-09-10-10-22-utc-1.jpg",
    },
    {
      url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1200&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=900&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=900&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=900&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=900&q=80",
    },
  ],
  portfolioItems: [
    {
      title: "Winter Veiling",
      description:
        "Portrait story built around texture, shadow, and strong eye contact.",
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Newborn Soft Light",
      description:
        "A calm newborn session with delicate tones and intimate composition.",
      image:
        "https://static.wixstatic.com/media/960c32_3f98285ed5d746af9ae48fa0f82100b5~mv2.jpg",
    },
    {
      title: "Morning Bloom",
      description:
        "Lifestyle portrait with floral framing and soft natural highlights.",
      image:
        "https://img.freepik.com/free-photo/chromatic-glow-portrait-medium-shot_23-2151911132.jpg",
    },
    {
      title: "Cinematic Skincare",
      description:
        "Product-focused campaign imagery with warm studio color and detail.",
      image:
        "https://img.freepik.com/free-photo/beautiful-portrait-teenager-woman_23-2149453480.jpg",
    },
    {
      title: "Landscape Story",
      image:
        "https://img.freepik.com/free-photo/beautiful-young-woman-wearing-professional-makeup_23-2150165293.jpg",
    },
    {
      title: "Editorial Ensemble",
      image:
        "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Night City",
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Street Mood",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
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
  name: "Maison Elara",
  tagline: "Modern handbags for every day",
  description:
    "Maison Elara is demo content for a reusable premium handbag store template. The same structure can also support fashion accessories, footwear, beauty, gifting, or other curated product brands.",
  primaryColor: "#f0bc3f",
  secondaryColor: "#efe6d6",
  logoUrl: "https://cdn-icons-png.freepik.com/128/3081/3081559.png",
  contact: {
    email: "hello@maisonelara.co",
    phone: "(555) 840-2211",
    address: "58 Mercer Street, Manhattan, New York",
  },
  socialLinks: { instagram: "#", facebook: "#", twitter: "#" },
  gallery: [
    {
      url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=2000&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=2000&q=80",
    },
    {
      url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
    },
  ],
  products: [
    {
      id: "sp1",
      name: "Luna Leather Tote",
      category: "Signature Tote",
      price: "$189",
      badge: "Best seller",
      image:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "sp2",
      name: "Sienna Shoulder Bag",
      category: "Shoulder Bag",
      price: "$164",
      badge: "New",
      image:
        "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "sp3",
      name: "Noir Mini Crossbody",
      category: "Crossbody",
      price: "$142",
      badge: "Top pick",
      image:
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "sp4",
      name: "Studio Bucket Bag",
      category: "Bucket Bag",
      price: "$171",
      badge: "New",
      image:
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "sp5",
      name: "Atelier Evening Clutch",
      category: "Clutch",
      price: "$128",
      badge: "Sale",
      image:
        "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=900&q=80",
    },
  ],
};

const STORE_PERFORMANCE_DATA: BusinessData = {
  name: "Boost Lab",
  tagline: "Built for output. Designed for stronger sessions.",
  description:
    "A high-intensity store template for performance brands selling gym equipment, conditioning tools, and training accessories with a bold campaign feel.",
  primaryColor: "#46ff16",
  secondaryColor: "#050505",

  heroBannerUrl:
    "https://img.freepik.com/free-photo/modern-urban-gym_23-2151917998.jpg?t=st=1775147042~exp=1775150642~hmac=7d71d3d245434e72f31f7f4525eff0bdfd8886903c6b858ad427df9fe1821938&w=2000",

  contact: {
    email: "hello@boostlabfit.com",
    phone: "(555) 510-9988",
    address: "812 Performance Blvd, Los Angeles, CA",
  },
  socialLinks: { instagram: "#", facebook: "#", twitter: "#" },
  gallery: [
    {
      url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1800&q=80",
    },
    {
      url: "https://img.freepik.com/free-photo/kettlebell-gym-equipment-still-life_23-2151739249.jpg?t=st=1775148995~exp=1775152595~hmac=c821028786cee3a563c8d0ab004cc2abbe0c61a0ec739f152a1b3b12a8cb2246&w=2000",
    },
    {
      url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1600&q=80",
    },
  ],
  products: [
    {
      id: "spf-1",
      name: "Loop Resistance Bands",
      category: "Accessories",
      price: "$25.00",
      image:
        "https://lifefitnesspk.com/wp-content/uploads/2022/05/1-PC-APOLLO-CUSTOM-STYLE-RUBBER-DUMBBELL-2.jpg",
      description:
        "Portable loop bands for mobility, warmups, and strength sessions.",
    },
    {
      id: "spf-2",
      name: "Cast Iron Kettlebell",
      category: "Equipment",
      price: "$70.00",
      image:
        "https://lifefitnesspk.com/wp-content/uploads/2025/10/5161wevyd8L._AC_SL1001_-1-510x510.jpg",
      description: "Competition-style kettlebell for full-body power work.",
    },
    {
      id: "spf-3",
      name: "Handle Resistance Bands",
      category: "Conditioning",
      price: "$40.00",
      image:
        "https://lifefitnesspk.com/wp-content/uploads/2020/09/33_c8de602d-e4e4-40f9-b742-60cc97b5fb07_1024x1024@2x.png",
      description:
        "Heavy training rope for cardio intervals and explosive conditioning.",
    },
    {
      id: "spf-4",
      name: "Adjustable Dumbbells Set",
      category: "Accessories",
      price: "$150.00",
      image:
        "https://lifefitnesspk.com/wp-content/uploads/2024/03/S2c431265c8974034b5c72711acc8575bi.webp",
      description:
        "Adjustable speed rope for intense conditioning and agility work.",
    },
    {
      id: "spf-5",
      name: "Olympic Weight Plate",
      category: "Strength",
      price: "$95.00",
      image:
        "https://lifefitnesspk.com/wp-content/uploads/2020/06/American-Fitness-UPRIGHT-BIKE-BU-5901-1-510x510.jpg",
      description:
        "Durable weight plate for compound lifts and progressive overload work.",
    },
    {
      id: "spf-6",
      name: "Pull-Up Assist Bands",
      category: "Accessories",
      price: "$35.00",
      image:
        "https://lifefitnesspk.com/wp-content/uploads/2022/04/Agility-Hurdles-3-510x510.png",
      description:
        "Support bands for mobility work, pull-up progressions, and recovery sessions.",
    },
    {
      id: "spf-7",
      name: "Training Bench",
      category: "Equipment",
      price: "$210.00",
      image:
        "https://lifefitnesspk.com/wp-content/uploads/2021/06/Back-Support-2223-3-600x600-1-510x510.jpg",
      description:
        "Compact heavy-duty bench designed for presses, rows, and strength circuits.",
    },
    {
      id: "spf-8",
      name: "Foam Roller Pro",
      category: "Recovery",
      price: "$28.00",
      image:
        "https://lifefitnesspk.com/wp-content/uploads/2022/03/XD-2228-Jumping-Rope-510x510.png",
      description:
        "High-density roller for cooldowns, muscle prep, and day-to-day recovery.",
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
  "portfolio-photo-studio": {
    templateId: "portfolio-photo-studio",
    data: PHOTO_STUDIO_DATA,
  },
  "store-basic": { templateId: "store-basic", data: STORE_DATA },
  "store-premium": { templateId: "store-premium", data: STORE_PREMIUM_DATA },
  "store-performance": {
    templateId: "store-performance",
    data: STORE_PERFORMANCE_DATA,
  },
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
  {
    label: "Portfolio",
    slugs: ["portfolio-creative", "portfolio-agency", "portfolio-photo-studio"],
  },
  {
    label: "Store",
    slugs: ["store-basic", "store-premium", "store-performance"],
  },
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
type PreviewSection = {
  id: string;
  label: string;
};

const PREVIEW_SECTION_MAP: Record<string, PreviewSection[]> = {
  "store-premium:home": [
    { id: "home-hero", label: "Hero" },
    { id: "home-featured", label: "Featured" },
    { id: "home-story", label: "Story" },
    { id: "home-newsletter", label: "Newsletter" },
  ],
  "store-premium:shop": [
    { id: "shop-hero", label: "Banner" },
    { id: "shop-products", label: "Products" },
  ],
  "store-premium:about": [
    { id: "about-intro", label: "Intro" },
    { id: "about-why", label: "Why Choose Us" },
    { id: "about-process", label: "How We Curate" },
    { id: "about-cta", label: "CTA" },
  ],
  "store-premium:contact": [{ id: "contact-form", label: "Contact Form" }],
};

const createPreviewSectionId = (label: string, index: number) =>
  `preview-section-${
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "section"
  }-${index}`;

const formatSectionLabel = (value: string) =>
  value
    .replace(/^preview-section-/, "")
    .replace(/-\d+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const shortenSectionLabel = (label: string, fallbackIndex: number) => {
  const compact = label.replace(/\s+/g, " ").trim();
  const lower = compact.toLowerCase();

  const commonMatches = [
    "hero",
    "about",
    "contact",
    "products",
    "product",
    "services",
    "service",
    "portfolio",
    "gallery",
    "journal",
    "reviews",
    "testimonials",
    "pricing",
    "faq",
    "features",
    "feature",
    "work",
    "projects",
    "project",
    "team",
    "story",
    "newsletter",
    "banner",
    "shop",
    "why choose us",
    "why us",
  ];

  const matched = commonMatches.find((item) => lower.includes(item));
  if (matched) {
    return formatSectionLabel(matched);
  }

  const words = compact.split(" ").filter(Boolean).slice(0, 3);

  if (words.length) {
    return words.join(" ");
  }

  return `Section ${fallbackIndex + 1}`;
};

const getLikelySectionLabel = (node: HTMLElement, index: number) => {
  const explicitLabel = node.dataset.previewLabel?.trim();
  if (explicitLabel) return shortenSectionLabel(explicitLabel, index);

  if (node.id) {
    return shortenSectionLabel(formatSectionLabel(node.id), index);
  }

  const headingText = node
    .querySelector("h1, h2, h3, h4")
    ?.textContent?.trim()
    ?.replace(/\s+/g, " ");
  if (headingText) return shortenSectionLabel(headingText, index);

  const textSample = node.textContent?.trim()?.replace(/\s+/g, " ");
  if (textSample) return shortenSectionLabel(textSample.slice(0, 36), index);

  return `Section ${index + 1}`;
};

const getBranchingContainer = (doc: Document) => {
  let current = doc.getElementById("root") as HTMLElement | null;
  if (!current) return null;

  while (current && current.children.length === 1) {
    const next: Element | null = current.firstElementChild;
    if (!(next instanceof HTMLElement)) break;
    current = next;
  }

  return current;
};

const extractPreviewSections = (doc: Document): PreviewSection[] => {
  const explicitNodes = Array.from(
    doc.querySelectorAll<HTMLElement>("[data-preview-section='true']"),
  );

  if (explicitNodes.length) {
    return explicitNodes
      .map((node, index) => {
        const label = getLikelySectionLabel(node, index);
        if (!node.id) node.id = createPreviewSectionId(label, index);
        return { id: node.id, label };
      })
      .filter((section) => Boolean(section.id && section.label))
      .slice(0, 12);
  }

  const headingNodes = Array.from(
    doc.querySelectorAll<HTMLElement>(
      "main h1, main h2, main h3, [role='main'] h1, [role='main'] h2, [role='main'] h3, body h1, body h2, body h3",
    ),
  ).filter((node) => {
    const text = node.textContent?.trim() || "";
    if (!text || text.length < 3 || text.length > 60) return false;
    if (node.closest("header, nav, footer")) return false;
    return true;
  });

  const headingSections = headingNodes
    .map((node, index) => {
      const label = getLikelySectionLabel(node, index);
      if (!node.id) node.id = createPreviewSectionId(label, index);
      return { id: node.id, label };
    })
    .filter(
      (section, index, array) =>
        array.findIndex((item) => item.label === section.label) === index,
    )
    .slice(0, 12);

  if (headingSections.length > 1) {
    return headingSections;
  }

  const branchingContainer = getBranchingContainer(doc);
  const topLevelCandidates = branchingContainer
    ? Array.from(branchingContainer.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      )
    : [];

  return topLevelCandidates
    .filter((node) => {
      const tagName = node.tagName.toLowerCase();
      if (tagName === "script" || tagName === "style") return false;
      if (tagName === "header" || tagName === "footer") return false;
      const rect = node.getBoundingClientRect();
      return rect.height >= 140 && rect.width >= 220;
    })
    .map((node, index) => {
      const label = getLikelySectionLabel(node, index);
      if (!node.id) node.id = createPreviewSectionId(label, index);
      return { id: node.id, label };
    })
    .filter(
      (section, index, array) =>
        Boolean(section.label) &&
        array.findIndex((item) => item.label === section.label) === index,
    )
    .slice(0, 12);
};

const EmbeddedPreviewBridge: React.FC<{ slug: string; pageId?: string }> = ({
  slug,
  pageId,
}) => {
  React.useEffect(() => {
    const publishSections = () => {
      const sections = extractPreviewSections(document);
      window.parent.postMessage(
        {
          type: "preview-sections",
          slug,
          pageId: pageId || "home",
          sections,
        },
        window.location.origin,
      );
    };

    const timer = window.setTimeout(publishSections, 300);
    const observer = new MutationObserver(() => {
      window.setTimeout(publishSections, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [pageId, slug]);

  return null;
};

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
                        : s === "store-performance"
                          ? "Performance"
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
  const { templateId: slug = "company", pageId } = useParams<{
    templateId: string;
    pageId?: string;
  }>();
  const isEmbeddedPreview = searchParams.get("embed") === "1";
  const { templateId, data } = resolveSlug(slug);
  const [device, setDevice] = React.useState<PreviewDevice>("desktop");
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const currentPreviewPage = pageId || "home";
  const fallbackSections = React.useMemo(
    () => PREVIEW_SECTION_MAP[`${slug}:${currentPreviewPage}`] || [],
    [currentPreviewPage, slug],
  );
  const [sections, setSections] =
    React.useState<PreviewSection[]>(fallbackSections);

  const collectIframeSections = React.useCallback(() => {
    const iframe = iframeRef.current;
    const iframeWindow = iframe?.contentWindow;
    const iframeDocument = iframeWindow?.document;

    if (!iframeDocument) return false;

    const foundSections = extractPreviewSections(iframeDocument);
    if (foundSections.length) {
      setSections(foundSections);
      return true;
    }

    return false;
  }, []);

  const scrollIframeToSection = React.useCallback((sectionId: string) => {
    const iframe = iframeRef.current;
    const iframeWindow = iframe?.contentWindow;
    const iframeDocument = iframeWindow?.document;
    const target = iframeDocument?.getElementById(sectionId);

    if (!iframeWindow || !target) return;

    const targetTop =
      target.getBoundingClientRect().top + iframeWindow.scrollY - 84;

    iframeWindow.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
  }, []);

  React.useEffect(() => {
    setSections(fallbackSections);
  }, [fallbackSections]);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const payload = event.data as
        | {
            type?: string;
            slug?: string;
            pageId?: string;
            sections?: PreviewSection[];
          }
        | undefined;

      if (
        payload?.type !== "preview-sections" ||
        payload.slug !== slug ||
        payload.pageId !== currentPreviewPage
      ) {
        return;
      }

      if (payload.sections?.length) {
        setSections(payload.sections);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentPreviewPage, slug]);

  React.useEffect(() => {
    if (device !== "mobile") return;

    let attempts = 0;
    const maxAttempts = 12;

    const tryCollect = () => {
      const found = collectIframeSections();
      attempts += 1;

      if (!found && attempts < maxAttempts) {
        window.setTimeout(tryCollect, 350);
      }
    };

    const timer = window.setTimeout(tryCollect, 500);

    return () => window.clearTimeout(timer);
  }, [collectIframeSections, device, slug, pageId]);

  if (isEmbeddedPreview) {
    return (
      <>
        <EmbeddedPreviewBridge slug={slug} pageId={pageId} />
        <TemplateEngine templateId={templateId} data={data} />
      </>
    );
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
            gap: { xs: 2, lg: 5 },
            px: { xs: 2, md: 3 },
            pb: 3,
            flexDirection: { xs: "column", lg: "row" },
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", lg: 220 },
              maxWidth: { xs: 390, lg: 220 },
              color: "#fff",
              pt: { xs: 0.5, lg: 7 },
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.46)",
              }}
            >
              Sections
            </Typography>
            <Stack
              direction={{ xs: "row", lg: "column" }}
              spacing={1}
              sx={{
                mt: 1.5,
                flexWrap: "wrap",
              }}
            >
              {sections.length ? (
                sections.map((section) => (
                  <Box
                    key={section.id}
                    component="button"
                    type="button"
                    onClick={() => scrollIframeToSection(section.id)}
                    sx={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      bgcolor: "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.82)",
                      px: 1.4,
                      py: 0.9,
                      borderRadius: 999,
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "0.74rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      transition:
                        "background-color 180ms ease, border-color 180ms ease, color 180ms ease",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.10)",
                        borderColor: "rgba(255,255,255,0.28)",
                        color: "#fff",
                      },
                    }}
                  >
                    {section.label}
                  </Box>
                ))
              ) : (
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: "0.9rem",
                    lineHeight: 1.7,
                    maxWidth: 180,
                  }}
                >
                  Tabs current page ke sections ke sath yahan show hongi.
                </Typography>
              )}
            </Stack>
          </Box>

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
              ref={iframeRef}
              title="Mobile template preview"
              src={`/landing-preview/${slug}${pageId ? `/${pageId}` : ""}?embed=1`}
              loading="eager"
              onLoad={() => {
                window.setTimeout(() => {
                  collectIframeSections();
                }, 300);
              }}
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
