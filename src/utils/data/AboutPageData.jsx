import React from "react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import Storefront from "@mui/icons-material/Storefront";
import LocalHospital from "@mui/icons-material/LocalHospital";
import { AutoGraphRounded } from "@mui/icons-material";

import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";

export const ABOUT_HERO = {
  bg: "/assets/publicAssets/images/about/newHero2.webp",
  accent: "#388d91",
  eyebrow: "Built for Businesses",
  title: ["Helping Businesses Get Online Instantly"],
  body: "Build a professional landing page for your business in minutes, get discovered through our directory, and grow without technical complexity or cost.",
  ctaLabel: "Build Your List Hub",
  ctaHref: "#ABOUT_MISSION",

  infoCards: [
    {
      icon: "trophy",
      title: "Driven by Directory!",
      position: { bottom: "50%", left: "-3%" },
      delay: 0.2,
    },
    {
      icon: "bolt",
      title: "Focus on Listing Push!",
      position: { bottom: "20%", left: "15%" },
      delay: 0.3,
    },
    {
      icon: "shield",
      title: "Built on Listing Trust!",
      position: { bottom: "20%", right: "-25%" },
      delay: 0.4,
    },
    {
      icon: "lightbulb",
      title: "Powered by BL Vision",
      position: { bottom: "50%", right: "-38%" },
      delay: 0.5,
    },
  ],
};

// ---------------- Two By Two Grid Section ----------------
export const ABOUT_TWO_BY_TWO_SECTION = {
  title: "Transforming Listings into Maps",
  description:
    "At Techietribe, we combine local discovery with simpler website builders to shape a practical future. Our mission is to develop listings that build trust, support visitors, and help owners expand, connect, and deliver enduring visibility online today.",
  image1: "/assets/images/about/about-mission-global-2.png",
  image2: "/assets/images/about/about-collaboration-11.png",
  content2:
    "Our journey is fueled by partners and shared purpose, where designers and entrepreneurs work together to solve genuine discoverability challenges. From crafting business tools to designing, user-friendly templates, we're shaping a clearer, more connected, and trustworthy directory future.",
};

// ---------------- Mission ----------------
export const ABOUT_MISSION = {
  brand: "LISTED",
  title: "Mission",
  items: [
    {
      title: "Global Impact",
      body: "Techietribe delivers progressive directory toolkits and website builders to enable regional businesses launch profiles capture prospects, and remain discoverable. We bring practical innovation to elevate communities and commerce everywhere online today.",
      img: "/assets/images/about/about-mission-global-2.png",
    },
    {
      title: "Client Innovation",
      body: "We put merchant success first delivering value exceeding expectations, and creating measurable outcomes. Our focus is on long-term partnerships and consistently great directory experiences.",
      img: "/assets/images/about/about-mission-contact-3.png",
    },
    {
      title: "List Mastery",
      body: "We take time to understand every client's marketplace location, and aims. This lets us craft tailored listings that deliver genuine visibility gains and elevate brands with meaningful locale impact.",
      img: "/assets/images/about/about-mission-excellent-1.png",
    },
  ],
};

// ---------------- Tech Stacks ----------------
export const ABOUT_TECH_STACKS = {
  headline: ["ListingTools", "We List All"],
  categories: [
    {
      key: "mobile",
      label: "Locale",
      items: [
        { name: "iOS", icon: "/assets/images/about/lottie/iOS.json" },
        { name: "Android", icon: "/assets/images/about/lottie/Andriod.json" },
        { name: "Ionic", icon: "/assets/images/about/lottie/Ionic.json" },
        { name: "Kotlin", icon: "/assets/images/about/lottie/Kotlin.json" },
        { name: "Flutter", icon: "/assets/images/about/lottie/Flutter.json" },
        // {
        //   name: "Objective",
        //   icon: "/assets/images/about/lottie/Objective.json",
        // },
        { name: "Swift", icon: "/assets/images/about/lottie/Swift.json" },
        {
          name: "React Native",
          icon: "/assets/images/about/lottie/ReactNative.json",
        },
      ],
    },
    {
      key: "fullstack",
      label: "Business Site Building",
      items: [
        {
          name: "JavaScript",
          icon: "/assets/images/about/lottie/JavaScript.json",
        },
        { name: "HTML", icon: "/assets/images/about/lottie/HTML.json" },
        { name: "SQL", icon: "/assets/images/about/lottie/SQL.json" },
        { name: "CSS", icon: "/assets/images/about/lottie/CSS.json" },
        { name: "React", icon: "/assets/images/about/lottie/React.json" },
        { name: "JAVA", icon: "/assets/images/about/lottie/JAVA.json" },
      ],
    },
    {
      key: "database",
      label: "Listings",
      items: [
        { name: "MongoDB", icon: "/assets/images/about/lottie/Mongodb.json" },
        { name: "MySQL", icon: "/assets/images/about/lottie/Mysql.json" },
        { name: "Mssql", icon: "/assets/images/about/lottie/Mssql.json" },
        { name: "Firebase", icon: "/assets/images/about/lottie/Firebase.json" },
        { name: "Dynamodb", icon: "/assets/images/about/lottie/Dynamodb.json" },
        { name: "Redis", icon: "/assets/images/about/lottie/Redis.json" },
      ],
    },
    {
      key: "backend",
      label: "Support",
      items: [
        { name: "PHP", icon: "/assets/images/about/lottie/Php.json" },
        { name: "JAVA", icon: "/assets/images/about/lottie/JAVA.json" },
        { name: "Node", icon: "/assets/images/about/lottie/Nodejs.json" },
        { name: "Python", icon: "/assets/images/about/lottie/Python.json" },
      ],
    },
    {
      key: "automation",
      label: "Workflow Tools",
      items: [
        {
          name: "n8n",
          icon: "/assets/images/about/lottie/logo_n8n.png",
        },
        { name: "HubSpot", icon: "/assets/images/about/lottie/hubspot.json" },
        {
          name: "Workato",
          icon: "https://player.vimeo.com/video/387087839?h=b49be7654d",
        },
        { name: "Zapier", icon: "/assets/images/about/lottie/zapier.svg" },
        { name: "Make", icon: "/assets/images/about/lottie/make.json" },
      ],
    },
  ],
};

