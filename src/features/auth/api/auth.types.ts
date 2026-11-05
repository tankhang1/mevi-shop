export type AuthProvider = 'center' | 'farm' | (string & {});

export interface WorkspaceRole {
  workspaceId: number;
  workspaceCode?: string | null;
  workspaceName?: string | null;
  roleCodes: string[];
}

/** `GET /api/me/profile`. Only the fields FE relies on are typed strictly. */
export interface AuthMeResponse {
  id: number;
  fullName: string | null;
  email?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
  province?: string | null;
  avatarUrl?: string | null;
  roleCodes: string[];
  workspaceRoles: WorkspaceRole[];
  [key: string]: unknown;
}

export const ADMIN_ROLE_CODES = ['MEVI_ADMIN', 'MEVI_SUPER_ADMIN', 'MEVI_SHOP_ADMIN'] as const;
