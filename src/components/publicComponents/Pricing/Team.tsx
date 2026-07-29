import { Box, ButtonBase, Container, Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import { Link as RouterLink } from "react-router-dom";

const supportCards = [
  {
    title: "Read pricing guidance",
    description:
      "Explore website, directory, and launch strategy notes before choosing a plan.",
    label: "Visit blog",
    href: "/blog",
    icon: ArticleOutlinedIcon,
  },
  {
    title: "Talk to our team",
    description:
      "Ask about plan fit, larger site counts, referrals, or custom launch needs.",
    label: "Contact us",
    href: "/contact",
    icon: SupportAgentOutlinedIcon,
  },
];

export default function CustomPlansSection() {
  return (
    <Box
      sx={{
        background: "#020303",
        color: "#fff",
        py: { xs: 7, md: 10 },
        position: "relative",
        overflow: "hidden",
        borderTop: "1px solid rgba(47,184,179,0.16)",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 0%, rgba(47,184,179,0.16), transparent 42%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2.5, md: 5 }}
          alignItems={{ xs: "flex-start", md: "flex-end" }}
          justifyContent="space-between"
          sx={{ mb: { xs: 3.5, md: 5 } }}
        >
          <Box>
            <Typography
              sx={{
                color: "#2fb8b3",
                fontSize: "0.72rem",
                fontWeight: 900,
                letterSpacing: 1.8,
                textTransform: "uppercase",
                mb: 1.2,
              }}
            >
              Need help choosing?
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              We’ll help you pick the right plan.
            </Typography>
          </Box>

          <Typography
            sx={{
              maxWidth: 420,
              color: "rgba(255,255,255,0.62)",
              fontSize: { xs: "0.95rem", md: "1rem" },
              lineHeight: 1.65,
            }}
          >
            Start with the public pricing details, then reach out if you need a
            higher site count, rollout advice, or a custom launch path.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 2, md: 3 },
          }}
        >
          {supportCards.map((card) => {
            const Icon = card.icon;

            return (
              <ButtonBase
                key={card.title}
                component={RouterLink}
                to={card.href}
                sx={{
                  display: "block",
                  textAlign: "left",
                  borderRadius: "18px",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    minHeight: { xs: 190, md: 230 },
                    p: { xs: 3, md: 4 },
                    borderRadius: "18px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background:
                      "linear-gradient(135deg, rgba(47,184,179,0.08), rgba(255,255,255,0.035))",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition:
                      "transform 0.22s ease, border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: "rgba(47,184,179,0.5)",
                      background:
                        "linear-gradient(135deg, rgba(47,184,179,0.14), rgba(255,255,255,0.05))",
                      boxShadow: "0 22px 56px rgba(47,184,179,0.14)",
                    },
                    "&:hover .support-arrow": {
                      transform: "translateX(4px)",
                      color: "#2fb8b3",
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        display: "grid",
                        placeItems: "center",
                        color: "#2fb8b3",
                        background: "rgba(47,184,179,0.13)",
                        border: "1px solid rgba(47,184,179,0.28)",
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: 22 }} />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          color: "#fff",
                          fontSize: { xs: "1.25rem", md: "1.45rem" },
                          fontWeight: 850,
                          mb: 1,
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.62)",
                          fontSize: "0.95rem",
                          lineHeight: 1.6,
                          maxWidth: 430,
                        }}
                      >
                        {card.description}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      mt: 4,
                      color: "#fff",
                      fontSize: "0.82rem",
                      fontWeight: 900,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    <Box component="span">{card.label}</Box>
                    <ArrowForwardIcon
                      className="support-arrow"
                      sx={{
                        fontSize: 18,
                        transition: "transform 0.22s ease, color 0.22s ease",
                      }}
                    />
                  </Stack>
                </Box>
              </ButtonBase>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
