"use client";

import { useState } from "react";
import { UsersTab } from "./UsersTab";
import { CommuneTab } from "./CommuneTab";
import { SecurityTab } from "./SecurityTab";

type UserRow = { id: string; name: string; email: string; role: string; commune: { id: string; name: string } | null };
type Commune = { id: string; name: string; logoUrl: string | null; contactEmail: string | null; contactPhone: string | null };

type SettingsTabsProps = {
  canManageSettings: boolean;
  users: UserRow[];
  communes: Commune[];
  currentUserId?: string;
  currentUserName?: string;
  currentUserEmail?: string;
};

export function SettingsTabs({
  canManageSettings,
  users,
  communes,
  currentUserId,
  currentUserName,
  currentUserEmail
}: SettingsTabsProps) {
  const tabs = canManageSettings
    ? [
        { id: "users", label: "Gestion des utilisateurs" },
        { id: "commune", label: "Configuration de la mairie" },
        { id: "security", label: "Sécurité & profil" }
      ]
    : [{ id: "security", label: "Sécurité & profil" }];

  const [active, setActive] = useState(tabs[0].id);

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-black/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
              active === tab.id
                ? "border-adressa-green text-adressa-deep"
                : "border-transparent text-adressa-ink/50 hover:text-adressa-deep"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "users" && canManageSettings && <UsersTab users={users} communes={communes} currentUserId={currentUserId} />}
      {active === "commune" && canManageSettings && <CommuneTab communes={communes} />}
      {active === "security" && <SecurityTab name={currentUserName} email={currentUserEmail} />}
    </div>
  );
}
