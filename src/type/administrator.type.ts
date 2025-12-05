import { User } from "./user.type"

export type ResourceTypeData = {
  resource_id: string,
  resource_name: string,
  permissions?: PermissionOnResource[],
}


export enum ResourceType {
  COURSE = "COURSE",
  INSTRUCTOR = "INSTRUCTOR",
  CATEGORY = "CATEGORY",
  LEVEL = "LEVEL",
  USER = "USER",
  TRANSACTION = "TRANSACTION",
  FEEDBACK = "FEEDBACK",
  ALL = "ALL",
}

export type PermissionOnResource = {
    id: string,
    permissionId: string,
    resourceTypeId: string,
    permission?: Permission,
    resource?: ResourceTypeData,
    createdAt?: string,
    updatedAt?: string,
}

export type Permission = {
    permission_id: string,
    permission_name: string,
    description?: string,
    resources?: PermissionOnResource[],
    createdAt?: string,
    updatedAt?: string,
}

export type AdminRoleWithPermissions = AdminRole & { permissions?: AdminRolePermission[] }


export type Admin = {
    admin_id: string,
    user_id: string,
    admin_role_id: string,
    adminRole?: AdminRole,
    user?: User,
    createdAt?: string,
    updatedAt?: string,
}

export type AdminWithRole = {
    role: AdminRole
}

export type AdminRole = {
    admin_role_id: string,
    role_name: string,
    level: number,
    permissions?: AdminRolePermission[], 
    admins?: Admin[], 
    createdAt?: string,
    updatedAt?: string,
}


export type AdminRolePermission = {
    permission_id: string,
    admin_role_id: string,
    permission: Permission,
    createdAt?: string,
    updatedAt?: string,
}

export type AdminRolePermissionDetail = AdminRolePermission & {
    role: AdminRole;
    permission: Permission;
};