// ---------------- Values (Sticky Scroll) ---------------

const ICONS = {
  "Integrity & Transparency": <VerifiedUserOutlinedIcon />,
  "Collaboration & Partnership": <GroupsOutlinedIcon />,
  "Innovation with Purpose": <LightbulbOutlinedIcon />,
  "Business-First Approach": <BusinessCenterOutlinedIcon />,
};

export const AboutStickyScrollData = {
  title:
    "Principles that shape how we build, support, and grow businesses online",
  subtitle: "Our Core Values",
  callToActionText: "Build Your Page",
  callToActionLink: "/create-page",
  processContentData: [
    {
      title: "Integrity & Transparency",
      description:
        "We operate with honesty and accountability at every step. From how businesses are listed to how visibility works on our platform, clarity and fairness are non-negotiable.",
    },
    {
      title: "Collaboration & Partnership",
      description:
        "We grow alongside the businesses we serve. By listening, learning, and improving together, we create a platform shaped by real needs, not assumptions.",
    },
    {
      title: "Innovation with Purpose",
      description:
        "We build tools that simplify online ownership. Every feature is designed to remove friction, reduce complexity, and help businesses move forward with confidence.",
    },
    {
      title: "Business-First Approach",
      description:
        "Every decision we make prioritizes the success of business owners. From page creation to discovery, our focus remains on practical value and measurable impact.",
    },
  ],
  ICONS,
};

// ---------------- Advanced Listings Showcase ----------------
export const ABOUT_ADVANCED_SHOWCASE = {
  title: "Shaping the Next Era of Marketplaces",
  subtitle:
    "At Techietribe, we see listings not just as profiles, but as the backbone of local discovery. Our focus is to build toolsets that stay simpler, trustworthy, and ready for every growing business across towns and markets today.",
  features: [
    {
      key: "responsible",
      icon: "Psychology",
      title: "Local Listings",
      body: "We uphold transparency, fairness, and accuracy, ensuring every listing we build is complete, consistent, and guided by trust and review standards today.",
    },
    {
      key: "adaptive",
      icon: "AutoAwesome",
      title: "Adaptive Marketplaces",
      body: "Our platform continuously updates and adapts helping businesses refresh profiles, respond to trends, and stay ahead of competition locally and internationally.",
    },
    {
      key: "ownerFlow",
      icon: "Timeline",
      title: "Owner-Site Partnership",
      body: "We engineer directory workflows that strengthen merchant insights and standardize revisions, decisioning, and customer engagement daylong.",
    },
    {
      key: "future",
      icon: "RocketLaunch",
      title: "Tomorrow-Ready Listings",
      body: "From template collections to streamlined publishing, we empower businesses to activate confidently in the evolving era of regional discovery.",
    },
  ],
};

export const ABOUT_BUILD_STEPS = {
  title: "How We Build Listing Sites",
  subtitle:
    "We follow a crystal and proven process that turns listing ideas into polished, scalable, and high-performing websites built for long-term growths.",
  steps: [
    {
      step: "01",
      title: "Directory & Vision",
      body: "We assess owner goals, explore listing potential, and build strategies that unite visibility with measurable progress. Each launch begins with a clear, structured roadmap toward long-term success.",
    },
    {
      step: "02",
      title: "Listing Basics",
      body: "Our team refines categories, tagging, and details meticulously, forming clear and consistent listings that strengthen discovery. Accuracy and trust define everything we publish for operators.",
    },
    {
      step: "03",
      title: "Directory Prototyping",
      body: "We craft and verify listing layouts through agile experimentation and owner validation ensuring early alignment with goals while confirming stability, scalability and real-world usability.",
    },
    {
      step: "04",
      title: "Marketplace Reliability.",
      body: "We evolve templates into resilient, cloud-ready listing systems engineered for reliability, security, & seamless integration. Each release maintains consistent performance for directories.",
    },
    {
      step: "05",
      title: "Performance Adaptation",
      body: "Our directories steadily update, refresh, and evolve with newest information, sustaining accuracy, relevance, and values. Every web-page adapts intelligently as markets and users change daily.",
    },
  ],
};

