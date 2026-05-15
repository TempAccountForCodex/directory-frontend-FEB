import { Box, Container, Typography, Grid, Paper } from "@mui/material";

const DARK_THEME = {
  cardText: "#FFFFFF",
  subText: "#555555",
};

const template = "/assets/publicAssets/images/home/templatesAi.jpg";
const aiImage = "/assets/publicAssets/images/home/aiImage.jpg";
const businessListing = "/assets/publicAssets/images/home/businessListing.jpg";
const copyWrite = "/assets/publicAssets/images/home/copyWrite.jpg";

const WebsiteWorksSection = () => {
  const cards = [
    {
      title: "Designed for you",
      description:
        "Skip hiring a designer and get a beautiful customizable website out of the box.",
      image: template,
    },
    {
      title: "Visuals created for you",
      description:
        "Create logos, social posts, posters, and more. No design skills needed.",
      image: aiImage,
    },
    {
      title: "Listed where customers search",
      description:
        "Your business appears in our public directory, making it easy to discover you.",
      image: businessListing,
    },
    {
      title: "Written for you",
      description:
        "Not a wordsmith? Generate clear, high-converting copy instantly.",
      image: copyWrite,
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 14 } }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Grid container spacing={4} alignItems="center" sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 500,
                fontSize: { xs: "2.5rem", md: "2.8rem" },
                color: "black",
                letterSpacing: "-0.03em",
              }}
            >
              A website that works for you
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography
              sx={{
                fontSize: "1rem",
                color: DARK_THEME.subText,
                lineHeight: 1.6,
              }}
            >
              Professionally designed, optimized for search, and ready to grow
              your business with AI-powered tools.
            </Typography>
          </Grid>
        </Grid>

        {/* Bento Grid Section */}
        <Grid container spacing={2}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  height: 520,
                  position: "relative",
                  borderRadius: "10px",
                  overflow: "hidden",
                  transition: "transform 0.3s ease",
                  backgroundColor: "#101010",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "scale(0.99)",
                  },
                }}
              >
                <Box
                  component="img"
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  decoding="async"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: 0,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
                  }}
                />
                {/* Content Overlay */}
                <Box
                  sx={{
                    p: 4,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: DARK_THEME.cardText,
                      fontWeight: 500,
                      mb: 1.5,
                      fontSize: "1.3rem",
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                      maxWidth: "90%",
                    }}
                  >
                    {card.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default WebsiteWorksSection;
