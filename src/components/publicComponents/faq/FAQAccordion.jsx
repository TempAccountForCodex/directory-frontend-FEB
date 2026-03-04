import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  SvgIcon,
} from "@mui/material";
import QuestionMarkIcon from "@mui/icons-material/HelpOutline";
import ChatIcon from "@mui/icons-material/ChatBubbleOutline";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import SchoolIcon from "@mui/icons-material/School";
import SecurityIcon from "@mui/icons-material/Security";
import faqData from "../../utils/data/FAQs.js";

const iconMap = [
  QuestionMarkIcon,
  ChatIcon,
  InfoIcon,
  SchoolIcon,
  SecurityIcon,
];

const FAQCardLayout = () => {
  const theme = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <Grid container spacing={4} sx={{ position: "relative" }}>
      {faqData.map((faq, index) => {
        const IconComponent = iconMap[index % iconMap.length];
        const isHovered = index === hoveredIndex;

        return (
          <Grid item xs={12} md={6} key={index}>
            <Card
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              elevation={isHovered ? 10 : 3}
              sx={{
                position: "relative",
                minHeight: "200px",
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
                p: { xs: 2.5, sm: 3 },
                bgcolor: "#fff",
                // transition: "all 0.2s ease-in-out",
                cursor: "pointer",
                zIndex: isHovered ? 10 : 1,
              }}
            >
              <CardContent sx={{ p: 0, flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2} gap={2}>
                  <SvgIcon
                    component={IconComponent}
                    sx={{
                      fontSize: "2rem",
                      color: "#378C92",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    {faq.question}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    overflow: "hidden",
                    transition: "max-height 0.2s ease-in-out",
                    maxHeight: isHovered ? "200px" : "73px",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: "0.95rem",
                      lineHeight: 1.75,
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default FAQCardLayout;
