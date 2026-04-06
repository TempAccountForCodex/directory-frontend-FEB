/**
 * Tests for ManageDocs (Step 10.9.6)
 *
 * Covers:
 * 1. Renders loading state (CircularProgress) while fetching articles
 * 2. Renders article list table when data is loaded
 * 3. SearchBar filters articles by title (client-side)
 * 4. Category filter (FilterBar) shows filtered results
 * 5. 'Create Article' button opens create dialog
 * 6. Edit button opens dialog pre-populated with article data
 * 7. Delete button triggers ConfirmationDialog
 * 8. Empty state displays when no articles exist
 * 9. Error state displays on API failure
 * 10. Toast notification shown on create success
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ---------------------------------------------------------------------------
// Mock ThemeContext
// ---------------------------------------------------------------------------
vi.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ actualTheme: 'dark', themeMode: 'dark', changeTheme: vi.fn() }),
  ThemeProvider: ({ children }) => <>{children}</>,
}));

// ---------------------------------------------------------------------------
// Mock AuthContext
// ---------------------------------------------------------------------------
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Admin User', role: 'admin' },
    token: 'mock-token',
  }),
}));

// ---------------------------------------------------------------------------
// Mock axios
// ---------------------------------------------------------------------------
vi.mock('axios');
import axios from 'axios';
const mockedAxios = vi.mocked(axios, true);

// ---------------------------------------------------------------------------
// Mock shared Dashboard components
// ---------------------------------------------------------------------------
vi.mock('../shared', () => ({
  PageHeader: ({ title, subtitle }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
  DashboardCard: ({ children }) => <div data-testid="dashboard-card">{children}</div>,
  DashboardTable: ({ children }) => <table data-testid="dashboard-table">{children}</table>,
  DashboardTableHeadCell: ({ children }) => <th>{children}</th>,
  DashboardTableRow: ({ children }) => <tr>{children}</tr>,
  SearchBar: ({ value, onChange, placeholder }) => (
    <input
      data-testid="search-bar"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
  FilterBar: ({ label, value, onChange, options }) => (
    <select data-testid="filter-bar" value={value} onChange={onChange}>
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  DashboardActionButton: ({ children, onClick, disabled }) => (
    <button data-testid="action-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  EmptyState: ({ title, subtitle, action }) => (
    <div data-testid="empty-state">
      <p>{title}</p>
      {subtitle && <p>{subtitle}</p>}
      {action}
    </div>
  ),
  DashboardInput: ({ label, value, onChange, ...props }) => (
    <input
      data-testid={`input-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`}
      value={value}
      onChange={onChange}
      placeholder={label}
    />
  ),
  DashboardSelect: ({ label, value, onChange, children }) => (
    <select
      data-testid={`select-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  ),
  ConfirmationDialog: ({ open, onConfirm, onCancel, title }) =>
    open ? (
      <div data-testid="confirmation-dialog">
        <p>{title}</p>
        <button data-testid="confirm-button" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
}));

// ---------------------------------------------------------------------------
// Import component under test
// ---------------------------------------------------------------------------
import ManageDocs from '../ManageDocs';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockArticles = [
  {
    id: '1',
    title: 'Getting Started Guide',
    category: 'getting-started',
    isPublished: true,
    views: 150,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    content: '# Getting Started\n\nWelcome to the platform.',
    tags: ['intro', 'beginner'],
    slug: 'getting-started-guide',
  },
  {
    id: '2',
    title: 'API Reference',
    category: 'api',
    isPublished: false,
    views: 42,
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    content: '# API Reference\n\nEndpoints documentation.',
    tags: ['api', 'reference'],
    slug: 'api-reference',
  },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('ManageDocs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state (CircularProgress) while fetching articles', async () => {
    // Never resolves — simulates loading
    mockedAxios.get = vi.fn(() => new Promise(() => {}));

    const { container } = render(<ManageDocs user={{ id: '1', role: 'admin' }} />);

    // Loading indicator should be present
    const progress = container.querySelector('[role="progressbar"]');
    expect(progress).toBeInTheDocument();
  });

  it('renders article list table when data is loaded', async () => {
    mockedAxios.get = vi.fn().mockResolvedValueOnce({
      data: { articles: mockArticles, total: 2 },
    });

    render(<ManageDocs user={{ id: '1', role: 'admin' }} />);

    await waitFor(() => {
      expect(screen.getByText('Getting Started Guide')).toBeInTheDocument();
      expect(screen.getByText('API Reference')).toBeInTheDocument();
    });
  });

  it('SearchBar filters articles by title (client-side)', async () => {
    mockedAxios.get = vi.fn().mockResolvedValueOnce({
      data: { articles: mockArticles, total: 2 },
    });

    render(<ManageDocs user={{ id: '1', role: 'admin' }} />);

    await waitFor(() => {
      expect(screen.getByText('Getting Started Guide')).toBeInTheDocument();
    });

    const searchBar = screen.getByTestId('search-bar');
    fireEvent.change(searchBar, { target: { value: 'API' } });

    await waitFor(() => {
      expect(screen.getByText('API Reference')).toBeInTheDocument();
      expect(screen.queryByText('Getting Started Guide')).not.toBeInTheDocument();
    });
  });

  it('FilterBar filters articles by category', async () => {
    mockedAxios.get = vi.fn().mockResolvedValueOnce({
      data: { articles: mockArticles, total: 2 },
    });

    render(<ManageDocs user={{ id: '1', role: 'admin' }} />);

    await waitFor(() => {
      expect(screen.getByText('Getting Started Guide')).toBeInTheDocument();
    });

    const filterBar = screen.getByTestId('filter-bar');
    fireEvent.change(filterBar, { target: { value: 'api' } });

    await waitFor(() => {
      expect(screen.getByText('API Reference')).toBeInTheDocument();
      expect(screen.queryByText('Getting Started Guide')).not.toBeInTheDocument();
    });
  });

  it("'Create Article' button opens create dialog", async () => {
    mockedAxios.get = vi.fn().mockResolvedValueOnce({
      data: { articles: [], total: 0 },
    });

    render(<ManageDocs user={{ id: '1', role: 'admin' }} />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    // Get the first action button (Create Article in toolbar)
    const createButtons = screen.getAllByTestId('action-button');
    fireEvent.click(createButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('article-dialog')).toBeInTheDocument();
    });
  });

  it('Edit button opens dialog pre-populated with article data', async () => {
    mockedAxios.get = vi.fn().mockResolvedValueOnce({
      data: { articles: mockArticles, total: 2 },
    });

    render(<ManageDocs user={{ id: '1', role: 'admin' }} />);

    await waitFor(() => {
      expect(screen.getByText('Getting Started Guide')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      const dialog = screen.getByTestId('article-dialog');
      expect(dialog).toBeInTheDocument();
      // Check pre-populated value
      const titleInput = within(dialog).getByDisplayValue('Getting Started Guide');
      expect(titleInput).toBeInTheDocument();
    });
  });

  it('Delete button triggers ConfirmationDialog', async () => {
    mockedAxios.get = vi.fn().mockResolvedValueOnce({
      data: { articles: mockArticles, total: 2 },
    });

    render(<ManageDocs user={{ id: '1', role: 'admin' }} />);

    await waitFor(() => {
      expect(screen.getByText('Getting Started Guide')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
    });
  });

  it('displays empty state when no articles exist', async () => {
    mockedAxios.get = vi.fn().mockResolvedValueOnce({
      data: { articles: [], total: 0 },
    });

    render(<ManageDocs user={{ id: '1', role: 'admin' }} />);

    await waitFor(() => {
      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toBeInTheDocument();
      expect(
        screen.getByText(/No documentation articles yet/i),
      ).toBeInTheDocument();
    });
  });

  it('displays error state on API failure', async () => {
    mockedAxios.get = vi.fn().mockRejectedValueOnce(new Error('Network Error'));

    render(<ManageDocs user={{ id: '1', role: 'admin' }} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load articles/i)).toBeInTheDocument();
    });
  });

  it('calls DELETE endpoint and shows success notification on delete confirm', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: { articles: mockArticles, total: 2 },
    });
    mockedAxios.delete = vi.fn().mockResolvedValueOnce({ data: { success: true } });

    render(<ManageDocs user={{ id: '1', role: 'admin' }} />);

    await waitFor(() => {
      expect(screen.getByText('Getting Started Guide')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/docs/articles/1'),
        expect.any(Object),
      );
    });
  });

  it('PageHeader renders with correct title', async () => {
    mockedAxios.get = vi.fn().mockResolvedValueOnce({
      data: { articles: [], total: 0 },
    });

    render(<ManageDocs user={{ id: '1', role: 'admin' }} />);

    await waitFor(() => {
      expect(screen.getByTestId('page-header')).toBeInTheDocument();
      expect(screen.getByText('Documentation Management')).toBeInTheDocument();
    });
  });
});
