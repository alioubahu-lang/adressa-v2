"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export type DailyPoint = { date: string; scans: number; creations: number };

export function ActivityChart({ data }: { data: DailyPoint[] }) {
  return (
    <div className="card">
      <h2 className="mb-4 text-sm font-bold text-adressa-deep">Activité — 30 derniers jours</h2>
      <div className="h-72 pb-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 10, bottom: 18, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} height={34} tickMargin={10} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip />
            <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            <Line type="monotone" dataKey="scans" name="Scans" stroke="#0D9488" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="creations" name="Créations" stroke="#0F2E23" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
