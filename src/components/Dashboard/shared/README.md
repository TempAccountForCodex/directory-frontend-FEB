# Shared Dashboard Components

Reusable components for consistent styling and behavior across all dashboard pages (Insights, Websites, Stores, etc.).

## Components

### PageHeader

Main page header with title, subtitle, and optional action buttons and tabs.

**Usage:**

```jsx
import { PageHeader } from './shared';
import { Button } from '@mui/material';
import { Plus } from 'lucide-react';

<PageHeader
  title="My Websites"
  subtitle="Create and manage your websites"
  action={
    <Button variant="contained" startIcon={<Plus size={18} />}>
      Create New Website
    </Button>
  }
  tabs={<TabNavigation ... />}
/>
```

**Props:**

- `title` (string, required) - Main heading text
- `subtitle` (string, required) - Subheading/description text
- `action` (ReactNode, optional) - Action button(s) in the top right
- `tabs` (ReactNode, optional) - Tabs component to render below the header

---

### StatCard

Metric display card with icon, value, and optional trend line.

**Usage:**

```jsx
import { StatCard } from './shared';
import { FileText } from 'lucide-react';

<StatCard title="Total Insights" value="42" icon={FileText} trend={15} trendDirection="up" />;
```

**Props:**

- `title` (string, required) - Stat label/title
- `value` (string|number, required) - Stat value to display
- `icon` (Component, required) - Lucide icon component
- `trend` (number|string, optional) - Trend value (e.g., 15 or "15%")
- `trendLabel` (string, optional) - Trend suffix text (defaults to month comparison)
- `trendDirection` (string, optional) - "up", "down", or "flat"

---

### TabNavigation

Tab navigation component with consistent styling.

**Usage:**

```jsx
import { TabNavigation } from './shared';
import { FileText } from 'lucide-react';

const [activeTab, setActiveTab] = useState('insights');

<TabNavigation
  value={activeTab}
  onChange={(e, newValue) => setActiveTab(newValue)}
  tabs={[
    { label: 'Insights', value: 'insights', icon: <FileText size={18} /> },
    { label: 'Pending Approval', value: 'pending' },
  ]}
/>;
```

**Props:**

- `tabs` (Array, required) - Array of tab objects with `{label, value, icon (optional)}`
- `value` (string, required) - Currently active tab value
- `onChange` (function, required) - Tab change handler function

---

### SearchBar

Search input with consistent styling.

**Usage:**

```jsx
import { SearchBar } from './shared';

const [searchQuery, setSearchQuery] = useState('');

<SearchBar
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search by title, category, author..."
  fullWidth={true}
/>;
```

**Props:**

- `value` (string, required) - Current search query value
- `onChange` (function, required) - Change handler function
- `placeholder` (string, optional) - Placeholder text (default: "Search...")
- `fullWidth` (boolean, optional) - Full width or fixed (default: true)

---

### FilterBar

Dropdown filter with consistent styling.

**Usage:**

```jsx
import { FilterBar } from './shared';

const [statusFilter, setStatusFilter] = useState('all');

<FilterBar
  label="Status"
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  options={[
    { value: 'all', label: 'All Status' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
  ]}
  fullWidth={false}
/>;
```

**Props:**

- `label` (string, required) - Filter label text
- `value` (string, required) - Currently selected filter value
- `onChange` (function, required) - Change handler function
- `options` (Array, required) - Array of option objects with `{value, label}`
- `fullWidth` (boolean, optional) - Full width or fixed (default: false)

---

### DashboardTable

Reusable table wrapper with consistent spacing and header cell styling.

**Usage:**

```jsx
import { DashboardTable, DashboardTableHeadCell } from './shared';
import { TableHead, TableRow, TableBody, TableCell } from '@mui/material';

<DashboardTable>
  <TableHead>
    <TableRow>
      <DashboardTableHeadCell colors={colors}>Name</DashboardTableHeadCell>
      <DashboardTableHeadCell colors={colors} align="right">
        Count
      </DashboardTableHeadCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>Example</TableCell>
      <TableCell align="right">12</TableCell>
    </TableRow>
  </TableBody>
</DashboardTable>
```

**Props (DashboardTable):**

- `variant` (string, optional) - `spaced` or `flat` (default: `spaced`)
- `tableSx` (object, optional) - MUI sx overrides for the table
- `containerSx` (object, optional) - MUI sx overrides for the container
- `tableProps` (object, optional) - Extra props for `Table`
- `containerProps` (object, optional) - Extra props for `TableContainer`

**Props (DashboardTableHeadCell):**

- `colors` (object, required) - Dashboard colors from `getDashboardColors`
- `interactive` (boolean, optional) - Adds hover + pointer styles for sortable headers
- `sx` (object, optional) - MUI sx overrides

---

### EmptyState

Empty state display for "no data" scenarios.

**Usage:**

```jsx
import { EmptyState } from './shared';
import { FileText } from 'lucide-react';
import { Button } from '@mui/material';

<EmptyState
  icon={<FileText size={48} color="#64748b" />}
  title="No insights found"
  subtitle="Create your first insight to get started!"
  action={<Button variant="contained">Create Insight</Button>}
/>;
```

**Props:**

- `icon` (ReactNode, optional) - Icon component to display
- `title` (string, required) - Main message title
- `subtitle` (string, optional) - Subtitle/description
- `action` (ReactNode, optional) - Action button or component

---

## Layout Pattern

All dashboard pages should follow this consistent layout:

```jsx
<Box>
  {/* 1. Page Header */}
  <PageHeader
    title="Page Title"
    subtitle="Page description"
    action={<Button>Action</Button>}
    tabs={<TabNavigation ... />}
  />

  {/* 2. Stats Cards (optional) */}
  <Grid container spacing={3} sx={{ mb: 4 }}>
    <Grid item xs={12} sm={6} md={3}>
      <StatCard ... />
    </Grid>
    {/* ... more stats */}
  </Grid>

  {/* 3. Search and Filters */}
  <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
    <Box sx={{ flex: 1, minWidth: 250 }}>
      <SearchBar ... />
    </Box>
    <FilterBar ... />
    <FilterBar ... />
  </Box>

  {/* 4. Content or Empty State */}
  {hasData ? (
    <ContentTable />
  ) : (
    <EmptyState ... />
  )}
</Box>
```

## Spacing Guidelines

- Page header margin bottom: `mb: { xs: 2, md: 3 }`
- Stats grid spacing: `spacing={3}`, `sx={{ mb: 4 }}`
- Search/filter row margin: `mb: 4`
- Search/filter gap: `gap: 2`
- Tab margin bottom: `mb: 3`

## Migration from Old Components

When updating existing dashboard pages to use shared components:

1. Import shared components:

   ```jsx
   import {
     PageHeader,
     StatCard,
     TabNavigation,
     SearchBar,
     FilterBar,
     DashboardTable,
     EmptyState,
   } from './shared';
   ```

2. Replace inline StatCard definitions with imported component
3. Replace custom header markup with PageHeader component
4. Replace custom tabs with TabNavigation component
5. Replace custom search inputs with SearchBar component
6. Replace custom filters with FilterBar component
7. Replace table wrappers with DashboardTable component
8. Replace custom empty states with EmptyState component

## Benefits

- ✅ **Consistency**: All dashboard pages look and behave the same way
- ✅ **Maintainability**: Update one component to update all pages
- ✅ **Reusability**: No duplicate code across dashboard pages
- ✅ **Performance**: Smaller bundle size (shared code)
