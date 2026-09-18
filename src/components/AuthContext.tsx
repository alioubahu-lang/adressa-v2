"use client";

import { createContext, useContext, useMemo } from "react";
import { useSession } from "next-auth/react";
import { hasPermission, getDefaultDashboardView, type Role, type Permission, type DashboardView } from "@/lib/permissions";

type AuthContextValue = {
  userId: string | undefined;
  name: string | undefined;
  email: string | undefined;
  role: Role | undefined;
  isAuthenticated: boolean;
  defaultView: DashboardView;
  can: (permission: Permission) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Ce contexte ne simule aucune donnée : il lit la vraie session NextAuth déjà en
// place sur ADRESSA (login réel, rôle réel stocké en base) et l'expose sous une
// forme pratique pour les vérifications de permissions côté composants.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const value = useMemo<AuthContextValue>(() => {
    const role = (session?.user as any)?.role as Role | undefined;
    return {
      userId: (session?.user as any)?.id,
      name: session?.user?.name ?? undefined,
      email: session?.user?.email ?? undefined,
      role,
      isAuthenticated: !!session,
      defaultView: getDefaultDashboardView(role),
      can: (permission: Permission) => hasPermission(role, permission)
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>.");
  return ctx;
}
