import React from "react";
import { Box, Badge } from "@mui/material";
import {
  SearchBar,
  FilterBar,
  DashboardActionButton,
} from "../Dashboard/shared";
import { CATEGORY_LABELS } from "../../templates/templateApi";

export interface TemplateFilters {
  search: string;
  category: string;
  type: string;
}

interface TemplateFiltersProps {
  filters: TemplateFilters;
  onFiltersChange: (filters: TemplateFilters) => void;
}

const categoryOptions = [
  { value: "", label: "All Categories" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "website", label: "Website" },
  { value: "store", label: "Store" },
];

const TemplateFilters = React.memo(function TemplateFilters({
  filters,
  onFiltersChange,
}: TemplateFiltersProps) {
  const activeFilterCount = [
    filters.search,
    filters.category,
    filters.type,
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  const handleReset = React.useCallback(() => {
    onFiltersChange({ search: "", category: "", type: "" });
  }, [onFiltersChange]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <SearchBar
        value={filters.search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onFiltersChange({ ...filters, search: e.target.value })
        }
        placeholder="Search templates..."
        fullWidth={false}
      />

      <FilterBar
        label="Category"
        value={filters.category}
        onChange={(e: React.ChangeEvent<{ value: unknown }>) =>
          onFiltersChange({ ...filters, category: e.target.value as string })
        }
        options={categoryOptions}
      />

      <FilterBar
        label="Type"
        value={filters.type}
        onChange={(e: React.ChangeEvent<{ value: unknown }>) =>
          onFiltersChange({ ...filters, type: e.target.value as string })
        }
        options={typeOptions}
      />

      {hasActiveFilters && (
        <Badge badgeContent={activeFilterCount} color="primary">
          <DashboardActionButton onClick={handleReset}>
            Reset Filters
          </DashboardActionButton>
        </Badge>
      )}
    </Box>
  );
});

export default TemplateFilters;
