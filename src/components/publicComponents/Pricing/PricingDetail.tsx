import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";

const star = "/assets/publicAssets/images/common/star.svg";

/* ============================
   Theme & Config
============================ */

const gradientText = {
  background:
    "linear-gradient(135deg, #2dd4bf 0%, #378C92 25%, #06b6d4 50%, #0ea5e9 75%, #3b82f6 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  fontWeight: 700,
};

const COLORS = {
  bg: "#020303",
  card: "#071c1e",
  cardDark: "#050f11",
  teal: "#2fb8b3",
  tealSoft: "rgba(47,184,179,0.25)",
  border: "rgba(255,255,255,0.08)",
};

/* ============================
   Plans

   NOTE: Prices are PLACEHOLDERS pending final numbers.
   Edit PLAN_PRICES to change pricing for every billing cycle.
============================ */

type BillingCycle = "monthly" | "annual";
type PlanId = "free" | "pro" | "business";

type Feature = string | { label: string; sub: string[] };

type Plan = {
  id: PlanId;
  label: string;
  tagline: string;
  positioning: string;
  free?: boolean;
  recommended?: boolean;
  cta: string;
  features: Feature[];
};

const PLAN_PRICES: Record<PlanId, Record<BillingCycle, number>> = {
  free: {
    monthly: 0,
    annual: 0,
  },
  pro: {
    monthly: 15,
    annual: 180,
  },
  business: {
    monthly: 40,
    annual: 480,
  },
};

const PLANS: Plan[] = [
  {
    id: "free",
    label: "Free",
    tagline: "Get online",
    positioning: "Establish a complete but simple online presence.",
    free: true,
    cta: "Get Started",
    features: [
      "1 single-page landing site",
      "1 standard directory listing",
      "1 form · 50 submissions/mo",
      "5 blog posts",
      "50 MB storage",
      "10 AI actions/mo",
      "Free techietribe.app subdomain",
    ],
  },
  {
    id: "pro",
    label: "Pro",
    tagline: "Look professional",
    positioning: "A polished, fully branded presence on your own domain.",
    recommended: true,
    cta: "Get Started",
    features: [
      "Everything in Free, plus:",
      {
        label: "Up to 5 websites",
        sub: [
          "A directory listing for each",
          "1 custom domain for each",
          "5 forms per website",
        ],
      },
      "500 form submissions/mo",
      "50 blog posts/site",
      "upto 500 MB storage",
      "100 AI actions/mo",
      "Premium templates · custom CSS",
      "SEO optimization for your website",
      "Detailed analytics · CSV exports",
      "2 collaborators per website",
    ],
  },
  {
    id: "business",
    label: "Business",
    tagline: "Grow and scale",
    positioning: "Scale a portfolio with maximum directory visibility.",
    cta: "Get Started",
    features: [
      "Everything in Pro, plus:",
      "Unlimited websites & directory listings*",
      "Unlimited forms · 10,000 submissions/mo",
      "Unlimited blog posts",
      "1 GB storage",
      "500 AI actions/mo",
      "Custom code & embeds",
      "SEO optimization for websites & blogs",
      "Blog comments & moderation controls",
      "Conversion, funnel & real-time analytics",
      "Advanced integrations (GTM, Meta Pixel…)",
      "10 collaborators per website",
      "1 featured directory listing",
      "Priority support",
    ],
  },
];

/* ============================
   Feature comparison matrix
============================ */

type Cell = string | boolean;

type CompareRow = { feature: string; free: Cell; pro: Cell; business: Cell };

