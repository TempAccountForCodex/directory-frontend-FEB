/**
 * Search Configuration — Role-gated features and quick actions
 *
 * Pure functions (no React hooks) for determining which searchable features
 * and quick actions are available based on user role.
 *
 * Step 10.12.3 & 10.12.4
 */

import {
  LayoutDashboard,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Plus,
  Store,
  List,
  Heart,
  Trash2,
  FileText,
  Palette,
  Clock,
  Users,
  BarChart3,
  Megaphone,
} from 'lucide-react';
import { isAdmin, isContentManager } from '../../constants/roles';

/**
 * Returns the list of searchable features visible to the given role.
 * @param {string} role - User role (USER, CONTENT_CREATOR, ADMIN, SUPER_ADMIN)
 * @returns {Array} Filtered features array
 */
export const getSearchableFeatures = (role) => {
  const userIsAdmin = isAdmin(role);
  const userIsContentManager = isContentManager(role);

  const ALL_FEATURES = [
    // ALL roles
    {
      id: 'overview',
      title: 'Overview Dashboard',
      description: 'View analytics and statistics',
      icon: LayoutDashboard,
      navigation: { activeTab: 'overview' },
      keywords: ['overview', 'dashboard', 'home', 'stats'],
      category: 'Pages',
      minRole: 'ALL',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure account settings',
      icon: Settings,
      navigation: { activeTab: 'settings' },
      keywords: ['settings', 'account', 'preferences', 'profile'],
      category: 'Pages',
      minRole: 'ALL',
    },
    {
      id: 'settings-notifications',
      title: 'Settings - Notifications',
      description: 'Manage notification preferences',
      icon: Bell,
      navigation: { activeTab: 'settings', subtab: 'notifications' },
      keywords: ['notifications', 'alerts', 'email preferences'],
      category: 'Pages',
      minRole: 'ALL',
    },
    {
      id: 'settings-security',
      title: 'Settings - Security',
      description: 'Password, 2FA, and login history',
      icon: Shield,
      navigation: { activeTab: 'settings', subtab: 'security' },
      keywords: ['security', 'password', '2fa', 'login history'],
      category: 'Pages',
      minRole: 'ALL',
    },

    // USER+ roles
    {
      id: 'settings-billing',
      title: 'Settings - Billing',
      description: 'Payment and subscription management',
      icon: CreditCard,
      navigation: { activeTab: 'settings', subtab: 'billing' },
      keywords: ['billing', 'payment', 'invoice', 'subscription'],
      category: 'Pages',
      minRole: 'USER',
    },
    {
      id: 'websites',
      title: 'My Websites',
      description: 'Manage your websites',
      icon: Globe,
      navigation: { activeTab: 'websites' },
      keywords: ['websites', 'sites', 'web', 'builder'],
      category: 'Pages',
      minRole: 'USER',
    },
    {
      id: 'create-website',
      title: 'Create Website',
      description: 'Start building a new website',
      icon: Plus,
      navigation: { path: '/dashboard/websites/templates' },
      keywords: ['create website', 'new site', 'template gallery'],
      category: 'Pages',
      minRole: 'USER',
    },
    {
      id: 'stores',
      title: 'My Stores',
      description: 'Manage your online stores',
      icon: Store,
      navigation: { activeTab: 'stores' },
      keywords: ['stores', 'ecommerce', 'shop', 'products'],
      category: 'Pages',
      minRole: 'USER',
    },
    {
      id: 'listings',
      title: 'Listings',
      description: 'Manage directory listings',
      icon: List,
      navigation: { activeTab: 'listings' },
      keywords: ['listings', 'directory', 'business'],
      category: 'Pages',
      minRole: 'USER',
    },
    {
      id: 'favourites',
      title: 'Favourites',
      description: 'View saved items and bookmarks',
      icon: Heart,
      navigation: { activeTab: 'favourites' },
      keywords: ['favourites', 'saved', 'bookmarks'],
      category: 'Pages',
      minRole: 'USER',
    },
    {
      id: 'recently-deleted',
      title: 'Recently Deleted',
      description: 'Restore deleted items',
      icon: Trash2,
      navigation: { activeTab: 'recently-deleted' },
      keywords: ['deleted', 'trash', 'restore', 'recover'],
      category: 'Pages',
      minRole: 'USER',
    },

    // CONTENT_CREATOR+ roles
    {
      id: 'insights',
      title: 'Manage Insights',
      description: 'Create and manage blog posts',
      icon: FileText,
      navigation: { activeTab: 'insights' },
      keywords: ['insights', 'blogs', 'articles', 'posts', 'write'],
      category: 'Pages',
      minRole: 'CONTENT_CREATOR',
    },
    {
      id: 'create-template',
      title: 'Create Template',
      description: 'Design and submit a new template',
      icon: Palette,
      navigation: { activeTab: 'websites/create-template' },
      keywords: ['template', 'create template', 'submit', 'design'],
      category: 'Pages',
      minRole: 'CONTENT_CREATOR',
    },

    // ADMIN+ roles
    {
      id: 'pending-approvals',
      title: 'Pending Approvals',
      description: 'Review pending content for approval',
      icon: Clock,
      navigation: { activeTab: 'insights', subtab: 'pending' },
      keywords: ['pending', 'approval', 'review', 'moderate'],
      category: 'Pages',
      minRole: 'ADMIN',
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      navigation: { activeTab: 'users' },
      keywords: ['users', 'members', 'team', 'roles', 'permissions'],
      category: 'Pages',
      minRole: 'ADMIN',
    },
    {
      id: 'admin-analytics',
      title: 'Admin Analytics',
      description: 'Platform-wide analytics and reports',
      icon: BarChart3,
      navigation: { activeTab: 'overview' },
      keywords: ['admin', 'analytics', 'reports', 'platform'],
      category: 'Pages',
      minRole: 'ADMIN',
    },
    {
      id: 'communications',
      title: 'Communications',
      description: 'Send broadcasts and announcements',
      icon: Megaphone,
      navigation: { path: '/dashboard/communications' },
      keywords: ['broadcast', 'communications', 'announce'],
      category: 'Pages',
      minRole: 'CONTENT_CREATOR_OR_ADMIN',
    },
  ];

  return ALL_FEATURES.filter((feature) => {
    switch (feature.minRole) {
      case 'ALL':
        return true;
      case 'USER':
        // All authenticated users have at least USER role
        return true;
      case 'CONTENT_CREATOR':
        return userIsContentManager;
      case 'ADMIN':
        return userIsAdmin;
      case 'CONTENT_CREATOR_OR_ADMIN':
        return userIsContentManager;
      default:
        return false;
    }
  });
};

