import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  useTheme,
  Button,
  Grid,
  TextField,
} from "@mui/material";
import HeroBannerSection from "../utils/commons/HeroImageSectionV2";
// import faqImage from "/assets/images/FooterResources/faqImage.svg";
import FAQCardLayout from "../components/faq/FAQAccordion";
const messageIcon = "/assets/images/FooterResources/paper-plane.png";
const pointerImage = "/assets/images/FooterResources/pointerImage.svg";
const SquareBG = "/assets/images/square-bg.svg";
const FAQ_BG = "/assets/images/FooterResources/FAQBanner.png";
const LeftCard = "/assets/images/careers/form-bg-first.jpg";

const faqImage = "http://appbiquity.com/assets/images/home/we-happiness.png";

const Faq = () => {
  const theme = useTheme();

  // State to manage form fields
  const [formData, setFormData] = useState({
    challenge: "",
    name: "",
    email: "",
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    // Here you would typically send the data to a backend API
    // e.g., using fetch or axios
    // fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })
    // .then(...)
  };

  return (
    <Box sx={{ width: "100%" }}>
      <HeroBannerSection
        imageSrc={FAQ_BG}
        fullscreen={true}
        dynamicTitle={true}
        dynamicPhrases={["FAQs", "Your Questions", "Get Answers"]}
        subText="Leveraging a diverse range of development technologies since our inception, we consistently align with the latest trends and evolving demands."
        showCTA={true}
        ctaLabel="Request a Call"
        ctaLink="/contact-us#request-call"
      />

      <Box
        sx={{
          pt: { xs: 6, md: 10 },
          backgroundImage: `url(${SquareBG})`,
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: "flex-start",
            gap: { xs: 6, md: 0, lg: 10 },
            padding: { sm: "20px 80px", md: "20px 130px", xl: "0px" },
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", lg: "30%" },
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
              textAlign: { xs: "center", md: "left" },
              position: { lg: "sticky" },
              top: { md: "180px" },
              marginBottom: { md: "77px" },
              zIndex: 2,
              backgroundImage: `url(${LeftCard})`,
              backgroundSize: { xs: "cover", lg: "auto" },
              borderRadius: 4,
              px: { xs: 2, md: 0 },
              py: { xs: 2, md: 0 },
              backdropFilter: "blur(3px)",
            }}
          >
            <Box
              component="img"
              src={faqImage}
              alt="FAQ Illustration"
              sx={{ width: "100%", borderRadius: "15px" }}
            />
            <Box sx={{ padding: "30px" }}>
              <Typography variant="h5" fontWeight={700} mt={3} color="white">
                Have Questions?
              </Typography>
              <Typography
                variant="body1"
                mt={1}
                color="white"
                sx={{
                  maxWidth: { xs: "100%", lg: 360 },
                  paddingBottom: "20px",
                }}
              >
                We’ve gathered answers to some of the most common queries our
                clients ask before getting started. If your question isn’t
                listed, feel free to contact us directly.
              </Typography>
            </Box>
          </Box>

          {/* Right FAQ cards */}
          <Box sx={{ width: { xs: "100%", lg: "70%" }, paddingBottom: "80px" }}>
            <Typography
              variant="h4"
              fontWeight={700}
              mb={4}
              color="text.primary"
            >
              Frequently Asked Questions
            </Typography>
            <FAQCardLayout />

            {/* In-page form section */}
            <Box
              sx={{
                mt: 8,
                p: { xs: 3, sm: 5 },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 4,
                backgroundColor: theme.palette.background.paper,
                boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
                border: `1px solid ${theme.palette.divider}`,
                flexDirection: { xs: "column", md: "row" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              {/* Form Content */}
              <Box sx={{ flex: 1, mr: { xs: 0, md: 4 } }}>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="text.primary"
                  gutterBottom
                >
                  Can't find what you're looking for?
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Send us a message and we'll get back to you promptly.
                </Typography>

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Your challenge/goal field */}
                  <TextField
                    fullWidth
                    label="Your challenge/goal *"
                    name="challenge"
                    value={formData.challenge}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    variant="standard"
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />

                  {/* Name and Corporate email fields */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Name *"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        variant="standard"
                        required
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Corporate email *"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        variant="standard"
                        required
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      mt: 2,
                      backgroundColor: "#378C92",
                      color: "#fff",
                      fontWeight: 400,
                      textTransform: "none",
                      padding: "16px 50px",
                      fontSize: "0.875rem",
                      transition: "all 0.4s ease-in-out",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                      fontFamily: "Plus Jakarta Sans",
                      border: "none",
                      borderRadius: "5px",
                      width: "auto",
                      display: "inline-block",
                      "&:hover": {
                        backgroundColor: "#378C92",
                        boxShadow:
                          "0 8px 25px rgba(0, 0, 0, 0.21), 0 0 20px rgba(44, 74, 96, 0.19)",
                        transform: "translateY(-3px) scale(1.02)",
                      },
                    }}
                  >
                    Send Message
                  </Button>
                </Box>
              </Box>

              {/* Right Icon/Image (unchanged) */}
              <Box
                sx={{
                  flexShrink: 0,
                  ml: { xs: 0, md: 4 },
                  mt: { xs: 3, md: 0 },
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  width: { xs: "100%", md: "auto" },
                }}
              >
                <Box
                  component="img"
                  src={pointerImage}
                  alt="Pointer Icon"
                  sx={{
                    width: "69%",
                    left: "-178px",
                    top: "-135px",
                    transform: "rotate(180deg)",
                    position: "relative",
                    display: { xs: "none", lg: "block" },
                  }}
                />

                <Box
                  component="img"
                  src={messageIcon}
                  alt="Message Icon"
                  sx={{
                    width: "120px",
                    height: "auto",
                    left: "-44px",
                    position: "relative",
                    display: { xs: "none", lg: "block" },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Faq;
