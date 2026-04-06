import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

/* Feature Icons */
import LinkIcon from "@mui/icons-material/Link";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BoltIcon from "@mui/icons-material/Bolt";
import SearchIcon from "@mui/icons-material/Search";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import ViewListIcon from "@mui/icons-material/ViewList";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

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
  animation: "shimmer 3s ease-in-out infinite",
  backgroundSize: "200% 200%",
};
const avatarStyle = {
  width: 44,
  height: 44,
  borderRadius: "12px",
  border: "3px solid #FFFFFF",
  objectFit: "cover",
  backgroundColor: "#fff",
};

const avatarWrapper = {
  display: "flex",
  alignItems: "center",
  marginLeft: "-10px",
};

const COLORS = {
  bg: "#020303",
  card: "#071c1e",
  cardDark: "#050f11",
  teal: "#2fb8b3",
  tealSoft: "rgba(47,184,179,0.25)",
  border: "rgba(255,255,255,0.08)",
};

const BASE_FEATURES = [
  "Custom Domain URLs",
  "Premium Templates",
  "Business Listing",
  "Slideshows",
  "SEO Structure",
  "Forms",
];
const STANDARD_EXTRAS = ["Priority Support", "Verified Badge"];
const PLUS_EXTRAS = ["AI Copywriter", "AI Image Gen"];

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  "Custom Domain URLs": <LinkIcon />,
  "Premium Templates": <ViewListIcon />,
  "Business Listing": <ViewListIcon />,
  Slideshows: <SlideshowIcon />,
  "SEO Structure": <SearchIcon />,
  Forms: <ViewListIcon />,
  "Priority Support": <SupportAgentIcon />,
  "Verified Badge": <VerifiedUserIcon />,
  "AI Copywriter": <AutoAwesomeIcon />,
  "AI Image Gen": <AutoAwesomeIcon />,
};

type BillingCycle = "annual" | "monthly";
type Plan = { label: string; price: number; sites: number };

const pricingConfig = {
  lite: [
    { label: "Pro Lite", price: 9, sites: 3 },
    { label: "Pro Lite 10", price: 19, sites: 10 },
    { label: "Pro Lite 25", price: 49, sites: 25 },
  ],
  standard: [
    { label: "Pro Standard", price: 19, sites: 25 },
    { label: "Pro Standard 50", price: 29, sites: 50 },
    { label: "Pro Standard 100", price: 49, sites: 100 },
    { label: "Pro Standard 150", price: 69, sites: 150 },
    { label: "Pro Standard 250", price: 99, sites: 250 },
  ],
  plus: [
    { label: "Pro Plus", price: 49, sites: 50 },
    { label: "Pro Plus 100", price: 79, sites: 100 },
    { label: "Pro Plus 150", price: 109, sites: 150 },
    { label: "Pro Plus 200", price: 149, sites: 200 },
  ],
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
}) => (
  <Box sx={{ textAlign: "center", mb: 10 }}>
    <Box
      sx={{
        display: "inline-flex",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "999px",
        p: 0.5,
      }}
    >
      {(["annual", "monthly"] as BillingCycle[]).map((type) => (
        <Button
          key={type}
          onClick={() => onChange(type)}
          sx={{
            px: 4,
            py: 1.3,
            borderRadius: "999px",
            fontWeight: 700,
            textTransform: "none",
            background: value === type ? "white" : "transparent",
            color: value === type ? "#000" : "rgba(255,255,255,0.7)",
            "&:hover": {
              background: value === type ? "white" : "rgba(255,255,255,0.08)",
            },
          }}
        >
          {type === "annual" ? "Pay annually" : "Pay monthly"}
        </Button>
      ))}
    </Box>
  </Box>
);

