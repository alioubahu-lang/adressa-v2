import { redirect } from "next/navigation";

// Cette page a été fusionnée dans /dashboard/settings (onglet "Gestion des utilisateurs").
export default function UsersRedirectPage() {
  redirect("/dashboard/settings");
}
