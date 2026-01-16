export type AppRole = 'superadmin' | 'admin' | 'brand' | 'creator';

export interface RoleInfo {
  id: AppRole;
  label: string;
  description: string;
  color: string;
}

export const ROLES: Record<AppRole, RoleInfo> = {
  superadmin: {
    id: 'superadmin',
    label: 'Super Admin',
    description: 'Full system access and control',
    color: 'bg-destructive text-destructive-foreground',
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    description: 'Manage users, brands, and creators',
    color: 'bg-primary text-primary-foreground',
  },
  brand: {
    id: 'brand',
    label: 'Brand',
    description: 'Manage campaigns and view creators',
    color: 'bg-blue-500 text-white',
  },
  creator: {
    id: 'creator',
    label: 'Creator',
    description: 'Create content and manage profile',
    color: 'bg-green-500 text-white',
  },
};

export const ROLE_HIERARCHY: AppRole[] = ['superadmin', 'admin', 'brand', 'creator'];

export function getRoleInfo(role: AppRole): RoleInfo {
  return ROLES[role];
}

export function canManageRole(userRole: AppRole, targetRole: AppRole): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const targetIndex = ROLE_HIERARCHY.indexOf(targetRole);
  return userIndex < targetIndex;
}
