import React, { Suspense, lazy, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CookieConsentProvider } from "./context/PreferencesContext";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
const Home = lazy(() => import("../src/pages/publicPages/Home"));
const Listings = lazy(() => import("../src/pages/publicPages/Listings"));
const Directory = lazy(() => import("./pages/Directory"));
const Contact = lazy(() => import("../src/pages/publicPages/Contact"));
// import ListingDetails from "../src/pages/publicPages/ListingDetail";
const BlogDetail = lazy(() => import("../src/pages/publicPages/BlogDetail"));
const NotFound = lazy(() => import("../src/pages/publicPages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const WebsiteEditor = lazy(
  () => import("./components/Dashboard/WebsiteEditor"),
);
import GoogleAnalyticsTracker from "./utils/commons/GoogleAnalyticsTracker";
const TermsConditions = lazy(
  () => import("../src/pages/publicPages/TermsConditions"),
);

const Faq = lazy(() => import("../src/pages/publicPages/Faq"));

const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const PrivacyPolicy = lazy(
  () => import("../src/pages/publicPages/PrivacyPolicy"),
);
const CookiePolicy = lazy(
  () => import("../src/pages/publicPages/CookiePolicy"),
);
import { DashboardProvider } from "./context/DashboardContext";
import { PendingCounterProvider } from "./context/pending-counter";
import { ListingsProvider } from "./context/ListingsContext.js";
import { useCookieConsent } from "./context/PreferencesContext";
const PublicWebsite = lazy(() => import("./pages/PublicWebsite"));
const TemplatePreview = lazy(() => import("./pages/TemplatePreview"));
const LandingPreview = lazy(() => import("./pages/LandingPreview"));
const CreateStoreWizard = lazy(() => import("./pages/CreateStoreWizard"));
const About = lazy(() => import("../src/pages/publicPages/About"));
const Pricing = lazy(() => import("../src/pages/publicPages/Pricing"));
const Templates = lazy(() => import("../src/pages/publicPages/Templates"));

const InsightsPage = lazy(() => import("./pages/publicPages/Blog.js"));
import Footer from "./components/Footer";
const MoveUpBtn = lazy(() => import("./components/UI/MoveUpBtn"));
const CookieBanner = lazy(
  () => import("./components/UserPreferences/PreferenceBanner.jsx"),
);
const CookiePreferences = lazy(
  () => import("./components/UserPreferences/PreferenceSettings.jsx"),
);
// import InsightDetails from "./pages/InsightsDetails";

const PricingPageFallback = () => (
  <div style={{ width: "100%", background: "#020303" }}>
    <div style={{ minHeight: "100vh" }} />
    <div style={{ minHeight: "220vh", background: "#ffffff" }} />
  </div>
);

const ContactPageFallback = () => (
  <div style={{ width: "100%", background: "#020303" }}>
    <div style={{ minHeight: "100vh" }} />
    <div style={{ minHeight: "240vh", background: "#ffffff" }} />
  </div>
);

const ListingsPageFallback = () => (
  <div style={{ width: "100%", background: "#041e18" }}>
    <div style={{ minHeight: "100vh" }} />
    <div style={{ minHeight: "220vh", background: "#ffffff" }} />
  </div>
);

const BlogPageFallback = () => (
  <div style={{ width: "100%", background: "#041e18" }}>
    <div style={{ minHeight: "70vh" }} />
    <div style={{ minHeight: "230vh", background: "#ffffff" }} />
  </div>
);

const LegalPageFallback = () => (
  <div style={{ width: "100%", background: "#070c10" }}>
    <div style={{ minHeight: "80vh" }} />
    <div style={{ minHeight: "260vh", background: "#ffffff" }} />
  </div>
);

const MainLayout = () => (
  <>
    <a
      href="#main-content"
      style={{
        position: "absolute",
        left: "-9999px",
        top: "auto",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = "12px";
        e.currentTarget.style.top = "12px";
        e.currentTarget.style.width = "auto";
        e.currentTarget.style.height = "auto";
        e.currentTarget.style.padding = "10px 14px";
        e.currentTarget.style.borderRadius = "8px";
        e.currentTarget.style.background = "#ffffff";
        e.currentTarget.style.color = "#000000";
        e.currentTarget.style.zIndex = "10000";
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = "-9999px";
        e.currentTarget.style.top = "auto";
        e.currentTarget.style.width = "1px";
        e.currentTarget.style.height = "1px";
        e.currentTarget.style.padding = "0";
      }}
    >
      Skip to main content
    </a>
    <GoogleAnalyticsTracker />
    <CookieBannerMount />
    <CookiePreferencesMount />
    <Navbar />
    <ScrollToTop />
    <main id="main-content">
      <Outlet />
    </main>
    <Footer />
    <MoveUpBtnMount />
  </>
);

const CookieBannerMount = () => {
  const { showBanner } = useCookieConsent();

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: "140px",
          zIndex: 9998,
          pointerEvents: "none",
        }}
      />
      <Suspense fallback={null}>
        <CookieBanner />
      </Suspense>
    </>
  );
};

const CookiePreferencesMount = () => {
  const { showPreferences } = useCookieConsent();

  if (!showPreferences) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <CookiePreferences />
    </Suspense>
  );
};