const COMPARISON_GROUPS: { category: string; rows: CompareRow[] }[] = [
  {
    category: "Websites & content",
    rows: [
      { feature: "Landing pages", free: "1 single-page", pro: "Up to 5", business: "Unlimited*" },
      { feature: "Directory listings", free: "1 standard", pro: "Up to 5", business: "Unlimited*" },
      { feature: "Link-in-bio pages", free: "1", pro: "Up to 5", business: "Unlimited*" },
      { feature: "Blog posts", free: "5", pro: "50 per website", business: "Unlimited" },
      { feature: "Storage", free: "100 MB", pro: "500 MB", business: "1 GB" },
    ],
  },
  {
    category: "Forms & leads",
    rows: [
      { feature: "Forms", free: "1", pro: "5 per website", business: "Unlimited" },
      { feature: "Form submissions", free: "50/month", pro: "500/month", business: "10,000/month" },
      { feature: "Booking/reservation forms", free: false, pro: true, business: true },
      { feature: "CSV lead export", free: false, pro: true, business: true },
    ],
  },
  {
    category: "AI tools",
    rows: [
      { feature: "AI actions", free: "10/month", pro: "100/month", business: "500/month" },
      { feature: "AI listing enhancement", free: false, pro: true, business: true },
    ],
  },
  {
    category: "Domain & branding",
    rows: [
      { feature: "Techietribe subdomain", free: true, pro: true, business: true },
      { feature: "Custom domains", free: false, pro: "1 per website", business: "1 per website" },
      { feature: "Techietribe branding", free: "Displayed", pro: "Removed", business: "Removed" },
    ],
  },
  {
    category: "Design & editor",
    rows: [
      { feature: "Templates", free: "Free", pro: "Free & premium", business: "All templates" },
      { feature: "Video blocks & uploads", free: false, pro: true, business: true },
      { feature: "Custom CSS", free: false, pro: true, business: true },
      { feature: "Custom code & embeds", free: false, pro: false, business: true },
    ],
  },
  {
    category: "Analytics",
    rows: [
      { feature: "Basic analytics", free: true, pro: true, business: true },
      { feature: "Detailed traffic analytics", free: false, pro: true, business: true },
      { feature: "Conversion & real-time analytics", free: false, pro: false, business: true },
    ],
  },
  {
    category: "Directory & reputation",
    rows: [
      { feature: "Directory ranking boost", free: "Standard", pro: "Enhanced", business: "Highest" },
      { feature: "Featured directory listing", free: false, pro: false, business: "1 active" },
      { feature: "Owner review replies", free: false, pro: true, business: true },
    ],
  },
  {
    category: "Team & integrations",
    rows: [
      { feature: "Collaborators", free: "0", pro: "2 per website", business: "10 per website" },
      { feature: "Advanced integrations", free: false, pro: "Limited", business: true },
      { feature: "Support", free: "Standard", pro: "Standard", business: "Priority" },
    ],
  },
];

/* ============================
   Sub-Components
============================ */

