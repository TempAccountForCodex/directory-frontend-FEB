import React from "react";
import { Box, Container, Typography, Paper, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PublicIcon from "@mui/icons-material/Public";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTheme, alpha } from "@mui/material/styles";
import { PrimaryActionButton } from "../../../components/UI/PrimaryActionButton";
import { motion } from "framer-motion";

const star = "/assets/publicAssets/images/common/star.svg";
const darkhole = "assets/publicAssets/images/common/darkhole.svg";

const StepIllustration = ({
  stepIndex,
  color,
}: {
  stepIndex: number;
  color: string;
}) => {
  const bg = alpha(color, 0.08);
  const elementBg = alpha(color, 0.15);

  return (
    <Box
      sx={{
        width: "100%",
        height: 140,
        background: bg,
        borderRadius: "12px",
        mb: 3,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${alpha(color, 0.05)}`,
      }}
    >
      {stepIndex === 0 && (
        <Stack
          component={motion.div}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          spacing={1}
          width="60%"
          alignItems="center"
        >
          <Box
            width={40}
            height={40}
            borderRadius="50%"
            bgcolor={elementBg}
            mb={1}
          />
          <Box width="100%" height={8} borderRadius={4} bgcolor={elementBg} />
          <Box width="100%" height={8} borderRadius={4} bgcolor={elementBg} />
          <Box
            width="40%"
            height={20}
            borderRadius={4}
            bgcolor={color}
            mt={1}
            sx={{ opacity: 0.8 }}
          />
        </Stack>
      )}

      {stepIndex === 1 && (
        <Stack
          component={motion.div}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          spacing={1.5}
          width="70%"
          sx={{ opacity: 0.8 }}
        >
          <Box display="flex" gap={1}>
            <Box width={20} height={20} borderRadius={1} bgcolor={elementBg} />
            <Box width="80%" height={20} borderRadius={1} bgcolor={elementBg} />
          </Box>
          <Box display="flex" gap={1}>
            <Box width={20} height={20} borderRadius={1} bgcolor={elementBg} />
            <Box width="60%" height={20} borderRadius={1} bgcolor={elementBg} />
          </Box>
          <Box display="flex" gap={1}>
            <Box width={20} height={20} borderRadius={1} bgcolor={elementBg} />
            <Box width="70%" height={20} borderRadius={1} bgcolor={elementBg} />
          </Box>
        </Stack>
      )}

      {stepIndex === 2 && (
        <Box
          component={motion.div}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          width="80%"
          height="80%"
          bgcolor="#fff"
          borderRadius={2}
          boxShadow="0 4px 12px rgba(0,0,0,0.05)"
          p={1}
        >
          <Box
            width="100%"
            height={30}
            bgcolor={alpha(color, 0.2)}
            borderRadius={1}
            mb={1}
          />
          <Box display="flex" gap={1}>
            <Box
              flex={1}
              height={40}
              bgcolor={alpha(color, 0.1)}
              borderRadius={1}
            />
            <Box
              flex={1}
              height={40}
              bgcolor={alpha(color, 0.1)}
              borderRadius={1}
            />
          </Box>
        </Box>
      )}

      {stepIndex === 3 && (
        <Box position="relative" width="100%" height="100%">
          <Box
            component={motion.div}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 120,
              height: 120,
              borderRadius: "50%",
              border: `1px dashed ${alpha(color, 0.3)}`,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: color,
              boxShadow: `0 0 0 8px ${alpha(color, 0.1)}`,
            }}
          />
          <Box
            position="absolute"
            top="20%"
            right="20%"
            width={20}
            height={20}
            borderRadius="50%"
            bgcolor={elementBg}
          />
          <Box
            position="absolute"
            bottom="30%"
            left="20%"
            width={10}
            height={10}
            borderRadius="50%"
            bgcolor={elementBg}
          />
        </Box>
      )}
    </Box>
  );
};

const steps = [
  {
    title: "Create Account",
    description: "Sign up in seconds. No credit card required.",
    icon: PersonAddAltIcon,
  },
  {
    title: "Add Details",
    description: "Input your services, hours, and images easily.",
    icon: EditNoteIcon,
  },
  {
    title: "AI Generation",
    description: "Our engine builds a pro landing page instantly.",
    icon: AutoAwesomeIcon,
  },
  {
    title: "Get Discovered",
    description: "Auto-listed in our directory for maximum SEO.",
    icon: PublicIcon,
  },
];

const HowItWorks: React.FC = () => {
  const theme = useTheme();
  const primaryColor = theme.palette.text.main || "#008080";

  return (
    <Box
      sx={{
        minHeight: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#041e18",
        py: { xs: 8, md: 12 },
        position: "relative",
        backgroundImage: `url(${star})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          height: "auto",
          zIndex: 0,
          backgroundImage: `url(${darkhole})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          aspectRatio: "2074 / 1333",
          top: "12%",
          left: "-70%",
          width: { xs: "auto", md: "280%" },
          "@media (min-width: 640px)": {
            top: "-4%",
            width: "100%",
            left: "-15%",
          },
        }}
      />
      <Container maxWidth="lg" sx={{ zIndex: 1 }}>
        <Stack
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          spacing={3}
          alignItems="center"
          textAlign="center"
          mb={10}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2.2rem", md: "3rem" },
              lineHeight: 1.1,
              color: theme.palette.text.secondary,
            }}
          >
            From Zero to Online.
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: 550,
              fontWeight: 400,
              fontSize: "1.1rem",
            }}
          >
            Stop wrestling with website builders. We automated the entire
            pipeline so you can focus on business.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Grid
                item
                key={index}
                xs={12}
                sm={6}
                md={3}
                component={motion.div}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    p: 2,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "rgba(0,0,0,0.06)",
                    background: "#fff",
                    transition: "all 0.3s ease",
                    position: "relative",
                    "&:hover": {
                      borderColor: alpha(primaryColor, 0.5),
                      transform: "translateY(-8px)",
                      boxShadow: `0 20px 40px ${alpha(primaryColor, 0.08)}`,
                      "& .icon-box": {
                        transform: "scale(1.1) rotate(5deg)",
                        background: primaryColor,
                        color: "#fff",
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -12,
                      left: 24,
                      bgcolor: theme.palette.text.primary,
                      color: "#fff",
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      border: "4px solid #fafafa",
                      zIndex: 2,
                    }}
                  >
                    {index + 1}
                  </Box>

                  <StepIllustration stepIndex={index} color={primaryColor} />

                  <Stack spacing={1} px={1} pb={1}>
                    <Box
                      className="icon-box"
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: alpha(primaryColor, 0.1),
                        color: primaryColor,
                        transition: "all 0.3s ease",
                        mb: 1,
                      }}
                    >
                      <Icon fontSize="small" />
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, fontSize: "1.1rem" }}
                    >
                      {step.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.gray,
                        lineHeight: 1.6,
                        fontWeight: 500,
                      }}
                    >
                      {step.description}
                    </Typography>
                  </Stack>
                </Paper>

                <Box
                  sx={{
                    display: { xs: "flex", md: "none" },
                    justifyContent: "center",
                    py: 2,
                    opacity: 0.3,
                  }}
                >
                  {index < steps.length - 1 && (
                    <ArrowForwardIcon sx={{ transform: "rotate(90deg)" }} />
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>

        <Stack
          component={motion.div}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          alignItems="center"
          spacing={1.5}
          sx={{ mt: 10 }}
        >
          <PrimaryActionButton size="large" to="/signup">
            Create Your Free Page
          </PrimaryActionButton>

          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.8rem",
            }}
          >
            No credit card required • Easy sign up
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default HowItWorks;
