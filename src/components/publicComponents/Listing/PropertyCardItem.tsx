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
          minHeight: 350,
          borderRadius: 0,
          bgcolor: "transparent",
          boxShadow: "none",
          cursor: "pointer",
          overflow: "visible",
          display: "flex",
          flexDirection: "column",
          "&:hover .listing-card-image": {
            transform: "scale(1.05)",
          },
          "&:hover .listing-card-title": {
            color: colors.teal,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            borderTopLeftRadius: "5px",
            borderTopRightRadius: "5px",
            aspectRatio: "4 / 3",
            mb: 2.5,
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
              transition: "transform 700ms ease",
              borderTopLeftRadius: "5px",
              borderTopRightRadius: "5px"
            }}
          />

          <Box
            aria-label={`${businessName} initials`}
            sx={{
              position: "absolute",
              bottom: 12,
              left: 12,
              width: 54,
              height: 54,
              borderRadius: "50%",
              bgcolor: colors.teal,
              color: "#fff",
              border: "4px solid #fff",
              boxShadow: "0 10px 22px rgba(0,0,0,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: '"Playfair Display", serif',
              fontSize: 20,
              fontWeight: 600,
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            {initials}
          </Box>

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

        <Chip
          label={category}
          sx={{
            alignSelf: "flex-start",
            mb: 1,
            height: 25,
            borderRadius: 0.5,
            bgcolor: colors.softLight,
            color: colors.muted,
            border: `1px solid ${colors.soft}`,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: 1.1,
            textTransform: "uppercase",
            maxWidth: "100%",
            width: "fit-content",
          }}
        />

        <Typography
          className="listing-card-title"
          sx={{
            color: colors.ink,
            fontFamily: '"Playfair Display", serif',
            fontSize: 23,
            lineHeight: 1.2,
            letterSpacing: 0,
            mt: 0.75,
            mb: 0.75,
            minHeight: 30,
            display: "-webkit-box",
            overflow: "hidden",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            transition: "color 200ms ease",
          }}
        >
          {businessName}
        </Typography>

        <Typography
          sx={{
            color: colors.muted,
            fontSize: 13,
            lineHeight: 1.55,
            mb: 1,
            minHeight: 38,
            display: "-webkit-box",
            overflow: "hidden",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {description}
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.6}
          sx={{ mt: "auto", mb: 1, minHeight: 20 }}
        >
          <StarIcon sx={{ color: colors.teal, fontSize: 14 }} />
          <Typography sx={{ color: colors.ink, fontSize: 12, fontWeight: 700 }}>
            {rating ? rating.toFixed(1) : "New"}
          </Typography>
          {item.hasStore && (
            <StorefrontIcon sx={{ color: colors.muted, fontSize: 14 }} />
          )}
        </Stack>
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
