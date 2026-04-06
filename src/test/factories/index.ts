export { makeFieldDefinition } from "./fieldDefinition";

// Re-export shared test render utilities from utils.tsx for a single import point
// Usage: import { makeFieldDefinition, renderWithProviders } from '@/test/factories'
export { renderWithProviders, renderWithRouter } from "../utils";
