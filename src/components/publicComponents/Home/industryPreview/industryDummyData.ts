import { BusinessData } from "../../../../landingTemplates/types/BusinessData";
import { companyStudioAssets } from "../../../../landingTemplates/assets/company/company-executive";
import { educationAssets } from "../../../../landingTemplates/assets/education/education";
import { gardeningAssets } from "../../../../landingTemplates/assets/gardening/gardening";
import { plumbingAssets } from "../../../../landingTemplates/assets/plumbing/plumbing";
import { portfolioAssets } from "../../../../landingTemplates/assets/portfolio/portfolio-agency";
import { restaurantAssets } from "../../../../landingTemplates/assets/restaurant/restaurant";

export const educationData: BusinessData = {
  name: "Bright Minds Academy",
  tagline: "Empowering learners of every age to reach their full potential.",
  description:
    "A premier education center offering expert tutoring, enrichment programs, and skill development for students K-12 and beyond.",
  primaryColor: "#2563eb",
  secondaryColor: "#60a5fa",
  heroBannerUrl: educationAssets.classroomLearning,
  logoUrl: educationAssets.educationLogo,
  services: [
    {
      name: "Math & Science Tutoring",
      description: "One-on-one and group sessions with certified educators.",
      price: "From $50/hr",
    },
    {
      name: "SAT/ACT Prep",
      description: "Comprehensive test prep with proven score improvements.",
      price: "From $299",
    },
    {
      name: "College Application Coaching",
      description: "End-to-end guidance from essays to interviews.",
      price: "From $499",
    },
    {
      name: "Coding Bootcamp",
      description: "Hands-on programming courses for ages 10–18.",
      price: "From $199",
    },
    {
      name: "Public Speaking",
      description: "Build confidence and communication skills.",
      price: "From $79/session",
    },
    {
      name: "Online Learning",
      description: "Flexible virtual classes from anywhere in the world.",
      price: "From $39/month",
    },
  ],
  gallery: [
    {
      url: educationAssets.classroomLearning,
      caption: "Classroom learning",
    },
    {
      url: educationAssets.groupStudy,
      caption: "Group study",
    },
    {
      url: educationAssets.studentTutoring,
      caption: "One-on-one tutoring",
    },
    {
      url: educationAssets.scienceLab,
      caption: "Science lab",
    },
    {
      url: educationAssets.graduationDay,
      caption: "Graduation day",
    },
    {
      url: educationAssets.onlineClass,
      caption: "Online session",
    },
  ],
  reviews: [
    {
      author: "Sarah T.",
      rating: 5,
      text: "My daughter's grades improved dramatically in just 3 months. The tutors are incredibly patient and knowledgeable.",
      date: "Jan 2026",
    },
    {
      author: "James M.",
      rating: 5,
      text: "The SAT prep program is exceptional. My son went from a 1150 to a 1420 score!",
      date: "Dec 2025",
    },
    {
      author: "Priya K.",
      rating: 5,
      text: "Outstanding college counseling. We had no idea where to start and they guided us every step of the way.",
      date: "Nov 2025",
    },
  ],
  contact: {
    phone: "(555) 280-4100",
    email: "hello@brightminds.edu",
    address: "400 Learning Lane, Suite 200, Boston, MA 02101",
  },
  location: {
    address: "400 Learning Lane, Boston, MA 02101",
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2948.0!2d-71.0589!3d42.3601!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDLCsDIxJzM2LjQiTiA3McKwMDMnMzIuMCJX!5e0!3m2!1sen!2sus!4v1",
  },
  socialLinks: { facebook: "#", instagram: "#", twitter: "#" },
  workingHours: [
    { day: "Monday – Friday", hours: "8:00 AM – 8:00 PM" },
    { day: "Saturday", hours: "9:00 AM – 5:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ],
};

export const gardeningData: BusinessData = {
  name: "Green Roots Garden Co.",
  tagline: "Crafting beautiful outdoor spaces that grow with you.",
  description:
    "Professional landscaping, garden design, and lawn care services for residential and commercial properties across the region.",
  primaryColor: "#3f8f2f",
  secondaryColor: "#7fd453",
  logoUrl: gardeningAssets.plantCare,
  services: [
    {
      name: "Garden Design",
      description:
        "Custom landscape plans tailored to your property and lifestyle.",
      price: "From $350",
    },
    {
      name: "Lawn Care & Maintenance",
      description:
        "Regular mowing, edging, fertilization, and seasonal cleanup.",
      price: "From $80/visit",
    },
    {
      name: "Planting & Mulching",
      description:
        "Seasonal planting, bed edging, and premium mulch installation.",
      price: "From $200",
    },
    {
      name: "Irrigation Systems",
      description:
        "Smart sprinkler installation and water-efficient drip systems.",
      price: "From $1,200",
    },
    {
      name: "Tree Trimming & Removal",
      description: "Safe, professional arborist services for any size tree.",
      price: "From $150",
    },
    {
      name: "Hardscaping",
      description:
        "Patios, walkways, retaining walls, and outdoor living areas.",
      price: "From $2,500",
    },
  ],
  gallery: [
    {
      url: gardeningAssets.gardenLandscape,
      caption: "English garden",
    },
    {
      url: gardeningAssets.greenhouse,
      caption: "Patio design",
    },
    {
      url: gardeningAssets.plantCare,
      caption: "Plant selection",
    },
    {
      url: gardeningAssets.gardenerTeam,
      caption: "Lawn care",
    },
    {
      url: gardeningAssets.gardenSoil,
      caption: "Flower beds",
    },
    {
      url: gardeningAssets.gardenLandscape,
      caption: "Irrigation",
    },
  ],
  reviews: [
    {
      author: "Linda R.",
      rating: 5,
      text: "Our backyard has been completely transformed. Green Roots turned a neglected space into a stunning garden retreat.",
      date: "Feb 2026",
    },
    {
      author: "Tom B.",
      rating: 5,
      text: "Reliable, professional, and the results speak for themselves. Our lawn has never looked better.",
      date: "Jan 2026",
    },
    {
      author: "Maria C.",
      rating: 5,
      text: "The hardscaping project exceeded all expectations. Beautiful stonework and delivered right on schedule.",
      date: "Dec 2025",
    },
  ],
  contact: {
    phone: "(555) 390-6200",
    email: "info@greenrootsco.com",
    address: "55 Oak Street, Portland, OR 97201",
  },
  location: { address: "55 Oak Street, Portland, OR 97201" },
  socialLinks: { facebook: "#", instagram: "#" },
  workingHours: [
    { day: "Monday – Friday", hours: "7:00 AM – 6:00 PM" },
    { day: "Saturday", hours: "8:00 AM – 4:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ],
};

export const consultingData: BusinessData = {
  name: "Meridian Advisory",
  tagline:
    "Finance consulting for capital planning, performance improvement, and investor-ready growth.",
  description:
    "A boutique finance consulting firm helping founders, CFOs, and mid-market leadership teams strengthen forecasting, improve margins, prepare for transactions, and make capital decisions with confidence.",
  primaryColor: "#29354a",
  secondaryColor: "#c8a968",
  services: [
    {
      name: "CFO Advisory",
      description:
        "Ongoing strategic finance support for budgeting, board reporting, cash visibility, and executive decision-making.",
      price: "From $6,000",
    },
    {
      name: "FP&A and Forecasting",
      description:
        "Build rolling forecasts, driver-based models, and scenario plans that stand up to lender and investor scrutiny.",
      price: "From $7,500",
    },
    {
      name: "Transaction Readiness",
      description:
        "Prepare your financial story, diligence materials, and KPI narrative for fundraising, acquisition, or refinancing.",
      price: "From $9,000",
    },
    {
      name: "Cash Flow Optimization",
      description:
        "Improve working capital, reduce leakage, and create tighter control over operating cash performance.",
      price: "From $5,500",
    },
    {
      name: "Valuation Support",
      description:
        "Translate business performance into clear valuation logic for owners, investors, and strategic buyers.",
      price: "Custom",
    },
    {
      name: "Performance Dashboards",
      description:
        "Turn finance data into clear management dashboards focused on margin, runway, pipeline, and return metrics.",
      price: "From $4,200",
    },
  ],
  gallery: [
    {
      url: companyStudioAssets.strategy,
      caption: "Financial planning review",
    },
    {
      url: companyStudioAssets.boardroom,
      caption: "Capital and cash analysis",
    },
    {
      url: portfolioAssets.agencyWorkspace,
      caption: "Performance dashboard strategy",
    },
    {
      url: companyStudioAssets.office,
      caption: "Board-level finance discussion",
    },
    {
      url: companyStudioAssets.team,
      caption: "Advisory meeting",
    },
    {
      url: companyStudioAssets.strategy,
      caption: "Financial model review",
    },
  ],
  reviews: [
    {
      author: "David L., CEO",
      rating: 5,
      text: "Meridian brought real financial discipline into our growth plan. Their forecasting model changed how we manage cash, hiring, and expansion.",
      date: "Feb 2026",
    },
    {
      author: "Jessica W., COO",
      rating: 5,
      text: "They translated messy reporting into a clean operating dashboard our leadership team actually uses every week. The visibility has been a major upgrade.",
      date: "Jan 2026",
    },
    {
      author: "Robert K., CFO",
      rating: 5,
      text: "From lender conversations to board materials, the team was precise, commercially sharp, and deeply credible on the finance side.",
      date: "Dec 2025",
    },
  ],
  contact: {
    phone: "(555) 740-9900",
    email: "contact@meridianadvisory.com",
    address: "One Financial Plaza, 21st Floor, New York, NY 10005",
  },
  location: { address: "One Financial Plaza, 21st Floor, New York, NY 10005" },
  socialLinks: { linkedin: "#", twitter: "#" },
  workingHours: [
    { day: "Monday – Thursday", hours: "8:00 AM – 7:00 PM" },
    { day: "Friday", hours: "8:00 AM – 5:00 PM" },
    { day: "Weekend", hours: "By appointment" },
  ],
};

export const restaurantData: BusinessData = {
  name: "Casa Bella Ristorante",
  tagline:
    "Authentic Italian cuisine crafted with passion and the finest ingredients.",
  description:
    "A family-owned Italian restaurant bringing the flavors of Rome and Tuscany to your table. Fresh pasta made daily, wood-fired pizzas, and an award-winning wine list.",
  primaryColor: "#c0392b",
  secondaryColor: "#e74c3c",
  logoUrl: restaurantAssets.restaurantInterior,
  heroBannerUrl: restaurantAssets.luxuryDining,

  services: [
    {
      name: "Dine-In Experience",
      description:
        "Intimate, candlelit dining in our beautifully appointed restaurant.",
      price: "Avg $45/person",
    },
    {
      name: "Private Events",
      description:
        "Exclusive dining room for birthdays, anniversaries, and corporate events.",
      price: "From $800",
    },
    {
      name: "Catering Services",
      description:
        "Full-service catering for weddings, corporate events, and private parties.",
      price: "From $35/person",
    },
    {
      name: "Pasta Cooking Classes",
      description: "Learn to make authentic pasta from our head chef.",
      price: "$95/person",
    },
    {
      name: "Wine Pairing Dinners",
      description:
        "Monthly curated tasting menus with sommelier-selected Italian wines.",
      price: "$120/person",
    },
    {
      name: "Takeout & Delivery",
      description: "Enjoy Casa Bella at home with our full takeout menu.",
      price: "From $12",
    },
  ],
  gallery: [
    {
      url: restaurantAssets.grilledSteak,
      caption: "Signature pasta",
    },
    {
      url: restaurantAssets.gourmetBurger,
      caption: "Wood-fired pizza",
    },
    {
      url: restaurantAssets.restaurantTable,
      caption: "Dining atmosphere",
    },
    {
      url: restaurantAssets.restaurantInterior,
      caption: "Wine selection",
    },
    {
      url: restaurantAssets.classicBurger,
      caption: "Seasonal menu",
    },
    {
      url: restaurantAssets.luxuryDining,
      caption: "Chef's special",
    },
  ],
  reviews: [
    {
      author: "Emma S.",
      rating: 5,
      text: "Absolutely the finest Italian food I've had outside of Italy. The handmade tagliatelle is simply divine.",
      date: "Feb 2026",
    },
    {
      author: "Marco R.",
      rating: 5,
      text: "From the warm bread to the tiramisu, every course was perfection. Casa Bella is our family's special occasion restaurant.",
      date: "Jan 2026",
    },
    {
      author: "Anne P.",
      rating: 5,
      text: "We hosted our anniversary dinner here and it was magical. The private room, the food, the service — all flawless.",
      date: "Dec 2025",
    },
  ],
  contact: {
    phone: "(555) 620-8800",
    email: "reservations@casabella.com",
    address: "218 Via Roma, Little Italy, San Francisco, CA 94133",
  },
  location: { address: "218 Via Roma, San Francisco, CA 94133" },
  socialLinks: { facebook: "#", instagram: "#" },
  workingHours: [
    { day: "Tuesday – Thursday", hours: "5:00 PM – 10:00 PM" },
    { day: "Friday – Saturday", hours: "5:00 PM – 11:00 PM" },
    { day: "Sunday", hours: "4:00 PM – 9:00 PM" },
    { day: "Monday", hours: "Closed" },
  ],
};

export const plumbingData: BusinessData = {
  name: "ProFlow Plumbing",
  tagline: "Fast, reliable plumbing you can trust — available 24/7.",
  description:
    "Licensed and insured plumbing professionals serving the greater metro area. From emergency repairs to full bathroom remodels, we handle every job with skill and integrity.",
  primaryColor: "#1f4f9d",
  secondaryColor: "#4fa0ff",
  heroBannerUrl: plumbingAssets.plumbingHero,
  logoUrl: plumbingAssets.serviceThumbnail,

  services: [
    {
      name: "Emergency Repairs",
      description:
        "24/7 rapid response for burst pipes, flooding, and urgent issues.",
      price: "From $150",
    },
    {
      name: "Drain Cleaning",
      description:
        "Professional hydro-jetting and snaking for all drain types.",
      price: "From $99",
    },
    {
      name: "Water Heater Services",
      description:
        "Installation, repair, and replacement of all water heater brands.",
      price: "From $200",
    },
    {
      name: "Bathroom Remodels",
      description: "Complete bathroom plumbing for renovations and new builds.",
      price: "From $1,500",
    },
    {
      name: "Pipe Inspection & Repair",
      description: "Camera inspection and trenchless pipe repair technology.",
      price: "From $175",
    },
    {
      name: "Fixture Installation",
      description: "Faucets, toilets, sinks, showers, and more.",
      price: "From $85",
    },
  ],
  gallery: [
    {
      url: plumbingAssets.plumberService,
      caption: "Pipe installation",
    },
    {
      url: plumbingAssets.bathroomRenovation,
      caption: "Bathroom remodel",
    },
    {
      url: plumbingAssets.pipeRepair,
      caption: "Water heater",
    },
    {
      url: plumbingAssets.constructionWorker,
      caption: "Drain service",
    },
    {
      url: plumbingAssets.serviceTeam,
      caption: "Inspection",
    },
    {
      url: plumbingAssets.serviceThumbnail,
      caption: "Fixture install",
    },
  ],
  reviews: [
    {
      author: "Kevin H.",
      rating: 5,
      text: "Called ProFlow at midnight for a burst pipe. They arrived within the hour and had everything fixed before morning. Truly exceptional service.",
      date: "Feb 2026",
    },
    {
      author: "Sandra L.",
      rating: 5,
      text: "Fair pricing, clean work, and they explained everything clearly. Won't use anyone else for plumbing ever again.",
      date: "Jan 2026",
    },
    {
      author: "Mike D.",
      rating: 5,
      text: "Handled our full bathroom remodel plumbing perfectly. On time, on budget, and zero issues since completion.",
      date: "Dec 2025",
    },
  ],
  contact: {
    phone: "(555) 770-2400",
    email: "service@proflowplumbing.com",
    address: "800 Trade Center Blvd, Chicago, IL 60601",
  },
  location: { address: "800 Trade Center Blvd, Chicago, IL 60601" },
  socialLinks: { facebook: "#", instagram: "#" },
  workingHours: [
    { day: "Monday – Friday", hours: "7:00 AM – 7:00 PM" },
    { day: "Saturday", hours: "8:00 AM – 5:00 PM" },
    { day: "Sunday / Emergency", hours: "24/7 Available" },
  ],
};
