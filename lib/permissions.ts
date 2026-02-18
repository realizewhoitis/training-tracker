export const PERMISSIONS = {
    // User Management
    MANAGE_USERS: 'users.manage', // Create, edit, delete users

    // Role Management
    MANAGE_ROLES: 'roles.manage', // Edit capability templates

    // Reports
    VIEW_REPORTS: 'reports.view', // View read-only reports
    EXPORT_REPORTS: 'reports.export', // Download PDF
    MANAGE_FORMS: 'forms.manage', // Edit form templates

    // Inventory
    MANAGE_INVENTORY: 'inventory.manage', // Create assets, assign them

    // EIS
    VIEW_EIS: 'eis.view', // View flags
    MANAGE_EIS: 'eis.manage', // Resolve/Dismiss flags

    // Branding
    MANAGE_BRANDING: 'branding.manage', // Settings page

    // SaaS Management
    MANAGE_SAAS: 'saas.manage', // License generation, module toggles
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const PERMISSION_LABELS: Record<Permission, { label: string; description: string }> = {
    [PERMISSIONS.MANAGE_USERS]: { label: 'Manage Users', description: 'Create, edit, and delete user accounts' },
    [PERMISSIONS.MANAGE_ROLES]: { label: 'Manage Roles', description: 'Modify permission templates for roles' },
    [PERMISSIONS.VIEW_REPORTS]: { label: 'View Reports', description: 'Read-only access to DORs' },
    [PERMISSIONS.EXPORT_REPORTS]: { label: 'Export Reports', description: 'Download reports as PDF' },
    [PERMISSIONS.MANAGE_FORMS]: { label: 'Manage Forms', description: 'Create and edit evaluation templates' },
    [PERMISSIONS.MANAGE_INVENTORY]: { label: 'Manage Inventory', description: 'Create and assign assets' },
    [PERMISSIONS.VIEW_EIS]: { label: 'View EIS', description: 'View Early Intervention System flags' },
    [PERMISSIONS.MANAGE_EIS]: { label: 'Manage EIS', description: 'Resolve and dismiss EIS alerts' },
    [PERMISSIONS.MANAGE_BRANDING]: { label: 'Manage Branding', description: 'Update logos and organization name' },
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
    'SUPERUSER': ALL_PERMISSIONS as Permission[], // Superuser has everything + SaaS
    'ADMIN': ALL_PERMISSIONS.filter(p => p !== PERMISSIONS.MANAGE_SAAS) as Permission[],
    'SUPERVISOR': [
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.VIEW_EIS,
        PERMISSIONS.MANAGE_INVENTORY
    ],
    'TRAINER': [
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_REPORTS
    ],
    'TRAINEE': []
};
