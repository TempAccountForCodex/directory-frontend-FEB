import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  TextField,
  Chip,
  Stack,
  alpha,
  Divider,
} from "@mui/material";
import HeroBannerSection from "../../utils/commons/HeroImageSectionV2";
import FAQCardLayout from "../../components/publicComponents/faq/FAQAccordion";

const FAQ_BG = "/assets/publicAssets/images/blog/hero.jpg";
const LeftCard = "/assets/publicAssets/images/blog/form-bg-first.jpg";

const Faq = () => {
  const [formData, setFormData] = useState({
    challenge: "",
    name: "",
    email: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <Box sx={{ width: "100%" }}>
      <HeroBannerSection
        // imageSrc={FAQ_BG}
        fullscreen
        dynamicTitle={true}
        dynamicPhrases={["FAQ", "Get Answers", "Need Help?"]}
        subText="Clear answers for listing setup, pricing, approvals, profile visibility, and support to help you get started quickly and confidently."
        showCTA={false}
        ctaLabel="Contact Support"
        ctaLink="/contact"
        imageSrc={undefined}
        children={undefined}
      />

      <Box
        sx={{
          pt: { xs: 5, md: 10 },
          pb: { xs: 8, md: 12 },
          background:
            "radial-gradient(circle at 12% 4%, rgba(55,140,146,0.09), transparent 36%), linear-gradient(180deg, #f7fafb 0%, #ffffff 60%)",
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: "flex-start",
            gap: { xs: 5, md: 6, lg: 8 },
            px: { xs: 2, sm: 4, md: 8, xl: 0 },
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", lg: "30%" },
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
              position: { lg: "sticky" },
              top: { md: "110px" },
              zIndex: 2,
              backgroundImage: `url(${LeftCard})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: 5,
              px: { xs: 2.5, md: 3 },
              py: { xs: 2.5, md: 3 },
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 18px 42px rgba(6, 18, 24, 0.28)",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(145deg, rgba(5,12,17,0.78), rgba(6,15,21,0.48))",
                zIndex: 0,
              },
            }}
          >
            <Box sx={{ pt: 1.2, pb: 1.2, position: "relative", zIndex: 1 }}>
              <Chip
                label="Support Center"
                sx={{
                  mb: 1.8,
                  backgroundColor: "rgba(127, 211, 218, 0.18)",
                  color: "#d8fbff",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  border: "1px solid rgba(127, 211, 218, 0.35)",
                }}
              />
              <Typography variant="h5" fontWeight={700} color="white">
                Have Questions?
              </Typography>
              <Typography
                variant="body1"
                mt={1.2}
                color={alpha("#fff", 0.88)}
                sx={{
                  maxWidth: { xs: "100%", lg: 360 },
                  pb: 2,
                  lineHeight: 1.7,
                }}
              >
                Find clear answers for onboarding, listings, approvals, billing,
                and profile visibility.
              </Typography>
              <Divider
                sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 2, mt: 0.6 }}
              />
              <Stack spacing={1.1} sx={{ mb: 2.2 }}>
                {[
                  "Typical response time under 24 hours",
                  "Step-by-step guidance for setup",
                  "Direct help for account and billing",
                ].map((point) => (
                  <Typography
                    key={point}
                    sx={{
                      color: alpha("#fff", 0.92),
                      fontSize: "0.92rem",
                      lineHeight: 1.55,
                      display: "flex",
                      gap: "8px",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        mt: "8px",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "#7fd3da",
                        flexShrink: 0,
                      }}
                    />
                    {point}
                  </Typography>
                ))}
              </Stack>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {["Listings", "Publishing", "Support", "Billing"].map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.16)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.16)",
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Stack>
              <Button
                href="/contact"
                sx={{
                  mt: 2.6,
                  px: 2.6,
                  py: 1.2,
                  borderRadius: "999px",
                  backgroundColor: "rgba(255,255,255,0.16)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  textTransform: "none",
                  fontWeight: 700,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.24)",
                  },
                }}
              >
                Talk to Support
              </Button>
            </Box>
          </Box>

          <Box sx={{ width: { xs: "100%", lg: "70%" } }}>
            <Typography
              variant="h3"
              fontWeight={800}
              mb={1.5}
              color="#0f1720"
              sx={{ fontSize: { xs: "2rem", md: "2.6rem" }, lineHeight: 1.1 }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography
              variant="body1"
              color="#4b5563"
              sx={{ mb: 4, maxWidth: "760px", lineHeight: 1.8 }}
            >
              Browse quick answers below. If you still need help, send your
              details and our team will respond shortly.
            </Typography>
            <FAQCardLayout />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Faq;
