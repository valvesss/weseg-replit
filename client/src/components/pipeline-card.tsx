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
  const firstContactDate = new Date(lead.createdAt);
  
  return (
    <div
      className={cn(
        "bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-move hover:shadow-md transition-shadow",
        isDragging && "opacity-50 transform rotate-1",
        lead.status === "qualified" && "border-blue-200",
        lead.status === "proposal" && "border-amber-200", 
        lead.status === "closed" && "border-green-200"
      )}
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onDragEnd={onDragEnd}
    >
      <h5 className="font-semibold text-slate-800 mb-3">{lead.name}</h5>
      
      <div className="space-y-2">
        <div className="text-lg font-bold text-green-600">
          {premium > 0 ? formatCurrency(premium) + "/year" : "Quote pending"}
        </div>
        
        <div className="text-xs text-slate-500">
          First contact: {firstContactDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </div>
    </div>
  );
}
