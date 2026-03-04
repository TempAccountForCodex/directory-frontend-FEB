import { Typography, Box, Button } from "@mui/material";
import React from "react";
import HeroBannerSection from "../../utils/commons/HeroImageSectionV2";
import companyData from "../../utils/data/CompanyInfo";
const CookiesImage = "/assets/images/FooterResources/cookiespolicy.jpg";
import SettingsIcon from "@mui/icons-material/Settings";
import CookieIcon from "@mui/icons-material/Cookie";
import InfoIcon from "@mui/icons-material/Info";
import CategoryIcon from "@mui/icons-material/Category";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import UpdateIcon from "@mui/icons-material/Update";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import { useCookieConsent } from "../../context/PreferencesContext";

const CookiesPolicy = () => {
  const { openPreferences } = useCookieConsent();
  const lastUpdated = "November 26, 2025";

  return (
    <Box>
      <HeroBannerSection
        imageSrc={CookiesImage}
        fullscreen={true}
        dynamicTitle={true}
        dynamicPhrases={[
          "Cookies Policy",
          "How We Use Cookies",
          "Your Data. Your Choice.",
        ]}
        subText="Learn how we use cookies to enhance your experience, personalize content, and improve our services while keeping your privacy secure."
        showCTA={false}
        backgroundPosition="center calc(100% + 50px)"
        children={undefined}
      />

      <Box
        sx={{
          paddingX: { xs: 2, md: "10rem" },
          paddingY: { xs: 2, md: "2rem" },
        }}
      >
        {/* Main Page Heading */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: 1,
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "#378C92",
                fontSize: { xs: "2.5rem", md: "3rem" },
                fontFamily: "Questrial",
                fontWeight: "600",
                mb: 0.5,
              }}
            >
              Cookies Policy
            </Typography>
            <Typography
              sx={{
                color: "#666",
                fontSize: { xs: "0.875rem", md: "0.95rem" },
                fontFamily: "system-ui",
              }}
            >
              Last Updated: {lastUpdated}
            </Typography>
          </Box>

          <Button
            onClick={openPreferences}
            startIcon={<SettingsIcon />}
            variant="contained"
            sx={{
              backgroundColor: "#378C92",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.95rem",
              textTransform: "none",
              fontFamily: "system-ui",
              px: 3,
              py: 1.2,
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(55, 140, 146, 0.3)",
              "&:hover": {
                backgroundColor: "#4aa4ab",
                boxShadow: "0 6px 16px rgba(55, 140, 146, 0.4)",
              },
            }}
          >
            Manage Cookie Preferences
          </Button>
        </Box>

        <Box sx={{ mb: { xs: "1.5rem", md: "2.5rem" } }} />

        {/* Section 1 */}
        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "1.3rem", md: "1.5rem" },
            fontWeight: "600",
            fontFamily: "system-ui",
            mb: 1.5,
            mt: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <InfoIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          Introduction to Our Cookies Policy
        </Typography>
        <Typography
          sx={{
            color: "#000000",
            fontSize: { xs: "0.9rem", md: "1.1rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: "1.5rem",
          }}
        >
          This Cookies Policy explains how Techietribe (Pvt.) Ltd. uses cookies
          and similar tracking technologies on our website,
          www.thetechietribe.com. Cookies allow us to remember your preferences,
          understand how you interact with our platform, and provide a seamless
          and personalized browsing experience. By continuing to use our site,
          you agree to the terms described in this policy. We are committed to
          being transparent about how your data is collected and stored through
          cookies.
        </Typography>

        {/* Section 2 */}
        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "1.3rem", md: "1.5rem" },
            fontWeight: "600",
            fontFamily: "system-ui",
            mb: 1.5,
            mt: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CookieIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          What Are Cookies?
        </Typography>
        <Typography
          sx={{
            color: "#000000",
            fontSize: { xs: "0.9rem", md: "1.1rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: "1.5rem",
          }}
        >
          Cookies are small text files stored on your device when you visit a
          website. They help websites recognize returning visitors, store
          information such as login details, preferences, and settings, and
          enhance the overall user experience. Some cookies are temporary
          (session cookies) and expire once you close your browser, while others
          (persistent cookies) remain stored until they expire or are deleted
          manually.
        </Typography>

        {/* Section 3 */}
        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "1.3rem", md: "1.5rem" },
            fontWeight: "600",
            fontFamily: "system-ui",
            mb: 1.5,
            mt: 3,
          }}
        >
          How We Use Cookies
        </Typography>
        <Typography
          sx={{
            color: "#000000",
            fontSize: { xs: "0.9rem", md: "1.1rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: "1.5rem",
          }}
        >
          We use cookies to improve our website’s performance and make your
          interaction with us more meaningful. Specifically, cookies help us:
        </Typography>
        <ul
          style={{
            paddingLeft: "1.5rem",
            marginTop: "-0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <li>Remember your login details and keep you signed in securely.</li>
          <li>
            Save your preferences for language, region, and theme settings.
          </li>
          <li>
            Analyze site traffic patterns to understand what content is most
            useful.
          </li>
          <li>
            Deliver relevant recommendations, promotions, and advertisements.
          </li>
          <li>Enhance the speed and security of our website’s functions.</li>
        </ul>

        {/* Section 4 */}
        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "1.3rem", md: "1.5rem" },
            fontWeight: "600",
            fontFamily: "system-ui",
            mb: 1.5,
            mt: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CategoryIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          Types of Cookies We Use
        </Typography>
        <Typography
          sx={{
            color: "#000000",
            fontSize: { xs: "0.9rem", md: "1.1rem" },
            lineHeight: "1.7",
            mb: "1.5rem",
          }}
        >
          Our website may use the following types of cookies:
        </Typography>
        <ul
          style={{
            paddingLeft: "1.5rem",
            marginTop: "-0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <li>
            <strong>Essential Cookies:</strong> Required for basic site
            operations, such as page navigation and secure login access. These
            cookies cannot be disabled.
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Help us understand how visitors
            interact with our website by collecting and reporting information
            anonymously. We use Google Analytics (GA4) to measure site traffic
            and improve our services.{" "}
            <em>You can manage this in your cookie preferences.</em>
          </li>
          <li>
            <strong>Marketing Cookies:</strong> Used to track visitors across
            websites to display relevant advertisements. Currently not in use on
            our site.
          </li>
        </ul>

        {/* Section 5 */}
        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "1.3rem", md: "1.5rem" },
            fontWeight: "600",
            fontFamily: "system-ui",
            mb: 1.5,
            mt: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ManageAccountsIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          Managing Your Cookie Preferences
        </Typography>
        <Typography
          sx={{
            color: "#000000",
            fontSize: { xs: "0.9rem", md: "1.1rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: "1rem",
          }}
        >
          You have full control over which cookies you allow on our website. You
          can:
        </Typography>
        <ul
          style={{
            paddingLeft: "1.5rem",
            marginTop: "-0.5rem",
            marginBottom: "1rem",
          }}
        >
          <li>
            <strong>Manage preferences directly on our site:</strong> Click the
            "Manage Cookie Preferences" button above or use the "Cookie
            Settings" link in the footer to customize your choices at any time.
          </li>
          <li>
            <strong>Browser settings:</strong> Configure your browser to block
            or delete cookies. Note that this may affect website functionality.
          </li>
          <li>
            <strong>Change your mind:</strong> Your preferences are saved and
            you can update them whenever you want by accessing the cookie
            settings.
          </li>
        </ul>
        <Box
          sx={{
            p: 2.5,
            borderRadius: "10px",
            backgroundColor: "rgba(55, 140, 146, 0.08)",
            border: "1px solid rgba(55, 140, 146, 0.2)",
            mb: "1.5rem",
          }}
        >
          <Typography
            sx={{
              color: "#378C92",
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              fontFamily: "Questrial",
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            Your Privacy Matters
          </Typography>
          <Typography
            sx={{
              color: "#000000",
              fontSize: { xs: "0.9rem", md: "1rem" },
              fontFamily: "Questrial",
              lineHeight: "1.7",
            }}
          >
            We respect your privacy and only use analytics cookies with your
            explicit consent. Essential cookies are necessary for the website to
            function and cannot be disabled. You can withdraw your consent for
            non-essential cookies at any time.
          </Typography>
        </Box>

        {/* Section 6 */}
        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "1.3rem", md: "1.5rem" },
            fontWeight: "600",
            fontFamily: "system-ui",
            mb: 1.5,
            mt: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <UpdateIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          Changes to This Cookies Policy
        </Typography>
        <Typography
          sx={{
            color: "#000000",
            fontSize: { xs: "0.9rem", md: "1.1rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: "1.5rem",
          }}
        >
          We may update this Cookies Policy periodically to reflect changes in
          technology, legislation, or how we use cookies. Any updates will be
          posted on this page, and we encourage you to review the policy
          regularly to stay informed about our data practices.
        </Typography>

        {/* Section 7 */}
        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "1.3rem", md: "1.5rem" },
            fontWeight: "600",
            fontFamily: "system-ui",
            mb: 1.5,
            mt: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ContactMailIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          Contact Us
        </Typography>
        <Typography
          sx={{
            color: "#000000",
            fontSize: { xs: "0.9rem", md: "1.1rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: "1.5rem",
          }}
        >
          If you have any questions about how we use cookies or how your data is
          handled, please contact us at{" "}
          <strong>{companyData.officialEmail}</strong>. Our support team is
          happy to assist you with any privacy-related inquiries.
        </Typography>
      </Box>
    </Box>
  );
};

export default CookiesPolicy;