/**
 * Returns the list of quick actions visible to the given role.
 * @param {string} role - User role (USER, CONTENT_CREATOR, ADMIN, SUPER_ADMIN)
 * @returns {Array} Filtered quick actions array
 */
export const getQuickActions = (role) => {
  const userIsAdmin = isAdmin(role);
  const userIsContentManager = isContentManager(role);

  const ALL_QUICK_ACTIONS = [
    // USER+ roles
    {
      id: 'create-website',
      title: 'Create Website',
      description: 'Start building a new website',
      icon: Globe,
      action: 'create-website',
      keywords: ['create', 'website', 'new site'],
      category: 'Quick Actions',
      minRole: 'USER',
    },
    {
      id: 'create-store',
      title: 'Create Store',
      description: 'Set up a new online store',
      icon: Store,
      action: 'create-store',
      keywords: ['create', 'store', 'ecommerce'],
      category: 'Quick Actions',
      minRole: 'USER',
    },

    // CONTENT_CREATOR+ roles
    {
      id: 'create-insight',
      title: 'Create New Insight',
      description: 'Start writing a new blog post',
      icon: FileText,
      action: 'create-insight',
      keywords: ['create', 'write', 'insight', 'blog'],
      category: 'Quick Actions',
      minRole: 'CONTENT_CREATOR',
    },
    {
      id: 'create-template',
      title: 'Submit a Template',
      description: 'Design and submit a new template',
      icon: Palette,
      action: 'create-template',
      keywords: ['submit', 'template', 'design'],
      category: 'Quick Actions',
      minRole: 'CONTENT_CREATOR',
    },

    // ADMIN+ roles
    {
      id: 'create-user',
      title: 'Create New User',
      description: 'Add a new team member',
      icon: Users,
      action: 'create-user',
      keywords: ['create', 'user', 'add', 'invite'],
      category: 'Quick Actions',
      minRole: 'ADMIN',
    },
    {
      id: 'pending-insights',
      title: 'Review Pending Insights',
      description: 'Approve or reject pending content',
      icon: Clock,
      action: 'pending-insights',
      keywords: ['pending', 'review', 'approve'],
      category: 'Quick Actions',
      minRole: 'ADMIN',
    },
    {
      id: 'communications',
      title: 'Send Broadcast',
      description: 'Send announcements to users',
      icon: Megaphone,
      action: 'communications',
      keywords: ['broadcast', 'send', 'announce'],
      category: 'Quick Actions',
      minRole: 'CONTENT_CREATOR_OR_ADMIN',
    },
  ];

  return ALL_QUICK_ACTIONS.filter((action) => {
    switch (action.minRole) {
      case 'ALL':
        return true;
      case 'USER':
        return true;
      case 'CONTENT_CREATOR':
        return userIsContentManager;
      case 'ADMIN':
        return userIsAdmin;
      case 'CONTENT_CREATOR_OR_ADMIN':
        return userIsContentManager;
      default:
        return false;
    }
  });
};