const BillingToggle = ({
  value,
  onChange,
}: {
  value: BillingCycle;
  onChange: (v: BillingCycle) => void;
}) => {
  const options: BillingCycle[] = ["monthly", "annual"];
  const selectedIndex = options.indexOf(value);

  return (
    <Box sx={{ textAlign: "center", mb: 8 }}>
      <Box
        sx={{
          display: "inline-grid",
          gridTemplateColumns: "repeat(2, minmax(142px, 190px))",
          position: "relative",
          background: "rgba(255,255,255,0.07)",
          borderRadius: "999px",
          p: 0.5,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
          overflow: "hidden",
          width: { xs: "min(100%, 300px)", sm: 388 },
        }}
      >
        <Box
          component={motion.span}
          aria-hidden
          animate={{ x: `${selectedIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.9 }}
          sx={{
            position: "absolute",
            top: 4,
            bottom: 4,
            left: 4,
            zIndex: 0,
            width: "calc((100% - 8px) / 2)",
            borderRadius: "999px",
            background: "#fff",
            boxShadow:
              "0 14px 34px rgba(0,0,0,0.24), 0 0 0 1px rgba(255,255,255,0.72)",
          }}
        />

        {options.map((type) => {
          const selected = value === type;

          return (
            <Button
              key={type}
              onClick={() => onChange(type)}
              disableRipple
              sx={{
                position: "relative",
                zIndex: 1,
                minWidth: 0,
                px: { xs: 2, sm: 4 },
                py: 1.3,
                borderRadius: "999px",
                fontWeight: 800,
                textTransform: "none",
                background: "transparent",
                color: selected ? "#000" : "rgba(255,255,255,0.72)",
                overflow: "hidden",
                transition: "color 0.22s ease",
                "&:hover": {
                  background: "transparent",
                  color: selected ? "#000" : "#fff",
                },
              }}
            >
              <Box
                component={motion.span}
                animate={{
                  opacity: selected ? 1 : 0,
                  y: selected ? 0 : 8,
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  color: "#000",
                }}
              >
                {type === "annual" ? "Pay annually" : "Pay monthly"}
              </Box>
              <Box
                component={motion.span}
                animate={{
                  opacity: selected ? 0 : 1,
                  y: selected ? -8 : 0,
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                sx={{
                  display: "inline-block",
                  color: "inherit",
                }}
              >
                {type === "annual" ? "Pay annually" : "Pay monthly"}
              </Box>
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};

const PlanHeader = ({
  plan,
  billing,
}: {
  plan: Plan;
  billing: BillingCycle;
}) => {
  const displayPrice = PLAN_PRICES[plan.id][billing];
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography sx={{ fontWeight: 800, fontSize: "1.15rem" }}>
        {plan.label}
      </Typography>
      <Typography
        sx={{
          ...gradientText,
          fontSize: "0.8rem",
          mt: 0.5,
          letterSpacing: 0.3,
        }}
      >
        {plan.tagline}
      </Typography>

      <Box
        sx={{
          mt: 2,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "center",
          gap: 0.5,
        }}
      >
        <Typography
          component="span"
          sx={{ fontSize: "2.6rem", fontWeight: 900, lineHeight: 1 }}
        >
          {plan.free ? "$0" : `$${displayPrice}`}
        </Typography>
        <Typography
          component="span"
          sx={{ opacity: 0.5, fontSize: "0.85rem", fontWeight: 500 }}
        >
          {plan.free
            ? "/forever"
            : `/${billing === "annual" ? "year" : "month"}`}
        </Typography>
      </Box>

      <Typography
        sx={{
          opacity: 0.6,
          mt: 1.5,
          fontSize: "0.85rem",
          lineHeight: 1.5,
          minHeight: 54,
          px: 1,
        }}
      >
        {plan.positioning}
      </Typography>
    </Box>
  );
};

/* ============================
   Pricing Card
============================ */

const PricingCard = ({
  plan,
  billing,
}: {
  plan: Plan;
  billing: BillingCycle;
}) => {
  const recommended = !!plan.recommended;
  const displayPrice = PLAN_PRICES[plan.id][billing];

  const firstIsHeading =
    typeof plan.features[0] === "string" &&
    (plan.features[0] as string).endsWith("plus:");
  const sectionLabel = firstIsHeading
    ? (plan.features[0] as string).replace(/,?\s*plus:$/, "")
    : "What's included";
  const items = firstIsHeading ? plan.features.slice(1) : plan.features;

  return (
    <Grid item xs={12} sm={6} md={4} sx={{ display: "flex" }}>
      <Box
        sx={{
          flexGrow: 1,
          position: "relative",
          mt: 3,
          background: recommended ? COLORS.card : "#03181a",
          borderRadius: "24px",
          border: recommended
            ? `1px solid rgba(47,184,179,0.5)`
            : `1px solid ${COLORS.border}`,
          boxShadow: recommended
            ? "0 0 50px rgba(47,184,179,0.12)"
            : "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {recommended && (
          <Chip
            label="MOST POPULAR"
            sx={{
              height: 26,
              fontSize: "0.65rem",
              fontWeight: 800,
              letterSpacing: 1,
              background: COLORS.teal,
              color: "white",
              position: "absolute",
              top: -13,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
            }}
          />
        )}

        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "24px",
            p: 4,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* WATERMARK */}
          <Typography
            variant="h1"
            sx={{
              position: "absolute",
              right: "-30px",
              bottom: "10%",
              transform: "rotate(-15deg)",
              fontSize: "12rem",
              fontWeight: 900,
              color: "rgba(255, 255, 255, 0.03)",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 0,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {plan.free ? "$0" : `$${displayPrice}`}
          </Typography>

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <PlanHeader plan={plan} billing={billing} />

            {/* Section divider label */}
            <Box
              sx={{
                mt: 3,
                mb: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.45)",
                  whiteSpace: "nowrap",
                }}
              >
                {sectionLabel}
              </Typography>
              <Box
                sx={{ flexGrow: 1, height: "1px", background: COLORS.border }}
              />
            </Box>

            <Stack spacing={1.4} sx={{ mb: 4 }}>
              {items.map((item) => {
                if (typeof item !== "string") {
                  return (
                    <Box key={item.label}>
                      <Stack
                        direction="row"
                        spacing={1.4}
                        alignItems="flex-start"
                      >
                        <CheckIcon
                          sx={{
                            fontSize: 18,
                            color: COLORS.teal,
                            mt: "1px",
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.92rem",
                            opacity: 0.92,
                            lineHeight: 1.4,
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Stack>
                      <Stack
                        spacing={0.8}
                        sx={{
                          mt: 1,
                          ml: "8px",
                          pl: 2.2,
                          borderLeft: `1px solid ${COLORS.border}`,
                        }}
                      >
                        {item.sub.map((s) => (
                          <Stack
                            key={s}
                            direction="row"
                            spacing={1}
                            alignItems="flex-start"
                          >
                            <CheckIcon
                              sx={{
                                fontSize: 14,
                                color: COLORS.teal,
                                mt: "1px",
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: "0.82rem",
                                opacity: 0.68,
                                lineHeight: 1.35,
                              }}
                            >
                              {s}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  );
                }

                return (
                  <Stack
                    key={item}
                    direction="row"
                    spacing={1.4}
                    alignItems="flex-start"
                  >
                    <CheckIcon
                      sx={{
                        fontSize: 18,
                        color: COLORS.teal,
                        mt: "1px",
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.92rem",
                        opacity: 0.92,
                        lineHeight: 1.4,
                      }}
                    >
                      {item}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>

            <Button
              fullWidth
              variant="outlined"
              sx={{
                mt: "auto",
                py: 1.6,
                borderRadius: "12px",
                fontWeight: 900,
                textTransform: "none",
                background: recommended ? "white" : "transparent",
                color: recommended ? "#000" : "white",
                borderColor: recommended ? "white" : "rgba(255,255,255,0.2)",
                "&:hover": {
                  background: recommended
                    ? COLORS.teal
                    : "rgba(255,255,255,0.1)",
                  borderColor: COLORS.teal,
                  color: "#ffffff",
                },
              }}
            >
              {plan.cta}
            </Button>
          </Box>
        </Box>
      </Box>
    </Grid>
  );
};

/* ============================
   Comparison Table
============================ */

const CompareCell = ({
  value,
  highlight,
}: {
  value: Cell;
  highlight?: boolean;
}) => {
  if (value === true)
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          mx: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: highlight ? COLORS.teal : "rgba(47,184,179,0.15)",
        }}
      >
        <CheckIcon
          sx={{ fontSize: 15, color: highlight ? "#04201f" : COLORS.teal }}
        />
      </Box>
    );
  if (value === false)
    return (
      <Box
        component="span"
        sx={{
          display: "inline-block",
          width: 12,
          height: "2px",
          borderRadius: 2,
          background: "rgba(255,255,255,0.2)",
        }}
      />
    );
  return (
    <Typography
      sx={{
        fontSize: "0.85rem",
        fontWeight: highlight ? 700 : 500,
        color: highlight ? "#fff" : "rgba(255,255,255,0.85)",
      }}
    >
      {value}
    </Typography>
  );
};

const PLAN_COL_WIDTH = "17%";

const ComparisonTable = () => {
  const [expanded, setExpanded] = React.useState(false);

  return (
  <Container maxWidth="lg" sx={{ mt: 14, pb: 4 }}>
    <Box sx={{ textAlign: "center", mb: 7 }}>
      <Typography
        sx={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: COLORS.teal,
          mb: 1.5,
        }}
      >
        Full breakdown
      </Typography>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          fontSize: { xs: "1.7rem", md: "2.4rem" },
          letterSpacing: "-0.02em",
        }}
      >
        Compare every feature
      </Typography>
    </Box>

    <Box sx={{ position: "relative" }}>
      <Box
        sx={{
          borderRadius: "24px",
          border: `1px solid ${COLORS.border}`,
          background: "rgba(3,24,26,0.6)",
          overflow: "hidden",
          boxShadow: expanded
            ? "0 22px 70px rgba(47,184,179,0.14)"
            : "0 14px 44px rgba(0,0,0,0.22)",
          transition: "box-shadow 0.35s ease, border-color 0.35s ease",
        }}
      >
        <motion.div
          initial={false}
          animate={{
            height: expanded ? "auto" : 360,
            filter: expanded ? "saturate(1.08)" : "saturate(0.96)",
          }}
          transition={{
            height: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            filter: { duration: 0.35, ease: "easeOut" },
          }}
          style={{ overflow: "hidden" }}
        >
          <Box
            sx={{
              overflowX: "auto",
              transform: expanded ? "translateY(0)" : "translateY(-2px)",
              transition: "transform 0.35s ease",
            }}
          >
            <Box
              component="table"
              sx={{
                width: "100%",
                minWidth: 720,
                borderCollapse: "separate",
                borderSpacing: 0,
                tableLayout: "fixed",
              }}
            >
        {/* Header */}
        <Box component="thead">
          <Box component="tr">
            <Box
              component="th"
              sx={{
                textAlign: "left",
                p: "22px 24px",
                position: "sticky",
                top: 0,
                background: COLORS.cardDark,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                FEATURES
              </Typography>
            </Box>
            {PLANS.map((p) => (
              <Box
                component="th"
                key={p.id}
                sx={{
                  width: PLAN_COL_WIDTH,
                  p: "18px 12px",
                  textAlign: "center",
                  background: p.recommended
                    ? "rgba(47,184,179,0.08)"
                    : COLORS.cardDark,
                  borderTop: p.recommended
                    ? `2px solid ${COLORS.teal}`
                    : "2px solid transparent",
                  borderLeft: p.recommended
                    ? `1px solid ${COLORS.tealSoft}`
                    : "none",
                  borderRight: p.recommended
                    ? `1px solid ${COLORS.tealSoft}`
                    : "none",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "1rem",
                    color: p.recommended ? COLORS.teal : "#fff",
                  }}
                >
                  {p.label}
                </Typography>
                {p.recommended && (
                  <Typography
                    sx={{
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: COLORS.teal,
                      opacity: 0.8,
                    }}
                  >
                    MOST POPULAR
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        <Box component="tbody">
          {COMPARISON_GROUPS.map((group) => (
            <React.Fragment key={group.category}>
              {/* Category header row */}
              <Box component="tr">
                <Box
                  component="td"
                  sx={{
                    p: "18px 24px 8px",
                    background: "rgba(255,255,255,0.015)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {group.category}
                  </Typography>
                </Box>
                {PLANS.map((p) => (
                  <Box
                    component="td"
                    key={p.id}
                    sx={{
                      background: p.recommended
                        ? "rgba(47,184,179,0.05)"
                        : "rgba(255,255,255,0.015)",
                      borderLeft: p.recommended
                        ? `1px solid ${COLORS.tealSoft}`
                        : "none",
                      borderRight: p.recommended
                        ? `1px solid ${COLORS.tealSoft}`
                        : "none",
                    }}
                  />
                ))}
              </Box>

              {group.rows.map((row) => (
                <Box
                  component="tr"
                  key={row.feature}
                  sx={{
                    "&:hover td": { background: "rgba(255,255,255,0.03)" },
                  }}
                >
                  <Box
                    component="td"
                    sx={{
                      p: "13px 24px",
                      fontSize: "0.9rem",
                      color: "rgba(255,255,255,0.82)",
                      borderTop: `1px solid ${COLORS.border}`,
                    }}
                  >
                    {row.feature}
                  </Box>
                  {(["free", "pro", "business"] as const).map((col) => {
                    const recommended = col === "pro";
                    return (
                      <Box
                        component="td"
                        key={col}
                        sx={{
                          p: "13px 12px",
                          textAlign: "center",
                          borderTop: `1px solid ${COLORS.border}`,
                          background: recommended
                            ? "rgba(47,184,179,0.05)"
                            : "transparent",
                          borderLeft: recommended
                            ? `1px solid ${COLORS.tealSoft}`
                            : "none",
                          borderRight: recommended
                            ? `1px solid ${COLORS.tealSoft}`
                            : "none",
                        }}
                      >
                        <CompareCell value={row[col]} highlight={recommended} />
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </React.Fragment>
          ))}
        </Box>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* Fade overlay when collapsed */}
      <motion.div
        initial={false}
        animate={{
          opacity: expanded ? 0 : 1,
          y: expanded ? 18 : 0,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 140,
          borderRadius: "0 0 24px 24px",
          background:
            "linear-gradient(180deg, rgba(4,30,24,0) 0%, rgba(4,30,24,0.92) 58%, #041e18 100%)",
          pointerEvents: "none",
        }}
      />
    </Box>

    {/* Toggle button */}
    <Box sx={{ textAlign: "center", mt: 3 }}>
      <Box
        component={motion.div}
        animate={{ y: expanded ? 0 : -8 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        sx={{ display: "inline-flex" }}
      >
        <Button
          onClick={() => setExpanded((v) => !v)}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transition: "transform 0.35s ease",
                transform: expanded ? "rotate(180deg)" : "none",
              }}
            />
          }
          sx={{
            px: 4,
            py: 1.4,
            borderRadius: "999px",
            fontWeight: 700,
            textTransform: "none",
            color: "white",
            border: `1px solid ${COLORS.tealSoft}`,
            background: expanded
              ? "rgba(255,255,255,0.08)"
              : "rgba(47,184,179,0.1)",
            boxShadow: expanded
              ? "none"
              : "0 12px 34px rgba(47,184,179,0.18)",
            transition:
              "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
            "&:hover": {
              background: "rgba(47,184,179,0.16)",
              borderColor: COLORS.teal,
              boxShadow: "0 14px 40px rgba(47,184,179,0.22)",
            },
          }}
        >
          {expanded ? "Show less" : "Show full comparison"}
        </Button>
      </Box>
    </Box>

    <Typography
      sx={{ mt: 3, fontSize: "0.8rem", opacity: 0.5, textAlign: "center" }}
    >
      *Unlimited is subject to a reasonable fair-use policy and platform-abuse
      protections.
    </Typography>
  </Container>
  );
};

/* ============================
   Main Section
============================ */

const PricingSection: React.FC = () => {
  const [billing, setBilling] = React.useState<BillingCycle>("monthly");

  return (
    <Box
      sx={{
        backgroundColor: "#041e18",
        backgroundImage: `url(${star})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 6, pb: { xs: 2, lg: 6 } }}>
        <Box textAlign="center" mb={6}>
          <Box
            sx={{
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "-21%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "100%",
                height: "100%",
                backgroundImage: `radial-gradient(circle at 50% -20%, rgba(55, 140, 146, 0.33) 0%, transparent 50%)`,
                zIndex: 0,
                display: { xs: "none", lg: "block" },
              }}
            />
            <Typography
              variant="h3"
              component="h1"
              fontWeight={700}
              sx={{
                color: "white",
                fontSize: { xs: "25px", sm: "35px", md: "45px", lg: "55px" },
                marginTop: { xs: "30px", md: "50px", lg: "90px" },
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "10px",
                lineHeight: 0.9,
                justifyContent: "center",
                fontFamily: "Plus Jakarta Sans",
              }}
            >
              Plans that grow with your business needs.
              <Box component="span" sx={{ width: "100%" }} />
              Start with a{" "}
              <Box component="span" sx={gradientText}>
                FREE
              </Box>{" "}
              landing page.
            </Typography>
          </Box>

          <Typography
            variant="h6"
            maxWidth="800px"
            mx="auto"
            sx={{ color: "white", marginTop: "30px" }}
          >
            Free gets you online. Pro makes you look professional. Business helps
            you grow and scale.
          </Typography>
        </Box>
      </Container>

      <Box sx={{ pb: 10, pt: 0, color: "white" }}>
        <Container maxWidth="lg">
          <BillingToggle value={billing} onChange={setBilling} />

          <Grid container spacing={4} alignItems="stretch">
            {PLANS.map((plan) => (
              <PricingCard key={plan.id} plan={plan} billing={billing} />
            ))}
          </Grid>
        </Container>

        <ComparisonTable />
      </Box>
    </Box>
  );
};

export default PricingSection;
