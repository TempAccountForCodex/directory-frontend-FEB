import type {
  MRT_ColumnDef,
  MRT_Row,
  MRT_TableOptions,
} from "material-react-table";
import type { ReactNode } from "react";

/**
 * Action configuration for row action buttons.
 * Matches the existing RowActionButtonGroup API.
 */
export interface ActionConfig<T extends object = object> {
  /** Action name displayed in tooltip */
  label: string;
  /** Icon element (lucide-react icon) */
  icon: ReactNode;
  /** Click handler receiving the row data */
  onClick: (rowData: T) => void;
  /** Icon color (default: colors.textSecondary) */
  color?: string;
  /** Icon color on hover */
  hoverColor?: string;
  /** Button background color */
  background?: string;
  /** Button background on hover */
  hoverBackground?: string;
  /** Disable the action - can be boolean or function of row data */
  disabled?: boolean | ((rowData: T) => boolean);
  /** Show/hide the action - can be boolean or function of row data */
  show?: boolean | ((rowData: T) => boolean);
  /** Custom tooltip text (defaults to label) */
  tooltip?: string;
}

/**
 * Configuration for the actions column.
 */
export interface ActionColumnConfig<T extends object = object> {
  /** Action definitions - array or function returning array based on row */
  actions: ActionConfig<T>[] | ((rowData: T) => ActionConfig<T>[]);
  /** Column width in pixels (default: 150) */
  width?: number;
  /** Pin column position (default: 'right') */
  pinned?: "left" | "right";
  /** Header name (default: 'Actions') */
  headerName?: string;
}

/**
 * Server-side pagination configuration.
 */
export interface ServerSidePaginationConfig {
  /** Total number of rows across all pages */
  totalRows: number;
  /** Current page (1-indexed) */
  currentPage: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange: (size: number) => void;
}

/**
 * Props for the DashboardDataGrid component.
 */
export interface DashboardDataGridProps<T extends object = object> {
  // Required props
  /** Array of row data to display */
  rowData: T[];
  /** Column definitions */
  columnDefs: MRT_ColumnDef<T>[];
  /** Unique identifier for column state persistence */
  gridId: string;

  // Action column
  /** Configuration for the actions column */
  actionColumn?: ActionColumnConfig<T>;

  // Pagination
  /** Enable pagination (default: true) */
  pagination?: boolean;
  /** Rows per page (default: 10) */
  paginationPageSize?: number;
  /** Page size options (default: [5, 10, 25, 50, 100]) */
  paginationPageSizeSelector?: number[];
  /** Server-side pagination config (overrides client-side) */
  serverSidePagination?: ServerSidePaginationConfig;

  // Row configuration
  /** Function to get unique row ID */
  getRowId?: (originalRow: T, index: number, parentRow: MRT_Row<T>) => string;
  /** Row height in pixels (default: 52) */
  rowHeight?: number;
  /** Header height in pixels (default: 48) */
  headerHeight?: number;

  // Loading & empty states
  /** Show loading overlay */
  loading?: boolean;
  /** Message when no rows */
  emptyMessage?: string;
  /** Icon for empty state */
  emptyIcon?: ReactNode;

  // Callbacks
  /** Callback when row is clicked */
  onRowClick?: (data: T) => void;
  /** Callback when selection changes */
  onSelectionChanged?: (selectedRows: T[]) => void;

  // Row selection
  /** Enable row selection */
  rowSelection?: boolean;
  /** Enable multi row selection */
  enableMultiRowSelection?: boolean;

  // Search
  /** External global filter value */
  globalFilter?: string;
  /** Callback for global filter changes */
  onGlobalFilterChange?: (updaterOrValue: any) => void;

  // Styling
  /** Additional CSS class for the grid container */
  className?: string;
  /** Container height (default: 'auto') */
  height?: string | number;

  // MRT passthrough
  /** Additional MRT options */
  tableOptions?: Partial<MRT_TableOptions<T>>;
}

/**
 * Theme colors interface (subset of getDashboardColors return type).
 */
export interface DashboardColors {
  panelBg: string;
  panelBorder: string;
  panelHover: string;
  panelText: string;
  panelMuted: string;
  rowBg: string;
  rowHover: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
}
