import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

/**
 * Roles used by Better Auth's admin plugin. Application-level permissions
 * (availability, clinics, audit) are enforced separately in lib/auth/guard.ts.
 */
export const ac = createAccessControl(defaultStatements);

export const roles = {
  admin: ac.newRole({ ...adminAc.statements }),
  coordinator: ac.newRole({ user: [], session: [] }),
};
