import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import faqData from "../../../utils/data/FAQs.js";

const FAQAccordion = () => {
  const [expanded, setExpanded] = useState("faq-panel-0");

  const handleChange = (panel) => (_event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ display: "grid", gap: 1.4 }}>
      {faqData.map((faq, index) => {
        const panelId = `faq-panel-${index}`;
        const questionId = `faq-question-${index}`;
        const answerId = `faq-answer-${index}`;

        return (
          <Accordion
            key={questionId}
            expanded={expanded === panelId}
            onChange={handleChange(panelId)}
            disableGutters
            sx={{
              borderRadius: "16px !important",
              overflow: "hidden",
              border: "1px solid rgba(15, 23, 32, 0.10)",
              backgroundColor: "#ffffff",
              boxShadow:
                expanded === panelId
                  ? "0 14px 28px rgba(13, 31, 40, 0.12)"
                  : "0 3px 10px rgba(15, 23, 42, 0.05)",
              transition: "all 0.25s ease",
              "&::before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon sx={{ color: "#378C92", fontSize: "1.7rem" }} />
              }
              aria-controls={answerId}
              id={questionId}
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: 0.45,
                minHeight: { xs: 74, sm: 82 },
                "& .MuiAccordionSummary-content": {
                  margin: "14px 0",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                },
              }}
            >
              <Chip
                icon={<HelpOutlineIcon sx={{ fontSize: "1rem !important" }} />}
                label={`Q${index + 1}`}
                size="small"
                sx={{
                  mt: "2px",
                  backgroundColor: "rgba(55, 140, 146, 0.12)",
                  color: "#1f5f66",
                  fontWeight: 700,
                  borderRadius: "8px",
                }}
              />
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#0f1720",
                  fontSize: { xs: "1rem", sm: "1.08rem" },
                  lineHeight: 1.45,
                  pr: 1,
                }}
              >
                {faq.question}
              </Typography>
            </AccordionSummary>

            <AccordionDetails
              id={answerId}
              sx={{
                px: { xs: 2, sm: 2.5 },
                pt: 0,
                pb: 2.2,
              }}
            >
              <Typography
                sx={{
                  color: "#4b5563",
                  fontSize: "0.98rem",
                  lineHeight: 1.82,
                }}
              >
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default FAQAccordion;
