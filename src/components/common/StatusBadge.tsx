import React from 'react';

type BadgeVariant = 
  | 'sage'        // Success / Completed / Active
  | 'amber'       // Pending / Warnings / In Progress
  | 'terracotta'  // Error / Overdue / Critical / Rejected
  | 'charcoal'    // Neutral
  | 'navy';       // Informational / Primary

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  className = ''
}) => {
  // Infer variant from common status strings if not specified
  const getInferredVariant = (s: string): BadgeVariant => {
    const lower = s.toLowerCase();
    if (['completed', 'approved', 'active', 'converted', 'fully_paid', 'in_stock', 'delivered', 'resolved'].includes(lower)) {
      return 'sage';
    }
    if (['pending', 'in_progress', 'scheduled', 'assigned', 'low_stock', 'submitted', 'partially_paid', 'quotation_sent', 'negotiation', 'in_transit'].includes(lower)) {
      return 'amber';
    }
    if (['rejected', 'delayed', 'cancelled', 'out_of_stock', 'expired', 'lost', 'critical', 'unpaid', 'defective'].includes(lower)) {
      return 'terracotta';
    }
    if (['new', 'draft', 'open'].includes(lower)) {
      return 'navy';
    }
    return 'charcoal';
  };

  const activeVariant = variant || getInferredVariant(status);

  const variantStyles: Record<BadgeVariant, string> = {
    sage: 'bg-[#6F8F7A]/15 text-[#3e5f49] border-[#6F8F7A]/30',
    amber: 'bg-[#C48A42]/15 text-[#8c5e25] border-[#C48A42]/30',
    terracotta: 'bg-[#B85C52]/15 text-[#823930] border-[#B85C52]/30',
    charcoal: 'bg-[#30343B]/10 text-[#30343B] border-[#30343B]/20',
    navy: 'bg-[#183153]/10 text-[#183153] border-[#183153]/25',
  };

  const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[activeVariant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0" 
        style={{
          backgroundColor: 
            activeVariant === 'sage' ? '#6F8F7A' :
            activeVariant === 'amber' ? '#C48A42' :
            activeVariant === 'terracotta' ? '#B85C52' :
            activeVariant === 'navy' ? '#183153' : '#30343B'
        }}
      />
      {formattedStatus}
    </span>
  );
};
