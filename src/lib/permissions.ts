// Système RBAC (Role-Based Access Control) pour ADRESSA.
// Les rôles sont ceux réellement définis dans prisma/schema.prisma (enum Role).

export type Role = "SUPER_ADMIN" | "ADMIN" | "AGENT" | "MUNICIPAL" | "MUNICIPAL_ADMIN" | "LOGISTICS_PARTNER" | "VIEWER";

export type Permission =
  | "address:create"
  | "address:edit"
  | "address:delete"
  | "address:view"
  | "fiscal:view"
  | "fiscal:edit"
  | "logistics:view"
  | "users:manage"
  | "settings:manage";

// Matrice de permissions par rôle. Chaque rôle n'obtient que ce qui est listé ici —
// pas d'héritage implicite, pour que la matrice reste lisible et auditable.
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "address:create",
    "address:edit",
    "address:delete",
    "address:view",
    "fiscal:view",
    "fiscal:edit",
    "logistics:view",
    "users:manage",
    "settings:manage"
  ],
  ADMIN: ["address:create", "address:edit", "address:delete", "address:view", "fiscal:view", "fiscal:edit", "settings:manage"],
  AGENT: ["address:create", "address:edit", "address:view"],
  MUNICIPAL: ["address:view", "fiscal:view"],
  MUNICIPAL_ADMIN: ["address:view", "fiscal:view", "fiscal:edit"],
  LOGISTICS_PARTNER: ["address:view", "logistics:view"],
  VIEWER: ["address:view"]
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Détermine quelle vue de dashboard afficher par défaut pour un rôle donné.
export type DashboardView = "municipal" | "logistics" | "operationnel";

export function getDefaultDashboardView(role: Role | undefined): DashboardView {
  if (role === "MUNICIPAL_ADMIN" || role === "MUNICIPAL") return "municipal";
  if (role === "LOGISTICS_PARTNER") return "logistics";
  return "operationnel"; // SUPER_ADMIN, ADMIN, AGENT, VIEWER
}

// Un SUPER_ADMIN peut consulter n'importe quelle vue (utile pour le support/debug),
// les autres rôles sont restreints à leur vue par défaut.
export function canAccessView(role: Role | undefined, view: DashboardView): boolean {
  if (role === "SUPER_ADMIN") return true;
  return getDefaultDashboardView(role) === view;
}
