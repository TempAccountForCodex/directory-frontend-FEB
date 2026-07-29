import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Stack,
  Chip,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";
import type {
  BillingCycle,
  Cell,
  Plan,
  PlanId,
  SiteCount,
} from "./pricingConfig";
import {
  COMPARISON_GROUPS,
  getNextSiteCount,
  getPlanPrice,
  getPlanPriceBreakdown,
  PLANS,
  PRICING_DISCOUNT_DISPLAY,
  REFERRAL_PROGRAM,
  SITE_COUNT_MAX,
  SITE_COUNT_MIN,
} from "./pricingConfig";

const star = "/assets/publicAssets/images/common/star.svg";
const heroAvatars = [
  "/assets/publicAssets/images/home/avatar1-sm.webp",
  "/assets/publicAssets/images/home/avatar2-sm.webp",
  "/assets/publicAssets/images/home/avatar3-sm.webp",
];
const pricingFontStack = "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif";

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

const HeroAvatarCluster = () => (
  <Box
    component="span"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      mx: { xs: 0, md: 0.05 },
      transform: { xs: "translateY(0px)", md: "translateY(2px)" },
    }}
  >
    {heroAvatars.map((src, index) => (
      <Box
        key={src}
        component="img"
        src={src}
        alt=""
        sx={{
          width: { xs: 24, sm: 32, md: 38, lg: 44 },
          height: { xs: 24, sm: 32, md: 38, lg: 44 },
          objectFit: "cover",
          borderRadius: "34%",
          border: "3px solid #fff",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          ml: index === 0 ? 0 : { xs: -0.9, sm: -1.15, md: -1.45 },
          position: "relative",
          zIndex: heroAvatars.length - index,
          transform:
            index === 0
              ? "rotate(-8deg)"
              : index === 1
                ? "translateY(-3px) rotate(1deg)"
                : "rotate(9deg)",
          transformOrigin: "center bottom",
        }}
      />
    ))}
  </Box>
);

const COLORS = {
  bg: "#020303",
  card: "#071c1e",
  cardDark: "#050f11",
  brand: "#378C92",
  teal: "#2fb8b3",
  tealSoft: "rgba(47,184,179,0.25)",
  border: "rgba(255,255,255,0.08)",
};

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
    <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
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
          transition={{
            type: "spring",
            stiffness: 360,
            damping: 32,
            mass: 0.9,
          }}
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

const CopyableCodeChip = ({ code, label }: { code: string; label: string }) => {
  const [copied, setCopied] = React.useState(false);
  const copyTimer = React.useRef<number | null>(null);

  React.useEffect(
    () => () => {
      if (copyTimer.current) {
        window.clearTimeout(copyTimer.current);
      }
    },
    [],
  );

  React.useEffect(() => {
    setCopied(false);
  }, [code]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      if (copyTimer.current) {
        window.clearTimeout(copyTimer.current);
      }

      copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Chip
      clickable
      role="button"
      aria-label={`Copy ${label} code ${code}`}
      label={copied ? "COPIED" : code}
      onClick={handleCopyCode}
      sx={{
        height: { xs: 36, sm: 40 },
        px: 1,
        borderRadius: "999px",
        background: copied ? COLORS.teal : "#fff",
        color: copied ? "#031211" : "#041e18",
        fontSize: { xs: "0.74rem", sm: "0.85rem" },
        fontWeight: 900,
        letterSpacing: 1.2,
        cursor: "pointer",
        transition:
          "background 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": {
          background: copied ? COLORS.teal : "rgba(255,255,255,0.92)",
          transform: "translateY(-2px)",
          boxShadow: "0 10px 26px rgba(0,0,0,0.24)",
        },
        "&:active": {
          transform: "translateY(0)",
        },
      }}
    />
  );
};

