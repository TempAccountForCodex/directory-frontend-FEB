import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Collapse,
  Grid,
  Button,
  Stack,
  Paper,
  Avatar,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";

const uniqueLinesbg = "/assets/publicAssets/images/common/uniqueLinesbg.webp";

export type FAQItem = {
  question: string;
  answer: string;
};

type FAQSectionProps = {
  title?: string;
  items: FAQItem[];
  defaultOpenIndex?: number | null;
};

const FAQSection: React.FC<FAQSectionProps> = ({
  title = "Frequently Asked Questions",
  items,
}) => {
  const theme = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Theme Colors
  const primaryMain = theme.palette.primary.focus; // #378C92
  const darkBg = theme.palette.primary.dark; // #141414
  const textColor = theme.palette.text.black;
  const subTextColor = theme.palette.text.gray;

  return (
    <Box
      sx={{
        height: "auto",
        py: 15,
        width: "100%",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        background: theme.palette.background.default || "#ffffff",
        backgroundImage: `url(${uniqueLinesbg})`,
      }}
    >
      {/* Floating geometric shapes */}
      <Box
        sx={{
          position: "absolute",
          top: "15%",
          left: "8%",
          width: "120px",
          height: "120px",
          border: `2px solid ${alpha(primaryMain!, 0.1)}`,
          borderRadius: "20px",
          transform: "rotate(15deg)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: "20%",
          right: "12%",
          width: "80px",
          height: "80px",
          background: `linear-gradient(135deg, ${alpha(primaryMain!, 0.05)} 0%, ${alpha(primaryMain!, 0.02)} 100%)`,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ height: "auto", py: 3 }}>
        <Grid
          container
          spacing={4}
          sx={{ position: "relative", zIndex: 1, height: "100%" }}
        >
          {/* LEFT SIDE */}
          <Grid
            item
            xs={12}
            md={4.5}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box>
              {/* Icon Badge */}
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  background: `linear-gradient(135deg, ${primaryMain} 0%, ${darkBg} 100%)`,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                  position: "relative",
                  boxShadow: `0 8px 24px ${alpha(primaryMain!, 0.25)}`,
                }}
              >
                <HelpOutlineRoundedIcon sx={{ fontSize: 24, color: "#fff" }} />
              </Box>

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1.5 }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    bgcolor: primaryMain,
                    borderRadius: "50%",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: primaryMain,
                    letterSpacing: 2,
                    fontSize: "0.65rem",
                  }}
                >
                  KNOWLEDGE BASE
                </Typography>
              </Stack>

              <Typography
                variant="h3"
                sx={{
                  color: textColor,
                  fontWeight: 800,
                  fontSize: "2.75rem",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  mb: 1.5,
                }}
              >
                {title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: subTextColor,
                  lineHeight: 1.6,
                  fontSize: "0.875rem",
                  mb: 2.5,
                }}
              >
                Search through our most common inquiries. Designed to help you
                build faster.
              </Typography>

              {/* Action Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: "16px",
                  background: alpha(
                    theme.palette.background.paper || "#fff",
                    0.7,
                  ),
                  backdropFilter: "blur(10px)",
                  border: "1px solid",
                  borderColor: alpha(subTextColor!, 0.2),
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 12px 28px ${alpha(primaryMain!, 0.12)}`,
                    borderColor: primaryMain,
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="flex-start"
                  sx={{ mb: 2 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: alpha(primaryMain!, 0.1),
                      color: primaryMain,
                      width: 36,
                      height: 36,
                    }}
                  >
                    <SupportAgentRoundedIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        mb: 0.3,
                        color: textColor,
                        fontSize: "1rem",
                      }}
                    >
                      Didn't find what you're looking for?{" "}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: subTextColor,
                        lineHeight: 1.4,
                        fontSize: "0.75rem",
                      }}
                    >
                      Expert developers available
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  fullWidth
                  disableElevation
                  endIcon={
                    <ArrowForwardIosRoundedIcon
                      sx={{ fontSize: "10px !important" }}
                    />
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${primaryMain} 0%, ${darkBg} 100%)`,
                    borderRadius: "28px",
                    textTransform: "none",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    py: 1.2,
                    color: "#fff",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: `0 6px 16px ${alpha(primaryMain!, 0.4)}`,
                    },
                  }}
                >
                  Contact Us Today
                </Button>
              </Paper>
            </Box>
          </Grid>

          {/* RIGHT SIDE */}
          <Grid item xs={12} md={7.5}>
            <Box
              sx={{
                height: "100%",
                overflowY: "auto",
                pr: 1,
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-thumb": {
                  background: alpha(subTextColor!, 0.2),
                  borderRadius: "10px",
                  "&:hover": { background: alpha(subTextColor!, 0.4) },
                },
              }}
            >
              <Stack spacing={2}>
                {items.map((item, index) => {
                  const isOpen = openIndex === index;
                  const isHovered = hoveredIndex === index;

                  return (
                    <Paper
                      key={index}
                      elevation={0}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      sx={{
                        cursor: "pointer",
                        borderRadius: "14px",
                        bgcolor: alpha(theme.palette.bg.gray || "#eee", 0.8),
                        backdropFilter: "blur(10px)",
                        border: "1px solid",
                        borderColor: isOpen
                          ? primaryMain
                          : alpha(subTextColor!, 0.1),
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: isOpen
                          ? `0 12px 32px ${alpha(primaryMain!, 0.15)}`
                          : isHovered
                            ? "0 4px 12px rgba(0, 0, 0, 0.06)"
                            : "0 2px 6px rgba(0, 0, 0, 0.03)",
                        transform: isOpen ? "translateX(4px)" : "none",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: isOpen ? "4px" : "0px",
                          background: `linear-gradient(135deg, ${primaryMain} 0%, ${darkBg} 100%)`,
                          transition: "width 0.3s ease",
                        },
                      }}
                    >
                      <Box sx={{ p: 2.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                          }}
                        >
                          {/* Number Badge */}
                          <Box
                            sx={{
                              minWidth: 32,
                              height: 32,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "8px",
                              background: isOpen
                                ? alpha(primaryMain!, 0.12)
                                : alpha(subTextColor!, 0.05),
                              border: isOpen
                                ? `1px solid ${alpha(primaryMain!, 0.15)}`
                                : "1px solid transparent",
                              transition: "all 0.3s ease",
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: isOpen
                                  ? primaryMain
                                  : alpha(subTextColor!, 0.6),
                              }}
                            >
                              {String(index + 1).padStart(2, "0")}
                            </Typography>
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 1.5,
                                mb: isOpen ? 2 : 0,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: textColor,
                                  fontSize: "1.2rem",
                                  letterSpacing: "-0.01em",
                                  lineHeight: 1.4,
                                  flex: 1,
                                }}
                              >
                                {item.question}
                              </Typography>

                              {/* Icon Button */}
                              <Box
                                sx={{
                                  minWidth: 28,
                                  height: 28,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "8px",
                                  background: isOpen
                                    ? `linear-gradient(135deg, ${primaryMain} 0%, ${darkBg} 100%)`
                                    : alpha(subTextColor!, 0.05),
                                  transition: "all 0.3s ease",
                                }}
                              >
                                {isOpen ? (
                                  <RemoveRoundedIcon
                                    sx={{ fontSize: 16, color: "#fff" }}
                                  />
                                ) : (
                                  <AddRoundedIcon
                                    sx={{
                                      fontSize: 16,
                                      color: alpha(subTextColor!, 0.6),
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>

                            <Collapse in={isOpen}>
                              <Box
                                sx={{
                                  pt: 2,
                                  borderTop: `1px solid ${alpha(subTextColor!, 0.1)}`,
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: alpha(textColor!, 0.8),
                                    lineHeight: 1.6,
                                    fontSize: "0.8rem",
                                    pl: 2,
                                    borderLeft: `2px solid ${primaryMain}`,
                                  }}
                                >
                                  {item.answer}
                                </Typography>
                              </Box>
                            </Collapse>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default FAQSection;
