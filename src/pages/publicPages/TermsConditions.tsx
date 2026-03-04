import { Typography, Box } from "@mui/material";
import React from "react";
import HeroBannerSection from "../../utils/commons/HeroImageSectionV2";
const TermsAndConditionsHeader =
  "/assets/images/FooterResources/terms-and-conditions.jpg";
import companyData from "../../utils/data/CompanyInfo";
import GavelIcon from "@mui/icons-material/Gavel";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AssignmentIcon from "@mui/icons-material/Assignment";

const TermsAndConditions = () => {
  const lastUpdated = "November 26, 2025";

  return (
    <Box>
      <HeroBannerSection
        imageSrc={TermsAndConditionsHeader}
        fullscreen={true}
        dynamicTitle={true}
        dynamicPhrases={[
          "Terms & Conditions",
          "User Agreement",
          "Know Your Rights",
        ]}
        subText="Please review the terms and conditions that govern the use of our website, services, and your rights and responsibilities while interacting with our platform."
        showCTA={false}
        backgroundPosition="top"
        children={undefined}
      />

      <Box
        sx={{
          paddingX: { xs: 2, md: "10rem" },
          paddingY: { xs: 2, md: "2rem" },
        }}
      >
        {/* Main Page Heading */}
        <Typography
          sx={{
            color: "#378C92",
            fontSize: { xs: "2.5rem", md: "3rem" },
            fontFamily: "Questrial",
            fontWeight: "600",
            mb: 0.5,
          }}
        >
          Terms & Conditions
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

        {/* Introduction */}
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
            Welcome to www.thetechietribe.com, the sole property of Techietribe
            (Pvt.) Ltd. By accessing and using our website, you accept and agree
            to comply with these Terms and Conditions. Please read them
            carefully before using our services. We reserve the right to modify,
            change, or revise these terms at any time.
          </Typography>
        </Box>

        {/* Section 1: Acceptance of Terms */}
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
          <GavelIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          Acceptance of Terms
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: 2.5,
          }}
        >
          By accessing, browsing, or using www.thetechietribe.com, you
          acknowledge that you have read, understood, and agree to be bound by
          these Terms and Conditions. If you do not agree with these terms, you
          must discontinue use of our website immediately. Your continued use
          constitutes acceptance of any updates or modifications to these terms.
        </Typography>

        {/* Section 2: Website Use and Availability */}
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
          Website Use and Availability
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: 1.5,
          }}
        >
          We may update, modify, or discontinue our website or any part of it at
          any time to reflect changes to our products, services, business
          priorities, or user needs. While our website is currently available
          for free, we reserve the right to:
        </Typography>

        <Box
          component="ul"
          sx={{
            pl: 3,
            mb: 2.5,
            "& li": {
              mb: 1.5,
              fontSize: { xs: "0.9rem", md: "1.05rem" },
              fontFamily: "Questrial",
              lineHeight: "1.7",
              color: "#000",
            },
          }}
        >
          <li>
            Restrict access to any part of the website for maintenance or
            operational reasons
          </li>
          <li>
            Suspend or withdraw the website temporarily or permanently without
            prior notice
          </li>
          <li>
            Implement changes to features, content, or functionality as we deem
            necessary
          </li>
          <li>
            Introduce premium features or services that may require payment in
            the future
          </li>
        </Box>

        {/* Section 3: User Accounts and Security */}
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
          <VerifiedUserIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          User Accounts and Security
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: 1.5,
          }}
        >
          If you are provided with a user identification code, password, or any
          other information as part of our digital security procedures, you are
          responsible for:
        </Typography>

        <Box
          component="ul"
          sx={{
            pl: 3,
            mb: 2,
            "& li": {
              mb: 1.5,
              fontSize: { xs: "0.9rem", md: "1.05rem" },
              fontFamily: "Questrial",
              lineHeight: "1.7",
              color: "#000",
            },
          }}
        >
          <li>
            <strong>Keeping all credentials confidential</strong> and not
            sharing them with third parties
          </li>
          <li>
            <strong>Immediately notifying us</strong> at{" "}
            {companyData.officialEmail} if you suspect unauthorized access or
            security violations
          </li>
          <li>
            <strong>Using strong, unique passwords</strong> and enabling
            two-factor authentication where available
          </li>
          <li>
            <strong>Taking responsibility</strong> for all activities conducted
            under your account
          </li>
        </Box>

        <Box
          sx={{
            p: 2.5,
            borderRadius: "8px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            mb: 3,
          }}
        >
          <Typography
            sx={{
              color: "#856404",
              fontSize: { xs: "0.875rem", md: "0.95rem" },
              fontFamily: "Questrial",
              lineHeight: "1.6",
            }}
          >
            <strong>Security Warning:</strong> We will never ask for your
            password via email or phone. If you receive such a request, do not
            respond and contact us immediately.
          </Typography>
        </Box>

        {/* Section 4: Intellectual Property Rights */}
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
          <AssignmentIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          Intellectual Property Rights
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: 1.5,
          }}
        >
          All content published on this website, including but not limited to
          text, graphics, logos, images, videos, audio, software, and code, is
          owned by or licensed to Techietribe (Pvt.) Ltd. and is protected by
          international copyright laws.
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "1.05rem", md: "1.15rem" },
            fontWeight: 600,
            fontFamily: "system-ui",
            mb: 1,
            mt: 2,
          }}
        >
          You MAY:
        </Typography>

        <Box
          component="ul"
          sx={{
            pl: 3,
            mb: 2,
            "& li": {
              mb: 1,
              fontSize: { xs: "0.9rem", md: "1.05rem" },
              fontFamily: "Questrial",
              lineHeight: "1.7",
              color: "#000",
            },
          }}
        >
          <li>Download extracts from pages for personal, non-commercial use</li>
          <li>
            Print copies for personal reference, provided our trademark remains
            visible
          </li>
          <li>
            Share links to our content on social media or websites with proper
            attribution
          </li>
        </Box>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "1.05rem", md: "1.15rem" },
            fontWeight: 600,
            fontFamily: "system-ui",
            mb: 1,
            mt: 2,
          }}
        >
          You MAY NOT:
        </Typography>

        <Box
          component="ul"
          sx={{
            pl: 3,
            mb: 2.5,
            "& li": {
              mb: 1,
              fontSize: { xs: "0.9rem", md: "1.05rem" },
              fontFamily: "Questrial",
              lineHeight: "1.7",
              color: "#000",
            },
          }}
        >
          <li>
            Modify, reproduce, or create derivative works from our content
            without permission
          </li>
          <li>
            Use content for commercial purposes without a license or prior
            written consent
          </li>
          <li>
            Remove, alter, or obscure any copyright, trademark, or proprietary
            notices
          </li>
          <li>
            Use automated tools to scrape, copy, or extract website content
          </li>
          <li>
            Reverse engineer, decompile, or attempt to extract source code
          </li>
        </Box>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: 2.5,
          }}
        >
          Violation of these terms may result in termination of your access and
          legal action. At our discretion, you may be required to destroy or
          return any copies of materials you have obtained.
        </Typography>

        {/* Section 5: User Conduct and Prohibited Activities */}
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
          User Conduct and Prohibited Activities
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: 1.5,
          }}
        >
          You agree not to use our website for any unlawful or prohibited
          purposes, including but not limited to:
        </Typography>

        <Box
          component="ul"
          sx={{
            pl: 3,
            mb: 2.5,
            "& li": {
              mb: 1.5,
              fontSize: { xs: "0.9rem", md: "1.05rem" },
              fontFamily: "Questrial",
              lineHeight: "1.7",
              color: "#000",
            },
          }}
        >
          <li>
            Transmitting malware, viruses, or harmful code that could damage our
            systems or users
          </li>
          <li>
            Attempting to gain unauthorized access to our servers, networks, or
            data
          </li>
          <li>
            Impersonating another person or entity, or providing false
            information
          </li>
          <li>
            Harassing, threatening, or defaming others through our platform
          </li>
          <li>
            Uploading or distributing content that infringes on intellectual
            property rights
          </li>
          <li>
            Using automated systems to access the website without our written
            permission
          </li>
          <li>
            Interfering with or disrupting the operation of our website or
            services
          </li>
        </Box>

        {/* Section 6: Third-Party Links */}
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
          Third-Party Links and Services
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: 2.5,
          }}
        >
          Our website may contain links to third-party websites, services, or
          resources provided for your convenience and informational purposes
          only. We do not endorse, control, or assume responsibility for the
          content, privacy policies, or practices of any third-party sites. Use
          of external links is at your own risk, and we encourage you to review
          the terms and privacy policies of any third-party sites you visit.
        </Typography>

        {/* Section 7: Refunds and Cancellations */}
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
          Refunds and Cancellations
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: 1.5,
          }}
        >
          For projects and services provided by Techietribe, refund and
          cancellation requests will be considered under the following
          conditions:
        </Typography>

        <Box
          component="ul"
          sx={{
            pl: 3,
            mb: 2,
            "& li": {
              mb: 1.5,
              fontSize: { xs: "0.9rem", md: "1.05rem" },
              fontFamily: "Questrial",
              lineHeight: "1.7",
              color: "#000",
            },
          }}
        >
          <li>
            <strong>Full Refund:</strong> If project work has not commenced at
            the time of cancellation request
          </li>
          <li>
            <strong>Partial Refund:</strong> If one or more milestones have been
            completed or delivered, those payments are non-refundable. The
            remaining amount will be refunded after deducting completed work.
          </li>
          <li>
            <strong>Work in Progress:</strong> If a project has been initiated
            but no milestones have been reached, payment for work completed is
            required, with the remaining amount refunded.
          </li>
          <li>
            <strong>Project Completion:</strong> No refund or cancellation will
            be provided once the entire project is completed or delivered.
          </li>
          <li>
            <strong>Custom Agreements:</strong> Refunds or cancellations may be
            subject to specific terms agreed upon in individual project
            agreements.
          </li>
        </Box>

        <Box
          sx={{
            p: 2.5,
            borderRadius: "10px",
            backgroundColor: "rgba(55, 140, 146, 0.08)",
            border: "1px solid rgba(55, 140, 146, 0.2)",
            mb: 3,
          }}
        >
          <Typography
            sx={{
              color: "#000",
              fontSize: { xs: "0.9rem", md: "1rem" },
              fontFamily: "Questrial",
              lineHeight: "1.7",
            }}
          >
            <strong>Note:</strong> All refund requests must be submitted in
            writing to {companyData.officialEmail} and will be reviewed on a
            case-by-case basis. Refunds typically take 7-14 business days to
            process.
          </Typography>
        </Box>

        {/* Section 8: Limitation of Liability */}
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
          Limitation of Liability
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: 1.5,
          }}
        >
          To the fullest extent permitted by law, Techietribe (Pvt.) Ltd., its
          officers, directors, employees, and affiliates shall not be liable
          for:
        </Typography>

        <Box
          component="ul"
          sx={{
            pl: 3,
            mb: 2.5,
            "& li": {
              mb: 1.5,
              fontSize: { xs: "0.9rem", md: "1.05rem" },
              fontFamily: "Questrial",
              lineHeight: "1.7",
              color: "#000",
            },
          }}
        >
          <li>
            Any indirect, incidental, special, consequential, or punitive
            damages
          </li>
          <li>Loss of profits, revenue, data, or business opportunities</li>
          <li>
            Damages arising from use or inability to use our website or services
          </li>
          <li>
            Errors, mistakes, or inaccuracies in content or information provided
          </li>
          <li>Unauthorized access to or alteration of your data</li>
          <li>
            Any third-party conduct, content, or services accessed through our
            website
          </li>
        </Box>

        {/* Section 9: Indemnification */}
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
          Indemnification
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: 2.5,
          }}
        >
          You agree to indemnify, defend, and hold harmless Techietribe (Pvt.)
          Ltd. and its affiliates from any claims, damages, losses, liabilities,
          and expenses (including legal fees) arising from: (a) your use or
          misuse of our website, (b) your violation of these Terms and
          Conditions, (c) your violation of any third-party rights, or (d) any
          content you submit or transmit through our website.
        </Typography>

        {/* Section 10: Modifications to Terms */}
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
          Modifications to These Terms
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: 2.5,
          }}
        >
          We reserve the right to modify, update, or replace these Terms and
          Conditions at any time without prior notice. Any new features,
          services, or products added to the website will immediately be subject
          to these terms. Your continued use of the website after changes are
          posted constitutes your acceptance of the modified terms. We encourage
          you to review this page periodically to stay informed of any updates.
        </Typography>

        {/* Section 11: Governing Law */}
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
          Governing Law and Jurisdiction
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: 2.5,
          }}
        >
          These Terms and Conditions shall be governed by and construed in
          accordance with the laws of the jurisdiction in which Techietribe
          (Pvt.) Ltd. operates, without regard to conflict of law principles.
          Any disputes arising from these terms shall be resolved exclusively in
          the courts of that jurisdiction.
        </Typography>

        {/* Section 12: Severability */}
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
          Severability
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: 2.5,
          }}
        >
          If any provision of these Terms and Conditions is found to be
          unlawful, void, or unenforceable, that provision shall be deemed
          severable and shall not affect the validity and enforceability of the
          remaining provisions.
        </Typography>

        {/* Contact Us */}
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
          Contact Us
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: 1,
          }}
        >
          If you have any questions, concerns, or inquiries regarding these
          Terms and Conditions, please contact us:
        </Typography>

        <Box
          sx={{
            p: 2.5,
            borderRadius: "10px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #e0e0e0",
            mt: 2,
            mb: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "0.9rem", md: "1rem" },
              fontFamily: "system-ui",
              color: "#000",
              mb: 0.5,
            }}
          >
            <strong>Email:</strong> {companyData.officialEmail}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "0.9rem", md: "1rem" },
              fontFamily: "system-ui",
              color: "#000",
            }}
          >
            <strong>Company:</strong> Techietribe (Pvt.) Ltd.
          </Typography>
        </Box>

        {/* Acceptance Notice */}
        <Box
          sx={{
            p: 3,
            borderRadius: "10px",
            backgroundColor: "rgba(55, 140, 146, 0.08)",
            border: "1px solid rgba(55, 140, 146, 0.2)",
            mb: 3,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              color: "#378C92",
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              fontFamily: "Questrial",
              fontWeight: 600,
              mb: 1,
            }}
          >
            By using www.thetechietribe.com, you acknowledge that you have read,
            understood, and agree to be bound by these Terms and Conditions.
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
      </Box>
    </Box>
  );
};

export default TermsAndConditions;