const PromoBanner = ({
  eyebrow,
  title,
  body,
  code,
  copyLabel,
  mb = 4,
}: {
  eyebrow: string;
  title: string;
  body: React.ReactNode;
  code: string;
  copyLabel: string;
  mb?: number;
}) => {
  return (
    <Box
      sx={{
        maxWidth: 980,
        mx: "auto",
        mb,
        p: { xs: 2, sm: 2.5 },
        borderRadius: "20px",
        border: `1px solid ${COLORS.tealSoft}`,
        background:
          "linear-gradient(135deg, rgba(47,184,179,0.14), rgba(255,255,255,0.045))",
        boxShadow:
          "0 18px 58px rgba(47,184,179,0.12), 0 0 58px rgba(47,184,179,0.08), inset 0 1px 0 rgba(255,255,255,0.07)",
        transform: "translateY(0)",
        transition:
          "box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: "rgba(47,184,179,0.42)",
          boxShadow:
            "0 24px 70px rgba(47,184,179,0.16), 0 0 70px rgba(47,184,179,0.1), inset 0 1px 0 rgba(255,255,255,0.09)",
        },
      }}
    >
      <Box
        component={motion.div}
        key={code}
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "center", md: "center" }}
          justifyContent="space-between"
        >
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Typography
              sx={{
                color: COLORS.teal,
                fontSize: "0.72rem",
                fontWeight: 900,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                mb: 0.6,
              }}
            >
              {eyebrow}
            </Typography>
            <Typography
              sx={{
                color: "#fff",
                fontSize: { xs: "1rem", sm: "1.14rem", md: "1.35rem" },
                fontWeight: 900,
                lineHeight: 1.22,
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.62)",
                mt: 0.8,
                fontSize: { xs: "0.78rem", sm: "0.82rem", md: "0.86rem" },
                lineHeight: 1.45,
              }}
            >
              {body}
            </Typography>
          </Box>

          <CopyableCodeChip code={code} label={copyLabel} />
        </Stack>
      </Box>
    </Box>
  );
};

