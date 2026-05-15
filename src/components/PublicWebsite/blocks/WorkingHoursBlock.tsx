/**
 * WorkingHoursBlock — Step 11.3
 *
 * Renders a business hours table with:
 * - Day / Hours two-column layout
 * - Closed days rendered in muted (text.secondary) italic text
 * - Live Open Now / Closed status badge (optional, showCurrentStatus)
 * - Today's row highlighted with primaryColor tint
 * - Compact card variant (max-width 420px, Card elevation=1)
 * - React.memo + useMemo for live status
 * - Framer Motion entrance animation + useInView
 */

import React, { useMemo } from "react";
import {
  Box,
  Card,
  Chip,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// ── Types ──────────────────────────────────────────────────────────────────

type DayName =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

interface HourEntry {
  day: DayName;
  openTime?: string;
  closeTime?: string;
  isClosed?: boolean;
}

interface WorkingHoursContent {
  heading?: string;
  showCurrentStatus?: boolean;
  hours?: HourEntry[];
}

interface Block {
  id: number;
  blockType: string;
  content: WorkingHoursContent;
  sortOrder: number;
  variant?: string;
}

interface WorkingHoursBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Convert HH:MM (24h) string to "h:mm AM/PM" display string */
export function formatTime(time: string): string {
  if (!time) return "";
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  const period = hour >= 12 ? "PM" : "AM";
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute} ${period}`;
}

/** Map JS getDay() (0=Sun..6=Sat) to DayName */
const DAY_INDEX_TO_NAME: DayName[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Determine live open/closed status. Returns true if currently open. */
function computeIsOpen(hours: HourEntry[]): boolean {
  const now = new Date();
  const todayName = DAY_INDEX_TO_NAME[now.getDay()];
  const entry = hours.find((h) => h.day === todayName);

  if (!entry || entry.isClosed) return false;
  if (!entry.openTime || !entry.closeTime) return false;

  const [openH, openM] = entry.openTime.split(":").map(Number);
  const [closeH, closeM] = entry.closeTime.split(":").map(Number);

  const openDate = new Date(now);
  openDate.setHours(openH, openM, 0, 0);

  const closeDate = new Date(now);
  closeDate.setHours(closeH, closeM, 0, 0);

  return now >= openDate && now < closeDate;
}

// ── Component ──────────────────────────────────────────────────────────────

const WorkingHoursBlock: React.FC<WorkingHoursBlockProps> = ({
  block,
  primaryColor = "#2563eb",
  headingColor = "#1e293b",
  bodyColor = "#475569",
}) => {
  const { content } = block;
  const hours = content.hours || [];
  const heading = content.heading;
  const showCurrentStatus = content.showCurrentStatus !== false;
  const isCompact = block.variant === "compact";

  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Memoize live status — computed once on mount
  const isOpen = useMemo(() => computeIsOpen(hours), [hours]);

  // Today's day name for row highlight
  const todayName = DAY_INDEX_TO_NAME[new Date().getDay()];

  const table = (
    <TableContainer component={Paper} elevation={1}>
      <Table size={isCompact ? "small" : "medium"} aria-label="working hours">
        <TableHead>
          <TableRow
            sx={{
              "& .MuiTableCell-root": {
                fontWeight: 600,
                color: headingColor,
                bgcolor: `${primaryColor}20`,
              },
            }}
          >
            <TableCell>Day</TableCell>
            <TableCell>Hours</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hours.map((entry) => {
            const isToday = entry.day === todayName;
            const closed = entry.isClosed;

            return (
              <TableRow
                key={entry.day}
                sx={{
                  bgcolor: isToday ? `${primaryColor}15` : "background.paper",
                }}
              >
                {/* Day cell */}
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: closed ? "text.secondary" : bodyColor,
                    fontStyle: closed ? "italic" : "normal",
                  }}
                >
                  {entry.day}
                </TableCell>

                {/* Hours cell */}
                <TableCell
                  sx={{
                    color: closed ? "text.secondary" : bodyColor,
                    fontStyle: closed ? "italic" : "normal",
                  }}
                >
                  {closed
                    ? "Closed"
                    : `${formatTime(entry.openTime || "")} – ${formatTime(entry.closeTime || "")}`}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const statusBadge = showCurrentStatus && (
    <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
      <Chip
        label={isOpen ? "Open Now" : "Closed"}
        color={isOpen ? "success" : "error"}
        variant="filled"
        size="small"
      />
    </Box>
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {isCompact ? (
        /* Compact variant — Card, max-width 420px */
        <Box sx={{ py: 4, px: 2 }}>
          <Card elevation={1} sx={{ maxWidth: 420, mx: "auto", p: 2 }}>
            {heading && (
              <Typography
                variant="h6"
                component="h2"
                gutterBottom
                sx={{ fontWeight: 600, color: headingColor }}
              >
                {heading}
              </Typography>
            )}
            {statusBadge}
            {table}
          </Card>
        </Box>
      ) : (
        /* Default variant — full-width centered container */
        <Box sx={{ py: 8 }}>
          <Container maxWidth="lg">
            {heading && (
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{ mb: 3, fontWeight: 600, color: headingColor }}
              >
                {heading}
              </Typography>
            )}
            {statusBadge}
            {table}
          </Container>
        </Box>
      )}
    </motion.div>
  );
};

export default React.memo(WorkingHoursBlock);
