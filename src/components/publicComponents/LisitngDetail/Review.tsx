import React from "react";
import TitleHeading from "../../UI/TitleHeading";
import { Grid, Box, Typography, useTheme } from "@mui/material";
import StarRateIcon from "@mui/icons-material/StarRate";
import Form from "../../UI/Form";

/* ---------------- Types ---------------- */
interface Field {
  type: string;
  placeholder: string;
  name: string;
  required?: boolean;
}

interface FormDataShape {
  [key: string]: string;
}

const Review: React.FC = () => {
  const theme = useTheme();
  const handleFeedbackSubmit = async (
    formData: FormDataShape,
  ): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  const fields: Field[] = [
    {
      type: "text",
      placeholder: "Enter your name",
      name: "user_name",
      required: true,
    },
    {
      type: "email",
      placeholder: "Enter your email",
      name: "user_email",
      required: true,
    },
  ];

  return (
    <>
      <TitleHeading text="Write a Review" pt={4} mb={3} />

      <Grid spacing={6} container sx={{ fontFamily: "poppins" }}>
        <Grid item xs={12} sm={6} component="div" {...({} as any)}>
          <Box
            component="section"
            style={{
              display: "flex",
              justifyContent: "space-between",
              maxWidth: 400,
            }}
          >
            <Box component="section" mr={4}>
              <Typography
                variant="h5"
                color="primary.hover"
                sx={{
                  color: (theme.palette.primary as any).hero,
                  fontWeight: 400,
                  fontSize: "18px",
                  lineHeight: "32px",
                  textAlign: "left",
                  paddingLeft: "3px",
                }}
              >
                Quality{" "}
              </Typography>
              <Box component="section">
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
              </Box>
            </Box>

            <Box component="section">
              <Typography
                variant="h5"
                color="primary.hover"
                sx={{
                  color: (theme.palette.primary as any).hero,
                  fontWeight: 400,
                  fontSize: "18px",
                  lineHeight: "32px",
                  textAlign: "left",
                  paddingLeft: "3px",
                }}
              >
                Hospitality{" "}
              </Typography>
              <Box component="section">
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
              </Box>
            </Box>
          </Box>

          <Box
            component="section"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "30px",
            }}
          >
            <Box component="section">
              <Typography
                variant="h5"
                color="primary.hover"
                sx={{
                  color: (theme.palette.primary as any).hero,
                  fontWeight: 400,
                  fontSize: "18px",
                  lineHeight: "32px",
                  textAlign: "left",
                  paddingLeft: "3px",
                }}
              >
                Service{" "}
              </Typography>
              <Box component="section">
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
              </Box>
            </Box>

            <Box component="section">
              <Typography
                variant="h5"
                color="primary.hover"
                sx={{
                  color: (theme.palette.primary as any).hero,
                  fontWeight: 400,
                  fontSize: "18px",
                  lineHeight: "32px",
                  textAlign: "left",
                  paddingLeft: "3px",
                }}
              >
                Pricing{" "}
              </Typography>
              <Box component="section">
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
                <StarRateIcon
                  sx={{ color: (theme.palette as any).cardshadow.main }}
                />
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} component="div" {...({} as any)}>
          <Box
            component="section"
            sx={{
              background: theme.palette.common.white,
              width: "200px",
              display: "flex",
              marginLeft: { xs: "0", sm: "auto" },
              borderRadius: "4px",
              justifyContent: "center",
              padding: "45px 20px",
            }}
          >
            <Box>
              <Typography
                variant="h5"
                textAlign="center"
                sx={{
                  color: (theme.palette.primary as any).focus,
                  fontWeight: 600,
                  fontSize: "30px",
                  lineHeight: "32px",
                }}
              >
                5.00
              </Typography>
              <Typography
                variant="h5"
                color="primary.hover"
                sx={{
                  color: (theme.palette.primary as any).hover,
                  fontWeight: 400,
                  fontSize: "17px",
                  lineHeight: "32px",
                  textAlign: "left",
                  paddingLeft: "3px",
                }}
              >
                Average Ratting
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box component="section" pt={6} pr={4}>
        <Typography
          variant="h6"
          color="primary.hover"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 400,
            fontSize: "17px",
            lineHeight: "32px",
            textAlign: "left",
            paddingLeft: "3px",
            marginBottom: "20px",
          }}
        >
          Your email address will not be published.{" "}
        </Typography>

        <Form
          fields={fields.map((field) => ({
            ...field,
            required: field.required ?? false,
          }))}
          buttonText="SEND REVIEW"
          textAreaPlaceholder="Write Your Review"
          onSubmit={handleFeedbackSubmit}
        />
      </Box>
    </>
  );
};

export default Review;