const PromoBannerLoop = () => {
  const promos = React.useMemo(
    () => [
      {
        eyebrow: "Launch discount",
        title: `${PRICING_DISCOUNT_DISPLAY.launchPercent}% off your first annual Pro or Business payment`,
        body: (
          <>
            Annual billing already includes two months free. Launch discounts
            are display-only here and will be connected at checkout later.
          </>
        ),
        code: PRICING_DISCOUNT_DISPLAY.launchCode,
        copyLabel: "launch",
      },
      {
        eyebrow: "Referral program",
        title: `Friend gets ${REFERRAL_PROGRAM.friendDiscountPercent}% off first payment; referrer earns $${REFERRAL_PROGRAM.referrerCreditAmount} credit`,
        body: (
          <>
            Renewal uses {REFERRAL_PROGRAM.renewalCopy}. Discount applies{" "}
            {REFERRAL_PROGRAM.friendDiscountDuration}; maximum benefit is
            controlled by backend at ${REFERRAL_PROGRAM.backendMaxBenefitAmount}
            . Eligible for {REFERRAL_PROGRAM.eligiblePlans.join(" or ")} plans.
          </>
        ),
        code: REFERRAL_PROGRAM.code,
        copyLabel: "referral",
      },
    ],
    [],
  );
  const [activePromoIndex, setActivePromoIndex] = React.useState(0);
  const activePromo = promos[activePromoIndex];

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setActivePromoIndex((current) => (current + 1) % promos.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [promos.length]);

  return (
    <Box sx={{ mb: { xs: 5, md: 10 } }}>
      <PromoBanner {...activePromo} mb={0.75} />

      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        sx={{ mt: 0.75 }}
      >
        {promos.map((promo, index) => {
          const selected = activePromoIndex === index;

          return (
            <Box
              key={promo.code}
              component="button"
              type="button"
              aria-label={`Show ${promo.eyebrow}`}
              aria-pressed={selected}
              onClick={() => setActivePromoIndex(index)}
              sx={{
                width: selected ? 18 : 7,
                height: 7,
                p: 0,
                border: 0,
                borderRadius: "999px",
                background: selected ? COLORS.teal : "rgba(255,255,255,0.28)",
                cursor: "pointer",
                transition:
                  "width 0.22s ease, background 0.22s ease, transform 0.22s ease",
                "&:hover": {
                  background: selected ? COLORS.teal : "rgba(255,255,255,0.5)",
                  transform: "translateY(-1px)",
                },
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
};

const PlanHeader = ({
  plan,
  billing,
  siteCount,
  onSiteCountChange,
}: {
  plan: Plan;
  billing: BillingCycle;
  siteCount: SiteCount;
  onSiteCountChange: (direction: -1 | 1) => void;
}) => {
  const {
    price: displayPrice,
    listPrice,
    earlyBirdSavings,
    volumeSavings,
    annualSavings,
  } = getPlanPriceBreakdown(plan.id, billing, siteCount);
  const paidPlan = !plan.free;
  const canDecrease = paidPlan && siteCount > SITE_COUNT_MIN;
  const canIncrease = paidPlan && siteCount < SITE_COUNT_MAX;
  const priceLabel = plan.free
    ? "$0"
    : `$${displayPrice.toLocaleString("en-US")}`;
  const priceFontSize =
    priceLabel.length >= 7
      ? "2.25rem"
      : priceLabel.length >= 6
        ? "2.6rem"
        : "3rem";
  const formattedListPrice = listPrice.toLocaleString("en-US");
  return (
    <Box
      sx={{
        textAlign: "center",
        minHeight: { md: 258 },
      }}
    >
      <Stack
        direction="row"
        alignItems="baseline"
        justifyContent="center"
        spacing={1}
        sx={{ minHeight: 32, flexWrap: "wrap", rowGap: 0.5 }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontFamily: `${pricingFontStack} !important`,
            fontWeight: 1000,
            fontSize: "1.5rem",
            lineHeight: 1.1,
          }}
        >
          {plan.label}
        </Typography>
        <Typography
          sx={{
            ...gradientText,
            fontSize: "0.58rem",
            letterSpacing: 0.7,
            textTransform: "uppercase",
          }}
        >
          {plan.tagline}
        </Typography>
      </Stack>

      <Typography
        sx={{
          opacity: 0.6,
          mt: 1.2,
          fontSize: "0.7rem",
          lineHeight: 1.5,
          minHeight: 38,
          maxWidth: 360,
          mx: "auto",
        }}
      >
        {plan.positioning}
      </Typography>

      <Box
        sx={{
          mt: 0.7,
          display: "grid",
          gridTemplateColumns: paidPlan ? "40px minmax(0, 1fr) 40px" : "1fr",
          alignItems: "center",
          columnGap: { xs: 1, sm: 1.5 },
          minHeight: 56,
        }}
      >
        {paidPlan && (
          <IconButton
            aria-label={`Decrease ${plan.label} website count`}
            disabled={!canDecrease}
            onClick={() => onSiteCountChange(-1)}
            sx={{
              width: 34,
              height: 34,
              justifySelf: "end",
              color: canDecrease ? COLORS.teal : "rgba(255,255,255,0.18)",
              border: `1px solid ${
                canDecrease ? COLORS.tealSoft : "rgba(255,255,255,0.08)"
              }`,
              background: "rgba(255,255,255,0.04)",
              transition:
                "color 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
              "&:hover": {
                background: canDecrease
                  ? "rgba(47,184,179,0.14)"
                  : "rgba(255,255,255,0.04)",
                transform: canDecrease ? "translateX(-3px)" : "none",
              },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
        <Box
          sx={{
            minWidth: 0,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          <Typography
            component="span"
            sx={{
              color: "#fff",
              fontSize: priceFontSize,
              fontWeight: 900,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            <Box
              component={motion.span}
              key={`${plan.id}-${billing}-${siteCount}`}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              sx={{ display: "inline-block" }}
            >
              {priceLabel}
            </Box>
          </Typography>
          <Typography
            component="span"
            sx={{
              opacity: 0.5,
              fontSize: "0.85rem",
              fontWeight: 500,
              mb: 0.4,
            }}
          >
            {plan.free
              ? "/forever"
              : `/${billing === "annual" ? "year" : "month"}`}
          </Typography>
        </Box>
        {paidPlan && (
          <IconButton
            aria-label={`Increase ${plan.label} website count`}
            disabled={!canIncrease}
            onClick={() => onSiteCountChange(1)}
            sx={{
              width: 34,
              height: 34,
              justifySelf: "start",
              color: canIncrease ? COLORS.teal : "rgba(255,255,255,0.18)",
              border: `1px solid ${
                canIncrease ? COLORS.tealSoft : "rgba(255,255,255,0.08)"
              }`,
              background: "rgba(255,255,255,0.04)",
              transition:
                "color 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
              "&:hover": {
                background: canIncrease
                  ? "rgba(47,184,179,0.14)"
                  : "rgba(255,255,255,0.04)",
                transform: canIncrease ? "translateX(2px)" : "none",
              },
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 22 }} />
          </IconButton>
        )}
      </Box>

      {paidPlan &&
      (annualSavings > 0 || earlyBirdSavings > 0 || volumeSavings > 0) ? (
        <Stack
          spacing={0.85}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 1.1, minHeight: 58 }}
        >
          <Typography
            component="span"
            sx={{
              color: "rgba(255,255,255,0.46)",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "line-through",
            }}
          >
            ${formattedListPrice}/{billing === "annual" ? "year" : "month"}
          </Typography>

          <Stack
            direction="row"
            spacing={0.8}
            justifyContent="center"
            alignItems="center"
            sx={{
              flexWrap: "nowrap",
              maxWidth: "100%",
              "& .MuiChip-root": {
                minWidth: 0,
              },
              "& .MuiChip-label": {
                px: 1.1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            }}
          >
            {earlyBirdSavings > 0 && (
              <Chip
                label={`${PRICING_DISCOUNT_DISPLAY.earlyBirdLabel} saves $${earlyBirdSavings.toLocaleString("en-US")}`}
                sx={{
                  height: 24,
                  borderRadius: "6px",
                  background: "rgba(47,184,179,0.16)",
                  border: `1px solid ${COLORS.tealSoft}`,
                  color: COLORS.teal,
                  fontSize: "0.72rem",
                  fontWeight: 900,
                  letterSpacing: 0.2,
                }}
              />
            )}
            {billing === "annual" && annualSavings > 0 && (
              <Chip
                label={`Save $${annualSavings} · 2 months free`}
                sx={{
                  height: 24,
                  borderRadius: "6px",
                  background: "rgba(47,184,179,0.16)",
                  border: `1px solid ${COLORS.tealSoft}`,
                  color: COLORS.teal,
                  fontSize: "0.72rem",
                  fontWeight: 900,
                  letterSpacing: 0.2,
                }}
              />
            )}
            {PRICING_DISCOUNT_DISPLAY.showVolumeDiscountChip &&
              volumeSavings > 0 && (
              <Chip
                label={`Volume savings $${volumeSavings}`}
                sx={{
                  height: 24,
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "0.72rem",
                  fontWeight: 900,
                  letterSpacing: 0.2,
                }}
              />
              )}
          </Stack>
        </Stack>
      ) : (
        <Box sx={{ mt: 1.1, minHeight: 58 }}>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.62)",
              fontSize: "0.82rem",
              fontWeight: 700,
              lineHeight: 1.45,
            }}
          >
            {plan.free
              ? "No credit card required"
              : `Save with ${PRICING_DISCOUNT_DISPLAY.annualFreeMonths} months free on annual billing`}
          </Typography>
        </Box>
      )}

      {paidPlan && (
        <Typography
          component={motion.p}
          key={`${plan.id}-sites-${siteCount}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          sx={{
            mt: 1.1,
            mb: 0,
            color: COLORS.teal,
            fontSize: "0.78rem",
            fontWeight: 800,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {siteCount} sites included
        </Typography>
      )}
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
  const comingSoon = !!plan.comingSoon;
  const [siteCount, setSiteCount] = React.useState<SiteCount>(SITE_COUNT_MIN);
  const displayPrice = getPlanPrice(plan.id, billing, siteCount);
  const updateSiteCount = (direction: -1 | 1) => {
    setSiteCount((current) => getNextSiteCount(current, direction));
  };

  const firstIsHeading =
    typeof plan.features[0] === "string" &&
    (plan.features[0] as string).endsWith("plus:");
  const sectionLabel = firstIsHeading
    ? (plan.features[0] as string).replace(/:$/, "")
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
          boxShadow: recommended ? "0 0 50px rgba(47,184,179,0.12)" : "none",
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
            <PlanHeader
              plan={plan}
              billing={billing}
              siteCount={siteCount}
              onSiteCountChange={updateSiteCount}
            />

            {/* Section divider label */}
            <Box
              sx={{
                mt: 2.5,
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
                          {plan.id === "pro"
                            ? `Up to ${siteCount} websites`
                            : item.label}
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
                      {plan.id === "business" &&
                      item === "Unlimited websites & directory listings*"
                        ? `${siteCount} websites & directory listings*`
                        : item}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>

            <Button
              fullWidth
              variant="outlined"
              disabled={comingSoon}
              sx={{
                mt: "auto",
                py: 1.6,
                borderRadius: "12px",
                fontWeight: 900,
                textTransform: "none",
                background: comingSoon
                  ? "rgba(255,255,255,0.08)"
                  : recommended
                    ? "white"
                    : "transparent",
                color: comingSoon
                  ? "rgba(255,255,255,0.55)"
                  : recommended
                    ? "#000"
                    : "white",
                borderColor: comingSoon
                  ? "rgba(255,255,255,0.12)"
                  : recommended
                    ? "white"
                    : "rgba(255,255,255,0.2)",
                "&.Mui-disabled": {
                  color: "rgba(255,255,255,0.55)",
                  borderColor: "rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.08)",
                },
                "&:hover": {
                  background: recommended
                    ? COLORS.brand
                    : "rgba(255,255,255,0.1)",
                  borderColor: COLORS.brand,
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

const MobileComparisonTable = ({ expanded }: { expanded: boolean }) => {
  const visibleGroups = expanded ? COMPARISON_GROUPS : COMPARISON_GROUPS.slice(0, 2);

  return (
    <Stack spacing={2.2} sx={{ display: { xs: "flex", md: "none" } }}>
      {visibleGroups.map((group) => (
        <Box key={group.category}>
          <Typography
            sx={{
              px: 2,
              py: 1.4,
              background: "rgba(255,255,255,0.025)",
              borderTop: `1px solid ${COLORS.border}`,
              borderBottom: `1px solid ${COLORS.border}`,
              fontSize: "0.68rem",
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {group.category}
          </Typography>

          <Stack>
            {group.rows.map((row) => (
              <Box
                key={row.feature}
                sx={{
                  px: 2,
                  py: 1.8,
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <Typography
                  sx={{
                    mb: 1.35,
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    lineHeight: 1.3,
                  }}
                >
                  {row.feature}
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 0.8,
                  }}
                >
                  {(["free", "pro", "business"] as const).map((planId) => {
                    const plan = PLANS.find((item) => item.id === planId);
                    const recommended = planId === "pro";

                    return (
                      <Box
                        key={planId}
                        sx={{
                          minWidth: 0,
                          p: 1,
                          borderRadius: "10px",
                          textAlign: "center",
                          background: recommended
                            ? "rgba(47,184,179,0.1)"
                            : "rgba(255,255,255,0.035)",
                          border: recommended
                            ? `1px solid ${COLORS.tealSoft}`
                            : `1px solid ${COLORS.border}`,
                        }}
                      >
                        <Typography
                          sx={{
                            mb: 0.7,
                            color: recommended ? COLORS.teal : "rgba(255,255,255,0.58)",
                            fontSize: "0.62rem",
                            fontWeight: 900,
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                          }}
                        >
                          {plan?.label}
                        </Typography>
                        <CompareCell value={row[planId]} highlight={recommended} />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

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
            <MobileComparisonTable expanded={expanded} />
            <Box
              sx={{
                display: { xs: "none", md: "block" },
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
                            "&:hover td": {
                              background: "rgba(255,255,255,0.03)",
                            },
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
                                <CompareCell
                                  value={row[col]}
                                  highlight={recommended}
                                />
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
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 1, lg: 6 } }}>
        <Box textAlign="center" mb={{ xs: 5, md: 9 }}>
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
                fontSize: { xs: "25px", sm: "30px", md: "42px", lg: "55px" },
                marginTop: { xs: "18px", md: "50px", lg: "90px" },
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                columnGap: { xs: "6px", sm: "8px", md: "10px" },
                rowGap: { xs: "8px", sm: "10px", md: "10px" },
                lineHeight: { xs: 1.08, md: 0.95 },
                justifyContent: "center",
                fontFamily: `${pricingFontStack} !important`,
                "& *": {
                  fontFamily: `${pricingFontStack} !important`,
                },
              }}
            >
              Plans that grow with you.
              <Box component="span" sx={{ width: "100%" }} />
              Start with a{" "}
              <Box component="span" sx={gradientText}>
                FREE
              </Box>
              <HeroAvatarCluster />{" "}
              landing page.
            </Typography>
          </Box>

          {/* <Typography
            variant="h6"
            maxWidth="800px"
            mx="auto"
            sx={{ color: "white", marginTop: "30px" }}
          >
            Build for free, upgrade when your website grows.
          </Typography> */}
        </Box>
      </Container>

      <Box sx={{ pb: { xs: 6, md: 10 }, pt: 0, color: "white" }}>
        <Container maxWidth="lg">
          <PromoBannerLoop />
          <BillingToggle value={billing} onChange={setBilling} />

          <Grid
            container
            spacing={{ xs: 3, md: 4 }}
            alignItems="stretch"
            justifyContent="center"
          >
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
