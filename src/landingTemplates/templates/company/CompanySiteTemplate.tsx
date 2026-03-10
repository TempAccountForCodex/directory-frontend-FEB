import React from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Stack,
  IconButton,
  Avatar,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { TemplateProps } from "../../templateEngine/types";
import FadeIn from "../../blocks/FadeIn";

const MotionBox = motion(Box);

const CompanySiteTemplate: React.FC<TemplateProps> = ({ data }) => {
  const primary = data.primaryColor || "#378C92";
  const secondary = data.secondaryColor || "#D3EB63";

  return (
    <Box sx={{ fontFamily: "'Inter', -apple-system, sans-serif", bgcolor: "#fff", minHeight: "100vh" }}>

      {/* Navbar */}
      <Box
        component="header"
        sx={{
          position: "sticky", top: 0, zIndex: 100,
          bgcolor: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid #ebebeb",
          px: { xs: 3, md: 6 }, py: 2,
          display: "flex", alignItems: "center", gap: 4,
        }}
      >
        {data.logoUrl ? (
          <Box component="img" src={data.logoUrl} alt={data.name} sx={{ height: 36 }} />
        ) : (
          <Typography sx={{ fontWeight: 900, fontSize: "1.2rem", color: primary, flexGrow: 1 }}>{data.name}</Typography>
        )}
        <Stack direction="row" spacing={3} sx={{ display: { xs: "none", md: "flex" }, flexGrow: 1 }}>
          {["Features", "Pricing", "Team", "Contact"].map((item) => (
            <Typography
              key={item}
              variant="body2"
              sx={{ color: "#555", cursor: "pointer", "&:hover": { color: primary }, transition: "color 0.2s" }}
            >
              {item}
            </Typography>
          ))}
        </Stack>
        <Button
          variant="contained"
          size="small"
          sx={{
            bgcolor: primary, color: "#fff", fontWeight: 700, borderRadius: 999, px: 3,
            "&:hover": { bgcolor: primary, filter: "brightness(0.9)" },
          }}
        >
          Get Started
        </Button>
      </Box>

      {/* Hero */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 3, md: 6 }, pt: { xs: 12, md: 20 }, pb: { xs: 10, md: 14 }, textAlign: "center" }}>
        <MotionBox
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <Chip
            label={data.tagline || "Now Available"}
            size="small"
            sx={{ bgcolor: `${primary}18`, color: primary, fontWeight: 700, mb: 3, px: 1 }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.5rem", md: "5rem" },
              fontWeight: 900, lineHeight: 1.05, color: "#0f172a",
              maxWidth: 900, mx: "auto",
            }}
          >
            {data.name}
          </Typography>
          <Typography
            sx={{
              mt: 4, color: "#64748b", fontSize: { xs: "1rem", md: "1.25rem" },
              maxWidth: 640, mx: "auto", lineHeight: 1.75,
            }}
          >
            {data.description}
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" sx={{ mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: primary, color: "#fff", fontWeight: 700, borderRadius: 999, px: 5,
                "&:hover": { bgcolor: primary, filter: "brightness(0.9)" },
              }}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: "#e2e8f0", color: "#0f172a", borderRadius: 999, px: 5,
                "&:hover": { borderColor: primary, bgcolor: "transparent" },
              }}
            >
              See Demo
            </Button>
          </Stack>
        </MotionBox>

        {/* Stats */}
        {data.stats && data.stats.length > 0 && (
          <FadeIn delay={0.3}>
            <Box
              sx={{
                mt: 14, display: "flex", justifyContent: "center",
                gap: { xs: 4, md: 10 }, flexWrap: "wrap",
              }}
            >
              {data.stats.map((s, i) => (
                <Box key={i} sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{ fontSize: { xs: "2rem", md: "3rem" }, fontWeight: 900, color: primary }}
                  >
                    {s.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </FadeIn>
        )}
      </Box>

      {/* Features */}
      {data.features && data.features.length > 0 && (
        <Box sx={{ bgcolor: "#f8fafc", py: { xs: 10, md: 16 }, px: 3 }}>
          <Box sx={{ maxWidth: 1100, mx: "auto" }}>
            <FadeIn>
              <Typography variant="overline" sx={{ color: primary, fontWeight: 700, letterSpacing: 3, display: "block", textAlign: "center" }}>
                Features
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 900, color: "#0f172a", textAlign: "center", mt: 1, mb: 2, fontSize: { xs: "1.75rem", md: "2.5rem" } }}
              >
                Everything you need
              </Typography>
              <Typography sx={{ color: "#64748b", textAlign: "center", mb: 8, maxWidth: 540, mx: "auto" }}>
                Built with the tools and features modern businesses actually use.
              </Typography>
            </FadeIn>
            <Grid container spacing={4}>
              {data.features.map((f, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <FadeIn delay={i * 0.07}>
                    <Box
                      sx={{
                        bgcolor: "#fff", borderRadius: 3, p: 4,
                        border: "1px solid #e2e8f0",
                        transition: "box-shadow 0.2s, transform 0.2s",
                        "&:hover": { boxShadow: "0 8px 32px rgba(0,0,0,0.08)", transform: "translateY(-4px)" },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48, height: 48, borderRadius: 2, bgcolor: `${primary}18`,
                          display: "flex", alignItems: "center", justifyContent: "center", mb: 3,
                          fontSize: "1.4rem",
                        }}
                      >
                        {f.icon || "✦"}
                      </Box>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>{f.title}</Typography>
                      <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.7 }}>{f.description}</Typography>
                    </Box>
                  </FadeIn>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}

      {/* Pricing */}
      {data.pricingPlans && data.pricingPlans.length > 0 && (
        <Box sx={{ py: { xs: 10, md: 16 }, px: 3 }}>
          <Box sx={{ maxWidth: 1100, mx: "auto" }}>
            <FadeIn>
              <Typography variant="overline" sx={{ color: primary, fontWeight: 700, letterSpacing: 3, display: "block", textAlign: "center" }}>
                Pricing
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, textAlign: "center", color: "#0f172a", mt: 1, mb: 10, fontSize: { xs: "1.75rem", md: "2.5rem" } }}>
                Simple, transparent pricing
              </Typography>
            </FadeIn>
            <Grid container spacing={3} alignItems="center">
              {data.pricingPlans.map((plan, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <FadeIn delay={i * 0.1}>
                    <Box
                      sx={{
                        borderRadius: 4, p: 4,
                        bgcolor: plan.highlighted ? primary : "#fff",
                        border: plan.highlighted ? "none" : "1px solid #e2e8f0",
                        boxShadow: plan.highlighted ? `0 20px 60px ${primary}40` : "none",
                        transform: plan.highlighted ? { md: "scale(1.04)" } : "none",
                        position: "relative",
                      }}
                    >
                      {plan.highlighted && (
                        <Chip
                          label="Most Popular"
                          size="small"
                          sx={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", bgcolor: secondary, color: "#000", fontWeight: 700 }}
                        />
                      )}
                      <Typography
                        sx={{
                          fontWeight: 700, mb: 0.5,
                          color: plan.highlighted ? "rgba(255,255,255,0.7)" : "#64748b",
                          fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 1.5,
                        }}
                      >
                        {plan.name}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 1 }}>
                        <Typography sx={{ fontSize: "2.5rem", fontWeight: 900, color: plan.highlighted ? "#fff" : "#0f172a" }}>
                          {plan.price}
                        </Typography>
                        {plan.period && (
                          <Typography variant="body2" sx={{ color: plan.highlighted ? "rgba(255,255,255,0.6)" : "#94a3b8" }}>
                            /{plan.period}
                          </Typography>
                        )}
                      </Box>
                      {plan.description && (
                        <Typography variant="body2" sx={{ color: plan.highlighted ? "rgba(255,255,255,0.7)" : "#64748b", mb: 3 }}>
                          {plan.description}
                        </Typography>
                      )}
                      <Box sx={{ mb: 4 }}>
                        {plan.features.map((f, j) => (
                          <Box key={j} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
                            <CheckCircleIcon sx={{ fontSize: 18, color: plan.highlighted ? secondary : primary, flexShrink: 0, mt: 0.2 }} />
                            <Typography variant="body2" sx={{ color: plan.highlighted ? "rgba(255,255,255,0.85)" : "#475569" }}>
                              {f}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      <Button
                        variant={plan.highlighted ? "contained" : "outlined"}
                        fullWidth
                        sx={{
                          bgcolor: plan.highlighted ? secondary : "transparent",
                          color: plan.highlighted ? "#000" : primary,
                          borderColor: plan.highlighted ? secondary : primary,
                          fontWeight: 700, borderRadius: 999,
                          "&:hover": {
                            bgcolor: plan.highlighted ? secondary : `${primary}10`,
                            filter: plan.highlighted ? "brightness(0.95)" : "none",
                          },
                        }}
                      >
                        {plan.cta || "Get Started"}
                      </Button>
                    </Box>
                  </FadeIn>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}

      {/* Team */}
      {data.team && data.team.length > 0 && (
        <Box sx={{ bgcolor: "#f8fafc", py: { xs: 10, md: 14 }, px: 3 }}>
          <Box sx={{ maxWidth: 1100, mx: "auto" }}>
            <FadeIn>
              <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", textAlign: "center", mb: 10, fontSize: { xs: "1.75rem", md: "2.5rem" } }}>
                Meet the Team
              </Typography>
            </FadeIn>
            <Grid container spacing={4} justifyContent="center">
              {data.team.map((member, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <FadeIn delay={i * 0.08}>
                    <Box sx={{ textAlign: "center" }}>
                      <Avatar
                        src={member.avatarUrl}
                        sx={{
                          width: 100, height: 100, mx: "auto", mb: 2,
                          bgcolor: primary, fontSize: "2rem",
                          border: `3px solid ${secondary}`,
                        }}
                      >
                        {member.name[0]}
                      </Avatar>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>{member.name}</Typography>
                      <Typography variant="body2" sx={{ color: primary, fontWeight: 600, mb: 1 }}>{member.role}</Typography>
                      {member.bio && (
                        <Typography variant="caption" sx={{ color: "#64748b", lineHeight: 1.6, display: "block" }}>
                          {member.bio}
                        </Typography>
                      )}
                    </Box>
                  </FadeIn>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}

      {/* Reviews */}
      {data.reviews && data.reviews.length > 0 && (
        <Box sx={{ py: { xs: 10, md: 14 }, px: 3 }}>
          <Box sx={{ maxWidth: 960, mx: "auto" }}>
            <FadeIn>
              <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", textAlign: "center", mb: 8, fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
                Trusted by teams worldwide
              </Typography>
            </FadeIn>
            <Grid container spacing={3}>
              {data.reviews.map((r, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <FadeIn delay={i * 0.1}>
                    <Box
                      sx={{
                        p: 4, borderRadius: 3, border: "1px solid #e2e8f0",
                        height: "100%", display: "flex", flexDirection: "column",
                      }}
                    >
                      <Typography sx={{ fontSize: "2rem", lineHeight: 1, mb: 2, color: primary }}>❝</Typography>
                      <Typography sx={{ color: "#475569", lineHeight: 1.75, flex: 1, mb: 3 }}>{r.text}</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: primary, fontSize: "0.8rem" }}>{r.author[0]}</Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a" }}>{r.author}</Typography>
                          {r.date && <Typography variant="caption" sx={{ color: "#94a3b8" }}>{r.date}</Typography>}
                        </Box>
                      </Box>
                    </Box>
                  </FadeIn>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}

      {/* CTA */}
      <Box sx={{ bgcolor: primary, py: { xs: 10, md: 14 }, px: 3, textAlign: "center" }}>
        <FadeIn>
          <Typography variant="h3" sx={{ fontWeight: 900, color: "#fff", mb: 2, fontSize: { xs: "1.75rem", md: "2.5rem" } }}>
            Ready to get started?
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 5, maxWidth: 480, mx: "auto" }}>
            Join thousands of teams already using {data.name} to build better products.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: secondary, color: "#000", fontWeight: 800, borderRadius: 999, px: 6, py: 1.75,
              "&:hover": { bgcolor: secondary, filter: "brightness(0.92)" },
            }}
          >
            Start Free — No Credit Card Needed
          </Button>
        </FadeIn>
      </Box>

      {/* Contact + Footer */}
      <Box sx={{ bgcolor: "#0f172a", py: 8, px: 3 }}>
        <Box sx={{ maxWidth: 1100, mx: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 6, mb: 6 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "1.1rem", mb: 2 }}>{data.name}</Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 260 }}>
              {data.description}
            </Typography>
          </Box>
          <Box>
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.4)", letterSpacing: 2, display: "block", mb: 2 }}>Contact</Typography>
            {data.contact.email && <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 1 }}>{data.contact.email}</Typography>}
            {data.contact.phone && <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>{data.contact.phone}</Typography>}
          </Box>
          <Box>
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.4)", letterSpacing: 2, display: "block", mb: 2 }}>Follow</Typography>
            {data.socialLinks && (
              <Stack direction="row" spacing={0.5}>
                {data.socialLinks.twitter && <IconButton size="small" sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#1da1f2" } }}><Twitter size={16} /></IconButton>}
                {data.socialLinks.linkedin && <IconButton size="small" sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#0a66c2" } }}><Linkedin size={16} /></IconButton>}
                {data.socialLinks.instagram && <IconButton size="small" sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff" } }}><Instagram size={16} /></IconButton>}
                {data.socialLinks.facebook && <IconButton size="small" sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff" } }}><Facebook size={16} /></IconButton>}
              </Stack>
            )}
          </Box>
        </Box>
        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", pt: 4, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} {data.name}. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CompanySiteTemplate;
