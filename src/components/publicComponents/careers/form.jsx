import React, { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  MenuItem,
  keyframes,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { MuiTelInput } from "mui-tel-input";
import { motion } from "framer-motion";
import SectionHeader from "../../UI/SectionHeader";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const cardVariantsBottom = {
  offscreen: { y: 40, opacity: 0 },
  onscreen: (i = 1) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] },
  }),
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const AirCard = styled(Box)(({ theme }) => ({
  position: "relative",
  borderRadius: 16,
  padding: theme.spacing(5),
  background: "#fff",
  border: "1px solid #e9eef3",
  boxShadow:
    "0 10px 25px rgba(13, 56, 87, 0.06), 0 2px 6px rgba(13,56,87,0.05)",
}));

const lightField = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    background: "#fff",
    "& fieldset": { borderColor: "#dfe7ee" },
    "&:hover fieldset": { borderColor: "#b7d9e4" },
    "&.Mui-focused fieldset": {
      borderColor: "#00000068",
    },
  },
  "& .MuiFormLabel-root": {
    color: "#5b6976",
    "&.Mui-focused": {
      color: "#000000",
    },
  },
  "& .MuiFormHelperText-root": { color: "#6c7a87" },
};

const UploadButton = styled(Button)({
  width: "100%",
  justifyContent: "center",
  gap: 8,
  borderRadius: 12,
  padding: "14px 16px",
  textTransform: "none",
  color: "#0f3944",
  borderColor: "#bfeaf0",
  background: "#f6feff",
  borderStyle: "dashed",
  "&:hover": {
    background: "#f0fdff",
    borderColor: "#8edee9",
  },
});

const ApplyBtn = styled(Button)({
  position: "relative",
  padding: "14px 28px",
  borderRadius: 12,
  fontWeight: 700,
  letterSpacing: 0.2,
  textTransform: "none",
  color: "#ffffffff",
  background: "#378C92",
  "&:hover": {
    background: "#378C92",
  },
});

