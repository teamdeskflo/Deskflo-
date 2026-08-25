// ─── Admin RBAC — Role-Based Access Control ────────────────────────────────
// Maps roles to allowed permissions across the admin panel.

export type AdminRole = 'super_admin' | 'support' | 'finance' | 'operations';

export type Permission =
  | 'view_dashboard'
  | 'view_users'      | 'edit_users'      | 'delete_users'
  | 'view_clients'
  | 'view_invoices'   | 'manage_invoices'
  | 'view_approvals'
  | 'view_waitlist'   | 'manage_waitlist'
  | 'view_tickets'    | 'manage_tickets'
  | 'view_logs'
  | 'manage_settings'
  | 'manage_team';

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    'view_dashboard',
    'view_users', 'edit_users', 'delete_users',
    'view_clients',
    'view_invoices', 'manage_invoices',
    'view_approvals',
    'view_waitlist', 'manage_waitlist',
    'view_tickets', 'manage_tickets',
    'view_logs',
    'manage_settings',
    'manage_team',
  ],
  support: [
    'view_dashboard',
    'view_users', 'edit_users',
    'view_clients',
    'view_approvals',
    'view_tickets', 'manage_tickets',
    'view_waitlist',
    'view_logs',
  ],
  finance: [
    'view_dashboard',
    'view_users',
    'view_invoices', 'manage_invoices',
    'view_waitlist',
  ],
  operations: [
    'view_dashboard',
    'view_users', 'edit_users',
    'view_clients',
    'view_invoices',
    'view_approvals',
    'view_waitlist', 'manage_waitlist',
    'view_logs',
    'manage_settings',
  ],
};

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: AdminRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

// Nav items — shown/hidden based on role
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  permission: Permission;
}

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',      href: '/admin/dashboard',       icon: 'LayoutDashboard', permission: 'view_dashboard'   },
  { label: 'Users',          href: '/admin/users',           icon: 'Users',           permission: 'view_users'       },
  { label: 'Approvals',      href: '/admin/approvals',       icon: 'CheckSquare',     permission: 'view_approvals'   },
  { label: 'Invoices',       href: '/admin/invoices',        icon: 'Receipt',         permission: 'view_invoices'    },
  { label: 'Waitlist',       href: '/admin/waitlist',        icon: 'ListPlus',        permission: 'view_waitlist'    },
  { label: 'Support',        href: '/admin/support',         icon: 'HeadphonesIcon',  permission: 'view_tickets'     },
  { label: 'Activity Logs',  href: '/admin/activity-logs',   icon: 'FileText',        permission: 'view_logs'        },
  { label: 'Settings',       href: '/admin/settings',        icon: 'Settings',        permission: 'manage_settings'  },
  { label: 'Team',           href: '/admin/team',            icon: 'ShieldCheck',     permission: 'manage_team'      },
];

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin:  'Super Admin',
  support:      'Support',
  finance:      'Finance',
  operations:   'Operations',
};

export const ROLE_COLORS: Record<AdminRole, { bg: string; color: string }> = {
  super_admin: { bg: 'rgba(147, 51, 234, 0.15)', color: '#C084FC' },
  support:     { bg: 'rgba(37, 99, 235, 0.15)',  color: '#60A5FA' },
  finance:     { bg: 'rgba(5, 150, 105, 0.15)',  color: '#34D399' },
  operations:  { bg: 'rgba(217, 119, 6, 0.15)',  color: '#FCD34D' },
};
