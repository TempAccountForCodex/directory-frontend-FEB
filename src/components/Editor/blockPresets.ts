import type { FieldMetadata } from "../../hooks/useFieldMetadata";

type LocalFieldDefinition = {
  name: string;
  label: string;
  type: string;
  order?: number;
  validation?: Record<string, unknown>;
  ui?: Record<string, unknown>;
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";
const DEFAULT_VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";

const makeTextField = (
  name: string,
  label: string,
  order: number,
  multiline = false,
): LocalFieldDefinition => ({
  name,
  label,
  type: multiline ? "TEXTAREA" : "TEXT",
  order,
});

const makeRepeaterField = (
  name: string,
  label: string,
  order: number,
  itemSchema: Record<string, LocalFieldDefinition>,
): LocalFieldDefinition => ({
  name,
  label,
  type: "REPEATER",
  order,
  ui: {
    props: {
      itemSchema,
    },
  },
});

const footerLinkValidation = {
  custom: (value: unknown) => {
    const trimmed = String(value ?? "").trim();
    if (!trimmed) {
      return "Link URL is required.";
    }

    if (/^\/(?!\/)/.test(trimmed) || trimmed === "/") {
      return undefined;
    }

    try {
      const parsed = new URL(trimmed);
      if (
        (parsed.protocol === "http:" || parsed.protocol === "https:") &&
        parsed.hostname
      ) {
        return undefined;
      }
    } catch {
      return "Enter a valid URL or internal path like /privacy-policy.";
    }

    return "Enter a valid URL or internal path like /privacy-policy.";
  },
} satisfies Record<string, unknown>;

export const normalizeBlockTypeKey = (value = "") =>
  String(value)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_");

export const getBlockDefaultContent = (
  blockType: string,
): Record<string, unknown> => {
  switch (normalizeBlockTypeKey(blockType)) {
    case "HERO":
      return {
        eyebrow: "Hero section",
        heading: "Large headline for this section",
        body: "Customize the hero block from the editor.",
        buttonText: "Get started",
        image: DEFAULT_IMAGE,
      };
    case "TEXT":
      return {
        heading: "Section heading",
        body: "Use this section to explain your offer in a clear, readable way.",
      };
    case "IMAGE":
      return {
        src: DEFAULT_IMAGE,
        alt: "Feature visual",
        caption: "Add a short caption here.",
      };
    case "GALLERY":
      return {
        heading: "Recent work",
        images: [
          { image: DEFAULT_IMAGE, alt: "Gallery image 1" },
          {
            image:
              "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
            alt: "Gallery image 2",
          },
          {
            image:
              "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
            alt: "Gallery image 3",
          },
        ],
      };
    case "CTA":
      return {
        heading: "Ready to move forward?",
        subheading: "Turn interest into action with one direct next step.",
        ctaText: "Book a call",
        ctaLink: "#contact",
      };
    case "CONTACT":
    case "FORM_BUILDER":
      return {
        heading: "Let’s talk",
        body: "Share your details and we will get back to you shortly.",
        buttonText: "Send message",
        fields: ["Full name", "Email address", "Message"],
      };
    case "RESERVATION_FORM":
      return {
        heading: "Reserve your visit",
        body: "Take bookings directly from this section.",
        buttonText: "Reserve now",
        fields: ["Full name", "Email", "Date", "Guests"],
      };
    case "FEATURES":
      return {
        heading: "Why clients choose us",
        features: [
          {
            icon: "star",
            title: "Fast delivery",
            description: "Ship polished work quickly without losing quality.",
          },
          {
            icon: "verified",
            title: "Reliable process",
            description: "Clear steps, strong communication, fewer surprises.",
          },
          {
            icon: "analytics",
            title: "Measured results",
            description: "Track what matters and improve from real feedback.",
          },
        ],
      };
    case "FAQ":
      return {
        heading: "Frequently asked questions",
        items: [
          {
            question: "Are purchases final sale?",
            answer:
              "Final sale rules depend on the product category and custom order status.",
          },
          {
            question: "When will I get my order?",
            answer:
              "Most orders are processed within 2 to 4 business days before shipping.",
          },
          {
            question: "How much does shipping cost?",
            answer:
              "Shipping cost is calculated at checkout based on location and method.",
          },
        ],
      };
    case "TESTIMONIALS":
    case "REVIEWS":
      return {
        heading: "What clients say",
        testimonials: [
          {
            quote:
              "The final result looked premium and was easy for our team to update.",
            author: "Ayesha Khan",
            position: "Marketing Lead",
          },
          {
            quote:
              "Everything felt more intentional after we rebuilt these sections.",
            author: "Hassan Ali",
            position: "Founder",
          },
        ],
      };
    case "PRICING":
      return {
        heading: "Simple plans",
        body: "Choose the plan that matches your current stage.",
        plans: [
          {
            name: "Starter",
            price: "$29",
            features: ["1 active project", "Email support", "Basic analytics"],
          },
          {
            name: "Growth",
            price: "$79",
            features: ["5 active projects", "Priority support", "Custom forms"],
          },
        ],
      };
    case "FAQ":
      return {
        heading: "Frequently asked questions",
        items: [
          {
            question: "How quickly can we launch?",
            answer:
              "Most teams can publish an initial version within a few days.",
          },
          {
            question: "Can we update content later?",
            answer: "Yes, every section remains editable inside the builder.",
          },
        ],
      };
    case "STATS":
      return {
        heading: "Key numbers",
        body: "Whether it's an engaging explainer video, a vibrant social media campaign, or captivating motion graphics, we bring creativity and expertise to every project.",
        buttonText: "Know More About us",
        items: [
          { value: "120+", label: "Projects shipped" },
          { value: "98%", label: "Client satisfaction" },
          { value: "24/7", label: "Support availability" },
        ],
      };
    case "TEAM":
      return {
        heading: "Meet the team",
        members: [
          {
            name: "Ayesha Khan",
            role: "Creative Director",
            bio: "Leads strategy, storytelling, and brand direction.",
            avatar: DEFAULT_IMAGE,
          },
          {
            name: "Bilal Ahmed",
            role: "Technical Lead",
            bio: "Builds reliable product experiences and systems.",
            avatar:
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
          },
        ],
      };
    case "VIDEO":
      return {
        videoUrl: DEFAULT_VIDEO,
        aspectRatio: "16:9",
        showControls: true,
        autoplay: false,
        muted: true,
        loop: false,
      };
    case "MARQUEE":
      return {
        text: "We make things that work better and last longer.",
      };
    case "NEWSLETTER":
      return {
        heading: "Join the newsletter",
        body: "Send product updates, launches, and useful insights.",
        placeholder: "Enter your email",
        buttonText: "Subscribe",
      };
    case "FOOTER":
      return {
        logoText: "LOGO",
        description:
          "A modern business footer with direct contact details, useful navigation, and a simple subscribe form.",
        links: [
          { label: "Privacy policy", url: "/privacy-policy" },
          { label: "Terms & condition", url: "/terms-and-condition" },
          { label: "Cookie Policy", url: "/cookie-policy" },
        ],
        contactEmail: "hello@yourcompany.com",
        contactPhone: "+1 (555) 123-4567",
        contactAddress: "123 Business Avenue, New York, NY 10001",
        socialLinks: [
          { platform: "linkedin", url: "https://linkedin.com" },
          { platform: "instagram", url: "https://instagram.com" },
          { platform: "facebook", url: "https://facebook.com" },
        ],
        placeholder: "Enter your email",
        buttonText: "Subscribe",
        copyright: "(c) 2026 Your company. All rights reserved.",
        cardStyle: {
          backgroundColor: "#0f1115",
          borderColor: "rgba(255,255,255,0.12)",
          boxShadowPreset: "none",
          layoutWidth: "page",
          paddingTop: "24px",
          paddingBottom: "24px",
          paddingLeft: "24px",
          paddingRight: "24px",
        },
      };
    case "LOGO_CAROUSEL":
      return {
        heading: "Trusted by leading brands",
        logos: [
          { src: DEFAULT_IMAGE, alt: "Brand 1", name: "Vertex" },
          {
            src: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=600&q=80",
            alt: "Brand 2",
            name: "Northstar",
          },
        ],
      };
    case "MAP_LOCATION":
      return {
        heading: "Visit our office",
        address: "Shahrah-e-Faisal, Karachi",
        latitude: "24.8607",
        longitude: "67.0011",
      };
    case "MENU_DISPLAY":
      return {
        heading: "Popular services",
        items: [
          {
            name: "Consultation",
            price: "$120",
            description: "Discovery and planning session.",
          },
          {
            name: "Implementation",
            price: "$420",
            description: "Done-for-you setup and launch.",
          },
        ],
      };
    case "IMAGE_TEXT_SPLIT":
      return {
        heading: "A better way to present your offer",
        body: "<p>Pair a strong image with a concise explanation and a clear CTA.</p>",
        image: DEFAULT_IMAGE,
        imageAlt: "Split section visual",
        imagePosition: "left",
        ctaText: "Learn more",
        ctaLink: "#contact",
      };
    case "TABS":
      return {
        heading: "Explore our services",
        tabs: [
          {
            label: "Strategy",
            content: "Clarify goals, offer, and positioning.",
            icon: "analytics",
          },
          {
            label: "Design",
            content: "Create cleaner layouts and stronger hierarchy.",
            icon: "palette",
          },
          {
            label: "Launch",
            content: "Ship quickly with an editable system.",
            icon: "rocket",
          },
        ],
      };
    case "STEPS_PROCESS":
      return {
        heading: "How we work",
        steps: [
          {
            title: "Discover",
            description: "Understand the goal and user journey.",
          },
          {
            title: "Design",
            description: "Shape the layout and visual direction.",
          },
          {
            title: "Deliver",
            description: "Launch a section that is ready to edit.",
          },
        ],
      };
 
      return {
        heading: "Customer stories",
        stories: [
          {
            title: "Planning",
            subtitle: "Start with clarity",
            body: "Organize complex information into a focused section.",
            image: DEFAULT_IMAGE,
            linkText: "See details",
            linkUrl: "#contact",
          },
          {
            title: "Execution",
            subtitle: "Move with confidence",
            body: "Turn ideas into sections that already look designed.",
            image:
              "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
            linkText: "Get started",
            linkUrl: "#contact",
          },
        ],
      };

      return {
        heading: "Business hours",
        showCurrentStatus: true,
        hours: [
          { day: "Monday", openTime: "09:00", closeTime: "18:00" },
          { day: "Tuesday", openTime: "09:00", closeTime: "18:00" },
          { day: "Wednesday", openTime: "09:00", closeTime: "18:00" },
          { day: "Thursday", openTime: "09:00", closeTime: "18:00" },
          { day: "Friday", openTime: "09:00", closeTime: "18:00" },
          { day: "Saturday", openTime: "10:00", closeTime: "15:00" },
          { day: "Sunday", isClosed: true },
        ],
      };
    case "SOCIAL_EMBED":
      return {
        heading: "Social proof",
        embeds: [
          {
            platform: "youtube",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            caption: "Add your own social or video URL here.",
          },
        ],
      };
    case "EMBED":
      return {
        heading: "Embedded content",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      };
    case "BEFORE_AFTER":
      return {
        heading: "Before and after",
        beforeImage: DEFAULT_IMAGE,
        afterImage:
          "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
        beforeLabel: "Before",
        afterLabel: "After",
      };
    case "ANNOUNCEMENT_BAR":
      return {
        text: "Limited-time offer: book now and get a free consultation.",
        ctaText: "Learn more",
        ctaLink: "#contact",
      };
    case "COUNTDOWN":
      return {
        heading: "Offer ends soon",
        endDate: "2026-12-31T23:59:59Z",
        ctaText: "Claim now",
        ctaLink: "#contact",
      };
    case "PORTFOLIO_GRID":
      return {
        heading: "Selected projects",
        items: [
          {
            title: "Brand Refresh",
            category: "Branding",
            image: DEFAULT_IMAGE,
            description: "Identity and landing page system.",
          },
          {
            title: "Product Launch",
            category: "Marketing",
            image:
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
            description: "Campaign assets and conversion sections.",
          },
        ],
      };
    case "COLLAGE":
      return {
        heading: "Visual showcase",
        body: "Combine multiple visuals with supporting copy in one section.",
        ctaText: "View gallery",
        ctaLink: "#contact",
        images: [
          DEFAULT_IMAGE,
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
        ],
      };
    default:
      return {
        heading: "New section",
        body: "Use the editor to customize this block.",
      };
  }
};

const contentGroup = (fields: LocalFieldDefinition[]): FieldMetadata => ({
  groups: [
    {
      id: "content",
      label: "Content",
      order: 1,
      fields,
    },
  ],
});

export const getLocalFieldMetadata = (
  blockType: string,
): FieldMetadata | null => {
  switch (normalizeBlockTypeKey(blockType)) {
    case "MARQUEE":
      return contentGroup([makeTextField("text", "Marquee text", 1)]);
    case "VIDEO":
      return contentGroup([
        makeTextField("videoUrl", "Video URL", 1),
        {
          name: "aspectRatio",
          label: "Aspect Ratio",
          type: "SELECT",
          order: 2,
          ui: {
            props: {
              options: [
                { label: "16:9", value: "16:9" },
                { label: "4:3", value: "4:3" },
                { label: "1:1", value: "1:1" },
              ],
            },
          },
        },
        {
          name: "showControls",
          label: "Show Controls",
          type: "TOGGLE",
          order: 3,
        },
        { name: "autoplay", label: "Autoplay", type: "TOGGLE", order: 4 },
        { name: "muted", label: "Muted", type: "TOGGLE", order: 5 },
        { name: "loop", label: "Loop", type: "TOGGLE", order: 6 },
      ]);
    case "HERO":
      return contentGroup([
        makeTextField("eyebrow", "Eyebrow", 1),
        makeTextField("heading", "Heading", 2, true),
        makeTextField("body", "Body", 3, true),
        makeTextField("buttonText", "Button Text", 4),
        {
          name: "image",
          label: "Background Image",
          type: "IMAGE",
          order: 5,
        },
      ]);
    case "FEATURES":
      return contentGroup([
        makeTextField("heading", "Heading", 1),
        {
          name: "variant",
          label: "Variant",
          type: "SELECT",
          order: 2,
          ui: {
            props: {
              options: [
                { label: "Default", value: "default" },
                { label: "4 Column", value: "4-column" },
                { label: "Stacked", value: "stacked" },
                { label: "Badges", value: "badges" },
              ],
            },
          },
        },
        makeRepeaterField("features", "Features", 3, {
          title: makeTextField("title", "Title", 1),
          description: makeTextField("description", "Description", 2, true),
          icon: makeTextField("icon", "Icon", 3),
        }),
      ]);
    case "FAQ":
      return contentGroup([
        makeTextField("heading", "Heading", 1),
        makeRepeaterField("items", "FAQ Items", 2, {
          question: makeTextField("question", "Question", 1),
          answer: makeTextField("answer", "Answer", 2, true),
        }),
      ]);
    case "GALLERY":
      return contentGroup([
        makeTextField("heading", "Heading", 1),
        makeRepeaterField("images", "Gallery Images", 2, {
          image: {
            name: "image",
            label: "Image",
            type: "IMAGE",
            order: 1,
          },
          alt: makeTextField("alt", "Alt Text", 2),
          caption: makeTextField("caption", "Caption", 3),
        }),
      ]);
    case "ANNOUNCEMENT_BAR":
      return contentGroup([
        makeTextField("text", "Title", 1),
      ]);
    case "STATS":
      return contentGroup([
        makeTextField("heading", "Heading", 1),
        makeTextField("body", "Body", 2, true),
        makeTextField("buttonText", "Button Text", 3),
        makeRepeaterField("items", "Stats Items", 4, {
          value: makeTextField("value", "Value", 1),
          label: makeTextField("label", "Label", 2),
        }),
      ]);
    case "IMAGE_TEXT_SPLIT":
      return contentGroup([
        makeTextField("heading", "Heading", 1),
        makeTextField("body", "Body", 2, true),
        { name: "image", label: "Image", type: "IMAGE", order: 3 },
        makeTextField("imageAlt", "Image Alt", 4),
        makeTextField("ctaText", "CTA Text", 5),
        makeTextField("ctaLink", "CTA Link", 6),
        {
          name: "imagePosition",
          label: "Image Position",
          type: "SELECT",
          order: 7,
          ui: {
            props: {
              options: [
                { label: "Left", value: "left" },
                { label: "Right", value: "right" },
              ],
            },
          },
        },
      ]);
    case "TABS":
      return contentGroup([
        makeTextField("heading", "Heading", 1),
        {
          name: "variant",
          label: "Variant",
          type: "SELECT",
          order: 2,
          ui: {
            props: {
              options: [
                { label: "Standard", value: "standard" },
                { label: "Outlined", value: "outlined" },
                { label: "Pills", value: "pills" },
              ],
            },
          },
        },
        makeRepeaterField("tabs", "Tabs", 3, {
          label: makeTextField("label", "Label", 1),
          content: makeTextField("content", "Content", 2, true),
          icon: makeTextField("icon", "Icon", 3),
        }),
      ]);

      return contentGroup([
        makeTextField("heading", "Heading", 1),
        makeRepeaterField("stories", "Stories", 2, {
          title: makeTextField("title", "Title", 1),
          subtitle: makeTextField("subtitle", "Subtitle", 2),
          body: makeTextField("body", "Body", 3, true),
          image: makeTextField("image", "Image URL", 4),
          linkText: makeTextField("linkText", "Link Text", 5),
          linkUrl: makeTextField("linkUrl", "Link URL", 6),
        }),
      ]);

      return contentGroup([
        makeTextField("heading", "Heading", 1),
        {
          name: "showCurrentStatus",
          label: "Show Current Status",
          type: "TOGGLE",
          order: 2,
        },
        makeRepeaterField("hours", "Hours", 3, {
          day: makeTextField("day", "Day", 1),
          openTime: makeTextField("openTime", "Open Time", 2),
          closeTime: makeTextField("closeTime", "Close Time", 3),
          isClosed: {
            name: "isClosed",
            label: "Closed",
            type: "TOGGLE",
            order: 4,
          },
        }),
      ]);
    case "SOCIAL_EMBED":
      return contentGroup([
        makeTextField("heading", "Heading", 1),
        makeRepeaterField("embeds", "Embeds", 2, {
          platform: {
            name: "platform",
            label: "Platform",
            type: "SELECT",
            order: 1,
            ui: {
              props: {
                options: [
                  { label: "YouTube", value: "youtube" },
                  { label: "Instagram", value: "instagram" },
                  { label: "Facebook", value: "facebook" },
                  { label: "TikTok", value: "tiktok" },
                ],
              },
            },
          },
          url: makeTextField("url", "URL", 2),
          caption: makeTextField("caption", "Caption", 3),
        }),
      ]);
    case "MENU_DISPLAY":
      return contentGroup([
        makeTextField("heading", "Heading", 1),
        makeRepeaterField("items", "Items", 2, {
          name: makeTextField("name", "Name", 1),
          price: makeTextField("price", "Price", 2),
          description: makeTextField("description", "Description", 3, true),
        }),
      ]);
    case "PRICING":
      return contentGroup([
        makeTextField("heading", "Heading", 1),
        makeTextField("body", "Body", 2, true),
        makeRepeaterField("plans", "Plans", 3, {
          name: makeTextField("name", "Plan Name", 1),
          price: makeTextField("price", "Price", 2),
        }),
      ]);
    case "FOOTER":
      return contentGroup([
        makeTextField("logoText", "Logo / Brand Text", 1),
        makeTextField("description", "Footer Description", 2, true),
        makeRepeaterField("links", "Footer Navigation Links", 3, {
          label: makeTextField("label", "Link Label", 1),
          url: {
            name: "url",
            label: "Link URL",
            type: "URL",
            order: 2,
            validation: footerLinkValidation,
            ui: {
              placeholder: "https://example.com or /privacy-policy",
            },
          },
        }),
        makeTextField("contactEmail", "Email Address", 4),
        makeTextField("contactPhone", "Phone Number", 5),
        makeTextField("contactAddress", "Address", 6, true),
        makeRepeaterField("socialLinks", "Social Links", 7, {
          platform: {
            name: "platform",
            label: "Platform",
            type: "SELECT",
            order: 1,
            defaultValue: "linkedin",
            ui: {
              props: {
                options: [
                  { label: "LinkedIn", value: "linkedin" },
                  { label: "Instagram", value: "instagram" },
                  { label: "Facebook", value: "facebook" },
                  { label: "X / Twitter", value: "twitter" },
                  { label: "YouTube", value: "youtube" },
                  { label: "TikTok", value: "tiktok" },
                  { label: "Website", value: "website" },
                ],
              },
            },
          },
          url: {
            name: "url",
            label: "Profile URL",
            type: "URL",
            order: 2,
            validation: footerLinkValidation,
            ui: {
              placeholder: "https://instagram.com/yourbrand",
            },
          },
        }),
        makeTextField("placeholder", "Email Placeholder Text", 8),
        makeTextField("buttonText", "Subscribe Button Text", 9),
        makeTextField("copyright", "Copyright Text", 10),
      ]);
    case "TESTIMONIALS":
    case "REVIEWS":
      return contentGroup([
        makeTextField("heading", "Heading", 1),
        makeRepeaterField("testimonials", "Testimonials", 2, {
          quote: makeTextField("quote", "Quote", 1, true),
          author: makeTextField("author", "Author", 2),
          position: makeTextField("position", "Position", 3),
        }),
      ]);
    default:
      return contentGroup([
        makeTextField("heading", "Heading", 1),
        makeTextField("body", "Body", 2, true),
      ]);
  }
};
