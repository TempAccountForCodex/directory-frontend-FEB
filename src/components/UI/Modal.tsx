import React, { type ReactNode, type RefObject } from "react";
import { Box, Button, useTheme } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  UserModelRef?: RefObject<HTMLDivElement>;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  UserModelRef,
}) => {
  const theme = useTheme();

  if (!isOpen) return null;

  return (
    <>
      {/* Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInContent {
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Overlay */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1300,
          animation: "slideIn 0.5s ease",
        }}
      >
        {/* Modal Content */}
        <Box
          ref={UserModelRef}
          sx={{
            width: { xs: "250px", sm: "320px", md: "500px" },
            backgroundColor: theme.palette.background.paper,
            padding: { xs: "30px 25px", md: "30px 55px" },
            borderRadius: "8px",
            boxShadow: theme.shadows[5],
            position: "relative",
            transform: "translateY(-50px)",
            opacity: 0,
            animation: "slideInContent 0.5s ease forwards",
          }}
        >
          {/* Close Button */}
          <Button
            onClick={onClose}
            sx={{
              position: "absolute",
              borderRadius: "50%",
              top: "-8px",
              right: "-12px",
              minWidth: "30px",
              height: "30px",
              background: (theme.palette.primary as any).focus,
              color: theme.palette.primary.main,
              border: `2px solid ${theme.palette.primary.main}`,
              padding: 0,
              "&:hover": {
                background: theme.palette.primary.main,
                borderColor: (theme.palette.primary as any).focus,
                color: (theme.palette.primary as any).focus,
              },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: "18px" }} />
          </Button>

          {/* Children */}
          {children}
        </Box>
      </Box>
    </>
  );
};

export default Modal;
