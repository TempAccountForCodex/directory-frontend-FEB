import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  alpha,
  MenuItem,
} from "@mui/material";
import { ArrowLeft, Save, Store } from "lucide-react";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import { usePersistentState } from "../../hooks/usePersistentState";
import type { PlanSummary } from "../../hooks/usePlanSummary";
import StoreProducts from "./StoreProducts";
import StoreOrders from "./StoreOrders";
import {
  DashboardActionButton,
  DashboardInput,
  DashboardSelect,
} from "./shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface Store {
  id: string;
  name: string;
  slug: string;
  currency: string;
  platformFeePercent: number;
  isPublished: boolean;
  isPublic: boolean;
  createdAt: string;
  description?: string;
}

interface StoreDetailProps {
  store: Store;
  onBack: () => void;
  onPlanLimitReached: (message: string, type: "stores" | "products") => void;
  planSummary: PlanSummary | null;
}

const StoreDetail = ({
  store: initialStore,
  onBack,
  onPlanLimitReached,
  planSummary,
}: StoreDetailProps) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  // Use persistent state for active tab
  const [activeTab, setActiveTab] = usePersistentState(
    `stores:detail:${initialStore.id}:tab:v1`,
    "settings",
    { scope: "global" },
  );

  const [store, setStore] = useState<Store>(initialStore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: initialStore.name,
    description: initialStore.description || "",
    currency: initialStore.currency,
  });
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch full store details on mount
  useEffect(() => {
    fetchStoreDetails();
  }, [initialStore.id]);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/stores/${initialStore.id}`, {
        headers: {},
      });
      const storeData = response.data.data;
      setStore(storeData);
      setSettingsForm({
        name: storeData.name,
        description: storeData.description || "",
        currency: storeData.currency,
      });
    } catch (err: any) {
      console.error("Error fetching store details:", err);
      setError(err.response?.data?.message || "Failed to load store details");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await axios.put(
        `${API_URL}/stores/${store.id}`,
        settingsForm,
        {
          headers: {},
        },
      );

      setStore(response.data.data);
      setSettingsChanged(false);
      setSuccess("Settings saved successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setError(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "settings":
        return (
          <Card
            sx={{
              borderRadius: 3,
              border: `1px solid ${colors.border}`,
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: colors.text, fontWeight: 700, mb: 3 }}
            >
              Store Settings
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert
                severity="success"
                sx={{ mb: 2 }}
                onClose={() => setSuccess(null)}
              >
                {success}
              </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <DashboardInput
                label="Store Name"
                labelPlacement="floating"
                value={settingsForm.name}
                onChange={(e) => {
                  setSettingsForm({ ...settingsForm, name: e.target.value });
                  setSettingsChanged(true);
                }}
                fullWidth
                required
              />

              <DashboardInput
                label="Store Slug"
                labelPlacement="floating"
                value={store.slug}
                fullWidth
                disabled
                helperText="Store slug cannot be changed after creation"
              />

              <DashboardInput
                label="Description"
                labelPlacement="floating"
                value={settingsForm.description}
                onChange={(e) => {
                  setSettingsForm({
                    ...settingsForm,
                    description: e.target.value,
                  });
                  setSettingsChanged(true);
                }}
                fullWidth
                multiline
                rows={4}
                helperText="Optional description for your store"
              />

              <Box>
                <DashboardSelect
                  fullWidth
                  label="Currency"
                  value={settingsForm.currency}
                  disabled
                >
                  <MenuItem value="USD">USD - US Dollar</MenuItem>
                  <MenuItem value="EUR">EUR - Euro</MenuItem>
                  <MenuItem value="GBP">GBP - British Pound</MenuItem>
                  <MenuItem value="PKR">PKR - Pakistani Rupee</MenuItem>
                </DashboardSelect>
                <Typography
                  variant="caption"
                  sx={{ color: colors.textSecondary, mt: 0.5 }}
                >
                  Currency cannot be changed after creation
                </Typography>
              </Box>

              {/* Platform Fee Info */}
              <Box
                sx={{
                  background: alpha(colors.primary, 0.05),
                  borderRadius: 2,
                  p: 2,
                  border: `1px solid ${alpha(colors.primary, 0.1)}`,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: colors.textSecondary, mb: 0.5 }}
                >
                  Platform Fee
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ color: colors.primary, fontWeight: 700 }}
                >
                  {store.platformFeePercent / 100}%
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: colors.textSecondary }}
                >
                  This fee is charged on each order and is determined by your
                  store plan.
                  {planSummary?.storePlan?.code === "store_pro" &&
                    " (0% fee on Store Pro plan!)"}
                </Typography>
              </Box>

              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSettingsForm({
                      name: store.name,
                      description: store.description || "",
                      currency: store.currency,
                    });
                    setSettingsChanged(false);
                  }}
                  disabled={!settingsChanged}
                  sx={{
                    borderColor: colors.textSecondary,
                    color: colors.textSecondary,
                    "&:hover": {
                      borderColor: colors.text,
                      background: alpha(colors.textSecondary, 0.1),
                    },
                  }}
                >
                  Reset
                </Button>
                <DashboardActionButton
                  startIcon={<Save size={18} />}
                  onClick={handleSaveSettings}
                  disabled={!settingsChanged || saving}
                >
                  {saving ? (
                    <CircularProgress size={20} sx={{ color: "inherit" }} />
                  ) : (
                    "Save Changes"
                  )}
                </DashboardActionButton>
              </Box>
            </Box>
          </Card>
        );

      case "products":
        return (
          <StoreProducts
            storeId={store.id}
            storeCurrency={store.currency}
            onPlanLimitReached={onPlanLimitReached}
            planSummary={planSummary}
          />
        );

      case "orders":
        return (
          <StoreOrders storeId={store.id} storeCurrency={store.currency} />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={onBack}
          sx={{
            color: colors.textSecondary,
            mb: 2,
            "&:hover": {
              color: colors.text,
              background: alpha(colors.textSecondary, 0.1),
            },
          }}
        >
          Back to Stores
        </Button>

        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
              p: 1.5,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Store size={32} color="#fff" />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: colors.text,
                fontWeight: 800,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              }}
            >
              {store.name}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              /{store.slug} • {store.currency} •{" "}
              {store.platformFeePercent / 100}% platform fee
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: colors.border, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              color: colors.textSecondary,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
              "&.Mui-selected": {
                color: colors.primary,
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: colors.primary,
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <Tab label="Settings" value="settings" />
          <Tab label="Products" value="products" />
          <Tab label="Orders" value="orders" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {renderTabContent()}
    </Container>
  );
};

export default StoreDetail;
