import { useContext, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Grid,
  Button,
  Modal,
  useTheme,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import RoomIcon from "@mui/icons-material/Room";
import CallIcon from "@mui/icons-material/Call";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useAuth } from "../../../context/AuthContext";
import StarIcon from "@mui/icons-material/Star";
import EditIcon from "@mui/icons-material/Edit";
import { DashboardContext } from "../../../context/DashboardContext";
import DeleteIcon from "@mui/icons-material/Delete";
import useFormattedPhoneNo from "../../../hooks/useFormattedPhoneNo";

/* ---------------- Types ---------------- */
export interface PropertyItem {
  id: string | number;
  title?: string;
  desc?: string;
  address?: string;
  phone?: string;
  website?: string;
  businessLogo?: string;
  // businessBanner?: string;
  image?: string;
  [key: string]: any;
}

interface PropertyItemCardProps {
  item: PropertyItem;
  handleDeleteItem: (id: string | number) => void;
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const PropertyItemCard: React.FC<PropertyItemCardProps> = ({
  item,
  handleDeleteItem,
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string;
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [_deleteId, setDeleteId] = useState<string | number | null>(null);
  const [imgError, setImgError] = useState<boolean>(false);
  const { setSelectedSection } = useContext(DashboardContext)!;
  const navigate = useNavigate();
  const auth = useAuth();
  const theme = useTheme();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  const handleCardClick = () => {
    navigate(`/listings/${item.id}?type=listing`);
  };

  const truncateDesc = (desc: string, maxLength: number): string => {
    const text = desc.replace(/<[^>]*>/g, "").trim();
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleDeleteClick = (id: string | number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = (id: string | number) => {
    handleDeleteItem(id);
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleImageError = () => {
    setImgError(true);
  };

  const handleEditClick = (id: string | number) => {
    navigate(`/dashboard/createlisting/update?id=${id}`);
    setSelectedSection(`/dashboard/createlisting/update?id=${id}`);
  };

  const shouldHide = item.website === "https://www.example.com/";
  const formatPhoneNumber = useFormattedPhoneNo(item.phone);

  return (
    <Grid item xs={12} sm={12} md={3.6} component="div" {...({} as any)}>
      <Box sx={{ position: "relative", width: "100%" }}>
        <Card
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%", // fill grid cell
            minHeight: "470px", // consistent minimum
            borderRadius: "6px",
            boxShadow:
              "rgba(0, 0, 0, 0.05) 0px 6px 24px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
            transition: "transform 0.3s",
            "&:hover": { transform: "scale(1.03)" },
            cursor: "pointer",
          }}
          onClick={handleCardClick}
        >
          {/* Banner Overlay */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "180px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1,
            }}
          />
          <CardMedia
            component="img"
            height="180"
            image={
              item.image
              // !imgError && item.image
              //   ? item.image.startsWith("http")
              //     ? item.image
              //     : `${backendUrl}/${item.image}`
              //   : DefaultImg
            }
            alt={item.title}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />

          {/* Edit/Delete buttons */}
          {auth.user &&
            (auth.user.role === "admin" ||
              auth.user.role === "super_admin") && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  position: "absolute",
                  top: "10px",
                  right: "20px",
                  zIndex: 2,
                }}
              >
                <Box
                  sx={{
                    borderRadius: "50%",
                    border: `1px solid ${theme.palette.common.white}`,
                    width: "30px",
                    height: "30px",
                    cursor: "pointer",
                    backgroundColor: (theme.palette.primary as any).focus,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(item.id);
                  }}
                >
                  <EditIcon
                    sx={{ color: theme.palette.common.white, fontSize: "20px" }}
                  />
                </Box>
                <Box
                  sx={{
                    borderRadius: "50%",
                    border: `1px solid ${theme.palette.common.white}`,
                    width: "30px",
                    height: "30px",
                    cursor: "pointer",
                    backgroundColor: (theme.palette.primary as any).focus,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(item.id);
                  }}
                >
                  <DeleteIcon
                    sx={{ color: theme.palette.common.white, fontSize: "20px" }}
                  />
                </Box>
              </Box>
            )}

          {/* Content */}
          <CardContent
            sx={{
              flexGrow: 1,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              minHeight: "260px",
              pt: 4,
            }}
          >
            {/* Logo */}
            <img
              style={{
                width: "63px",
                height: "63px",
                borderRadius: "50%",
                border: "4px solid white",
                position: "absolute",
                top: "145px",
                left: "30px",
                zIndex: 3,
              }}
              src={
                item.image1
                // !imgError && item.businessLogo
                //   ? `${backendUrl}/${item.businessLogo}`
                //   : DefaultImg
              }
              alt={item.title}
              onError={handleImageError}
              loading="lazy"
              decoding="async"
              width={63}
              height={63}
            />

            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                color: (theme.palette.primary as any).hover,
                fontWeight: 600,
                lineHeight: "22px",
                textAlign: "left",
                fontFamily: "poppins",
                fontSize: "16px",
                mt: "30px",
                mb: "5px",
                px: "20px",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                minHeight: "48px", // ✅ reserve space
                "&:hover": { color: (theme.palette.primary as any).focus },
              }}
            >
              {item.title}
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "14px",
                lineHeight: "20px",
                fontFamily: "poppins",
                px: "20px",
                mb: "10px",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                minHeight: "40px",
              }}
            >
              {truncateDesc(item.desc ?? "", 80)}
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            {/* Address */}
            <Box sx={{ display: "flex", gap: "1rem", px: "16px" }}>
              <RoomIcon
                sx={{
                  fontSize: "20px",
                  color: (theme.palette.primary as any).focus,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "12px",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {truncateDesc(item.address ?? "", 100)}
              </Typography>
            </Box>

            {/* Phone */}
            <Box sx={{ display: "flex", gap: "1rem", px: "16px", mt: 1 }}>
              <CallIcon
                sx={{
                  fontSize: "20px",
                  color: (theme.palette.primary as any).focus,
                }}
              />
              <Typography
                component="div"
                variant="body2"
                sx={{ color: theme.palette.text.secondary, fontSize: "12px" }}
              >
                <a
                  href={`tel:${item.phone}`}
                  style={{ textDecoration: "none", color: "unset" }}
                  onClick={handleLinkClick}
                >
                  {formatPhoneNumber}
                </a>
              </Typography>
            </Box>

            {/* Website */}
            <Box sx={{ display: "flex", gap: "1rem", px: "16px", mt: 1 }}>
              <OpenInNewIcon
                sx={{
                  fontSize: "20px",
                  color: (theme.palette.primary as any).focus,
                }}
              />
              <Typography
                component="div"
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "12px",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {!shouldHide ? (
                  <a
                    href={item.website ?? ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "unset" }}
                    onClick={handleLinkClick}
                  >
                    {truncateDesc(item.website ?? "", 50)}
                  </a>
                ) : (
                  "-"
                )}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Delete modal */}
      <Modal
        open={showDeleteModal}
        onClose={handleCancelDelete}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-desc"
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
            <Button variant="outlined" onClick={handleCancelDelete}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Grid>
  );
};

export default PropertyItemCard;