const DynamicForm = ({
  formTitle,
  formSubtext,
  fields,
  submitText,
  validationSchema,
  initialValues,
  showChips = false,
  onSubjectChange,
  apiEndpoint = "/contact", // Default to contact endpoint
}) => {
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);

      console.group("🧾 Form Submission Data");
      Object.entries(values).forEach(([key, val]) => {
        if (val instanceof File) {
          console.log(`${key}: File -> ${val.name}, size: ${val.size} bytes`);
        } else {
          console.log(`${key}:`, val);
        }
      });
      console.groupEnd();

      try {
        // Check if there are any file fields in the form data
        const hasFiles = Object.values(values).some(
          (value) => value instanceof File,
        );

        let requestData;
        let headers = {};

        if (hasFiles) {
          // Use FormData for file uploads
          const formData = new FormData();
          Object.entries(values).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
              formData.append(key, value);
            }
          });
          requestData = formData;
          headers = { "Content-Type": "multipart/form-data" };
        } else {
          // Use JSON for forms without files
          requestData = Object.fromEntries(
            Object.entries(values).filter(
              ([_, value]) =>
                value !== null && value !== undefined && value !== "",
            ),
          );
          headers = { "Content-Type": "application/json" };
        }

        const response = await axios.post(
          `${API_URL}${apiEndpoint}`,
          requestData,
          { headers },
        );

        if (response.data.success) {
          formik.resetForm();
          setSnackbarSeverity("success");
          setSnackbarMessage(
            "Application submitted successfully! We'll review your application and get back to you soon.",
          );
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error("Error submitting application:", error);

        let errorMessage = "Failed to submit application. Please try again.";

        if (error.response?.data?.error === "RATE_LIMIT_EXCEEDED") {
          errorMessage =
            "Too many applications submitted. Please try again after an hour.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setSnackbarSeverity("error");
        setSnackbarMessage(errorMessage);
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleFileChange = (e, fieldName) => {
    const file = e.currentTarget.files[0];
    formik.setFieldValue(fieldName, file);
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          py: { xs: 7 },
          px: 2,
          overflow: "hidden",
          // backgroundColor: "#ffffff",
        }}
        id="contact-section"
      >
        <Box
          sx={{ maxWidth: 980, mx: "auto", position: "relative", zIndex: 1 }}
        >
          <motion.div
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.15 }}
            variants={cardVariantsBottom}
          >
            <SectionHeader
              text={formTitle}
              subtext={formSubtext}
              variant="lg"
              align="center"
              titleSx={{ color: "#0f1a21", letterSpacing: 0.2 }}
              subtextSx={{ color: "#4a5a66", maxWidth: 760, mx: "auto" }}
              sx={{ mb: 5, mt: 2.5 }}
            />
          </motion.div>

          <AirCard
            component={motion.div}
            variants={cardVariantsBottom}
            initial="offscreen"
            whileInView="onscreen"
          >
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Grid container spacing={2.5}>
                {fields.map((field, index) => {
                  if (field.hidden) return null;

                  const isOptional = field.optional || false;

                  return (
                    <Grid item xs={12} sm={field.size} key={index}>
                      {field.type === "tel" ? (
                        <MuiTelInput
                          label={field.label}
                          name={field.name}
                          fullWidth
                          variant="outlined"
                          defaultCountry="PK"
                          value={formik.values[field.name]}
                          onChange={(val) =>
                            formik.setFieldValue(field.name, val)
                          }
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched[field.name] &&
                            Boolean(formik.errors[field.name])
                          }
                          helperText={
                            formik.touched[field.name] &&
                            formik.errors[field.name]
                          }
                          sx={lightField}
                        />
                      ) : field.type === "file" ? (
                        <Box>
                          <UploadButton
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                          >
                            {field.label}
                            <VisuallyHiddenInput
                              type="file"
                              onChange={(e) => handleFileChange(e, field.name)}
                            />
                          </UploadButton>
                          {formik.values[field.name] && (
                            <Typography
                              variant="body2"
                              sx={{ mt: 1, color: "#334a54" }}
                            >
                              Selected File:{" "}
                              <em>{formik.values[field.name].name}</em>
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <TextField
                          label={
                            isOptional
                              ? `${field.label.replace(" *", "")} (Optional)`
                              : field.label
                          }
                          name={field.name}
                          fullWidth
                          variant="outlined"
                          select={field.select}
                          multiline={field.multiline}
                          rows={field.rows}
                          sx={lightField}
                          value={formik.values[field.name]}
                          onChange={(e) => {
                            formik.handleChange(e);
                            if (
                              (field.name === "subject" ||
                                field.name === "select") &&
                              onSubjectChange
                            ) {
                              onSubjectChange(e.target.value);
                              formik.setFieldValue("sub_subject", "");
                            }
                          }}
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched[field.name] &&
                            Boolean(formik.errors[field.name])
                          }
                          helperText={
                            formik.touched[field.name] &&
                            formik.errors[field.name]
                          }
                        >
                          {field.options &&
                            field.options.map((option, i) => (
                              <MenuItem key={i} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                        </TextField>
                      )}
                    </Grid>
                  );
                })}

                {showChips && (
                  <Grid item xs={12} display="flex" gap={1} flexWrap="wrap">
                    <Chip
                      label="Avg. response: < 24h"
                      size="small"
                      sx={{
                        bgcolor: "#eaf9fb",
                        color: "#145c69",
                        borderRadius: 1,
                      }}
                    />
                    <Chip
                      label="NDA on request"
                      size="small"
                      sx={{
                        bgcolor: "#eaf9fb",
                        color: "#145c69",
                        borderRadius: 1,
                      }}
                    />
                  </Grid>
                )}

                <Grid item xs={12} textAlign="right">
                  <ApplyBtn type="submit" disabled={loading}>
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: "#032026" }} />
                    ) : (
                      submitText
                    )}
                  </ApplyBtn>
                </Grid>
              </Grid>
            </Box>
          </AirCard>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          severity={snackbarSeverity}
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DynamicForm;
