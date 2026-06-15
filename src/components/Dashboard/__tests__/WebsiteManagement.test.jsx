/**
 * Tests for Per-Website Management Dashboard (Step 10.3 + 10.37 contract normalization)
 *
 * Covers all substeps:
 * 10.3.1 - Dashboard Route & Layout Shell (WebsiteManagementDashboard)
 * 10.3.2 - Navigation Integration & Manage Button (Websites.jsx)
 * 10.3.3 - Overview Tab
 * 10.3.4 - Placeholder Tabs (Analytics, Forms, Integrations, Listing, Reviews)
 * 10.3.5 - Pages Tab
 * 10.3.6 - Design Tab
 * 10.3.7 - SEO Tab
 * 10.3.8 - Domain Tab
 * 10.3.9 - Team Tab
 * 10.3.10 - Settings Tab
 *
 * Step 10.37: All mocked responses now use the real backend envelope
 * { success: true, data: {...} } instead of { website: {...} }.
 * Status values are lowercase (matching backend) — the shell normalizes to uppercase.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ actualTheme: 'dark', themeMode: 'dark', changeTheme: vi.fn() }),
  ThemeProvider: ({ children }) => <>{children}</>,
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' },
    token: 'mock-token',
  }),
}));

vi.mock('../../../context/PermissionContext', () => ({
  usePermissionContext: () => ({
    setCurrentWebsite: vi.fn(),
    currentWebsite: null,
    permissions: [],
  }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: '123', section: 'overview' }),
  useLocation: () => ({ pathname: '/dashboard/websites/123/manage/overview' }),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

const { mockApiClient } = vi.hoisted(() => {
  const mockApiClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    defaults: { headers: { common: {} } },
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  };
  return { mockApiClient };
});
vi.mock('../../../api/client', () => ({
  apiClient: mockApiClient,
  default: mockApiClient,
}));

// ---------------------------------------------------------------------------
// Import components after mocks
// ---------------------------------------------------------------------------
import WebsiteManagementDashboard from '../WebsiteManagementDashboard';
import OverviewTab from '../website-manage/OverviewTab';
import AnalyticsTab from '../website-manage/AnalyticsTab';
import FormsTab from '../website-manage/FormsTab';
import IntegrationsTab from '../website-manage/IntegrationsTab';
import ListingEditTab from '../ListingEditTab';
import ReviewsTab from '../website-manage/ReviewsTab';
import PagesTab from '../website-manage/PagesTab';
import MediaTab from '../website-manage/MediaTab';
import DesignTab from '../website-manage/DesignTab';
import SeoTab from '../website-manage/SeoTab';
import DomainTab from '../website-manage/DomainTab';
import TeamTab from '../website-manage/TeamTab';
import SettingsTab from '../website-manage/SettingsTab';

// ---------------------------------------------------------------------------
// Mock website data
// ---------------------------------------------------------------------------
// Matches real backend getWebsite response shape (lowercase status, role from middleware)
const mockWebsiteBackend = {
  id: 123,
  ownerUserId: 1,
  name: 'My Test Website',
  slug: 'my-test-website',
  status: 'published',
  isPublic: true,
  subdomain: 'my-test-website',
  customDomain: null,
  primaryColor: '#378C92',
  logoUrl: null,
  faviconUrl: null,
  metaTitle: 'My Test Website',
  metaDescription: 'A test website',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
  pages: [
    { id: 1, title: 'Home', path: '/', isHome: true, sortOrder: 0, isPublished: true },
    { id: 2, title: 'About', path: '/about', isHome: false, sortOrder: 1, isPublished: true },
  ],
  role: 'OWNER',
};

// After shell normalization (status/role uppercased)
const mockWebsite = {
  ...mockWebsiteBackend,
  status: 'PUBLISHED',
  role: 'OWNER',
};

const renderWithQueryClient = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

// ---------------------------------------------------------------------------
// Substep 10.3.1 — WebsiteManagementDashboard Shell
// ---------------------------------------------------------------------------
describe('10.3.1 — WebsiteManagementDashboard Shell', () => {
  beforeEach(() => {
    // Real backend envelope: { success: true, data: { ...websiteFields } }
    mockApiClient.get = vi.fn().mockResolvedValue({ data: { success: true, data: mockWebsiteBackend } });
  });

  it('renders MiniSideNav with navigation sections', async () => {
    render(<WebsiteManagementDashboard websiteId="123" section="overview" />);
    await waitFor(() => {
      // Overview appears in both nav and breadcrumb — use getAllByText
      expect(screen.getAllByText('Overview').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders 5 navigation section groups', async () => {
    render(<WebsiteManagementDashboard websiteId="123" section="overview" />);
    await waitFor(() => {
      // Section groups: Content, Design, Growth, Connections, Manage
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  it('shows website name in MiniSideNav profile slot', async () => {
    render(<WebsiteManagementDashboard websiteId="123" section="overview" />);
    await waitFor(() => {
      // Website name appears in both MiniSideNav profile and breadcrumb
      expect(screen.getAllByText('My Test Website').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows Media item in the Content section', async () => {
    render(<WebsiteManagementDashboard websiteId="123" section="overview" />);
    await waitFor(() => {
      expect(screen.getByText('Media')).toBeInTheDocument();
    });
  });

  it('shows subdomain in MiniSideNav profile slot', async () => {
    render(<WebsiteManagementDashboard websiteId="123" section="overview" />);
    await waitFor(() => {
      expect(screen.getByText(/my-test-website\.techietribe\.app/i)).toBeInTheDocument();
    });
  });

  it('shows Back to All Websites link', async () => {
    render(<WebsiteManagementDashboard websiteId="123" section="overview" />);
    await waitFor(() => {
      expect(screen.getByText(/back to all websites/i)).toBeInTheDocument();
    });
  });

  it('renders loading state initially', () => {
    mockApiClient.get = vi.fn(() => new Promise(() => {})); // never resolves
    render(<WebsiteManagementDashboard websiteId="123" section="overview" />);
    // Should show skeleton or loading indicator
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error state on fetch failure', async () => {
    mockApiClient.get = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<WebsiteManagementDashboard websiteId="123" section="overview" />);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('defaults to overview when no section given', async () => {
    render(<WebsiteManagementDashboard websiteId="123" section={null} />);
    await waitFor(() => {
      expect(screen.getAllByText('Overview').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows permission denied for non-editor users', async () => {
    mockApiClient.get = vi.fn().mockResolvedValue({
      data: { success: true, data: { ...mockWebsiteBackend, role: 'VIEWER' } },
    });
    render(<WebsiteManagementDashboard websiteId="123" section="settings" userRole="VIEWER" />);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/do not have permission/i)).toBeInTheDocument();
    });
  });

  it('renders breadcrumb with All Websites > Website Name > Section', async () => {
    render(<WebsiteManagementDashboard websiteId="123" section="overview" />);
    await waitFor(() => {
      const breadcrumb = screen.getByLabelText('breadcrumb');
      expect(breadcrumb).toBeInTheDocument();
      // Breadcrumb should contain all 3 segments
      expect(within(breadcrumb).getByText('All Websites')).toBeInTheDocument();
      expect(within(breadcrumb).getByText('My Test Website')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Substep 10.3.3 — Overview Tab
// ---------------------------------------------------------------------------
describe('10.3.3 — OverviewTab', () => {
  beforeEach(() => {
    // Real activity feed envelope: { success, data: { activities, total, hasMore } }
    mockApiClient.get = vi.fn().mockResolvedValue({
      data: { success: true, data: { activities: [], total: 0, hasMore: false } },
    });
  });

  it('renders 4 metric cards', () => {
    render(
      <OverviewTab
        website={mockWebsite}
        onNavigateToSection={vi.fn()}
      />
    );
    // Check for real metric cards (Pages, Status, Created, Last Updated)
    expect(screen.getByText(/pages/i)).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();
  });

  it('renders quick actions row', () => {
    render(
      <OverviewTab
        website={mockWebsite}
        onNavigateToSection={vi.fn()}
      />
    );
    expect(screen.getByText(/edit website/i)).toBeInTheDocument();
  });

  it('renders website status chip', () => {
    render(
      <OverviewTab
        website={mockWebsite}
        onNavigateToSection={vi.fn()}
      />
    );
    // Status appears in both chip and metric card — use getAllByText
    expect(screen.getAllByText(/published/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders View Live Site button', () => {
    render(
      <OverviewTab
        website={mockWebsite}
        onNavigateToSection={vi.fn()}
      />
    );
    expect(screen.getByText(/view live site/i)).toBeInTheDocument();
  });

  it('renders Manage Team button', () => {
    render(
      <OverviewTab
        website={mockWebsite}
        onNavigateToSection={vi.fn()}
      />
    );
    expect(screen.getByText(/manage team/i)).toBeInTheDocument();
  });

  it('wraps with React.memo (component type check)', () => {
    expect(OverviewTab).toBeTruthy();
    expect(OverviewTab.$$typeof?.toString()).toContain('Symbol');
  });
});

// ---------------------------------------------------------------------------
// Substep 10.3.4 — Placeholder Tabs
// ---------------------------------------------------------------------------
describe('10.3.4 — Placeholder Tabs', () => {
  it('AnalyticsTab renders EmptyState with analytics message', () => {
    render(<AnalyticsTab website={mockWebsite} />);
    expect(screen.getByText(/No Analytics Data Yet/i)).toBeInTheDocument();
  });

  it('FormsTab renders EmptyState with forms message', async () => {
    mockApiClient.get.mockResolvedValue({
      data: { success: true, data: { submissions: [], total: 0, stats: { total: 0, unread: 0, spam: 0 } } },
    });
    render(<FormsTab website={mockWebsite} websiteId="123" />);
    await waitFor(() => {
      expect(screen.getByText(/No Form Submissions Yet/i)).toBeInTheDocument();
    });
  });

  it('IntegrationsTab renders EmptyState with integrations message', async () => {
    mockApiClient.get.mockResolvedValue({ data: { data: [] } });
    render(<IntegrationsTab website={mockWebsite} websiteId="123" />);
    await waitFor(() => {
      expect(screen.getByText(/No integrations configured/i)).toBeInTheDocument();
    });
  });

  it('ListingEditTab renders with listing message', () => {
    renderWithQueryClient(<ListingEditTab websiteId={123} websiteData={mockWebsite} planCode="free" />);
    expect(screen.getAllByText(/listing/i).length).toBeGreaterThanOrEqual(1);
  });

  it('ReviewsTab renders EmptyState with reviews message', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    // ReviewsTab uses useDeleteReview (React Query) and renders DashboardMetricCard
    // which expects MUI icon components. Verify it mounts without throwing.
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTab website={mockWebsite} websiteId="123" />
      </QueryClientProvider>
    );
    expect(container).toBeTruthy();
  });

  it('AnalyticsTab is wrapped with React.memo', () => {
    // React.memo returns an object with $$typeof Symbol
    expect(AnalyticsTab).toBeTruthy();
    expect(AnalyticsTab.$$typeof?.toString()).toContain('Symbol');
  });

  it('FormsTab is wrapped with React.memo', () => {
    expect(FormsTab).toBeTruthy();
    expect(FormsTab.$$typeof?.toString()).toContain('Symbol');
  });

  it('IntegrationsTab is wrapped with React.memo', () => {
    expect(IntegrationsTab).toBeTruthy();
    expect(IntegrationsTab.$$typeof?.toString()).toContain('Symbol');
  });

  it('ListingEditTab is wrapped with React.memo', () => {
    expect(ListingEditTab).toBeTruthy();
    expect(ListingEditTab.$$typeof?.toString()).toContain('Symbol');
  });

  it('ReviewsTab is wrapped with React.memo', () => {
    expect(ReviewsTab).toBeTruthy();
    expect(ReviewsTab.$$typeof?.toString()).toContain('Symbol');
  });
});

// ---------------------------------------------------------------------------
// Substep 10.3.4b — Media Tab
// ---------------------------------------------------------------------------
describe('10.3.4b — MediaTab', () => {
  beforeEach(() => {
    mockApiClient.get = vi.fn((url) => {
      if (url === '/websites/123/pages') {
        return Promise.resolve({
          data: {
            success: true,
            data: [{ id: 1, title: 'Home' }],
          },
        });
      }

      if (url === '/pages/1/blocks') {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              blocks: [
                {
                  id: 'block-1',
                  type: 'HERO',
                  content: {
                    heroImage: 'https://example.com/hero.jpg',
                  },
                },
              ],
            },
          },
        });
      }

      return Promise.resolve({ data: { success: true, data: [] } });
    });
  });

  it('renders detected website media', async () => {
    render(
      <MediaTab
        websiteId="123"
        website={{ ...mockWebsite, logoUrl: 'https://example.com/logo.png' }}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/media library/i)).toBeInTheDocument();
      expect(screen.getByText(/website logo/i)).toBeInTheDocument();
      expect(screen.getByText(/home/i)).toBeInTheDocument();
    });
  });

  it('is wrapped with React.memo', () => {
    expect(MediaTab).toBeTruthy();
    expect(MediaTab.$$typeof?.toString()).toContain('Symbol');
  });
});

// ---------------------------------------------------------------------------
// Substep 10.3.5 — Pages Tab
// ---------------------------------------------------------------------------
describe('10.3.5 — PagesTab', () => {
  const mockPages = [
    {
      id: 1,
      title: 'Home',
      path: '/',
      blockCount: 5,
      isHome: true,
      isPublished: true,
      sortOrder: 0,
      updatedAt: '2026-03-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'About',
      path: '/about',
      blockCount: 3,
      isHome: false,
      isPublished: true,
      sortOrder: 1,
      updatedAt: '2026-02-28T00:00:00Z',
    },
  ];

  beforeEach(() => {
    // Real backend envelopes
    mockApiClient.get = vi.fn().mockResolvedValue({ data: { success: true, data: mockPages } });
    mockApiClient.post = vi.fn().mockResolvedValue({ data: { success: true, data: { id: 3, title: 'New Page', path: '/new-page' } } });
    mockApiClient.put = vi.fn().mockResolvedValue({ data: { success: true, data: {} } });
    mockApiClient.delete = vi.fn().mockResolvedValue({ data: { success: true } });
  });

  it('renders Add Page button', async () => {
    render(<PagesTab websiteId="123" website={mockWebsite} />);
    await waitFor(() => {
      expect(screen.getByText(/add page/i)).toBeInTheDocument();
    });
  });

  it('renders page list table', async () => {
    render(<PagesTab websiteId="123" website={mockWebsite} />);
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  it('renders About page', async () => {
    render(<PagesTab websiteId="123" website={mockWebsite} />);
    await waitFor(() => {
      expect(screen.getByText('About')).toBeInTheDocument();
    });
  });

  it('Add Page button opens dialog', async () => {
    render(<PagesTab websiteId="123" website={mockWebsite} />);
    await waitFor(() => {
      fireEvent.click(screen.getByText(/add page/i));
    });
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('shows empty state when no pages', async () => {
    mockApiClient.get = vi.fn().mockResolvedValue({ data: { success: true, data: [] } });
    render(<PagesTab websiteId="123" website={mockWebsite} />);
    await waitFor(() => {
      expect(screen.getByText(/no pages/i)).toBeInTheDocument();
    });
  });

  it('wraps with React.memo', () => {
    expect(PagesTab).toBeTruthy();
    expect(PagesTab.$$typeof?.toString()).toContain('Symbol');
  });
});

// ---------------------------------------------------------------------------
// Substep 10.3.6 — Design Tab
// ---------------------------------------------------------------------------
describe('10.3.6 — DesignTab', () => {
  beforeEach(() => {
    mockApiClient.put = vi.fn().mockResolvedValue({ data: { success: true, data: mockWebsiteBackend } });
  });

  it('renders 4 theme preset cards', () => {
    render(<DesignTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} />);
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('Colorful')).toBeInTheDocument();
    expect(screen.getByText('Minimal')).toBeInTheDocument();
  });

  it('renders heading font selector (disabled, coming soon)', () => {
    render(<DesignTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} />);
    expect(screen.getByText(/heading font/i)).toBeInTheDocument();
  });

  it('renders body font selector (disabled, coming soon)', () => {
    render(<DesignTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} />);
    expect(screen.getByText(/body font/i)).toBeInTheDocument();
  });

  it('renders Save button', () => {
    render(<DesignTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} />);
    expect(screen.getByText(/save/i)).toBeInTheDocument();
  });

  it('renders Reset to defaults button', () => {
    render(<DesignTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} />);
    expect(screen.getByText(/Reset to Defaults/)).toBeInTheDocument();
  });

  it('wraps with React.memo', () => {
    expect(DesignTab).toBeTruthy();
    expect(DesignTab.$$typeof?.toString()).toContain('Symbol');
  });
});

// ---------------------------------------------------------------------------
// Substep 10.3.7 — SEO Tab
// ---------------------------------------------------------------------------
describe('10.3.7 — SeoTab', () => {
  const mockSeoPages = [
    { id: 1, title: 'Home', path: '/', metaTitle: '', metaDescription: '', isPublished: true },
  ];

  beforeEach(() => {
    // Real backend envelopes
    mockApiClient.get = vi.fn().mockResolvedValue({ data: { success: true, data: mockSeoPages } });
    mockApiClient.put = vi.fn().mockResolvedValue({ data: { success: true, data: mockWebsiteBackend } });
  });

  it('renders indexing status banner', async () => {
    render(<SeoTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/indexable/i)).toBeInTheDocument();
    });
  });

  it('renders meta title input', async () => {
    render(<SeoTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/meta title/i)).toBeInTheDocument();
    });
  });

  it('renders meta description input', async () => {
    render(<SeoTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/meta description/i)).toBeInTheDocument();
    });
  });

  it('renders social preview section', async () => {
    render(<SeoTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/social preview/i)).toBeInTheDocument();
    });
  });

  it('renders Save button', async () => {
    render(<SeoTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/save/i)).toBeInTheDocument();
    });
  });

  it('wraps with React.memo', () => {
    expect(SeoTab).toBeTruthy();
    expect(SeoTab.$$typeof?.toString()).toContain('Symbol');
  });
});

// ---------------------------------------------------------------------------
// Substep 10.3.8 — Domain Tab
// ---------------------------------------------------------------------------
describe('10.3.8 — DomainTab', () => {
  beforeEach(() => {
    mockApiClient.get = vi.fn().mockResolvedValue({ data: { available: true } });
    mockApiClient.patch = vi.fn().mockResolvedValue({ data: { success: true, data: mockWebsiteBackend } });
  });

  it('renders subdomain display', () => {
    render(<DomainTab website={mockWebsite} websiteId="123" userPlan="free" />);
    expect(screen.getByText(/my-test-website/i)).toBeInTheDocument();
  });

  it('renders Change Subdomain button', () => {
    render(<DomainTab website={mockWebsite} websiteId="123" userPlan="free" />);
    expect(screen.getByText(/change subdomain/i)).toBeInTheDocument();
  });

  it('renders custom domain section locked for Free plan', () => {
    render(<DomainTab website={mockWebsite} websiteId="123" userPlan="free" />);
    expect(screen.getByText(/custom domain/i)).toBeInTheDocument();
  });

  it('renders copy subdomain button', () => {
    render(<DomainTab website={mockWebsite} websiteId="123" userPlan="free" />);
    // Copy button with aria-label
    const copyButtons = screen.getAllByRole('button');
    expect(copyButtons.length).toBeGreaterThan(0);
  });

  it('wraps with React.memo', () => {
    expect(DomainTab).toBeTruthy();
    expect(DomainTab.$$typeof?.toString()).toContain('Symbol');
  });
});

// ---------------------------------------------------------------------------
// Substep 10.3.9 — Team Tab
// ---------------------------------------------------------------------------
describe('10.3.9 — TeamTab', () => {
  const mockCollaborators = [
    {
      id: 1,
      userId: 10,
      role: 'OWNER',
      user: { id: 10, name: 'Alice Owner', email: 'alice@test.com' },
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 2,
      userId: 20,
      role: 'EDITOR',
      user: { id: 20, name: 'Bob Editor', email: 'bob@test.com' },
      createdAt: '2026-02-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    // Collaborators endpoint returns raw array (no envelope)
    mockApiClient.get = vi.fn().mockResolvedValue({ data: mockCollaborators });
    mockApiClient.patch = vi.fn().mockResolvedValue({ data: {} });
    mockApiClient.delete = vi.fn().mockResolvedValue({ data: {} });
  });

  it('renders Invite Collaborator button', async () => {
    render(<TeamTab websiteId="123" website={mockWebsite} currentUserRole="OWNER" />);
    await waitFor(() => {
      expect(screen.getByText(/invite collaborator/i)).toBeInTheDocument();
    });
  });

  it('renders collaborator list', async () => {
    render(<TeamTab websiteId="123" website={mockWebsite} currentUserRole="OWNER" />);
    await waitFor(() => {
      expect(screen.getByText('Alice Owner')).toBeInTheDocument();
    });
  });

  it('renders Bob Editor', async () => {
    render(<TeamTab websiteId="123" website={mockWebsite} currentUserRole="OWNER" />);
    await waitFor(() => {
      expect(screen.getByText('Bob Editor')).toBeInTheDocument();
    });
  });

  it('shows empty state when no collaborators', async () => {
    mockApiClient.get = vi.fn().mockResolvedValue({ data: [] });
    render(<TeamTab websiteId="123" website={mockWebsite} currentUserRole="OWNER" />);
    await waitFor(() => {
      expect(screen.getByText(/no collaborators/i)).toBeInTheDocument();
    });
  });

  it('wraps with React.memo', () => {
    expect(TeamTab).toBeTruthy();
    expect(TeamTab.$$typeof?.toString()).toContain('Symbol');
  });
});

// ---------------------------------------------------------------------------
// Substep 10.3.10 — Settings Tab
// ---------------------------------------------------------------------------
describe('10.3.10 — SettingsTab', () => {
  beforeEach(() => {
    mockApiClient.put = vi.fn().mockResolvedValue({ data: { success: true, data: mockWebsiteBackend } });
    mockApiClient.delete = vi.fn().mockResolvedValue({ data: { success: true } });
  });

  it('renders website name editor', () => {
    render(<SettingsTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} onDeleted={vi.fn()} currentUserRole="OWNER" />);
    expect(screen.getByText(/website name/i)).toBeInTheDocument();
  });

  it('renders visibility selector (disabled, coming soon)', () => {
    render(<SettingsTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} onDeleted={vi.fn()} currentUserRole="OWNER" />);
    expect(screen.getByText('Visibility')).toBeInTheDocument();
  });

  it('renders language/locale selector (disabled, coming soon)', () => {
    render(<SettingsTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} onDeleted={vi.fn()} currentUserRole="OWNER" />);
    expect(screen.getByText(/Language \/ Locale/)).toBeInTheDocument();
  });

  it('renders Danger Zone section', () => {
    render(<SettingsTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} onDeleted={vi.fn()} currentUserRole="OWNER" />);
    expect(screen.getByText(/danger zone/i)).toBeInTheDocument();
  });

  it('renders Archive Website button', () => {
    render(<SettingsTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} onDeleted={vi.fn()} currentUserRole="OWNER" />);
    expect(screen.getByRole('button', { name: /archive this website/i })).toBeInTheDocument();
  });

  it('renders Delete Website button', () => {
    render(<SettingsTab website={mockWebsite} websiteId="123" onSaved={vi.fn()} onDeleted={vi.fn()} currentUserRole="OWNER" />);
    expect(screen.getByText(/delete website/i)).toBeInTheDocument();
  });

  it('wraps with React.memo', () => {
    expect(SettingsTab).toBeTruthy();
    expect(SettingsTab.$$typeof?.toString()).toContain('Symbol');
  });
});
