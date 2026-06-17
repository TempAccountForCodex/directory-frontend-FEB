import { useContext, useState } from "react";
import {
  Box,
  Button,
  Card,
  IconButton,
  Modal,
  Rating,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import EditIcon from "@mui/icons-material/Edit";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { DashboardContext } from "../../../context/DashboardContext";
import { useFavorites } from "../../../hooks/useFavorites";

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
  onEditItem?: (item: PropertyItem) => void;
  previewMode?: boolean;
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const cardAccent = "#378b91";
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
  onEditItem,
  previewMode = false,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [_deleteId, setDeleteId] = useState<string | number | null>(null);
  const dashboardContext = useContext(DashboardContext);
  const navigate = useNavigate();
  const auth = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites(item.id);
  const favorited = isFavorited(item.id);

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
    if (previewMode) return;
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
    const target = `/dashboard/websites/${id}/manage/listing`;
    navigate(target);
    dashboardContext?.setSelectedSection(target);
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 400 },
          mx: "auto",
        }}
      >
        <Card
          onClick={handleCardClick}
          elevation={0}
          sx={{
            width: "100%",
            minHeight: { xs: 280, sm: 360 },
            borderRadius: "1em",
            color: "#fff",
            border: "none",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 4px 24px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2)",
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
              boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.12)",
            },
            "&:hover::before, &:hover::after": {
              transform: "scaleY(1)",
            },
            "&:hover .listing-card-rating": {
              opacity: 1,
              transform: "translateY(0)",
            },
            "&:hover .listing-card-fav": {
              opacity: 1,
            },
            "&:hover .card-border-ring": {
              background: "linear-gradient(135deg, rgba(20,184,166,0.5), rgba(99,102,241,0.3), rgba(255,255,255,0.15))",
            },
          }}
        >
          {/* Gradient border ring */}
          <Box
            className="card-border-ring"
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "1em",
              pointerEvents: "none",
              zIndex: 10,
              padding: "1px",
              background: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04), rgba(255,255,255,0.1))",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              transition: "background 0.3s ease",
            }}
          />
          {/* Location — top right */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              zIndex: 3,
              px: 2,
              py: 2,
              fontFamily: "Open Sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: { xs: 10, md: 11 },
              lineHeight: 1,
              opacity: 0.85,
              color: "#fff",
              maxWidth: "60%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {locationText || "Directory"}
          </Box>

          {/* Admin buttons — top left */}
          {!previewMode && auth.user &&
            (auth.user.role === "admin" || auth.user.role === "super_admin" ||
              String(auth.user.id) === String(item.ownerId)) && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ position: "absolute", top: 12, left: 12, zIndex: 4 }}
              >
                <Tooltip title="Edit listing" arrow>
                  <IconButton
                    aria-label="Edit listing"
                    size="small"
                    onClick={(event) => { event.stopPropagation(); handleEditClick(item.id); }}
                    sx={{
                      color: "#fff",
                      bgcolor: "rgba(0,0,0,0.35)",
                      backdropFilter: "blur(8px)",
                      "&:hover": { bgcolor: cardAccent },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Unpublish listing" arrow>
                  <IconButton
                    component="div"
                    role="button"
                    aria-label="Unpublish listing"
                    size="small"
                    onClick={(event) => { event.stopPropagation(); handleDeleteClick(item.id); }}
                    sx={{
                      color: "#fff",
                      bgcolor: "rgba(0,0,0,0.35)",
                      backdropFilter: "blur(8px)",
                      "&:hover": { bgcolor: cardAccent },
                    }}
                  >
                    <ArchiveOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}

          {/* Heart — bottom right, hidden until hover (always visible when favourited) */}
          <IconButton
            className="listing-card-fav"
            size="small"
            aria-label={favorited ? "Remove from favourites" : "Add to favourites"}
            onClick={(e) => {
              if (previewMode) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              toggleFavorite(item.id, e);
            }}
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              zIndex: 6,
              width: 34,
              height: 34,
              opacity: favorited ? 1 : 0,
              bgcolor: favorited ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.35)",
              backdropFilter: "blur(8px)",
              border: favorited
                ? "1px solid rgba(239,68,68,0.35)"
                : "1px solid rgba(255,255,255,0.2)",
              color: favorited ? "#ef4444" : "#fff",
              transition: "opacity 0.25s ease, transform 0.2s ease, background 0.2s ease",
              "&:hover": {
                bgcolor: favorited ? "rgba(239,68,68,0.28)" : "rgba(0,0,0,0.5)",
                transform: "scale(1.12)",
              },
            }}
          >
            {favorited
              ? <FavoriteIcon sx={{ fontSize: 16 }} />
              : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
          </IconButton>

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
              <Rating
                value={rating}
                readOnly
                size="small"
                precision={0.5}
                sx={{ color: cardAccent }}
              />
              
            </Stack>
          </Box>
        </Card>
      </Box>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-desc"
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(8, 12, 18, 0.68)",
              backdropFilter: "blur(8px)",
            },
          },
        }}
      >
        <Box
          sx={{
            width: { xs: "calc(100vw - 32px)", sm: 430 },
            maxWidth: 430,
            p: { xs: 3, sm: 3.5 },
            borderRadius: "18px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#f8fafc",
            bgcolor: "rgba(15, 23, 32, 0.96)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.08)",
            outline: "none",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                flex: "0 0 auto",
                bgcolor: "rgba(55,139,145,0.18)",
                border: "1px solid rgba(55,139,145,0.45)",
                boxShadow: "0 12px 28px rgba(55,139,145,0.22)",
              }}
            >
              <ArchiveOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                id="delete-modal-title"
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: { xs: 22, sm: 24 },
                  lineHeight: 1.2,
                  letterSpacing: 0,
                }}
              >
                Unpublish this listing?
              </Typography>
              <Typography
                id="delete-modal-desc"
                variant="body2"
                sx={{
                  color: "rgba(248,250,252,0.72)",
                  mt: 1,
                  lineHeight: 1.65,
                  fontSize: 14,
                }}
              >
                It will move to archived listings and disappear from the public directory. You can publish it again from your dashboard.
              </Typography>
            </Box>
          </Stack>
          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            spacing={1.5}
            justifyContent="flex-end"
            sx={{ mt: 3 }}
          >
            <Button
              variant="outlined"
              onClick={() => setShowDeleteModal(false)}
              sx={{
                minHeight: 44,
                px: 2.5,
                borderRadius: "12px",
                color: "rgba(248,250,252,0.86)",
                borderColor: "rgba(248,250,252,0.18)",
                textTransform: "none",
                fontWeight: 700,
                "&:hover": {
                  borderColor: "rgba(248,250,252,0.36)",
                  bgcolor: "rgba(255,255,255,0.06)",
                },
              }}
            >
              Keep published
            </Button>
            <Button
              variant="contained"
              onClick={() => handleDeleteConfirm(item.id)}
              sx={{
                minHeight: 44,
                px: 2.5,
                borderRadius: "12px",
                bgcolor: cardAccent,
                color: "#fff",
                textTransform: "none",
                fontWeight: 800,
                boxShadow: "0 14px 30px rgba(55,139,145,0.28)",
                "&:hover": {
                  bgcolor: "#2f7a80",
                  boxShadow: "0 16px 34px rgba(55,139,145,0.34)",
                },
              }}
            >
              Unpublish
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export default PropertyItemCard;
