import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'purple' | 'emerald' | 'amber' | 'blue' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'purple',
  onClick
}) => {
  const colorMap = {
    purple: 'from-purple-500/20 to-indigo-500/5 text-purple-400 border-purple-500/20 group-hover:border-purple-500/40',
    emerald: 'from-emerald-500/20 to-teal-500/5 text-emerald-400 border-emerald-500/20 group-hover:border-emerald-500/40',
    amber: 'from-amber-500/20 to-orange-500/5 text-amber-400 border-amber-500/20 group-hover:border-amber-500/40',
    blue: 'from-sky-500/20 to-blue-500/5 text-sky-400 border-sky-500/20 group-hover:border-sky-500/40',
    rose: 'from-rose-500/20 to-pink-500/5 text-rose-400 border-rose-500/20 group-hover:border-rose-500/40',
  };

  const iconBgMap = {
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        onClick ? 'cursor-pointer' : ''
      } ${colorMap[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`rounded-xl border p-3 ${iconBgMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span className={`font-semibold ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.value}
          </span>
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
};
