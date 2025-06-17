import { cn, formatCurrency } from "@/lib/utils";
import type { PipelineLead } from "@shared/schema";

interface PipelineCardProps {
  lead: PipelineLead;
  onDragStart: (e: React.DragEvent, lead: PipelineLead) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const insuranceTypeColors = {
  auto: "text-blue-600",
  home: "text-green-600", 
  life: "text-purple-600",
  business: "text-orange-600",
};

export function PipelineCard({ lead, onDragStart, onDragEnd, isDragging }: PipelineCardProps) {
  const premium = lead.annualPremium ? parseFloat(lead.annualPremium.toString()) : 0;
  const daysAgo = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div
      className={cn(
        "bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-move hover:shadow-md transition-shadow",
        isDragging && "opacity-50 transform rotate-1",
        lead.status === "qualified" && "border-blue-200",
        lead.status === "proposal" && "border-amber-200", 
        lead.status === "closed" && "border-green-200"
      )}
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-medium text-slate-800">{lead.name}</h5>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full",
          insuranceTypeColors[lead.insuranceType as keyof typeof insuranceTypeColors] || "text-slate-600"
        )}>
          {lead.insuranceType}
        </span>
      </div>
      
      {lead.notes && (
        <p className="text-sm text-slate-600 mb-2 line-clamp-2">{lead.notes}</p>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-green-600">
          {premium > 0 ? formatCurrency(premium) + "/year" : "Quote pending"}
        </span>
        <span className="text-xs text-slate-500">
          {daysAgo === 0 ? "Today" : `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`}
        </span>
      </div>
    </div>
  );
}
