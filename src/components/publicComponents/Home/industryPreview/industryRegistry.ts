import type { BusinessData } from "../../../../landingTemplates/types/BusinessData";
import {
  educationData,
  gardeningData,
  consultingData,
  restaurantData,
  plumbingData,
} from "./industryDummyData";

export interface IndustryEntry {
  templateId: string;
  data: BusinessData;
  accentColor: string;
  label: string;
}

const industryRegistry: Record<string, IndustryEntry> = {
  Education: {
    templateId: "education",
    data: educationData,
    accentColor: "#2563eb",
    label: "Education",
  },
  Gardening: {
    templateId: "gardening",
    data: gardeningData,
    accentColor: "#58b74e",
    label: "Gardening",
  },
  Consulting: {
    templateId: "premium",
    data: consultingData,
    accentColor: "#c9a84c",
    label: "Consulting",
  },
  Restaurant: {
    templateId: "restaurant",
    data: restaurantData,
    accentColor: "#c0392b",
    label: "Restaurant",
  },
  Plumbing: {
    templateId: "plumbing",
    data: plumbingData,
    accentColor: "#3c86d9",
    label: "Plumbing",
  },
};

export const getIndustryEntry = (title: string): IndustryEntry =>
  industryRegistry[title] ?? Object.values(industryRegistry)[0];

export const getIndustryKeys = (): string[] => Object.keys(industryRegistry);
