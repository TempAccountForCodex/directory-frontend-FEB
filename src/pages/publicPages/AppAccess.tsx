import React from "react";
import { Box, Typography } from "@mui/material";
import { Helmet } from "react-helmet";
import LoginIcon from "@mui/icons-material/Login";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SecurityIcon from "@mui/icons-material/Security";
import PolicyIcon from "@mui/icons-material/Policy";
import HeroBannerSection from "../../utils/commons/HeroImageSectionV2";
import companyData from "../../utils/data/CompanyInfo";

const heroImage = "/assets/publicAssets/images/home/BusinessDirectory.webp";

const sectionTitleSx = {
  color: "#000",
  fontSize: { xs: "1.3rem", md: "1.5rem" },
  fontWeight: "600",
  fontFamily: "system-ui",
  mb: 1.5,
  mt: 3,
  display: "flex",
  alignItems: "center",
  gap: 1,
};

const bodyTextSx = {
  color: "#000",
  fontSize: { xs: "0.9rem", md: "1.05rem" },
  fontFamily: "Questrial",
  lineHeight: "1.7",
  mb: 1.5,
};

const listSx = {
  pl: 3,
  mb: 2.5,
  "& li": {
    mb: 1.5,
    fontSize: { xs: "0.9rem", md: "1.05rem" },
    fontFamily: "Questrial",
    lineHeight: "1.7",
    color: "#000",
  },
};

const AppAccess = () => {
  const lastUpdated = "July 27, 2026";

  return (
    <Box>
      <Helmet>
        <title>App Access and Google Data Use | Techietribe</title>
        <meta
          name="description"
          content="Learn how Techietribe uses Google sign-in for secure account access, business directory tools, dashboards, and user data handling."
        />
        <link rel="canonical" href="https://www.techietribe.ai/app-access" />
      </Helmet>

      <HeroBannerSection
        imageSrc={heroImage}
        fullscreen={true}
        dynamicTitle={true}
        dynamicPhrases={[
          "App Access",
          "Google Sign-In",
          "Secure Account Access",
        ]}
        subText="Learn how Techietribe uses Google sign-in for secure account access and how Google user data is handled."
        showCTA={false}
        backgroundPosition="center"
        children={undefined}
      />

      <Box
        sx={{
          paddingX: { xs: 2, md: "10rem" },
          paddingY: { xs: 2, md: "2rem" },
        }}
      >
        <Typography
          sx={{
            color: "#378C92",
            fontSize: { xs: "2.5rem", md: "3rem" },
            fontFamily: "Questrial",
            fontWeight: "600",
            mb: 0.5,
          }}
        >
          App Access & Google Data Use
        </Typography>

        <Typography
          sx={{
            color: "#666",
            fontSize: { xs: "0.875rem", md: "0.95rem" },
            fontFamily: "system-ui",
            mb: { xs: "1.5rem", md: "2.5rem" },
          }}
        >
          Last Updated: {lastUpdated}
        </Typography>

        <Box
          sx={{
            p: 3,
            borderRadius: "10px",
            backgroundColor: "rgba(55, 140, 146, 0.08)",
            border: "1px solid rgba(55, 140, 146, 0.2)",
            mb: 3,
          }}
        >
          <Typography
            sx={{
              color: "#000",
              fontSize: { xs: "0.95rem", md: "1.1rem" },
              fontFamily: "Questrial",
              lineHeight: "1.7",
            }}
          >
            Techietribe uses Google sign-in to help authorized users securely
            access their account, dashboard, business listings, website tools,
            and related directory services. This page explains the purpose of
            the application, what Google user data may be used, and how that
            data supports authentication and service delivery.
          </Typography>
        </Box>

        <Typography sx={sectionTitleSx}>
          <LoginIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          Purpose of the Application
        </Typography>
        <Typography sx={bodyTextSx}>
          Techietribe is a business directory and website platform that helps
          users discover local businesses, manage listings, create and maintain
          websites, and access dashboard tools for account and service
          management.
        </Typography>

        <Typography sx={sectionTitleSx}>
          <VerifiedUserIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          Why We Use Google Sign-In
        </Typography>
        <Typography sx={bodyTextSx}>
          Google sign-in is used to verify a user's identity and provide a
          secure login option. When a user chooses to sign in with Google, we
          may use basic Google profile information only for authentication,
          account identification, dashboard access, and account security.
        </Typography>

        <Box component="ul" sx={listSx}>
          <li>Verify the identity of the person signing in.</li>
          <li>Create, locate, or manage the user's Techietribe account.</li>
          <li>Provide access to authorized dashboard and listing features.</li>
          <li>Help protect accounts from unauthorized access.</li>
        </Box>

        <Typography sx={sectionTitleSx}>
          <SecurityIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          Google User Data We May Use
        </Typography>
        <Typography sx={bodyTextSx}>
          Depending on the permissions shown during sign-in, Techietribe may use
          basic Google account information such as name, email address, and
          profile image. This information is used only for authentication,
          account identification, access management, and service delivery.
        </Typography>
        <Typography sx={bodyTextSx}>
          Techietribe does not sell Google user data and does not use Google
          user data for advertising. Google user data is not shared with third
          parties except where required to provide the requested service, comply
          with law, or protect account security.
        </Typography>

        <Typography sx={sectionTitleSx}>
          <PolicyIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          Privacy Policy and Contact
        </Typography>
        <Typography sx={bodyTextSx}>
          For more details about how Techietribe handles personal information,
          please review our{" "}
          <Box
            component="a"
            href="/privacy-policy"
            sx={{ color: "#378C92", fontWeight: 700 }}
          >
            Privacy Policy
          </Box>
          . If you have questions about app access or Google data use, contact
          us at{" "}
          <Box
            component="a"
            href={`mailto:${companyData.officialEmail}`}
            sx={{ color: "#378C92", fontWeight: 700 }}
          >
            {companyData.officialEmail}
          </Box>
          .
        </Typography>
      </Box>
    </Box>
  );
};

export default AppAccess;
