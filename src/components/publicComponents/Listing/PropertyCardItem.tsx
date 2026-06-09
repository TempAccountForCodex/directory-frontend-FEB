import { useContext, useState } from "react";
import {
  Box,
  Button,
  Card,
  IconButton,
  Modal,
  Rating,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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

const cardAccent = "#3c3163";
const cardHoverText = "#1f2937";
const cardEase = "cubic-bezier(0.19, 1, 0.22, 1)";
const cardTransition = `color 700ms ${cardEase}, box-shadow 700ms ${cardEase}, transform 700ms ${cardEase}`;

const fallbackImage =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80";

const stripHtml = (value?: string | null) =>
  (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();


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
  const description =
    item.shortDescription ||
    stripHtml(item.desc) ||
    item.intro ||
    "Directory listing";
  const rating = item.rating ?? item.averageRating ?? 0;
  const locationText = [item.city, item.region].filter(Boolean).join(", ");
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
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 360 },
          mx: "auto",
        }}
      >
        <Card
          onClick={handleCardClick}
          elevation={0}
          sx={{
            width: "100%",
            minHeight: { xs: 390, sm: 430 },
            borderRadius: "1em",
            color: "#fff",
            border: "10px solid #ccc",
            boxShadow: "0 0 5em -1em #000",
            cursor: "pointer",
            overflow: "hidden",
            display: "flex",
            alignItems: "flex-end",
            position: "relative",
            p: { xs: 2.5, md: 3 },
            textDecoration: "none",
            isolation: "isolate",
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("${String(image).replace(/"/g, '\\"')}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: cardTransition,
            willChange: "transform, color, box-shadow",
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            "&::before, &::after": {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              transform: "scaleY(0)",
              transformOrigin: "bottom",
              transition: `transform 760ms ${cardEase}`,
              pointerEvents: "none",
              zIndex: 1,
              willChange: "transform",
              backfaceVisibility: "hidden",
            },
            "&::before": {
              background:
                "linear-gradient(to top, rgba(255,255,255,0.6) 0%, transparent 70%)",
            },
            "&::after": {
              background:
                "linear-gradient(to top, rgba(255,255,255,1) 0%, transparent 100%)",
            },
            "&:hover": {
              color: cardHoverText,
              transform: "translate3d(0, -4px, 0)",
              boxShadow: "0 1.5rem 4.5rem -1.8rem rgba(0,0,0,0.9)",
            },
            "&:hover::before, &:hover::after": {
              transform: "scaleY(1)",
            },
            "&:hover .listing-card-rating": {
              opacity: 1,
              transform: "translateY(0)",
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              zIndex: 3,
              px: 2,
              py: 2,
              fontFamily:
                "Open Sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: { xs: 10, md: 11 },
              lineHeight: 1,
              opacity: 0.85,
              color: "#fff",
              maxWidth: "68%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {locationText || "Directory"}
          </Box>

          {auth.user &&
            (auth.user.role === "admin" ||
              auth.user.role === "super_admin") && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ position: "absolute", top: 12, left: 12, zIndex: 4 }}
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
                    bgcolor: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(8px)",
                    "&:hover": { bgcolor: cardAccent },
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
                    bgcolor: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(8px)",
                    "&:hover": { bgcolor: cardAccent },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}

          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              minWidth: 0,
            }}
          >
            <Typography
              component="h3"
              sx={{
                m: 0,
                fontFamily:
                  "Heebo, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: { xs: 19, md: 21 },
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: 0,
              }}
            >
              {businessName}
            </Typography>

            <Typography
              sx={{
                fontFamily:
                  "Open Sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: { xs: 11, md: 12 },
                lineHeight: 1.7,
                mt: 1,
                mb: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              className="listing-card-rating"
              sx={{
                opacity: 0,
                transform: "translateY(6px)",
                transition: `opacity 500ms ${cardEase}, transform 500ms ${cardEase}`,
              }}
            >
              <Rating
                value={rating}
                readOnly
                size="small"
                precision={0.5}
                sx={{ color: cardAccent }}
              />
              <Typography
                sx={{
                  fontFamily:
                    "Open Sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: { xs: 11, md: 12 },
                  fontWeight: 700,
                  lineHeight: 1,
                  color: cardAccent,
                }}
              >
                {rating > 0 ? Number(rating).toFixed(1) : "No rating"}
              </Typography>
            </Stack>
          </Box>
        </Card>
      </Box>

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
