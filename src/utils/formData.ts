/* ---------------- Types ---------------- */
interface BaseField {
  name: string;
  placeholder: string;
  type: "text" | "select" | "number" | "textarea";
  maxLength?: number;
  minLength?: number;
}

interface SelectField extends BaseField {
  type: "select";
  options: string[];
}

interface TextField extends BaseField {
  type: "text" | "number" | "textarea";
  options?: never; // to ensure non-selects don't have options
}

type FormField = SelectField | TextField;

/* ---------------- Data ---------------- */
const formData: FormField[] = [
  {
    name: "Banner Title",
    placeholder: "Banner Title",
    type: "text",
    maxLength: 60,
  },
  {
    name: "Category",
    placeholder: "Category",
    type: "select",
    options: [
      "Accounting and Bookkeeping",
      "Marketing and Advertising",
      "IT and Technical Support",
      "Consulting Services",
      "Legal Services",
      "Human Resources and Recruitment",
      "Financial Planning and Advisory",
      "Cleaning and Maintenance",
      "Others",
    ],
  },
  {
    name: "Region",
    placeholder: "Region",
    type: "select",
    options: ["Canada", "United Kingdom", "United States"],
  },
  {
    name: "City",
    placeholder: "City",
    type: "text",
    maxLength: 40,
  },
  {
    name: "Area",
    placeholder: "Area",
    type: "text",
    maxLength: 300,
  },
  {
    name: "Price Range",
    placeholder: "Price Range",
    type: "select",
    options: ["Inexpensive $", "Moderate $$", "Pricey $$$", "Ultra High $$$$"],
  },
  {
    name: "Services",
    placeholder: "Services",
    type: "select",
    options: [
      "Retail",
      "Healthcare",
      "Finance",
      "Technology",
      "Manufacturing",
      "Real Estate",
      "Education",
      "Hospitality",
      "Plumbing",
    ],
  },
  {
    name: "Phone",
    placeholder: "Number",
    type: "number",
    maxLength: 10,
  },
  {
    name: "Street",
    placeholder: "Street",
    type: "text",
    maxLength: 50,
  },
  {
    name: "Website",
    placeholder: "Add your company's Website Link",
    type: "text",
    maxLength: 300,
  },
  {
    name: "Map Embed (src)",
    placeholder: "Location",
    type: "text",
    maxLength: 300,
  },
  {
    name: "Banner Intro",
    placeholder: "Banner Intro",
    type: "text",
    maxLength: 500,
    minLength: 200,
  },
  {
    name: "About us",
    placeholder: "About us",
    type: "text",
    maxLength: 500,
    minLength: 220,
  },
  {
    name: "Why us",
    placeholder: "Why us",
    type: "text",
    maxLength: 500,
    minLength: 200,
  },
  {
    name: "Latest Projects Intro",
    placeholder: "Latest Projects Intro",
    type: "text",
    maxLength: 300,
    minLength: 200,
  },
  {
    name: "Our Mission",
    placeholder: "Our Mission",
    type: "text",
    maxLength: 500,
    minLength: 220,
  },
  {
    name: "Contact us Intro",
    placeholder: "Contact us Intro",
    type: "textarea",
    maxLength: 300,
    minLength: 200,
  },
];

export default formData;
export type { FormField };
