import React, { useState, useEffect } from "react";
import type { ComponentProps } from "react";
import * as Yup from "yup";
import { useLocation } from "react-router-dom";
import { Box, Typography, Grid, Container, SvgIcon } from "@mui/material";
import Form from "../../../components/publicComponents/careers/form";
import { useTheme, alpha } from "@mui/material/styles";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import CompanyContactData from "../../Data/CompanyContactInfo";

const { phone: companyPhone, OfficeLocation: companyAddress } =
  CompanyContactData[0];

const DISCORD_URL = "https://discord.gg/fNCrM6gA7F";

const DiscordIcon = (props: ComponentProps<typeof SvgIcon>) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.516c-.21.375-.444.88-.608 1.275a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.275A19.74 19.74 0 0 0 3.832 4.37C.534 9.046-.36 13.58.087 18.058a19.9 19.9 0 0 0 5.994 3.03c.48-.655.91-1.35 1.28-2.08a12.98 12.98 0 0 1-2.02-.97c.17-.124.336-.253.498-.385 3.9 1.804 8.13 1.804 11.982 0 .164.134.33.263.498.386-.64.38-1.317.705-2.02.97.37.73.798 1.425 1.28 2.08a19.88 19.88 0 0 0 5.994-3.03c.524-5.188-.894-9.68-3.256-13.69ZM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.333-.956 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.333-.946 2.419-2.157 2.419Z" />
  </SvgIcon>
);

const contactSocialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/thetechietribe_/",
    Icon: InstagramIcon,
    hoverColor: "#E4405F",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/thetechietribe.official",
    Icon: FacebookIcon,
    hoverColor: "#1877F2",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/techietribe",
    Icon: LinkedInIcon,
    hoverColor: "#0A66C2",
  },
  {
    label: "GitHub",
    href: "https://github.com/thetechietribe",
    Icon: GitHubIcon,
    hoverColor: "#6E5494",
  },
  {
    label: "Discord",
    href: DISCORD_URL,
    Icon: DiscordIcon,
    hoverColor: "#5865F2",
  },
];

type ContactFieldOption = {
  value: string;
  label: string;
};

type ContactField = {
  name: string;
  label: string;
  type: string;
  size: number;
  multiline?: boolean;
  rows?: number;
  optional?: boolean;
  select?: boolean;
  options?: ContactFieldOption[];
  hidden?: boolean;
  defaultValue?: string;
};

const contactValidationSchema = Yup.object().shape({
  message: Yup.string().required("Your message is required"),
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().nullable(),
  company: Yup.string().nullable(),
  subject: Yup.string().required("Subject is required"),
  sub_subject: Yup.string().nullable(),
});

const contactFields: ContactField[] = [
  {
    name: "message",
    label: "Your message *",
    type: "text",
    multiline: true,
    rows: 4,
    size: 12,
  },
  {
    name: "name",
    label: "Name *",
    type: "text",
    size: 6,
  },
  {
    name: "email",
    label: "Email *",
    type: "text",
    size: 6,
  },
  {
    name: "phone",
    label: "Phone number",
    type: "tel",
    size: 6,
  },
  {
    name: "company",
    label: "Company",
    type: "text",
    size: 6,
    optional: true,
  },
  {
    name: "subject",
    label: "Subject *",
    type: "text",
    select: true,
    options: [
      { value: "general", label: "General Inquiry" },
      { value: "partnership", label: "Partnership Opportunity" },
      { value: "support", label: "Technical Support" },
      { value: "results", label: "Results & Case Studies" },
      { value: "consultation", label: "Consultation & Project Planning" },
      { value: "evolution", label: "Evolving with AI & Innovation" },
      { value: "business", label: "Business Growth & Strategy" },
      { value: "development", label: "AI Development Process" },
      { value: "values", label: "Our Core Values & Culture" },
    ],
    size: 12,
  },
  {
    name: "sub_subject",
    label: "More details",
    type: "text",
    select: true,
    options: [],
    size: 12,
    hidden: true,
  },
];

