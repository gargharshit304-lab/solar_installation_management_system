import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  badge?: string;
  badgeColor?: 'sage' | 'amber' | 'terracotta';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subValue,
  trend,
  icon: Icon,
  iconBgColor = 'bg-sand-100',
  iconColor = 'text-navy',
  badge,
  badgeColor = 'sage'
}) => {
  const badgeClasses = {
    sage: 'bg-sage-50 text-sage border-sage/20',
    amber: 'bg-amber-50 text-amber border-amber/20',
    terracotta: 'bg-terracotta-50 text-terracotta border-terracotta/20',
  }[badgeColor];

  return (
    <div className="bg-white rounded-card p-5 border border-warmGrey/60 shadow-card hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-mutedGrey uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-charcoal mt-1.5 tracking-tight font-sans">{value}</h3>
          {subValue && (
            <p className="text-xs text-mutedGrey mt-1">{subValue}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(trend || badge) && (
        <div className="mt-4 pt-3 border-t border-warmGrey/40 flex items-center justify-between text-xs">
          {trend ? (
            <div className="flex items-center space-x-1.5">
              <span className={`font-semibold flex items-center ${trend.isPositive ? 'text-sage' : 'text-terracotta'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-mutedGrey">vs last month</span>
            </div>
          ) : <div />}
          
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${badgeClasses}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
