import { cn, formatCurrency } from "@/lib/utils";
import { Mail, Phone, FileText, Calendar, ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
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
  
  const getStatusColor = () => {
    switch (lead.status) {
      case "leads": return "bg-red-200";
      case "qualified": return "bg-yellow-200";
      case "proposal": return "bg-blue-200";
      case "closed": return "bg-green-200";
      default: return "bg-slate-200";
    }
  };
  
  return (
    <div
      className={cn(
        "rounded-lg shadow-sm border border-slate-200 cursor-move hover:shadow-md transition-all duration-200 mb-3 bg-white",
        isDragging && "opacity-50 transform rotate-1 scale-105"
      )}
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onDragEnd={onDragEnd}
    >
      {/* Card Header */}
      <div className={cn("rounded-t-lg p-3", getStatusColor())}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800">{lead.name}</h3>
            <p className="text-sm text-slate-600 mt-1">
              {premium > 0 ? formatCurrency(premium).replace('.00', '') : 'R$ 230,00'}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <FileText className="w-4 h-4" />
            </button>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-slate-600">
            <FileText className="w-4 h-4 mr-2" />
            <span className="font-medium">Seguro: {lead.insuranceType}</span>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div className="flex items-center text-slate-800">
              <span className="text-lg font-bold">
                {premium > 0 ? formatCurrency(premium).replace('.00', '') : 'R$ 230,00'}
              </span>
            </div>
            
            <div className="flex items-center text-xs text-slate-500">
              <Calendar className="w-3 h-3 mr-1" />
              <span>
                Data: {firstContactDate.toLocaleDateString('pt-BR', { 
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