const MoveUpBtnMount = () => {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (shouldMount) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const onScroll = () => {
      if (window.scrollY > 100) {
        setShouldMount(true);
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    timeoutId = setTimeout(() => {
      setShouldMount(true);
      window.removeEventListener("scroll", onScroll);
    }, 1800);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [shouldMount]);

  if (!shouldMount) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <MoveUpBtn />
    </Suspense>
  );
};

const AuthDashboardLayout = () => (
  <>
    <ScrollToTop />
    <Outlet />
  </>
);

const NotFoundLayout = () => (
  <>
    <ScrollToTop />
    <Suspense fallback={null}>
      <NotFound />
    </Suspense>
    <Suspense fallback={null}>
      <MoveUpBtn />
    </Suspense>
  </>
);

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CookieConsentProvider>
          <ListingsProvider>
            <DashboardProvider>
              <PendingCounterProvider>
                <AppRoutes />
              </PendingCounterProvider>
            </DashboardProvider>
          </ListingsProvider>
        </CookieConsentProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

const AppRoutes = () => {
  const suspense = (element: React.ReactNode) => (
    <Suspense fallback={null}>{element}</Suspense>
  );

  // Check if we're on a subdomain for public website viewing
  // e.g., prof-service-123.localhost:5175
  const isSubdomain = () => {
    const hostname = window.location.hostname;

    // Never treat raw IPv4 addresses as subdomains (e.g. 192.168.0.200).
    const isIPv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
    if (isIPv4) {
      return false;
    }

    const parts = hostname.split(".");

    // Reserved subdomains that should NOT be treated as website slugs
    const reservedSubdomains = [
      "www",
      "api",
      "admin",
      "app",
      "dashboard",
      "staging",
      "dev",
      "test",
      "localhost",
    ];

    // Check if we have a subdomain and it's not reserved
    if (parts.length > 1 && parts[0] !== "localhost") {
      const subdomain = parts[0].toLowerCase();
      return !reservedSubdomains.includes(subdomain);
    }

    return false;
  };

  // If on subdomain, render public website
  if (isSubdomain()) {
    const subdomainRouter = createBrowserRouter([
      {
        path: "*",
        element: <PublicWebsite />,
      },
    ]);
    return <RouterProvider router={subdomainRouter} />;
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/about",
          element: suspense(<About />),
        },
        {
          path: "/pricing",
          element: (
            <Suspense fallback={<PricingPageFallback />}>
              <Pricing />
            </Suspense>
          ),
        },
        {
          path: "/templates",
          element: suspense(<Templates />),
        },
        {
          path: "/listings",
          element: (
            <Suspense fallback={<ListingsPageFallback />}>
              <Listings />
            </Suspense>
          ),
        },
        {
          path: "/directory",
          element: suspense(<Directory />),
        },
        {
          path: "/contact",
          element: (
            <Suspense fallback={<ContactPageFallback />}>
              <Contact />
            </Suspense>
          ),
        },
        // {
        //   path: "/business/:slug",
        //   element: <ListingComapanyDetails />,
        // },
        // {
        //   path: "/listings/:pid",
        //   element: <ListingDetails />,
        // },

        //  {
        //   path: "/insight-details/:id",
        //   element: <InsightDetails />,
        // },

        {
          path: "/blog",
          element: (
            <Suspense fallback={<BlogPageFallback />}>
              <InsightsPage />
            </Suspense>
          ),
        },

        {
          path: "/blogdetail/:id",
          element: suspense(<BlogDetail />),
        },
        {
          path: "/terms-and-conditions",
          element: (
            <Suspense fallback={<LegalPageFallback />}>
              <TermsConditions />
            </Suspense>
          ),
        },
        {
          path: "/faq",
          element: (
            <Suspense fallback={<LegalPageFallback />}>
              <Faq />
            </Suspense>
          ),
        },
        {
          path: "/privacy-policy",
          element: (
            <Suspense fallback={<LegalPageFallback />}>
              <PrivacyPolicy />
            </Suspense>
          ),
        },
        {
          path: "/cookie-policy",
          element: (
            <Suspense fallback={<LegalPageFallback />}>
              <CookiePolicy />
            </Suspense>
          ),
        },
        {
          path: "/checkout/:storeId",
          element: suspense(<CheckoutPage />),
        },
        {
          path: "/site/:slug",
          element: suspense(<PublicWebsite />),
        },
        {
          path: "/site/:slug/*",
          element: suspense(<PublicWebsite />),
        },
        {
          path: "*",
          element: <NotFoundLayout />,
        },
      ],
    },
    {
      path: "/",
      element: <AuthDashboardLayout />,
      children: [
        {
          path: "/auth",
          element: suspense(<Auth />),
        },
        {
          path: "/dashboard/stores/create",
          element: suspense(<CreateStoreWizard />),
        },
        {
          path: "/dashboard/websites/:websiteId/editor",
          element: suspense(<WebsiteEditor />),
        },
        {
          path: "/dashboard/*",
          element: suspense(<Dashboard />),
        },
        {
          path: "/template-preview/:templateId",
          element: suspense(<TemplatePreview />),
        },
        {
          path: "/landing-preview/:templateId/:pageId?",
          element: suspense(<LandingPreview />),
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
