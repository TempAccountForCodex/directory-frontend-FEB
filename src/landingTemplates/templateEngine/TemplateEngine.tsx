import React, { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import type { BusinessData } from "../types/BusinessData";
import { getTemplateById } from "./templateRegistry";

interface TemplateEngineProps {
  templateId: string;
  data: BusinessData;
}

const TemplateEngine: React.FC<TemplateEngineProps> = ({
  templateId,
  data,
}) => {
  const definition = getTemplateById(templateId) ?? getTemplateById("modern");

  if (!definition) {
    return <Box sx={{ p: 4, textAlign: "center" }}>Template not found.</Box>;
  }

  const TemplateComponent = definition.component;

  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <TemplateComponent data={data} />
    </Suspense>
  );
};

export default TemplateEngine;
