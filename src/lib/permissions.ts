import { AdminRoleId, PermAction, ROLE_PERMISSIONS } from '@/types';

export const can = (role: AdminRoleId, resource: string, action: PermAction): boolean => {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  const actions = perms[resource];
  if (!actions) return false;
  return actions.includes(action);
};

export const canAny = (role: AdminRoleId, resource: string, actions: PermAction[]): boolean =>
  actions.some(a => can(role, resource, a));

export const canAccess = (role: AdminRoleId, resource: string): boolean =>
  canAny(role, resource, ['view','create','edit','delete','approve','suspend']);
