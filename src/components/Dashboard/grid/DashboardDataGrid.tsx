import { useMemo, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  alpha,
  ThemeProvider,
  createTheme,
  useTheme,
} from "@mui/material/styles";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnOrderState,
  type MRT_VisibilityState,
} from "material-react-table";
import { getDashboardColors } from "../../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../../context/ThemeContext";
import RowActionButtonGroup from "../shared/RowActionButtonGroup";
import type { DashboardDataGridProps, ActionConfig } from "./types";
// import './DashboardDataGrid.css';

/**
 * DashboardDataGrid - Reusable Material React Table wrapper for dashboard tables.
 *
 * Features:
 * - Theme-aware styling (dark/light mode)
 * - Column state persistence (order, width, visibility)
 * - Flexible action column using RowActionButtonGroup
 * - Client and server-side pagination support
 */
const DashboardDataGrid = <T extends object>({
  // Required
  rowData,
  columnDefs,
  gridId,

  // Actions
  actionColumn,

  // Pagination
  pagination = true,
  paginationPageSize = 10,
  paginationPageSizeSelector = [5, 10, 25, 50, 100],
  serverSidePagination,

  // Row config
  getRowId,
  rowHeight: _rowHeight = 52,
  headerHeight: _headerHeight = 48,

  // Loading & empty
  loading = false,
  emptyMessage = "No data to display",
  emptyIcon,

  // Callbacks
  onRowClick,
  onSelectionChanged,

  // Selection
  rowSelection = false,
  enableMultiRowSelection = true,

  // Styling
  className = "",
  height = "auto",

  // Search
  globalFilter,
  onGlobalFilterChange,

  // MRT passthrough
  tableOptions = {},
}: DashboardDataGridProps<T>) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const muiTheme = useTheme();

  // Local pagination state for client-side tables
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize: paginationPageSize,
  });

  // Create a theme that forces the mode to match our custom theme
  const tableTheme = useMemo(
    () =>
      createTheme(muiTheme, {
        palette: {
          mode: actualTheme === "dark" ? "dark" : "light",
          background: {
            default: colors.panelBg,
            paper: colors.panelBg,
          },
          text: {
            primary: colors.text,
            secondary: colors.textSecondary,
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
        },
      }),
    [actualTheme, colors, muiTheme],
  );

  // Column State Persistence
  const storageKey = `dashboard-grid-state-${gridId}`;

  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}-order`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    () => {
      try {
        const saved = localStorage.getItem(`${storageKey}-visibility`);
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    },
  );

  // Save state effects
  useEffect(() => {
    if (columnOrder.length > 0) {
      localStorage.setItem(`${storageKey}-order`, JSON.stringify(columnOrder));
    }
  }, [columnOrder, storageKey]);

  useEffect(() => {
    if (Object.keys(columnVisibility).length > 0) {
      localStorage.setItem(
        `${storageKey}-visibility`,
        JSON.stringify(columnVisibility),
      );
    }
  }, [columnVisibility, storageKey]);

  // Handle action column
  const enableRowActions = !!actionColumn;

  const table = useMaterialReactTable({
    columns: columnDefs,
    data: rowData,
    enableRowSelection: rowSelection,
    enableMultiRowSelection: rowSelection && enableMultiRowSelection,
    getRowId: getRowId,

    // State management
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: onGlobalFilterChange, // Bind state update to parent
    state: {
      isLoading: loading,
      columnOrder,
      columnVisibility,
      globalFilter: globalFilter ?? undefined, // Bind external search
      pagination: serverSidePagination
        ? {
            pageIndex: serverSidePagination.currentPage - 1,
            pageSize: paginationPageSize,
          }
        : paginationState,
    },
    initialState: {
      pagination: { pageSize: paginationPageSize, pageIndex: 0 },
      density: "comfortable",
    },
    muiSearchTextFieldProps: {
      size: "small",
      variant: "outlined",
    },
    // Pagination
    muiPaginationProps: {
      rowsPerPageOptions: paginationPageSizeSelector,
      SelectProps: {
        size: "small",
      },
      sx: {
        "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
          {
            fontSize: "0.85rem",
            color: colors.textSecondary,
          },
        "& .MuiTablePagination-select": {
          color: colors.text,
        },
        "& .MuiIconButton-root": {
          color: colors.text,
        },
      },
    },
    muiColumnActionsButtonProps: {
      sx: {
        color: colors.text,
      },
    },
    enablePagination: pagination,
    manualPagination: !!serverSidePagination,
    rowCount: serverSidePagination?.totalRows ?? rowData.length,
    onPaginationChange: (updater) => {
      if (serverSidePagination) {
        if (typeof updater === "function") {
          const newState = updater({
            pageIndex: serverSidePagination.currentPage - 1,
            pageSize: paginationPageSize,
          });
          serverSidePagination.onPageChange(newState.pageIndex + 1);
          serverSidePagination.onPageSizeChange(newState.pageSize);
        } else {
          serverSidePagination.onPageChange(updater.pageIndex + 1);
          serverSidePagination.onPageSizeChange(updater.pageSize);
        }
      } else {
        setPaginationState(updater);
      }
    },

    // Styling
    muiTablePaperProps: ({ table }) => ({
      elevation: 0,
      style: {
        zIndex: table.getState().isFullScreen ? 1000 : undefined,
      },
      sx: {
        backgroundColor: "transparent",
        border: "none",
        "& .MuiIconButton-root:not(.row-action-button)": {
          color: colors.text,
          "&:hover": {
            color: colors.panelAccent || colors.primary,
          },
        },
        "& .MuiSvgIcon-root:not(.row-action-button *)": {
          color: colors.text,
        },
      },
    }),
    muiTableContainerProps: {
      sx: {
        maxHeight: "760px",
      },
    },
    muiTableProps: {
      sx: {
        border: "none",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: colors.panelHover,
        color: colors.panelText,
        fontWeight: 600,
        py: 2.6,
        borderBottom: `0.5px solid ${colors.border}`,
        "&:hover": {
          color: colors.panelAccent || colors.primary,
        },
      },
    },
    muiTableBodyCellProps: {
      sx: {
        color: colors.text,
        background: colors.rowBg,
        py: 1.8,
        borderBottom: `1px solid ${colors.border}`,
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: onRowClick ? () => onRowClick(row.original) : undefined,
      sx: {
        cursor: onRowClick ? "pointer" : "default",
        backgroundColor: colors.panelBg,
        "&:hover": {
          backgroundColor: `${colors.rowHover} !important`,
        },
        "&.Mui-selected": {
          backgroundColor: `${alpha(colors.primary, 0.12)} !important`,
        },
        "&.Mui-selected:hover": {
          backgroundColor: `${alpha(colors.primary, 0.18)} !important`,
        },
      },
    }),
    muiCircularProgressProps: {
      color: "secondary",
      thickness: 5,
      size: 55,
    },
    muiSkeletonProps: {
      animation: "pulse",
      height: 28,
    },

    // Actions
    enableRowActions: enableRowActions,
    positionActionsColumn: actionColumn?.pinned === "left" ? "first" : "last",
    displayColumnDefOptions: {
      "mrt-row-actions": {
        header: actionColumn?.headerName ?? "Actions",
        size: actionColumn?.width ?? 150,
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
    },
    renderRowActions: ({ row }) => {
      if (!actionColumn) return null;

      let initialActions: ActionConfig<T>[] = [];
      if (typeof actionColumn.actions === "function") {
        initialActions = actionColumn.actions(row.original);
      } else {
        initialActions = actionColumn.actions ?? [];
      }

      // Wrap onClick to pass row data
      const actions = initialActions.map((action) => ({
        ...action,
        onClick: () => action.onClick(row.original),
      }));

      return (
        <RowActionButtonGroup
          actions={actions}
          colors={colors}
          size="small"
          sx={{ justifyContent: "center" }}
        />
      );
    },

    // UI Features
    enableColumnOrdering: true,
    enableColumnResizing: true,
    layoutMode: "grid",
    defaultColumn: {
      minSize: 60,
      maxSize: 1000,
      grow: true,
    },
    enableRowVirtualization: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableGlobalFilter: false, // Enable internal search
    enableColumnFilters: true, // Enable column filters
    enableDensityToggle: true, // Enable density toggle
    enableFullScreenToggle: true, // Enable fullscreen toggle
    enableHiding: true, // Enable column hiding
    globalFilterFn: "contains", // Strict matching as requested

    // Empty State
    renderEmptyRowsFallback: () => (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          gap: 2,
          color: colors.textSecondary,
        }}
      >
        {emptyIcon}
        <Typography>{emptyMessage}</Typography>
      </Box>
    ),

    // Passthrough
    ...tableOptions,
  });

  // Callbacks
  useEffect(() => {
    if (onSelectionChanged) {
      onSelectionChanged(
        table.getSelectedRowModel().rows.map((row) => row.original),
      );
    }
  }, [table.getState().rowSelection, onSelectionChanged, table]);

  // Height styling
  const containerStyle = height === "auto" ? {} : { height, overflow: "auto" };

  return (
    <ThemeProvider theme={tableTheme}>
      <Box
        className={`dashboard-data-grid ${className}`}
        sx={{
          ...containerStyle,
          width: "100%",
        }}
      >
        <MaterialReactTable table={table} />
      </Box>
    </ThemeProvider>
  );
};

export default DashboardDataGrid;
