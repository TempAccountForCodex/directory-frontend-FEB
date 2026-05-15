import { Container, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

const CompanyCopyRight: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        backgroundColor: (theme.palette.primary as any).hero,
        mt: "auto",
        textAlign: "center",
        py: 1,
      }}
    >
      <Container maxWidth="sm">
        <Typography
          variant="body2"
          sx={{ fontSize: "12px", color: theme.palette.primary.main }}
        >
          Copyright © 2023. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default CompanyCopyRight;
