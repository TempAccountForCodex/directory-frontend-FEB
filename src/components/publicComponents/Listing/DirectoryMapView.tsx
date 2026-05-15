import React, { useMemo, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import StarIcon from "@mui/icons-material/Star";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface MapListing {
  id: string | number;
  slug?: string;
  businessName?: string;
  title?: string;
  businessLogo?: string;
  image?: string;
  averageRating?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  city?: string;
  country?: string;
  [key: string]: any;
}

interface DirectoryMapViewProps {
  results: MapListing[];
  onBoundsChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  loading?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Listing row in the sidebar                                         */
/* ------------------------------------------------------------------ */

const MapListingRow = React.memo(function MapListingRow({
  listing,
}: {
  listing: MapListing;
}) {
  const theme = useTheme();
  const name = listing.businessName ?? listing.title ?? "Unnamed";
  const location = [listing.city, listing.country].filter(Boolean).join(", ");
  const showRating =
    typeof listing.averageRating === "number" && listing.averageRating > 0;

  return (
    <>
      <ListItem
        alignItems="flex-start"
        sx={{
          cursor: "pointer",
          "&:hover": { backgroundColor: (theme.palette.action as any).hover },
          borderRadius: 1,
        }}
      >
        <ListItemAvatar>
          <Avatar
            src={listing.businessLogo ?? listing.image}
            alt={name}
            sx={{ width: 40, height: 40 }}
          >
            <RoomIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="body2" fontWeight={600} noWrap>
              {name}
            </Typography>
          }
          secondary={
            <Box>
              {location && (
                <Typography variant="caption" color="text.secondary">
                  {location}
                </Typography>
              )}
              {showRating && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.3,
                    mt: 0.2,
                  }}
                >
                  <StarIcon sx={{ fontSize: 12, color: "#faaf00" }} />
                  <Typography variant="caption" color="text.secondary">
                    {(listing.averageRating as number).toFixed(1)}
                  </Typography>
                </Box>
              )}
            </Box>
          }
        />
      </ListItem>
      <Divider component="li" />
    </>
  );
});

/* ------------------------------------------------------------------ */
/*  DirectoryMapView                                                   */
/* ------------------------------------------------------------------ */

const DirectoryMapView: React.FC<DirectoryMapViewProps> = ({
  results,
  onBoundsChange,
  loading = false,
}) => {
  const theme = useTheme();

  /* ---- Calculate mean coordinates for map center ---- */
  const { centerLat, centerLng } = useMemo(() => {
    const geoResults = results.filter(
      (r) =>
        r.location?.latitude !== undefined &&
        r.location?.longitude !== undefined,
    );
    if (geoResults.length === 0) {
      return { centerLat: 51.505, centerLng: -0.09 }; // default: London
    }
    const sumLat = geoResults.reduce((acc, r) => acc + r.location!.latitude, 0);
    const sumLng = geoResults.reduce(
      (acc, r) => acc + r.location!.longitude,
      0,
    );
    return {
      centerLat: sumLat / geoResults.length,
      centerLng: sumLng / geoResults.length,
    };
  }, [results]);

  /* ---- Iframe src ---- */
  const iframeSrc = useMemo(
    () =>
      `https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - 0.1}%2C${centerLat - 0.1}%2C${centerLng + 0.1}%2C${centerLat + 0.1}&layer=mapnik`,
    [centerLat, centerLng],
  );

  /* ---- Search this area stub ---- */
  const handleSearchThisArea = useCallback(() => {
    if (!onBoundsChange) return;
    onBoundsChange({
      north: centerLat + 0.1,
      south: centerLat - 0.1,
      east: centerLng + 0.1,
      west: centerLng - 0.1,
    });
  }, [centerLat, centerLng, onBoundsChange]);

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        boxShadow:
          "rgba(0, 0, 0, 0.05) 0px 6px 24px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          height: { xs: "auto", md: 560 },
        }}
      >
        {/* ---- Map iframe ---- */}
        <Box
          sx={{
            flex: "1 1 auto",
            position: "relative",
            height: { xs: 300, md: "100%" },
            minHeight: 300,
          }}
        >
          {/* Loading overlay */}
          {loading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.75)",
                zIndex: 10,
              }}
              role="status"
              aria-label="Loading map"
            >
              <CircularProgress />
            </Box>
          )}

          <Box
            component="iframe"
            src={iframeSrc}
            title="Directory listings map"
            sx={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
            }}
            loading="lazy"
            aria-label="Map showing listing locations"
          />

          {/* Search this area button */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 5,
            }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={handleSearchThisArea}
              sx={{
                backgroundColor: theme.palette.common.white,
                color:
                  (theme.palette.primary as any).focus ??
                  theme.palette.primary.main,
                boxShadow: 2,
                "&:hover": {
                  backgroundColor: theme.palette.grey[100],
                },
                fontWeight: 600,
                fontSize: "12px",
              }}
              aria-label="Search this area"
            >
              Search this area
            </Button>
          </Box>
        </Box>

        {/* ---- Sidebar listing list ---- */}
        <Box
          sx={{
            width: { xs: "100%", md: 280 },
            flexShrink: 0,
            borderLeft: { md: `1px solid ${theme.palette.divider}` },
            borderTop: { xs: `1px solid ${theme.palette.divider}`, md: "none" },
            overflowY: "auto",
          }}
        >
          <CardContent sx={{ pb: 0, px: 2, pt: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              {results.length} listing{results.length !== 1 ? "s" : ""} in this
              area
            </Typography>
          </CardContent>

          {results.length === 0 ? (
            <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
              <RoomIcon
                sx={{ fontSize: 40, color: theme.palette.text.disabled, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                No listings in this area.
                <br />
                Try zooming out or searching a different area.
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {results.map((listing) => (
                <MapListingRow key={listing.id} listing={listing} />
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default React.memo(DirectoryMapView);
