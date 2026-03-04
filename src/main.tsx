import "./index.css";
import { Fragment, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import theme from "./styles/theme";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { I18nProvider } from "./context/I18nContext";
import { FeatureFlagsProvider } from "./context/FeatureFlagsContext";
import { ABTestProvider } from "./context/ABTestContext";

const RootWrapper = import.meta.env.DEV ? StrictMode : Fragment;
const analyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === "true";

createRoot(document.getElementById("root")!).render(
  <RootWrapper>
    <ThemeProvider theme={theme}>
      <I18nProvider defaultLanguage="en">
        <FeatureFlagsProvider
          defaultFlags={{
            analytics_enabled: analyticsEnabled,
            contact_form_enabled: true,
            lazy_load_images: true,
          }}
          source="local"
        >
          <ABTestProvider tests={[]}>
            <CssBaseline />
            <App />
          </ABTestProvider>
        </FeatureFlagsProvider>
      </I18nProvider>
    </ThemeProvider>
  </RootWrapper>,
);
