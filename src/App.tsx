import React, { Suspense, lazy, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CookieConsentProvider } from "./context/PreferencesContext";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import Home from "../src/pages/publicPages/Home";
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
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const PrivacyPolicy = lazy(() => import("../src/pages/publicPages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("../src/pages/publicPages/CookiePolicy"));
import { DashboardProvider } from "./context/DashboardContext";
import { PendingCounterProvider } from "./context/pending-counter";
import { ListingsProvider } from "./context/ListingsContext.js";
const PublicWebsite = lazy(() => import("./pages/PublicWebsite"));
const TemplatePreview = lazy(() => import("./pages/TemplatePreview"));
const CreateStoreWizard = lazy(() => import("./pages/CreateStoreWizard"));
const About = lazy(() => import("../src/pages/publicPages/About"));
const Pricing = lazy(() => import("../src/pages/publicPages/Pricing"));

const InsightsPage = lazy(() => import("./pages/publicPages/Blog.js"));
const Footer = lazy(() => import("./components/Footer"));
const MoveUpBtn = lazy(() => import("./components/UI/MoveUpBtn"));
const CookieBanner = lazy(
  () => import("./components/UserPreferences/PreferenceBanner.jsx"),
);
const CookiePreferences = lazy(
  () => import("./components/UserPreferences/PreferenceSettings.jsx"),
);
// import InsightDetails from "./pages/InsightsDetails";

const DeferredRender = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const start = () => {
      if (!cancelled) setReady(true);
    };

    const isMobile = window.matchMedia("(max-width: 900px)").matches;
    const mobileDelay = 10000;
    const desktopDelay = 600;
    const timer = window.setTimeout(
      start,
      isMobile ? mobileDelay : desktopDelay,
    );
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return ready ? <>{children}</> : null;
};

const MainLayout = () => (
  <>
    <GoogleAnalyticsTracker />
    <DeferredRender>
      <Suspense fallback={null}>
        <CookieBanner />
        <CookiePreferences />
      </Suspense>
    </DeferredRender>
    <Navbar />
    <ScrollToTop />
    <Outlet />
    <DeferredRender>
      <Suspense fallback={null}>
        <Footer />
        <MoveUpBtn />
      </Suspense>
    </DeferredRender>
  </>
);

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
          element: suspense(<Pricing />),
        },
        {
          path: "/listings",
          element: suspense(<Listings />),
        },
        {
          path: "/directory",
          element: suspense(<Directory />),
        },
        {
          path: "/contact",
          element: suspense(<Contact />),
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
          element: suspense(<InsightsPage />),
        },

        {
          path: "/blogdetail/:id",
          element: suspense(<BlogDetail />),
        },
        {
          path: "/terms-and-conditions",
          element: suspense(<TermsConditions />),
        },
        {
          path: "/privacy-policy",
          element: suspense(<PrivacyPolicy />),
        },
        {
          path: "/cookie-policy",
          element: suspense(<CookiePolicy />),
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
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
