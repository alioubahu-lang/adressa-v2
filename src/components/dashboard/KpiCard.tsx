import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: number | string;
  Icon: LucideIcon;
  trend?: string;
  tone?: "neutral" | "green" | "orange";
};

const toneStyles: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  neutral: "bg-adressa-light text-adressa-deep",
  green: "bg-green-100 text-green-700",
  orange: "bg-orange-100 text-orange-700"
};

export function KpiCard({ label, value, Icon, trend, tone = "neutral" }: KpiCardProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-2 ${toneStyles[tone]}`}>
          <Icon size={20} strokeWidth={1.75} />
        </div>
      </div>
      <div className="mt-3 text-2xl font-black text-adressa-deep">{value}</div>
      <div className="mt-1 text-xs text-adressa-ink/60">{label}</div>
      {trend && <div className="mt-2 text-[11px] font-semibold text-adressa-green">{trend}</div>}
    </div>
  );
}
