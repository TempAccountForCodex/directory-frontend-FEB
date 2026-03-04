import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";

// Create a basic test theme
const testTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

interface WrapperProps {
  children: ReactNode;
}

// Wrapper with all necessary providers
function AllTheProviders({ children }: WrapperProps) {
  return (
    <ThemeProvider theme={testTheme}>
      <MemoryRouter>{children}</MemoryRouter>
    </ThemeProvider>
  );
}

// Custom render function with all providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Render with custom router initial entries
export function renderWithRouter(
  ui: ReactElement,
  {
    initialEntries = ["/"],
    ...options
  }: RenderOptions & { initialEntries?: string[] } = {},
) {
  function RouterWrapper({ children }: WrapperProps) {
    return (
      <ThemeProvider theme={testTheme}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: RouterWrapper, ...options });
}

// Re-export everything from React Testing Library
export * from "@testing-library/react";
