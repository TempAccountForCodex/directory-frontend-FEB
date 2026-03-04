// Mock data for business directory listings
export interface Listing {
  id: string | number;
  title: string;
  desc: string;
  aboutBusiness?: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  image: string;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  businessLogo?: string;
  businessBanner?: string;
  slug: string;
  intro?: string;
  mapUrl?: string;
  whyUs?: string;
  latestProjectIntro?: string;
  ourMission?: string;
  accountingAndTaxService?: string[];
  contactUsIntro?: string;
  aboutUs?: string;
}

const DummyListing: Listing[] = [
  {
    id: 1,
    title: "Techietribe Consulting",
    desc: "Leading business consulting firm specializing in digital transformation and growth strategies.",
    aboutBusiness:
      "We help businesses grow with innovative solutions and expert advice.",
    category: "Consulting",
    address: "165 Denrose Drive, Apt 6, Buffalo, NY 14228",
    phone: "(516) 424-4928",
    website: "https://thetechietribe.com/",
    image: "/src/assets/images/BuissnessLogo.png",
    image1: "/src/assets/images/banner-1.jfif",
    image2: "/src/assets/images/banner-2.jfif",
    image3: "/src/assets/images/banner-3.jfif",
    image4: "/src/assets/images/banner-4.jpg",
    businessLogo: "/src/assets/images/BuissnessLogo.png",
    businessBanner: "/src/assets/images/banner-1.jfif",
    slug: "techietribe-consulting",
    intro: "Empowering your business for the digital age.",
    mapUrl: "https://maps.google.com/?q=165+Denrose+Drive,+Buffalo,+NY+14228",
    whyUs: "Expert team, proven results, and client-focused approach.",
    latestProjectIntro:
      "Recently helped a retail chain increase sales by 30% through digital marketing.",
    ourMission: "To deliver measurable business value to our clients.",
    accountingAndTaxService: ["Bookkeeping", "Tax Filing", "Payroll"],
    contactUsIntro: "Contact us for a free consultation.",
    aboutUs: "Techietribe is dedicated to your business success.",
  },
  {
    id: 2,
    title: "Bright Future Academy",
    desc: "A premier educational institution offering K-12 programs and extracurricular activities.",
    aboutBusiness: "Empowering students to achieve academic excellence.",
    category: "Education",
    address: "123 Main St, New York, NY 10001",
    phone: "(212) 555-1234",
    website: "https://brightfuture.edu/",
    image: "/src/assets/images/banner-2.jfif",
    image1: "/src/assets/images/banner-3.jfif",
    image2: "/src/assets/images/banner-4.jpg",
    image3: "/src/assets/images/banner-1.jfif",
    image4: "/src/assets/images/banner-5.jpg",
    businessLogo: "/src/assets/images/logo-3.png",
    businessBanner: "/src/assets/images/banner-2.jfif",
    slug: "bright-future-academy",
    intro: "Shaping tomorrow's leaders today.",
    mapUrl: "https://maps.google.com/?q=123+Main+St,+New+York,+NY+10001",
    whyUs: "Experienced faculty, modern facilities, and holistic development.",
    latestProjectIntro:
      "Launched a STEM program with 100% student participation.",
    ourMission: "To inspire and nurture young minds.",
    accountingAndTaxService: ["Fee Management", "Scholarship Guidance"],
    contactUsIntro: "Enroll now for the new academic year.",
    aboutUs: "Bright Future Academy is committed to excellence in education.",
  },
  {
    id: 3,
    title: "GreenLeaf Grocery",
    desc: "Your neighborhood grocery store for fresh produce and organic products.",
    aboutBusiness: "Serving the community with quality and care.",
    category: "Retail",
    address: "456 Elm St, Los Angeles, CA 90001",
    phone: "(310) 555-5678",
    website: "https://greenleafgrocery.com/",
    image: "/src/assets/images/banner-3.jfif",
    image1: "/src/assets/images/banner-4.jpg",
    image2: "/src/assets/images/banner-1.jfif",
    image3: "/src/assets/images/banner-2.jfif",
    image4: "/src/assets/images/banner-5.jpg",
    businessLogo: "/src/assets/images/logo-3 (1).png",
    businessBanner: "/src/assets/images/banner-3.jfif",
    slug: "greenleaf-grocery",
    intro: "Freshness delivered daily.",
    mapUrl: "https://maps.google.com/?q=456+Elm+St,+Los+Angeles,+CA+90001",
    whyUs: "Locally sourced, organic, and affordable.",
    latestProjectIntro: "Introduced a zero-waste initiative in 2023.",
    ourMission: "To promote healthy living in our community.",
    accountingAndTaxService: ["Inventory Management", "Supplier Coordination"],
    contactUsIntro: "Visit us for weekly specials.",
    aboutUs: "GreenLeaf Grocery is your trusted local grocer.",
  },
];

// Featured listings can be a subset or different selection
export const FeaturedListings: Listing[] = DummyListing.slice(0, 3);

export default DummyListing;
