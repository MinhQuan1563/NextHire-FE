export interface Permission {
  name: string;
  displayName: string;
  isGranted: boolean;
  parentName?: string;
}

export interface PermissionGroup {
  name: string;
  displayName: string;
  permissions: Permission[];
}

export interface GetPermissionResponse {
  entityDisplayName: string;
  groups: PermissionGroup[];
}

export interface UpdatePermissionDto {
  permissions: { name: string; isGranted: boolean }[];
}