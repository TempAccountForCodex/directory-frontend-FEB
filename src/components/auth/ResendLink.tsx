import { Button } from "@mui/material";

interface ResendLinkProps {
  secondsRemaining: number;
  onResend: () => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Reusable resend code link component with countdown display
 */
export const ResendLink = ({
  secondsRemaining,
  onResend,
  disabled = false,
  loading = false,
}: ResendLinkProps) => {
  const isDisabled = disabled || loading || secondsRemaining > 0;

  return (
    <Button
      variant="text"
      onClick={onResend}
      disabled={isDisabled}
      size="small"
      sx={{
        color: isDisabled ? "rgba(255, 255, 255, 0.4)" : "#378C92",
        fontSize: "14px",
        fontWeight: 600,
        textTransform: "none",
        transition: "all 0.2s ease",
        "&:hover": {
          color: "#3a98a0",
          backgroundColor: "rgba(55, 140, 146, 0.06)",
        },
        "&:disabled": {
          color: "rgba(255, 255, 255, 0.4)",
        },
      }}
    >
      {secondsRemaining > 0 ? `Resend in ${secondsRemaining}s` : "Resend code"}
    </Button>
  );
};