const ContactDiscussSection = () => {
  const theme = useTheme();

  const nestedOptionsMap: Record<string, ContactFieldOption[]> = {
    general: [
      { value: "pricing", label: "Pricing & Plans" },
      { value: "features", label: "Product Features" },
      { value: "timeline", label: "Implementation Timeline" },
    ],
    partnership: [
      { value: "affiliate", label: "Affiliate Partnership" },
      { value: "integration", label: "Integration Partner" },
      { value: "reseller", label: "Reseller / Collaboration" },
    ],
    support: [
      { value: "app", label: "App-related Issue" },
      { value: "web", label: "Website-related Issue" },
      { value: "dashboard", label: "Dashboard / Admin Panel" },
    ],
    results: [
      { value: "efficiency", label: "Efficiency Gains (10+ Saved Annually)" },
      { value: "retention", label: "Higher Retention Rate (5x)" },
      { value: "clients", label: "Client Growth (20+ Recurring Clients)" },
      { value: "engagement", label: "Engagement Time (24 Months)" },
      { value: "cost", label: "Reduced Tech Costs (30%)" },
    ],
    consultation: [
      { value: "strategy", label: "AI Strategy Consultation" },
      { value: "workflow", label: "Workflow Automation Planning" },
      { value: "innovation", label: "Digital Innovation Roadmap" },
      { value: "integration", label: "System Integration Consultation" },
      { value: "scalability", label: "Scalability & Optimization Review" },
      { value: "techstack", label: "Tech Stack Assessment" },
      { value: "custom", label: "Custom AI Project Discussion" },
    ],
    evolution: [
      {
        value: "imagine",
        label: "Imagine with AI — Creative Concept Exploration",
      },
      { value: "build", label: "Build with AI — Intelligent System Design" },
      {
        value: "innovate",
        label: "Innovate with AI — Adaptive Intelligence & Analytics",
      },
      {
        value: "evolve",
        label: "Evolve with AI — Continuous Learning & Optimization",
      },
    ],
    business: [
      { value: "language", label: "AI-Powered Language Processing" },
      { value: "escalation", label: "Streamlined Escalation Workflows" },
      { value: "engagement", label: "Automated Customer Engagement" },
      { value: "integration", label: "Effortless System Integration" },
      { value: "lead", label: "Automated Lead Management" },
      { value: "optimization", label: "Workflow Optimization & Efficiency" },
      { value: "scalability", label: "Scalable Chatbot Architecture" },
    ],
    development: [
      { value: "research", label: "Requirement Analysis & Research" },
      { value: "architecture", label: "System Architecture Planning" },
      { value: "design", label: "Conversation Flow & UX Design" },
      { value: "training", label: "AI Model Training & Optimization" },
      { value: "testing", label: "Testing & Quality Assurance" },
      { value: "deployment", label: "Deployment & Integration" },
      { value: "maintenance", label: "Ongoing Support & Improvement" },
    ],
    values: [
      { value: "integrity", label: "Integrity & Transparency" },
      { value: "collaboration", label: "Collaboration & Teamwork" },
      { value: "innovation", label: "Innovation & Creativity" },
      { value: "client", label: "Client-Centric Approach" },
      { value: "excellence", label: "Commitment to Excellence" },
      {
        value: "sustainability",
        label: "Ethical & Sustainable AI Development",
      },
    ],
  };

  const [dynamicFields, setDynamicFields] =
    useState<ContactField[]>(contactFields);

  const handleSubjectChange = (selectedValue: string) => {
    const updatedFields = contactFields.map((field) => {
      if (field.name === "sub_subject") {
        const relatedOptions = nestedOptionsMap[selectedValue] || [];
        return {
          ...field,
          options: relatedOptions,
          hidden: relatedOptions.length === 0,
        };
      }
      return field;
    });
    setDynamicFields(updatedFields);
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subjectParam = queryParams.get("subject");

  useEffect(() => {
    if (subjectParam) {
      handleSubjectChange(subjectParam);

      setDynamicFields((prev) =>
        prev.map((field) =>
          field.name === "subject"
            ? { ...field, defaultValue: subjectParam }
            : field,
        ),
      );
    }
  }, [subjectParam]);

  const contactInitialValues = {
    message: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: subjectParam || "",
    sub_subject: "",
  };
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        // DOT PATTERN BACKGROUND - Adds texture so it's not "empty"
        backgroundColor: "#fafafa",
        backgroundImage: `
              radial-gradient(${alpha(theme.palette.text.primary, 0.15)} 1px, transparent 1px),
              linear-gradient(to bottom, transparent, #fff 80%)
            `,
        backgroundSize: "24px 24px, 100% 100%",
        py: { xs: 8, md: 4 },
        position: "relative",
      }}
    >
      <Container maxWidth="lg">
        <Grid container width="100%" alignItems="stretch">
          {/* LEFT CONTENT — 6 columns */}

          {/* RIGHT CONTENT — 6 columns */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              px: { xs: 2, md: 4 },
              alignItems: "center",
              margin: "auto",
            }}
          >
            <Box mb={5}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2.25rem", md: "3.5rem" },
                  lineHeight: 1.2,
                  mb: 2,
                  color: "#111827",
                }}
              >
                We're here to help,
                <br />
                <Box component="span" sx={{ color: "#9ca3af" }}>
                  Lets connect.
                </Box>
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontSize: "18px",
                  color: "#6b7280",
                  maxWidth: "600px",
                }}
              >
                Have a question about our services or expertise? Our team is
                ready to collaborate and help bring your vision to life
              </Typography>
            </Box>

            <Grid container spacing={5}>
              {/* Call Center */}
              <Grid item xs={12} sm={6}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "18px",
                    color: "#111827",
                    mb: 1,
                  }}
                >
                  Call Center
                </Typography>

                <Typography sx={{ color: "#6b7280", fontSize: "16px" }}>
                  {companyPhone}
                </Typography>
              </Grid>

              {/* Our Location */}
              <Grid item xs={12} sm={6}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "18px",
                    color: "#111827",
                    mb: 1,
                  }}
                >
                  Our Location
                </Typography>

                <Typography sx={{ color: "#6b7280", fontSize: "16px" }}>
                  {companyAddress}
                </Typography>
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "18px",
                    color: "#111827",
                    mb: 1,
                  }}
                >
                  Email
                </Typography>

                <Typography sx={{ color: "#6b7280", fontSize: "16px" }}>
                  info@thetechietribe.com
                </Typography>
              </Grid>

              {/* Social Network */}
              <Grid item xs={12} sm={6}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "18px",
                    color: "#111827",
                    mb: 1,
                  }}
                >
                  Social Network
                </Typography>

                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  {contactSocialLinks.map(
                    ({ label, href, Icon, hoverColor }) => (
                      <Box
                        key={label}
                        component="a"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Techietribe on ${label}`}
                        title={`Techietribe on ${label}`}
                        sx={{
                          color: "#000000ff",
                          display: "inline-flex",
                          alignItems: "center",
                          textDecoration: "none",
                          "&:hover": { color: hoverColor },
                        }}
                      >
                        <Icon aria-hidden="true" sx={{ fontSize: 22 }} />
                      </Box>
                    ),
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* RIGHT FORM — 6 columns */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Form
              //   formTitle="We're here to help, Lets connect."
              //   formSubtext="Have a question about our services or expertise? Our team is ready to collaborate and help bring your vision to life"
              fields={dynamicFields}
              submitText="Send message"
              validationSchema={contactValidationSchema}
              initialValues={contactInitialValues}
              onSubjectChange={handleSubjectChange}
              apiEndpoint="/contact"
              formTitle={undefined}
              formSubtext={undefined}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ContactDiscussSection;
