import { forwardRef } from 'react';
import { Table, TableCell, TableContainer, TablePagination, TableRow } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * DashboardTable (LoginHistory exact chrome)
 * - INNER inset panel with rounded border (like Login history)
 * - header row bg strip + rounded top corners
 * - stronger separators
 * - generous paddings
 */
const DashboardTable = ({
  children,
  variant = 'inset', // ✅ this is the LoginHistory look
  tableSx,
  containerSx,
  tableProps = {},
  containerProps = {},
  colors,
}) => {
  const isInset = variant === 'inset';

  const BORDER = alpha(colors?.text || '#fff', 0.08);
  const HEADER_BG = alpha(colors?.text || '#fff', 0.02);
  const HEADER_DIVIDER = alpha(colors?.text || '#fff', 0.06);
  const ROW_DIVIDER = alpha(colors?.text || '#fff', 0.05);

  const baseTableSx = {
    borderCollapse: 'separate',
    borderSpacing: 0,
  };

  const tableChromeSx = colors
    ? {
        // header sizing + divider (matches LoginHistory)
        '& thead th': {
          backgroundColor: HEADER_BG,
          color: alpha(colors.text, 0.6),
          fontSize: '0.875rem',
          fontWeight: 500,
          paddingTop: '10px',
          paddingBottom: '10px',
          paddingLeft: '22px',
          paddingRight: '22px',
          borderBottom: `1px solid ${HEADER_DIVIDER}`,
        },

        // header rounded top corners
        '& thead th:first-of-type': { borderTopLeftRadius: '14px' },
        '& thead th:last-of-type': { borderTopRightRadius: '14px' },

        // body cells spacing + divider
        '& tbody td': {
          color: colors.text,
          fontSize: '0.875rem',
          fontWeight: 500,
          paddingTop: '20px',
          paddingBottom: '20px',
          paddingLeft: '22px',
          paddingRight: '22px',
          borderBottom: `1px solid ${ROW_DIVIDER} !important`,
          backgroundColor: 'transparent',
        },

        // last row no divider + rounded bottom corners
        '& tbody tr:last-of-type td': {
          borderBottom: 'none !important',
        },
        '& tbody tr:last-of-type td:first-of-type': { borderBottomLeftRadius: '14px' },
        '& tbody tr:last-of-type td:last-of-type': { borderBottomRightRadius: '14px' },
      }
    : {};

  const { sx: tableSxProp, ...tableRest } = tableProps;
  const { sx: containerSxProp, ...containerRest } = containerProps;

  return (
    <TableContainer
      {...containerRest}
      sx={[
        {
          overflowX: 'auto',
          borderRadius: '14px',
          border: `1px solid ${alpha(colors.text, 0.08)}`,
          ...(isInset
            ? {
                mt: 2,
                borderRadius: '14px',
                border: `1px solid ${BORDER}`,
                overflow: 'hidden',
                // subtle inner panel feel (same as LoginHistory)
                backgroundColor: alpha(colors?.text || '#fff', 0.01),
              }
            : {}),
        },
        containerSx,
        containerSxProp,
      ]}
    >
      <Table {...tableRest} sx={[baseTableSx, tableChromeSx, tableSx, tableSxProp]}>
        {children}
      </Table>
    </TableContainer>
  );
};

export const DashboardTableHeadCell = ({ colors, interactive = false, sx, ...props }) => {
  const baseStyles = {
    color: alpha(colors?.text || colors?.panelText || '#fff', 0.6),
    fontSize: '0.85rem',
    fontWeight: 500,
    py: '14px',
    px: '22px',
    border: 'none',
    borderBottom: `1px solid ${alpha(colors?.text || colors?.panelText || '#fff', 0.06)}`,
    backgroundColor: alpha(colors?.text || colors?.panelText || '#fff', 0.02),
  };

  const interactiveStyles = interactive
    ? {
        cursor: 'pointer',
        userSelect: 'none',
        '&:hover': {
          color: colors?.panelAccent || colors?.primary,
        },
      }
    : {};

  return <TableCell sx={[baseStyles, interactiveStyles, sx]} {...props} />;
};

export const DashboardTableRow = forwardRef(({ colors, sx, ...props }, ref) => {
  const baseStyles = colors
    ? {
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: alpha(colors.text, 0.015),
        },
        transition: 'background 0.2s ease',
      }
    : {};

  return <TableRow ref={ref} sx={[baseStyles, sx]} {...props} />;
});

DashboardTableRow.displayName = 'DashboardTableRow';

export const DashboardTablePagination = ({ colors, sx, ...props }) => {
  const baseStyles = colors
    ? {
        color: colors.text,
        borderTop: `1px solid ${alpha(colors.text, 0.06)}`,
        '& .MuiTablePagination-select': { color: colors.text },
        '& .MuiTablePagination-selectIcon': { color: colors.text },
        '& .MuiTablePagination-displayedRows': { color: colors.textSecondary },
        '& .MuiTablePagination-actions button': {
          color: colors.text,
          '&:hover': { background: alpha(colors.primary, 0.15) },
          '&.Mui-disabled': { color: colors.textTertiary },
        },
      }
    : {};

  return <TablePagination {...props} sx={[baseStyles, sx]} />;
};

export default DashboardTable;