// ---------------- Listings Evolution Timeline ----------------
export const ABOUT_LISTING_TIMELINE = {
  title: "The Evolution of Regional Marketplaces!",
  subtitle:
    "Technology continues to reshape discoverability, creating new opportunities for growth. At Techietribe, we align our tools with every stage of this journey, helping businesses stay discoverable.",
  steps: [
    {
      year: "1990s",
      title: "The Listings Era",
      body: "Directories connected regional buyers and merchants, creating the foundation for modern business discovery, reviews, and neighborhood commerce online.",
    },
    {
      year: "2000s",
      title: "Listings & Smartphones",
      body: "Smartphones and applications reshaped how users searched for services and interacted with listings, setting new expectations for speed, credibility, and convenience.",
    },
    {
      year: "2010",
      title: "Cloud & Template-First Listing",
      body: "Cloud hosting and template-first design transformed how directory websites were built and used, enabling scalable services and frictionless experiences across devices.",
    },
    {
      year: "2015",
      title: "Listings Insights",
      body: "Reviews and analytics gave businesses deeper insight into buyer behavior, improving decisions and enabling more tailored conversion-driven listing journeys online.",
    },
    {
      year: "2018",
      title: "Review Automation",
      body: "Automation became widely adopted, driving review replies, profile updates, and scheduled publishing, that improved efficiency and created smarter local discovery.",
    },
    {
      year: "2022",
      title: "Automation & Listing Systems!",
      body: "Automation, bulk edits, and team collaboration reshaped operations, enabling efficient workflows, and flexible directory ecosystems across regions today.",
    },
  ],
};

// ---------------- Case Studies ----------------
export const ABOUT_CASE_STUDIES = {
  title: "Local Wins in Action!",
  subtitle:
    "Explore how we've expanded regional listings and website toolsets, turning ideas into measurable discoverability gains nationwide.",
  studies: [
    {
      title: "Market Match",
      challenge:
        "Improving neighborhood discoverability and trustworthiness for businesses.",
      solution:
        "Built a directory platform that utilizes frameworks to support operators publish profiles with photographs schedules, and service highlights.",
      outcome:
        "Elevated directory visibility by 40% throughout detailrich listing results.",
      icon: <AutoGraphRounded sx={{ fontSize: { xs: 30, sm: 40, md: 50 } }} />,
      href: "/case-study/therapy-talk",
    },
    {
      title: "Smart Profile Builder",
      challenge:
        "Reducing handson updates and improving listing accuracy for operators daily.",
      solution:
        "Built a guided profile builder that structures business details, validates inputs, and flags missing info in real time, for owners!",
      outcome:
        "Reduced directory setup time by 35% while improving listing consistency.",
      icon: <LocalHospital sx={{ fontSize: { xs: 30, sm: 40, md: 50 } }} />,
      href: "/case-study/smart-medical-history",
    },
    {
      title: "Biz Support",
      challenge:
        "Managing steady listing edits, onboarding, and support across multiple locations.",
      solution:
        "Created a centralized support desk to automate listing updates, onboarding workflows, and policy guidance with email and ticket inbox integration.",
      outcome:
        "Cut response time by 60% and improved listing compliance overall sitewide.",
      icon: (
        <GroupsOutlinedIcon sx={{ fontSize: { xs: 30, sm: 40, md: 50 } }} />
      ),
      href: "/case-study/hr-helpdesk",
    },
    {
      title: "Directory Pathfinder",
      challenge:
        "Improving services discovery and conversions in regional search results.",
      solution:
        "Developed a personalized discovery guide, that delivers directories, availability insights, and personalized filtering for purchases!",
      outcome:
        "Increased total listing inquiries by 22% through faster, smarter, search flows!",
      icon: <Storefront sx={{ fontSize: { xs: 30, sm: 40, md: 50 } }} />,
      href: "/case-study/e-commerce-assistant",
    },
    {
      title: "Directory Customer Support",
      challenge: "Improving directory support responses.",
      solution:
        "Deployed automated responses and tone tools for listings support.",
      outcome: "Improved listing replys by 50%!",
      icon: (
        <GroupsOutlinedIcon sx={{ fontSize: { xs: 30, sm: 40, md: 50 } }} />
      ),
      href: "/case-study/hr-helpdesk",
    },
    {
      title: "Personalized Directory Promotions",
      challenge: "Delivering targeted listing promotions!",
      solution:
        "Used segmentation to personalization directory promotions and offers.",
      outcome: "Increased directory clicks by 20%.",
      icon: (
        <LightbulbOutlinedIcon sx={{ fontSize: { xs: 30, sm: 40, md: 50 } }} />
      ),
      href: "/case-study/hr-helpdesk",
    },
  ],
};

export default AboutStickyScrollData;
