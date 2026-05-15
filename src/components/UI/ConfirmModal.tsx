import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  type ForwardRefRenderFunction,
} from "react";
import { Modal, Box, Typography, Button, useTheme } from "@mui/material";

/* ---------- Types ---------- */
interface ConfirmModalProps {
  slug: string;
  handleSubmit: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface ConfirmModalRef {
  openModal: () => void;
  closeModal: () => void;
}

/* ---------- Component ---------- */
const ConfirmModal: ForwardRefRenderFunction<
  ConfirmModalRef,
  ConfirmModalProps
> = (
  { slug, handleSubmit, confirmLabel = "Confirm", cancelLabel = "Cancel" },
  ref,
) => {
  const [open, setOpen] = useState<boolean>(false);
  const theme = useTheme();
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({
    openModal: handleOpen,
    closeModal: handleClose,
  }));

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
    >
      <Box
        sx={{
          bgcolor: theme.palette.common.white,
          width: "300px",
          p: 4,
          borderRadius: "10px",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow:
            "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
        }}
      >
        <Typography
          variant="h6"
          id="confirm-modal-title"
          sx={{ color: (theme.palette.primary as any).hover }}
        >
          This title already exists. Your new URL will be:{" "}
          <span>{`https://prismx.us/business/${slug}`}</span>
        </Typography>

        <Box mt={2} sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button variant="outlined" onClick={handleClose}>
            {cancelLabel}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleSubmit();
              handleClose();
            }}
            sx={{
              mr: 1.5,
              bgcolor: (theme.palette.primary as any).hover,
              color: theme.palette.common.white,
            }}
          >
            {confirmLabel}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default forwardRef(ConfirmModal);
