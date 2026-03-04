import { Typography, Box } from "@mui/material";
import React from "react";
import HeroBannerSection from "../../utils/commons//HeroImageSectionV2";
const PrivacyPolicyImage = "/assets/images/FooterResources/privacyPolicy.jpg";
import companyData from "../../utils/data/CompanyInfo";
import SecurityIcon from "@mui/icons-material/Security";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import PolicyIcon from "@mui/icons-material/Policy";

const PrivacyPolicy = () => {
  const lastUpdated = "November 26, 2025";

  return (
    <Box>
      <HeroBannerSection
        imageSrc={PrivacyPolicyImage}
        fullscreen={true}
        dynamicTitle={true}
        dynamicPhrases={[
          "Privacy Policy",
          "Your Data Matters",
          "We Value Your Trust",
        ]}
        subText="Our privacy policy outlines how we collect, use, and protect your personal data in accordance with industry best practices and legal standards."
        showCTA={false}
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
          Privacy Policy
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
            Welcome to Techietribe (Pvt.) Ltd.'s Privacy Policy. We are
            committed to safeguarding your privacy and ensuring that your
            personal data is handled responsibly, securely, and transparently.
            By using our website (www.thetechietribe.com), you acknowledge and
            agree to the practices described in this policy.
          </Typography>
        </Box>

        {/* Section 1: Information We Collect */}
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
          <PrivacyTipIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          Information We Collect
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
          We collect both personal and non-personal information to provide you
          with a tailored, secure experience on our website:
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
            <strong>Personal Information:</strong> Name, email address, phone
            number, company name, and any information you voluntarily provide
            through contact forms, career applications, or communication
            channels.
          </li>
          <li>
            <strong>Technical Data:</strong> IP address, browser type and
            version, device information, operating system, and screen resolution
            to ensure compatibility and optimal performance.
          </li>
          <li>
            <strong>Usage Information:</strong> Pages visited, time spent on
            site, click patterns, and navigation behavior collected via cookies
            and analytics tools (with your consent).
          </li>
          <li>
            <strong>Uploaded Files:</strong> Resumes and documents submitted
            through our career application form, securely stored and processed
            for recruitment purposes only.
          </li>
        </Box>

        {/* Section 2: How We Use Your Information */}
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
          <PolicyIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          How We Use Your Information
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
          The information we collect enables us to:
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
            Deliver, maintain, and continuously improve our services and website
            functionality
          </li>
          <li>
            Respond to your inquiries, provide support, and communicate
            important updates
          </li>
          <li>
            Personalize your experience by recommending relevant content and
            services
          </li>
          <li>
            Send newsletters, promotional offers, event invitations, or
            resources (you may opt out at any time)
          </li>
          <li>
            Analyze website usage trends and measure the effectiveness of our
            content and campaigns
          </li>
          <li>Protect against fraudulent, unauthorized, or illegal activity</li>
          <li>Process career applications and communicate with candidates</li>
          <li>
            Comply with legal obligations and enforce our terms of service
          </li>
        </Box>

        {/* Section 3: Data Protection and Security */}
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
          <SecurityIcon sx={{ color: "#378C92", fontSize: "1.8rem" }} />
          Data Protection and Security
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: { xs: "0.9rem", md: "1.05rem" },
            fontFamily: "Questrial",
            lineHeight: "1.7",
            mb: 2,
          }}
        >
          We implement industry-standard technical and organizational measures
          to protect your personal data from unauthorized access, alteration,
          disclosure, or destruction. Our security practices include:
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
            Encrypted data transmission (HTTPS/SSL) for all sensitive
            information
          </li>
          <li>Secure cloud storage with access controls and monitoring</li>
          <li>Regular security audits and vulnerability assessments</li>
          <li>Restricted access to personal data (need-to-know basis)</li>
          <li>Employee training on data protection and privacy practices</li>
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
            <strong>Important Notice:</strong> While we take every reasonable
            precaution to secure your information, no method of electronic
            transmission or storage is completely risk-free. We cannot guarantee
            absolute security but are committed to protecting your data to the
            best of our ability.
          </Typography>
        </Box>

        {/* Section 4: Cookies and Tracking */}
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
          Cookies and Tracking Technologies
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
          We use cookies to enhance your browsing experience and analyze site
          traffic. You have full control over cookie preferences through our
          cookie consent banner. For detailed information, please review our{" "}
          <Typography
            component="a"
            href="/cookie-policy"
            sx={{
              color: "#378C92",
              textDecoration: "underline",
              "&:hover": { color: "#4aa4ab" },
            }}
          >
            Cookie Policy
          </Typography>
          .
        </Typography>

        {/* Section 5: Sharing Your Information */}
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
          Sharing Your Information
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
          <strong>
            We do not sell or rent your personal information to third parties.
          </strong>{" "}
          However, we may share your data in the following limited
          circumstances:
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
            <strong>Service Providers:</strong> Trusted third-party vendors who
            help us operate our website, process applications, or deliver
            services (e.g., Google Analytics, Google Drive), under strict
            confidentiality agreements
          </li>
          <li>
            <strong>Legal Requirements:</strong> When required to comply with
            laws, regulations, legal processes, or valid government requests
          </li>
          <li>
            <strong>Business Transfers:</strong> In the event of a merger,
            acquisition, or asset sale, your information may be transferred (you
            will be notified)
          </li>
          <li>
            <strong>Protection of Rights:</strong> To protect our rights,
            property, safety, or that of our users and the public
          </li>
        </Box>

        {/* Section 6: Your Rights */}
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
          Your Privacy Rights
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
          You have the following rights regarding your personal data:
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
            <strong>Access:</strong> Request a copy of the personal data we hold
            about you
          </li>
          <li>
            <strong>Correction:</strong> Update or correct inaccurate or
            incomplete information
          </li>
          <li>
            <strong>Deletion:</strong> Request deletion of your personal data
            (subject to legal obligations)
          </li>
          <li>
            <strong>Objection:</strong> Object to certain types of data
            processing
          </li>
          <li>
            <strong>Data Portability:</strong> Receive your data in a
            structured, machine-readable format
          </li>
          <li>
            <strong>Withdraw Consent:</strong> Opt out of marketing
            communications or analytics tracking at any time
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
            To exercise any of these rights, please contact us at{" "}
            <strong>{companyData.officialEmail}</strong>. We will respond to
            your request within 30 days in accordance with applicable data
            protection laws.
          </Typography>
        </Box>

        {/* Section 7: Third-Party Links */}
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
          Third-Party Links
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
          Our website may contain links to external third-party websites for
          your convenience. We are not responsible for the privacy practices,
          content, or policies of these external sites. We strongly recommend
          reviewing the privacy policies of any third-party sites you visit
          before sharing personal information.
        </Typography>

        {/* Section 8: Children's Privacy */}
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
          Children's Privacy
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
          Our services are not directed to individuals under the age of 18. We
          do not knowingly collect personal information from children. If you
          believe we have inadvertently collected information from a child,
          please contact us immediately so we can delete it.
        </Typography>

        {/* Section 9: International Data Transfers */}
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
          International Data Transfers
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
          Your information may be transferred to and processed in countries
          other than your country of residence. These countries may have
          different data protection laws. By using our website, you consent to
          such transfers. We ensure appropriate safeguards are in place to
          protect your data in accordance with this Privacy Policy.
        </Typography>

        {/* Section 10: Changes to This Policy */}
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
          Changes to This Privacy Policy
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
          We may update this Privacy Policy periodically to reflect changes in
          our practices, technology, or legal requirements. Any material changes
          will be posted on this page with an updated "Last Updated" date.
          Continued use of our website after such changes constitutes your
          acceptance of the revised policy. We encourage you to review this page
          regularly.
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
          If you have any questions, concerns, or requests related to this
          Privacy Policy or our data practices, please contact us:
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
      </Box>
    </Box>
  );
};

export default PrivacyPolicy;
