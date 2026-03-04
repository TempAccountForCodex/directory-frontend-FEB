import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  alpha,
} from "@mui/material";
import { X, TrendingUp, Store, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import type { StorePlan } from "../../hooks/usePlanSummary";
import { DashboardActionButton } from "./shared";

interface StorePlanUpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  message: string;
  limitType: "stores" | "products";
  currentPlan: StorePlan | null | undefined;
}

const StorePlanUpgradeDialog = ({
  open,
  onClose,
  message,
  limitType,
  currentPlan,
}: StorePlanUpgradeDialogProps) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate("/pricing#stores");
    onClose();
  };

  const getUpgradeSuggestion = () => {
    const planCode = currentPlan?.code;

    if (planCode === "store_free") {
      return {
        suggestion: "Store Starter",
        benefits:
          limitType === "stores"
            ? ["1 store", "100 products per store", "1.5% platform fee"]
            : [
                "100 products per store",
                "1.5% platform fee",
                "Advanced analytics",
              ],
      };
    } else if (planCode === "store_starter") {
      return {
        suggestion: "Store Pro",
        benefits:
          limitType === "stores"
            ? ["3 stores", "10,000 products per store", "0% platform fee"]
            : [
                "10,000 products per store",
                "0% platform fee",
                "Priority support",
              ],
      };
    }

    return {
      suggestion: "a higher plan",
      benefits: ["More stores", "More products", "Lower fees"],
    };
  };

  const { suggestion, benefits } = getUpgradeSuggestion();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          border: `1px solid ${colors.border}`,
          borderRadius: 3,
          background: colors.cardBg,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: colors.text,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${colors.warning} 0%, ${colors.error} 100%)`,
              p: 1,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {limitType === "stores" ? (
              <Store size={24} color="#fff" />
            ) : (
              <ShoppingBag size={24} color="#fff" />
            )}
          </Box>
          Plan Limit Reached
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Current Plan Info */}
        {currentPlan && (
          <Box
            sx={{
              background: alpha(colors.primary, 0.05),
              borderRadius: 2,
              p: 2,
              mb: 3,
              border: `1px solid ${alpha(colors.primary, 0.1)}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: colors.textSecondary, mb: 0.5 }}
            >
              Current Plan
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: colors.text, fontWeight: 700 }}
            >
              {currentPlan.name}
            </Typography>
          </Box>
        )}

        {/* Error Message */}
        <Typography
          variant="body1"
          sx={{
            color: colors.text,
            mb: 3,
            lineHeight: 1.7,
          }}
        >
          {message}
        </Typography>

        {/* Upgrade Suggestion */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.primaryDark, 0.05)} 100%)`,
            borderRadius: 2,
            p: 3,
            border: `1px solid ${alpha(colors.primary, 0.2)}`,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <TrendingUp size={28} color={colors.primary} />
            <Typography
              variant="h6"
              sx={{ color: colors.text, fontWeight: 700 }}
            >
              Upgrade to {suggestion}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {benefits.map((benefit, index) => (
              <Box key={index} display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: colors.primary,
                  }}
                />
                <Typography variant="body2" sx={{ color: colors.text }}>
                  {benefit}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Additional Info */}
        <Typography
          variant="body2"
          sx={{
            color: colors.textSecondary,
            mt: 3,
            fontStyle: "italic",
          }}
        >
          Upgrade your plan to unlock more{" "}
          {limitType === "stores" ? "stores" : "products"} and grow your
          business.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: colors.textSecondary,
            "&:hover": { background: alpha(colors.textSecondary, 0.1) },
          }}
        >
          Maybe Later
        </Button>
        <DashboardActionButton
          onClick={handleUpgrade}
          startIcon={<TrendingUp size={18} />}
          sx={{ px: 3 }}
        >
          View Store Plans
        </DashboardActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default StorePlanUpgradeDialog;
