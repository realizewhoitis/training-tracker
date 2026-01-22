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
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
    'ADMIN': ALL_PERMISSIONS as Permission[],
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
    'FTO': [
        PERMISSIONS.VIEW_REPORTS
        // FTOs also have innate ability to WRITE reports which is app logic, not just permission
    ],
    'TRAINEE': []
};
