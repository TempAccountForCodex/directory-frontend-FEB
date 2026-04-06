import React from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { ArrowRight, Facebook, Instagram } from "lucide-react";
import type { TemplateProps } from "../../templateEngine/types";
import FadeIn from "../../blocks/FadeIn";

const serifFont = '"Cormorant Garamond", Georgia, serif';
const bodyFont =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const brown = "#81563f";
const black = "#060606";
const cream = "#f4e7db";

const sectionOffset = 108;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - sectionOffset;
  window.scrollTo({ top: y, behavior: "smooth" });
}

const RestaurantTemplate: React.FC<TemplateProps> = ({ data }) => {
  const reviews = data.reviews ?? [];

  const navItems = [
    { label: "Story", id: "story" },
    { label: "Menu", id: "menu" },
    { label: "Why Us", id: "why-us" },
    { label: "Reviews", id: "reviews" },
    { label: "Contact", id: "contact" },
  ];

  const storyTopImage =
    "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80";
  const grillImage =
    "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1400&q=80";
  const burgerImage =
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80";
  const promoImage =
    "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=1400&q=80";
  const whyTopImage =
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80";
  const whyBottomImage =
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80";
  const contactImage =
    "https://img.freepik.com/free-photo/luxury-dinner-table-hotel_1150-11071.jpg";
  const heroBannerImage =
    data.heroBannerUrl || data.gallery?.[2]?.url || data.gallery?.[0]?.url;

  return (
    <Box sx={{ bgcolor: black, color: "#fff", fontFamily: bodyFont }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: { xs: 0, md: 50 },
          bgcolor: `${brown}ee`,
          color: "#fff",
          boxShadow: "none",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1240,
            width: "100%",
            mx: "auto",
            px: { xs: 2, md: 3 },
            py: { xs: 1.15, md: 1.3 },
            minHeight: "auto !important",
            display: "grid",
            gridTemplateColumns: { xs: "1fr auto", md: "220px 1fr 150px" },
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: serifFont,
              fontSize: { xs: "1.1rem", md: "1.35rem" },
              fontWeight: 600,
            }}
          >
            Casa Bella
          </Typography>

          <Stack
            direction="row"
            spacing={3}
            justifyContent="center"
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            {navItems.map((item) => (
              <Box
                key={item.id}
                component="button"
                type="button"
                onClick={() => scrollToSection(item.id)}
                sx={{
                  border: 0,
                  p: 0,
                  bgcolor: "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: bodyFont,
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </Box>
            ))}
          </Stack>

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={() => scrollToSection("contact")}
              sx={{
                bgcolor: black,
                color: "#fff",
                borderRadius: 999,
                px: 2.2,
                py: 0.8,
                fontWeight: 700,
                "&:hover": {
                  bgcolor: black,
                  color: "#fff",
                  filter: "brightness(1.14)",
                },
              }}
            >
              Reserve
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        id="hero"
        data-preview-section="Hero"
        sx={{
          bgcolor: brown,
          textAlign: "center",
          px: 2,
          pt: { xs: 7, md: 9 },
          pb: { xs: 5, md: 6 },
        }}
      >
        <FadeIn>
          <Typography
            sx={{
              fontFamily: serifFont,
              fontSize: { xs: "2.5rem", md: "4rem" },
              lineHeight: 0.98,
              color: "#fff",
            }}
          >
            Taste the Difference
          </Typography>
        </FadeIn>
        <FadeIn delay={0.08}>
          <Typography
            sx={{
              mt: 1.5,
              maxWidth: 580,
              mx: "auto",
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.75,
            }}
          >
            Bold comfort food, warm atmosphere, and dishes built to leave a
            lasting impression at every table.
          </Typography>
        </FadeIn>
        <FadeIn delay={0.16}>
          <Button
            variant="contained"
            sx={{
              mt: 3,
              bgcolor: black,
              color: "#fff",
              borderRadius: 999,
              px: 3,
              py: 0.95,
              fontWeight: 700,
              "&:hover": {
                bgcolor: black,
                color: "#fff",
                filter: "brightness(1.14)",
              },
            }}
          >
            Book Table
          </Button>
        </FadeIn>
      </Box>

      <Box sx={{ height: { xs: 120, md: 500 }, overflow: "hidden" }}>
        <FadeIn direction="up">
          <Box
            component="img"
            src={heroBannerImage}
            alt={data.name}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              backgroundAttachment: "fixed",
            }}
          />
        </FadeIn>
      </Box>

      <Box id="story" data-preview-section="Story" sx={{ bgcolor: black }}>
        <Container
          maxWidth="lg"
          sx={{ px: { xs: 2, md: 3 }, py: { xs: 7, md: 9 } }}
        >
          <Grid container spacing={0}>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                p: { xs: 0, md: 4 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <FadeIn>
                <Typography
                  sx={{
                    fontFamily: serifFont,
                    fontSize: { xs: "2rem", md: "2.9rem" },
                    color: "#fff",
                    mb: 2,
                  }}
                >
                  Our Story
                </Typography>
              </FadeIn>
              <FadeIn delay={0.08}>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.76)",
                    lineHeight: 1.9,
                    maxWidth: 360,
                  }}
                >
                  {data.description}
                </Typography>
              </FadeIn>
              <Stack spacing={2.6} sx={{ mt: 4.5, maxWidth: 360 }}>
                {["Our Mission", "Our Vision", "Our Promise"].map(
                  (title, index) => (
                    <FadeIn
                      key={title}
                      delay={0.16 + index * 0.08}
                      direction="right"
                    >
                      <Box>
                        <Typography
                          sx={{
                            color: cream,
                            fontFamily: serifFont,
                            fontSize: "1.45rem",
                            mb: 0.7,
                          }}
                        >
                          {title}
                        </Typography>
                        <Typography
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            lineHeight: 1.8,
                            fontSize: "0.94rem",
                          }}
                        >
                          {index === 0 &&
                            "Serve memorable food with warmth, speed, and consistency in every service."}
                          {index === 1 &&
                            "Create a dining experience that feels lively, welcoming, and worth returning to."}
                          {index === 2 &&
                            "Fresh ingredients, bold flavors, and hospitality that remains personal."}
                        </Typography>
                      </Box>
                    </FadeIn>
                  ),
                )}
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <FadeIn delay={0.08} direction="left">
                <Box sx={{ overflow: "hidden", height: { xs: 340, md: 580 } }}>
                  <Box
                    component="img"
                    src={storyTopImage}
                    alt="French fries tray"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              </FadeIn>
            </Grid>

            <Grid item xs={12} md={6}>
              <FadeIn delay={0.12} direction="up">
                <Box sx={{ overflow: "hidden", height: { xs: 280, md: 320 } }}>
                  <Box
                    component="img"
                    src={grillImage}
                    alt="Grill burgers"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={6}>
              <FadeIn delay={0.16} direction="up">
                <Box sx={{ overflow: "hidden", height: { xs: 280, md: 320 } }}>
                  <Box
                    component="img"
                    src={burgerImage}
                    alt="Burger"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        id="menu"
        data-preview-section="Location"
        sx={{ bgcolor: brown, color: "#fff", py: { xs: 6, md: 7 } }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 5 }}>
            <Grid item xs={12} md={3}>
              <FadeIn>
                <Typography sx={{ fontFamily: serifFont, fontSize: "2rem" }}>
                  Location
                </Typography>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={4.5}>
              <FadeIn delay={0.08}>
                <Typography
                  sx={{ lineHeight: 1.85, color: "rgba(255,255,255,0.82)" }}
                >
                  Find us in the heart of the city where warm interiors,
                  open-grill cooking, and late-evening energy come together in
                  one memorable dining room.
                </Typography>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={4.5}>
              <FadeIn delay={0.16}>
                <Typography
                  sx={{ lineHeight: 1.85, color: "rgba(255,255,255,0.82)" }}
                >
                  {data.contact.address}
                  <br />
                  {data.contact.phone}
                  <br />
                  {data.contact.email}
                </Typography>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          py: 1.1,
          bgcolor: black,
          color: cream,
          overflow: "hidden",
          whiteSpace: "nowrap",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Box
          sx={{
            display: "inline-block",
            minWidth: "100%",
            px: 2,
            letterSpacing: "0.08em",
            fontSize: "2.5rem",
            animation: "marquee 12s linear infinite",
          }}
        >
          Limited Time Offer ✦ Limited Time Offer ✦ Limited Time Offer ✦ Limited
          Time Offer ✦ Limited Time Offer ✦
        </Box>
      </Box>

      <Grid container sx={{ bgcolor: black }}>
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              minHeight: { xs: 260, md: 360 },
              display: "grid",
              placeItems: "center",
              px: 4,
              textAlign: "center",
            }}
          >
            <FadeIn>
              <Typography
                sx={{ color: "#fff", lineHeight: 1.9, maxWidth: 320 }}
              >
                Enjoy 25% off our menu for a limited time because great burgers
                taste even better with a deal.
              </Typography>
            </FadeIn>
            <FadeIn delay={0.1}>
              <Button
                variant="outlined"
                sx={{
                  mt: 2.6,
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.4)",
                  borderRadius: 999,
                  px: 2.4,
                  py: 0.8,
                }}
              >
                Order Now
              </Button>
            </FadeIn>
          </Box>
        </Grid>
        <Grid item xs={12} md={7}>
          <FadeIn delay={0.08} direction="left">
            <Box sx={{ height: { xs: 320, md: 360 }, overflow: "hidden" }}>
              <Box
                component="img"
                src={promoImage}
                alt="Burger offer"
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          </FadeIn>
        </Grid>
      </Grid>

      <Box
        id="why-us"
        data-preview-section="Why Us"
        sx={{ bgcolor: brown, color: "#fff", py: { xs: 7, md: 8 } }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 6 }}>
            <Grid item xs={12} md={7}>
              <FadeIn>
                <Typography
                  sx={{
                    fontFamily: serifFont,
                    fontSize: { xs: "2rem", md: "3rem" },
                    mb: 2.5,
                  }}
                >
                  Why Us
                </Typography>
              </FadeIn>
              {[
                [
                  "Quality Ingredients",
                  "We use fresh ingredients and bold seasoning to deliver full flavor in every dish.",
                ],
                [
                  "Unique Flavors",
                  "Our menu balances comfort favorites with recipes that feel distinctive and memorable.",
                ],
                [
                  "Exceptional Service",
                  "Fast, warm, and attentive hospitality is part of the experience from arrival to last bite.",
                ],
                [
                  "Customer Satisfaction",
                  "Guests return because the food, service, and atmosphere consistently deliver.",
                ],
                [
                  "Crafted In-House",
                  "From sauces to signature specials, much of what you taste is prepared with care in-house.",
                ],
              ].map(([title, text], index) => (
                <FadeIn
                  key={title}
                  delay={0.08 + index * 0.08}
                  direction="right"
                >
                  <Box sx={{ mb: 2.3 }}>
                    <Typography
                      sx={{
                        fontFamily: serifFont,
                        fontSize: "1.35rem",
                        color: cream,
                      }}
                    >
                      {title}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.55,
                        color: "rgba(255,255,255,0.82)",
                        lineHeight: 1.8,
                        maxWidth: 460,
                      }}
                    >
                      {text}
                    </Typography>
                  </Box>
                </FadeIn>
              ))}
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack spacing={2.2}>
                <FadeIn delay={0.08} direction="left">
                  <Box sx={{ overflow: "hidden", height: 170 }}>
                    <Box
                      component="img"
                      src={whyTopImage}
                      alt="Restaurant seating"
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                </FadeIn>
                <FadeIn delay={0.16} direction="left">
                  <Box sx={{ overflow: "hidden", height: 170 }}>
                    <Box
                      component="img"
                      src={whyBottomImage}
                      alt="Restaurant dish"
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                </FadeIn>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        id="reviews"
        data-preview-section="Reviews"
        sx={{
          bgcolor: black,
          color: "#fff",
          py: { xs: 7, md: 10 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <FadeIn>
            <Typography
              sx={{
                fontFamily: serifFont,
                fontSize: { xs: "2rem", md: "3rem" },
                mb: 5,
              }}
            >
              Customer Reviews
            </Typography>
          </FadeIn>
          {reviews[0] && (
            <FadeIn delay={0.08}>
              <Typography
                sx={{
                  maxWidth: 480,
                  mx: "auto",
                  color: "rgba(255,255,255,0.82)",
                  lineHeight: 1.9,
                }}
              >
                {reviews[0].text}
              </Typography>
              <Typography
                sx={{
                  mt: 2.5,
                  color: cream,
                  fontFamily: serifFont,
                  fontSize: "1.2rem",
                }}
              >
                {reviews[0].author}
              </Typography>
            </FadeIn>
          )}
        </Container>
      </Box>

      <Box
        id="contact"
        data-preview-section="Contact"
        sx={{ bgcolor: brown, color: "#fff", py: { xs: 7, md: 8 } }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 5 }} alignItems="stretch">
            <Grid item xs={12} md={6}>
              <FadeIn direction="right">
                <Box
                  sx={{
                    overflow: "hidden",
                    minHeight: { xs: 260, md: 400 },
                    bgcolor: "#111",
                  }}
                >
                  <Box
                    component="img"
                    src={contactImage}
                    alt="Restaurant interior"
                    sx={{ width: "100%", height: "100%" }}
                  />
                </Box>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={6}>
              <FadeIn>
                <Typography
                  sx={{
                    fontFamily: serifFont,
                    fontSize: { xs: "2rem", md: "3rem" },
                    mb: 2,
                  }}
                >
                  Get in Touch Today
                </Typography>
              </FadeIn>
              <Stack spacing={2}>
                {[
                  "Full Name",
                  "Email Address",
                  "Phone",
                  "Date",
                  "Time",
                  "Message",
                ].map((label, index) => (
                  <FadeIn
                    key={label}
                    delay={0.08 + index * 0.06}
                    direction="left"
                  >
                    <TextField
                      fullWidth
                      multiline={label === "Message"}
                      minRows={label === "Message" ? 3 : undefined}
                      placeholder={label}
                      variant="standard"
                      InputProps={{
                        disableUnderline: false,
                        sx: {
                          color: "#fff",
                          "&::before": {
                            borderBottomColor: "rgba(255,255,255,0.34)",
                          },
                          "&::after": { borderBottomColor: "#fff" },
                        },
                      }}
                      inputProps={{ sx: { color: "#fff" } }}
                    />
                  </FadeIn>
                ))}
              </Stack>
              <FadeIn delay={0.46}>
                <Button
                  variant="contained"
                  sx={{
                    mt: 3,
                    bgcolor: "#fff",
                    color: black,
                    borderRadius: 0,
                    px: 5.5,
                    py: 1,
                    fontWeight: 700,
                    "&:hover": {
                      bgcolor: "#fff",
                      color: black,
                      filter: "brightness(0.96)",
                    },
                  }}
                >
                  Send
                </Button>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          bgcolor: "#8a624b",
          color: "#fff",
          pt: { xs: 6, md: 7 },
          pb: { xs: 5, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <FadeIn>
                <Typography
                  sx={{ fontFamily: serifFont, fontSize: "1.8rem", mb: 1 }}
                >
                  B. Morgan
                </Typography>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.76)", lineHeight: 1.8 }}
                >
                  Restaurant operator focused on bold flavor, honest
                  hospitality, and a memorable dining room.
                </Typography>
                <Stack direction="row" spacing={1.2} sx={{ mt: 2 }}>
                  {[Facebook, Instagram].map((Icon, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 34,
                        height: 34,
                        display: "grid",
                        placeItems: "center",
                        border: "1px solid rgba(255,255,255,0.16)",
                      }}
                    >
                      <Icon size={15} />
                    </Box>
                  ))}
                </Stack>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={3}>
              <FadeIn delay={0.08}>
                <Typography sx={{ color: cream, fontWeight: 700, mb: 1.2 }}>
                  Say Hello
                </Typography>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}
                >
                  {data.contact.address}
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 1.8,
                    mt: 1,
                  }}
                >
                  {data.contact.phone}
                </Typography>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}
                >
                  {data.contact.email}
                </Typography>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={3}>
              <FadeIn delay={0.16}>
                <Typography sx={{ color: cream, fontWeight: 700, mb: 1.2 }}>
                  Opening Hours
                </Typography>
                {data.workingHours?.map((item) => (
                  <Typography
                    key={item.day}
                    sx={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}
                  >
                    {item.day}: {item.hours}
                  </Typography>
                ))}
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={3}>
              <FadeIn delay={0.24}>
                <Typography sx={{ color: cream, fontWeight: 700, mb: 1.2 }}>
                  Stay Connected
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter email address"
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.16)" },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  endIcon={<ArrowRight size={16} />}
                  sx={{
                    mt: 1.6,
                    bgcolor: "#fff",
                    color: black,
                    borderRadius: 0,
                    px: 3,
                    py: 0.9,
                    fontWeight: 700,
                    "&:hover": {
                      bgcolor: "#fff",
                      color: black,
                      filter: "brightness(0.96)",
                    },
                  }}
                >
                  Join
                </Button>
              </FadeIn>
            </Grid>
          </Grid>
          <FadeIn delay={0.32}>
            <Typography
              sx={{
                mt: 4.5,
                color: "rgba(255,255,255,0.72)",
                fontSize: "0.82rem",
              }}
            >
              © 2026 B. Morgan. Restaurant demo template.
            </Typography>
          </FadeIn>
        </Container>
      </Box>
    </Box>
  );
};

export default RestaurantTemplate;
