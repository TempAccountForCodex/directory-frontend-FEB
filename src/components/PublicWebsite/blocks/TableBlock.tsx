/**
 * TableBlock — TABLE block renderer (Step 2.29A.7)
 *
 * Renders a data table block with:
 * - MUI Table/TableHead/TableBody/TableRow/TableCell/TableContainer/TableSortLabel
 * - Client-side sort: click header toggles asc/desc via TableSortLabel
 * - DOMPurify on all cell content (XSS protection)
 * - Striped rows via alternating background
 * - Bordered style applies border to cells
 * - Hoverable rows highlight on hover
 * - Compact mode reduces cell padding
 * - Responsive: TableContainer with overflow-x auto for horizontal scroll
 * - SSR: renders complete HTML table (sort disabled without JS)
 * - React.memo for performance
 * - Framer Motion entrance animation with useInView
 */

import React, { useState, useMemo } from "react";
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import DOMPurify from "dompurify";

// ---- Types ----

interface Column {
  header: string;
  accessor: string;
  align?: "left" | "center" | "right";
  width?: string;
}

type Row = Record<string, string>;

interface TableBlockContent {
  heading?: string;
  caption?: string;
  columns?: Column[];
  rows?: Row[];
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  sortable?: boolean;
  compact?: boolean;
}

interface Block {
  id: number;
  blockType: string;
  content: TableBlockContent;
  sortOrder: number;
}

interface TableBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

type SortDirection = "asc" | "desc";

// ---- Main component ----

const TableBlock: React.FC<TableBlockProps> = ({
  block,
  primaryColor = "#2563eb",
  headingColor = "#1e293b",
  bodyColor = "#475569",
}) => {
  const { content } = block;
  const columns = content.columns || [];
  const rows = content.rows || [];
  const striped = content.striped !== false;
  const bordered = content.bordered !== false;
  const hoverable = content.hoverable !== false;
  const sortable = content.sortable !== false;
  const compact = content.compact || false;

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // ---- Sort handler ----
  const handleSort = (accessor: string) => {
    if (!sortable) return;
    if (sortColumn === accessor) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(accessor);
      setSortDirection("asc");
    }
  };

  // ---- Sorted rows ----
  const sortedRows = useMemo(() => {
    if (!sortColumn || !sortable) return rows;
    return [...rows].sort((a, b) => {
      const aVal = String(a[sortColumn] || "");
      const bVal = String(b[sortColumn] || "");
      const cmp = aVal.localeCompare(bVal, undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [rows, sortColumn, sortDirection, sortable]);

  // ---- Cell border style ----
  const cellBorderSx = bordered
    ? { border: "1px solid", borderColor: "divider" }
    : {};

  // ---- Compact padding ----
  const cellPaddingSx = compact ? { py: 0.5, px: 1 } : {};

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          {/* Heading */}
          {content.heading && (
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ mb: 4, fontWeight: 600, color: headingColor }}
            >
              {content.heading}
            </Typography>
          )}

          {/* Table with horizontal scroll for responsive */}
          <TableContainer
            component={Paper}
            elevation={1}
            sx={{ overflowX: "auto", width: "100%" }}
          >
            <Table
              size={compact ? "small" : "medium"}
              sx={{
                minWidth: 400,
              }}
              aria-label={content.heading || "data table"}
            >
              {/* Caption (SSR-friendly) */}
              {content.caption && (
                <caption
                  style={{
                    captionSide: "bottom",
                    padding: "8px",
                    color: bodyColor,
                    fontSize: "0.875rem",
                  }}
                >
                  {content.caption}
                </caption>
              )}

              {/* Table Head */}
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: primaryColor,
                    "& .MuiTableCell-root": {
                      color: "white",
                      fontWeight: 600,
                      ...cellBorderSx,
                      ...cellPaddingSx,
                    },
                  }}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.accessor}
                      align={col.align || "left"}
                      width={col.width || undefined}
                      sortDirection={
                        sortColumn === col.accessor ? sortDirection : false
                      }
                    >
                      {sortable ? (
                        <TableSortLabel
                          active={sortColumn === col.accessor}
                          direction={
                            sortColumn === col.accessor ? sortDirection : "asc"
                          }
                          onClick={() => handleSort(col.accessor)}
                          sx={{
                            color: "white !important",
                            "&.Mui-active": { color: "white !important" },
                            "& .MuiTableSortLabel-icon": {
                              color: "white !important",
                            },
                          }}
                        >
                          {col.header}
                        </TableSortLabel>
                      ) : (
                        col.header
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              {/* Table Body */}
              <TableBody>
                {sortedRows.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    sx={{
                      // Striped rows
                      bgcolor:
                        striped && rowIndex % 2 === 1
                          ? "grey.50"
                          : "background.paper",
                      // Hoverable
                      ...(hoverable && {
                        "&:hover": { bgcolor: `${primaryColor}10` },
                      }),
                      cursor: hoverable ? "default" : undefined,
                    }}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.accessor}
                        align={col.align || "left"}
                        sx={{
                          color: bodyColor,
                          ...cellBorderSx,
                          ...cellPaddingSx,
                        }}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            String(row[col.accessor] || ""),
                          ),
                        }}
                      />
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
    </motion.div>
  );
};

export default React.memo(TableBlock);
