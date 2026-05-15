import React, { useState, type ChangeEvent } from "react";
import { Box, IconButton, useTheme } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface LabelWithInputProps {
  label: string;
  id: string;
  name?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "select";
  disabled?: boolean;
  options?: string[];
}

const LabelWithInput: React.FC<LabelWithInputProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  options = [],
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div style={{ marginTop: "23px" }}>
      <label
        htmlFor={id}
        style={{
          color: theme.palette.text.primary,
          fontWeight: 600,
          display: "block",
          fontFamily: theme.typography.fontFamily,
          fontSize: "16px",
        }}
      >
        {label}
      </label>
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        {type === "select" ? (
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            style={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              padding: "0 20px",
              width: "100%",
              marginTop: "12px",
              borderRadius: theme.shape.borderRadius,
              lineHeight: "50px",
              fontSize: "16px",
              color: theme.palette.text.secondary,
              outline: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              height: "55px",
            }}
          >
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <Box
            component="input"
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            type={showPassword && type === "password" ? "text" : type}
            disabled={disabled}
            placeholder={placeholder}
            sx={{
              backgroundColor: (t) => t.palette.background.paper,
              border: (t) => `1px solid ${t.palette.divider}`,
              padding: "0 20px",
              width: "100%",
              marginTop: "12px",
              borderRadius: "10px",
              lineHeight: "50px",
              fontSize: { xs: "11px", sm: "14px", md: "16px" }, // ✅ responsive font size
              color: (t) => t.palette.text.primary,
              outline: "none",
              paddingRight: type === "password" ? "40px" : "20px",
              cursor: disabled ? "not-allowed" : "text",
              height: "55px",
            }}
          />
        )}
        {type === "password" && (
          <IconButton
            onClick={handleTogglePasswordVisibility}
            style={{
              position: "absolute",
              right: "10px",
              top: "43%",
              transform: "translateY(-50%)",
              marginTop: "12px",
              zIndex: 10,
            }}
          >
            {showPassword ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        )}
      </div>
    </div>
  );
};

export default LabelWithInput;
