import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress, Typography, keyframes } from "@mui/material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

// Advanced animations
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const rotateGlow = keyframes`
  0% {
    transform: rotate(0deg);
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
  100% {
    transform: rotate(360deg);
    filter: brightness(1);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(61, 138, 149, 0.5),
                0 0 40px rgba(61, 138, 149, 0.3),
                0 0 60px rgba(61, 138, 149, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(61, 138, 149, 0.8),
                0 0 60px rgba(61, 138, 149, 0.5),
                0 0 90px rgba(61, 138, 149, 0.3);
  }
`;

const textGlow = keyframes`
  0%, 100% {
    text-shadow: 0 0 10px rgba(61, 138, 149, 0.5),
                 0 0 20px rgba(61, 138, 149, 0.3),
                 0 0 30px rgba(61, 138, 149, 0.2);
  }
  50% {
    text-shadow: 0 0 20px rgba(61, 138, 149, 0.8),
                 0 0 30px rgba(61, 138, 149, 0.6),
                 0 0 40px rgba(61, 138, 149, 0.4);
  }
`;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  // Show enhanced loading state while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0b0f10 0%, #1a2332 50%, #0b0f10 100%)",
          backgroundSize: "200% 200%",
          position: "relative",
          overflow: "hidden",
          animation: `${fadeIn} 0.5s ease-out`,

          // Animated background gradient
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(61, 138, 149, 0.1) 0%, transparent 50%)",
            animation: `${pulse} 3s ease-in-out infinite`,
          },

          // Particle effect
          "&::after": {
            content: '""',
            position: "absolute",
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            background:
              "radial-gradient(circle, rgba(61, 138, 149, 0.03) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            animation: `${rotateGlow} 20s linear infinite`,
          },
        }}
      >
        {/* Floating security icons in background */}
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            left: "15%",
            opacity: 0.1,
            animation: `${float} 6s ease-in-out infinite`,
          }}
        >
          <SecurityIcon sx={{ fontSize: 60, color: "#3d8a95" }} />
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: "70%",
            right: "20%",
            opacity: 0.1,
            animation: `${float} 8s ease-in-out infinite`,
            animationDelay: "1s",
          }}
        >
          <VerifiedUserIcon sx={{ fontSize: 50, color: "#3d8a95" }} />
        </Box>

        {/* Main content */}
        <Box sx={{ position: "relative", zIndex: 1 }}>
          {/* Glowing circle container */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
            }}
          >
            {/* Outer glow ring */}
            <Box
              sx={{
                position: "absolute",
                width: 120,
                height: 120,
                borderRadius: "50%",
                animation: `${glow} 2s ease-in-out infinite`,
              }}
            />

            {/* Secondary spinner ring */}
            <CircularProgress
              size={100}
              thickness={1}
              sx={{
                position: "absolute",
                color: "rgba(61, 138, 149, 0.3)",
                animation: `${rotateGlow} 3s linear infinite reverse`,
              }}
            />

            {/* Main spinner */}
            <CircularProgress
              size={80}
              thickness={2.5}
              sx={{
                color: "#3d8a95",
                filter: "drop-shadow(0 0 10px rgba(61, 138, 149, 0.7))",
                "& .MuiCircularProgress-circle": {
                  strokeLinecap: "round",
                },
              }}
            />

            {/* Center icon with pulse */}
            <Box
              sx={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: `${pulse} 2s ease-in-out infinite`,
                background: "rgba(61, 138, 149, 0.1)",
                borderRadius: "50%",
                padding: 2,
              }}
            >
              <LockOpenIcon
                sx={{
                  fontSize: 36,
                  color: "#3d8a95",
                  filter: "drop-shadow(0 0 5px rgba(61, 138, 149, 0.8))",
                }}
              />
            </Box>
          </Box>

          {/* Animated title with shimmer effect */}
          <Typography
            variant="h5"
            sx={{
              color: "#ffffff",
              fontWeight: 600,
              letterSpacing: "1px",
              mb: 2,
              textAlign: "center",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.7) 0%, rgba(61,138,149,1) 50%, rgba(255,255,255,0.7) 100%)",
              backgroundSize: "200% auto",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: `${shimmer} 3s linear infinite, ${textGlow} 2s ease-in-out infinite`,
            }}
          >
            Verifying Authentication
          </Typography>

          {/* Subtitle with fade in */}
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "15px",
              textAlign: "center",
              maxWidth: "300px",
              lineHeight: 1.6,
              animation: `${fadeIn} 0.8s ease-out 0.3s both`,
            }}
          >
            Securing your session with end-to-end encryption
          </Typography>

          {/* Loading dots */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              mt: 3,
              animation: `${fadeIn} 1s ease-out 0.5s both`,
            }}
          >
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#3d8a95",
                  animation: `${pulse} 1.4s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                  boxShadow: "0 0 10px rgba(61, 138, 149, 0.5)",
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  // Redirect to auth page if not logged in
  return user ? children : <Navigate to="/auth" />;
};

export default ProtectedRoute;
