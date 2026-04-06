/**
 * MapLocationBlock — Step 2.28.1
 *
 * Renders an interactive world map with configurable location markers.
 * Uses react-simple-maps (NOT Google Maps or Mapbox).
 *
 * Features:
 * - ComposableMap with ZoomableGroup and Geography rendering
 * - SVG circle markers with configurable color
 * - MUI Tooltip on hover (when showTooltips=true) showing label, address, phone
 * - 3 style variants: world, region, minimal
 * - Responsive: scales to container width
 * - Framer Motion entrance animation (whileInView, viewport once:true)
 *
 * Security: DOMPurify.sanitize() on all marker labels and addresses
 * Performance: React.memo
 * Accessibility: role="img", aria-label on map container
 */

import React, { useMemo } from "react";
import { Box, Container, Typography, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";

// ── Types ────────────────────────────────────────────────────────────────────

interface MarkerConfig {
  lat: number;
  lng: number;
  label: string;
  address: string;
  phone: string;
  color: string;
}

interface MapLocationContent {
  heading?: string;
  markers?: MarkerConfig[];
  zoom?: number;
  height?: number;
  showTooltips?: boolean;
  style?: "world" | "region" | "minimal";
  // Standard styling fields
  spacingPaddingTop?: string;
  spacingPaddingBottom?: string;
}

interface Block {
  id: number;
  blockType: string;
  content: MapLocationContent;
  sortOrder: number;
}

interface MapLocationBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const DEFAULT_MARKER: MarkerConfig = {
  lat: 40.7128,
  lng: -74.006,
  label: "Main Office",
  address: "123 Main St, New York, NY",
  phone: "",
  color: "#378C92",
};

// ── Tooltip Content ───────────────────────────────────────────────────────────

interface MarkerTooltipProps {
  marker: MarkerConfig;
}

const MarkerTooltipContent: React.FC<MarkerTooltipProps> = React.memo(
  ({ marker }) => (
    <Box sx={{ p: 0.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
        {DOMPurify.sanitize(marker.label)}
      </Typography>
      {marker.address && (
        <Typography variant="caption" display="block">
          {DOMPurify.sanitize(marker.address)}
        </Typography>
      )}
      {marker.phone && (
        <Typography variant="caption" display="block">
          {DOMPurify.sanitize(marker.phone)}
        </Typography>
      )}
    </Box>
  ),
);

MarkerTooltipContent.displayName = "MarkerTooltipContent";

// ── Main Component ────────────────────────────────────────────────────────────

const MapLocationBlockBase: React.FC<MapLocationBlockProps> = ({
  block,
  headingColor = "#1e293b",
}) => {
  const {
    heading = "Our Locations",
    markers: rawMarkers,
    zoom = 4,
    height = 400,
    showTooltips = true,
    style = "world",
  } = block.content;

  // Use default marker if no markers configured
  const markers: MarkerConfig[] = useMemo(() => {
    if (!rawMarkers || rawMarkers.length === 0) return [DEFAULT_MARKER];
    return rawMarkers;
  }, [rawMarkers]);

  // Compute projection settings based on style
  const projectionConfig = useMemo(() => {
    if (style === "region" && markers.length > 0) {
      // Center on average of marker coordinates
      const avgLng = markers.reduce((s, m) => s + m.lng, 0) / markers.length;
      const avgLat = markers.reduce((s, m) => s + m.lat, 0) / markers.length;
      return { center: [avgLng, avgLat] as [number, number], scale: 120 };
    }
    if (style === "minimal") {
      return { center: [0, 0] as [number, number], scale: 90 };
    }
    // world — default
    return { center: [0, 20] as [number, number], scale: 100 };
  }, [style, markers]);

  // Geography fill based on style
  const geoFill = style === "minimal" ? "#d4d4d8" : "#e2e8f0";
  const geoStroke = style === "minimal" ? "#a1a1aa" : "#94a3b8";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Box
        component="section"
        aria-label={heading || "Map Location"}
        sx={{ py: 6 }}
      >
        <Container maxWidth="lg">
          {heading && (
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ mb: 3, fontWeight: 700, color: headingColor }}
            >
              {DOMPurify.sanitize(heading)}
            </Typography>
          )}

          <Box
            sx={{
              width: "100%",
              height: height,
              overflow: "hidden",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "#f8fafc",
            }}
            role="img"
            aria-label="Interactive location map"
          >
            <ComposableMap
              projectionConfig={projectionConfig}
              style={{ width: "100%", height: "100%" }}
            >
              <ZoomableGroup zoom={zoom} center={projectionConfig.center}>
                <Geographies geography={GEO_URL}>
                  {({ geographies }: { geographies: any[] }) =>
                    geographies.map((geo: any) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={geoFill}
                        stroke={geoStroke}
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { fill: "#cbd5e1", outline: "none" },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>

                {markers.map((marker, idx) => {
                  const safeLabel = DOMPurify.sanitize(marker.label);
                  const safeAddress = DOMPurify.sanitize(marker.address);
                  const safePhone = DOMPurify.sanitize(marker.phone || "");
                  const fill = marker.color || DEFAULT_MARKER.color;

                  const circle = (
                    <Marker
                      key={`marker-${idx}`}
                      coordinates={[marker.lng, marker.lat]}
                    >
                      <circle
                        r={8}
                        fill={fill}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                      {showTooltips && (
                        <title>
                          {safeLabel}
                          {safeAddress ? ` — ${safeAddress}` : ""}
                          {safePhone ? ` — ${safePhone}` : ""}
                        </title>
                      )}
                    </Marker>
                  );

                  if (!showTooltips) return circle;

                  return (
                    <Tooltip
                      key={`tooltip-${idx}`}
                      title={<MarkerTooltipContent marker={marker} />}
                      arrow
                      placement="top"
                    >
                      <g>
                        <Marker coordinates={[marker.lng, marker.lat]}>
                          <circle
                            r={8}
                            fill={fill}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        </Marker>
                      </g>
                    </Tooltip>
                  );
                })}
              </ZoomableGroup>
            </ComposableMap>
          </Box>

          {/* Accessible location list for screen readers */}
          {showTooltips && (
            <Box
              component="ul"
              sx={{
                mt: 2,
                listStyle: "none",
                p: 0,
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
              }}
              aria-label="Location list"
            >
              {markers.map((marker, idx) => (
                <Box
                  key={idx}
                  component="li"
                  sx={{ fontSize: "0.875rem", color: "text.secondary" }}
                >
                  <strong>{DOMPurify.sanitize(marker.label)}</strong>
                  {marker.address && (
                    <span> — {DOMPurify.sanitize(marker.address)}</span>
                  )}
                  {marker.phone && (
                    <span> — {DOMPurify.sanitize(marker.phone)}</span>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </motion.div>
  );
};

MapLocationBlockBase.displayName = "MapLocationBlock";

const MapLocationBlock = React.memo(MapLocationBlockBase);
MapLocationBlock.displayName = "MapLocationBlock";

export default MapLocationBlock;
