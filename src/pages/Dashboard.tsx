import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme as useCustomTheme } from "../context/ThemeContext";
import { getDashboardColors } from "../styles/dashboardTheme";
import DashboardLayout from "../components/Dashboard/Dashboard";
import { Box, Typography } from "@mui/material";
import dashboardStars from "../assets/common/star.svg";
import dashboardDarkHole from "../assets/common/darkhole.svg";
import brandIcon from "../assets/images/navbar/collapsedLogo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  useEffect(() => {
    // Only redirect after loading is complete and user is not authenticated
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Show loading screen while checking authentication
  // Always use dark stars background so light mode bg.jpeg never flashes
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#090A0B",
          backgroundImage: `url(${dashboardStars})`,
          backgroundSize: "1440px 819px",
          backgroundPosition: "top center",
          backgroundRepeat: "repeat",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${dashboardDarkHole})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center",
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(55, 140, 146, 0.15) 0%, transparent 70%)",
            animation: "ambientPulse 3s ease-in-out infinite",
            "@keyframes ambientPulse": {
              "0%, 100%": { transform: "scale(1)", opacity: 0.6 },
              "50%": { transform: "scale(1.3)", opacity: 1 },
            },
          }}
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Box
            component="img"
            src={brandIcon}
            alt=""
            sx={{
              width: 80,
              height: 80,
              borderRadius: "18px",
              animation: "logoBreath 2.5s ease-in-out infinite",
              "@keyframes logoBreath": {
                "0%, 100%": { opacity: 0.8, transform: "scale(1)" },
                "50%": { opacity: 1, transform: "scale(1.08)" },
              },
            }}
          />
          <Box
            sx={{
              width: 120,
              height: 3,
              borderRadius: 2,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: "40%",
                borderRadius: 2,
                background:
                  "linear-gradient(90deg, transparent, #378C92, transparent)",
                animation: "shimmer 1.5s ease-in-out infinite",
                "@keyframes shimmer": {
                  "0%": { transform: "translateX(-100%)" },
                  "100%": { transform: "translateX(350%)" },
                },
              }}
            />
          </Box>
          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "0.75rem",
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Loading
          </Typography>
        </Box>
      </Box>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return <DashboardLayout user={user} />;
};

export default Dashboard;
