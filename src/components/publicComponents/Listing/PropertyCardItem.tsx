import { useContext, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Modal,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import StarIcon from "@mui/icons-material/Star";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { DashboardContext } from "../../../context/DashboardContext";

export interface PropertyItem {
  id: string | number;
  title?: string;
  desc?: string;
  address?: string;
  phone?: string;
  website?: string;
  businessLogo?: string | null;
  businessBanner?: string | null;
  image?: string;
  image1?: string;
  slug?: string;
  [key: string]: any;
}

interface PropertyItemCardProps {
  item: PropertyItem;
  handleDeleteItem: (id: string | number) => void;
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const colors = {
  ink: "#2C2A28",
  text: "#4A4744",
  muted: "#827D77",
  soft: "#E5DFD3",
  softLight: "#F5F1EA",
  teal: "#398C91",
};

const categoryPillSx = {
  position: "absolute",
  bottom: 12,
  left: 16,
  height: 24,
  borderRadius: 999,
  background: "#1a7a74",
  color: "#fff",
  border: 0,
  boxShadow: "none",
  transition: "background-color 0.15s ease, color 0.15s ease",
  "&:hover": {
    background: "#35C5C2",
    color: "#fff",
  },
  "& .MuiChip-label": {
    px: 1.5,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0,
    textTransform: "none",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
};

const fallbackImage =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80";

const stripHtml = (value?: string | null) =>
  (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const normalizeTags = (tags: unknown) =>
  Array.isArray(tags)
    ? tags.map((tag) => String(tag)).filter(Boolean).slice(0, 2)
    : [];

const PropertyItemCard: React.FC<PropertyItemCardProps> = ({
  item,
  handleDeleteItem,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [_deleteId, setDeleteId] = useState<string | number | null>(null);
  const { setSelectedSection } = useContext(DashboardContext)!;
  const navigate = useNavigate();
  const auth = useAuth();
  const theme = useTheme();

  const businessName = item.businessName || item.title || "Business Listing";
  const category = item.businessCategory || item.category || "Business";
  const description =
    item.shortDescription ||
    stripHtml(item.desc) ||
    item.intro ||
    "Directory listing";
  const rating = Number(item.averageRating ?? item.rating ?? 0);
  const reviewCount = Number(item.reviewCount ?? item.totalReviews ?? 0);
  const tags = normalizeTags(item.tags);
  const locationText = [item.city, item.region].filter(Boolean).join(", ");
  const initials = useMemo(() => getInitials(businessName), [businessName]);
  const image =
    item.businessBanner ||
    item.bannerImage ||
    item.image ||
    item.businessLogo ||
    item.image1 ||
    fallbackImage;
  const handleCardClick = () => {
    navigate(`/listings/${item.id}?type=listing`);
  };

  const handleDeleteClick = (id: string | number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = (id: string | number) => {
    handleDeleteItem(id);
    setShowDeleteModal(false);
  };

  const handleEditClick = (id: string | number) => {
    navigate(`/dashboard/createlisting/update?id=${id}`);
    setSelectedSection(`/dashboard/createlisting/update?id=${id}`);
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        elevation={0}
        sx={{
          width: "100%",
          minHeight: 0,
          borderRadius: "24px",
          bgcolor: "#fff",
          border: "2px solid #1a7a74",
          boxShadow: "6px 6px 0px #1a7a74",
          cursor: "pointer",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translate(-4px, -4px)",
            boxShadow: "10px 10px 0px #1a7a74",
          },
          "&:hover .listing-card-image": {
            transform: "scale(1.04)",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: 160,
            overflow: "hidden",
            bgcolor: colors.soft,
          }}
        >
          <Box
            className="listing-card-image"
            component="img"
            src={image}
            alt={businessName}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.35s ease",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.4) 100%)",
            }}
          />
          <Chip label={category} sx={categoryPillSx} />

          {auth.user &&
            (auth.user.role === "admin" ||
              auth.user.role === "super_admin") && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ position: "absolute", top: 12, left: 12 }}
              >
                <IconButton
                  aria-label="Edit listing"
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleEditClick(item.id);
                  }}
                  sx={{
                    color: "#fff",
                    bgcolor: "rgba(0,0,0,0.25)",
                    backdropFilter: "blur(8px)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.38)" },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  component="div"
                  role="button"
                  aria-label="Delete listing"
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteClick(item.id);
                  }}
                  sx={{
                    color: "#fff",
                    bgcolor: "rgba(0,0,0,0.25)",
                    backdropFilter: "blur(8px)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.38)" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}
        </Box>

        <Box sx={{ p: "20px" }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "14px",
                overflow: "hidden",
                flexShrink: 0,
                border: "2px solid #1a7a74",
                bgcolor: "#e6f0ef",
              }}
            >
              {item.businessLogo ? (
                <Box
                  component="img"
                  src={item.businessLogo}
                  alt={businessName}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1a7a74",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {initials}
                </Box>
              )}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#111827",
                  lineHeight: 1.3,
                }}
              >
                {businessName}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#9ca3af", mt: "2px" }}>
                {locationText || category}
              </Typography>
            </Box>
          </Stack>

          <Typography
            sx={{
              fontSize: 13,
              color: "#6b7280",
              lineHeight: 1.6,
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </Typography>

          {tags.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
              {tags.map((tag) => (
                <Box
                  key={tag}
                  sx={{
                    fontSize: 11,
                    px: "10px",
                    py: "4px",
                    borderRadius: 999,
                    border: "1.5px solid #1a7a74",
                    color: "#1a7a74",
                    fontWeight: 500,
                    transition: "background 0.15s ease, color 0.15s ease",
                    "&:hover": {
                      background: "#1a7a74",
                      color: "#fff",
                    },
                  }}
                >
                  {tag}
                </Box>
              ))}
            </Stack>
          )}

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{
              pt: 2,
              borderTop: "1.5px dashed rgba(26,122,116,0.25)",
            }}
          >
            <StarIcon sx={{ color: "#1a7a74", fontSize: 16 }} />
            <Typography sx={{ color: "#111827", fontSize: 14, fontWeight: 700 }}>
              {rating ? rating.toFixed(1) : "New"}
            </Typography>
            <Typography sx={{ color: "#9ca3af", fontSize: 12 }}>
              {reviewCount ? `· ${reviewCount} reviews` : "· No reviews yet"}
            </Typography>
            {item.hasStore && (
              <StorefrontIcon sx={{ color: "#9ca3af", fontSize: 14, ml: 0.5 }} />
            )}
          </Stack>
        </Box>
      </Card>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-desc"
      >
        <Box
          sx={{
            bgcolor: theme.palette.common.white,
            width: 300,
            p: 4,
            borderRadius: "10px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow:
              "rgba(0, 0, 0, 0.05) 0px 6px 24px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
          }}
        >
          <Typography
            variant="h6"
            id="delete-modal-title"
            sx={{ color: (theme.palette.primary as any).hover }}
          >
            Are you sure you want to delete this item?
          </Typography>
          <Box mt={2} sx={{ display: "flex", justifyContent: "right" }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDeleteConfirm(item.id)}
              sx={{ mr: 1.5 }}
            >
              Delete
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default PropertyItemCard;