const PlanHeader = ({ plan, index, max, onPrev, onNext, billing }: any) => {
  const displayPrice =
    billing === "annual" ? plan.price : Math.round(plan.price / 12);
  return (
    <Box sx={{ textAlign: "center", mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          onClick={onPrev}
          disabled={index === 0}
          aria-label={`Previous ${plan.label} plan`}
          title={`Previous ${plan.label} plan`}
          sx={{ color: "white", minWidth: 40 }}
        >
          <ChevronLeftIcon />
        </Button>
        <Typography sx={{ fontWeight: 800 }}>{plan.label}</Typography>
        <Button
          onClick={onNext}
          disabled={index === max - 1}
          aria-label={`Next ${plan.label} plan`}
          title={`Next ${plan.label} plan`}
          sx={{ color: "white", minWidth: 40 }}
        >
          <ChevronRightIcon />
        </Button>
      </Box>
      <Typography sx={{ fontSize: "2.2rem", fontWeight: 900, mt: 1 }}>
        ${displayPrice}
        <Box component="span" sx={{ opacity: 0.5, fontSize: "0.9rem" }}>
          {" "}
          /{billing === "annual" ? "year" : "month"}
        </Box>
      </Typography>
      <Typography sx={{ opacity: 0.78, mt: 0.5 }}>
        {plan.sites} Sites
      </Typography>
    </Box>
  );
};

/* ============================
   Main Pricing Card
============================ */
const PricingCard = ({
  plan,
  index,
  max,
  onPrev,
  onNext,
  billing,
  tier,
  recommended,
}: any) => {
  const features =
    tier === "lite"
      ? BASE_FEATURES
      : tier === "standard"
        ? [...BASE_FEATURES, ...STANDARD_EXTRAS]
        : [...BASE_FEATURES, ...STANDARD_EXTRAS, ...PLUS_EXTRAS];
  const displayPrice =
    billing === "annual" ? plan.price : Math.round(plan.price / 12);

  return (
    <Grid item xs={12} sm={6} md={4} sx={{ display: "flex" }}>
      <Box
        sx={{
          flexGrow: 1,
          position: "relative",
          mt: recommended ? 0 : 4,
          background: recommended ? COLORS.card : "#03181a",
          borderRadius: "24px",
          border: recommended
            ? `1px solid ${COLORS.tealSoft}`
            : `1px solid ${COLORS.border}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* RECOMMENDED CHIP */}
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

        {/* INTERNAL CONTENT WRAPPER */}
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
            ${displayPrice}
          </Typography>

          {/* CONTENT LAYERS */}
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
              index={index}
              max={max}
              onPrev={onPrev}
              onNext={onNext}
              billing={billing}
            />

            <Stack spacing={1.6} sx={{ my: 4 }}>
              {features.map((item) => (
                <React.Fragment key={item}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                      marginTop: "5.8px !important",
                    }}
                  >
                    <Box sx={{ "& svg": { fontSize: 18 } }}>
                      {FEATURE_ICONS[item] ?? <BoltIcon />}
                    </Box>
                    <Typography sx={{ fontSize: "0.95rem", opacity: 0.9 }}>
                      {item}
                    </Typography>
                  </Stack>
                  {/* <Divider
                    sx={{
                      borderColor: COLORS.border,
                      marginTop: "5.8px !important",
                    }}
                  /> */}
                </React.Fragment>
              ))}
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
              Get Started
            </Button>
          </Box>
        </Box>
      </Box>
    </Grid>
  );
};

/* ============================
   Main Section
============================ */
const PricingSection: React.FC = () => {
  const [billing, setBilling] = React.useState<BillingCycle>("annual");
  const [indices, setIndices] = React.useState({
    lite: 0,
    standard: 0,
    plus: 0,
  });

  const updateIdx = (tier: string, delta: number) => {
    setIndices((prev) => ({
      ...prev,
      [tier]: Math.max(
        0,
        Math.min(
          (pricingConfig as any)[tier].length - 1,
          (prev as any)[tier] + delta,
        ),
      ),
    }));
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: "#041e18",
          backgroundImage: `url(${star})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box>
          <Container maxWidth="lg" sx={{ pt: 6, pb: { xs: 2, lg: 6 } }}>
            {/* Header */}

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
                    fontSize: {
                      xs: "25px",
                      sm: "35px",
                      md: "45px",
                      lg: "55px",
                    },
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
                  {/* Avatars */}
                  <Box sx={{ display: "flex", alignItems: "center", ml: 0 }}>
                    <Box sx={{ ...avatarWrapper, marginLeft: 0 }}>
                      <Box
                        component="img"
                        src="https://img.freepik.com/free-photo/portrait-pretty-girl-with-bun-denim-jacket-white-t-shirt-with-gentle-smile-pink_176532-13857.jpg?t=st=1767881978~exp=1767885578~hmac=92b5bc141cfed93ec4655f092cc42c81dfc337287c34e1163a5a71529be0ba07&w=2000"
                        alt="user"
                        sx={{
                          ...avatarStyle,
                          transform: "rotate(352deg)",
                          zIndex: 10,
                        }}
                      />
                    </Box>

                    <Box sx={avatarWrapper}>
                      <Box
                        component="img"
                        src="https://img.freepik.com/free-photo/confident-young-brunette-caucasian-girl-looks-camera-isolated-green-background-with-copy-space_141793-67067.jpg?t=st=1767882034~exp=1767885634~hmac=ffb030c651276a576d561203a6213dca6ac21dd0a099cdc97064088a764f647a&w=2000"
                        alt="user"
                        sx={{
                          ...avatarStyle,
                          zIndex: 9,
                          marginTop: "-10px",
                        }}
                      />
                    </Box>

                    <Box sx={avatarWrapper}>
                      <Box
                        component="img"
                        src="https://img.freepik.com/free-photo/medium-shot-man-sticking-out-tongue_23-2150171206.jpg?uid=R205766258&ga=GA1.1.355267885.1764683677&semt=ais_hybrid&w=740&q=80"
                        alt="user"
                        sx={{
                          ...avatarStyle,
                          transform: "rotate(12deg)",
                          zIndex: 1,
                        }}
                      />
                    </Box>
                  </Box>
                  landing page.
                </Typography>
              </Box>

              <Typography
                variant="h6"
                maxWidth="800px"
                mx="auto"
                sx={{ color: "white", marginTop: "30px" }}
              >
                Build for free, upgrade when your website grows.
              </Typography>
            </Box>
          </Container>
        </Box>

        <Box
          sx={{
            pb: 10,
            pt: 0,
            color: "white",
            minHeight: "100vh",
          }}
        >
          <Container maxWidth="lg">
            <BillingToggle value={billing} onChange={setBilling} />

            {/* Grid Container Fixed for Alignment */}
            <Grid container spacing={4} alignItems="stretch">
              <PricingCard
                tier="lite"
                plan={pricingConfig.lite[indices.lite]}
                index={indices.lite}
                max={pricingConfig.lite.length}
                onPrev={() => updateIdx("lite", -1)}
                onNext={() => updateIdx("lite", 1)}
                billing={billing}
              />
              <PricingCard
                recommended
                tier="standard"
                plan={pricingConfig.standard[indices.standard]}
                index={indices.standard}
                max={pricingConfig.standard.length}
                onPrev={() => updateIdx("standard", -1)}
                onNext={() => updateIdx("standard", 1)}
                billing={billing}
              />
              <PricingCard
                tier="plus"
                plan={pricingConfig.plus[indices.plus]}
                index={indices.plus}
                max={pricingConfig.plus.length}
                onPrev={() => updateIdx("plus", -1)}
                onNext={() => updateIdx("plus", 1)}
                billing={billing}
              />
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default PricingSection;
