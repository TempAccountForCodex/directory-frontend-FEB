import React from "react";
import { Link as RouterLink } from "react-router-dom";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";

const SIZE_MAP = {
  small: { padding: "8px 16px", fontSize: "0.875rem", icon: 18, radius: 8 },
  medium: { padding: "12px 24px", fontSize: "0.95rem", icon: 20, radius: 10 },
  large: { padding: "14px 28px", fontSize: "1.05rem", icon: 22, radius: 12 },
  xl: { padding: "15px 30px", fontSize: "1.4rem", icon: 24, radius: 14 },
};

const CustomButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "bgColor" && prop !== "btnSize",
})<{ bgColor?: string; btnSize?: keyof typeof SIZE_MAP }>(({
  bgColor,
  btnSize,
}) => {
  const sz = SIZE_MAP[btnSize ?? "medium"] ?? SIZE_MAP.medium;

  return {
    position: "relative",
    overflow: "hidden",
    background: bgColor || "#fff",
    color: "#000",
    fontWeight: "bold",
    borderRadius: sz.radius,
    padding: sz.padding,
    fontSize: sz.fontSize,
    textTransform: "none",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
    transition: "all 0.3s ease-in-out",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",

    "& .MuiButton-endIcon": {
      marginLeft: 8,
      "& svg": { fontSize: sz.icon },
    },

    "&:hover": {
      background: bgColor || "#fff",
      boxShadow: "0 12px 28px rgba(0,0,0,.35)",
      textDecoration: "none",
    },
  };
});

interface ButtonV1Props {
  to: string;
  children: React.ReactNode;
  bgColor?: string;
  size?: "small" | "medium" | "large" | "xl";
  [key: string]: any;
}

function ButtonV1({
  to,
  children,
  bgColor,
  size = "medium",
  ...rest
}: ButtonV1Props) {
  const btnVariants = {
    initial: { y: 0, scale: 1, boxShadow: "0 8px 24px rgba(0,0,0,.25)" },
    hover: { y: -2, scale: 1.02, boxShadow: "0 12px 28px rgba(0,0,0,.35)" },
    tap: { scale: 0.98 },
  };

  const MotionRouterLink = motion(RouterLink as any);

  return (
    <CustomButton
      {...({
        component: MotionRouterLink,
        to,
        variants: btnVariants,
        initial: "initial",
        whileHover: "hover",
        whileTap: "tap",
      } as any)}
      variant="contained"
      endIcon={<ArrowForwardOutlined />}
      bgColor={bgColor}
      btnSize={size}
      {...rest}
    >
      {children}
    </CustomButton>
  );
}

export default ButtonV1;
export { ButtonV1 };
