import { cn, formatCurrency } from "@/lib/utils";
import { Mail, Phone, FileText, Calendar, ChevronDown, ChevronUp, MoreVertical, Paperclip, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/pipeline-leads/${lead.id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pipeline-leads'] });
    }
  });
  
  const getStatusColor = () => {
    switch (lead.status) {
      case "leads": return "bg-red-200";
      case "qualified": return "bg-yellow-200";
      case "proposal": return "bg-blue-200";
      case "closed": return "bg-green-200";
      default: return "bg-slate-200";
    }
  };

  const handleAttachDocument = () => {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.txt,.jpg,.png';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Here you would typically upload the file
        console.log('Attaching document:', file.name);
        // For now, just show an alert
        alert(`Document "${file.name}" attached to ${lead.name}`);
      }
    };
    fileInput.click();
  };

  const handleDeleteCard = () => {
    if (confirm(`Are you sure you want to delete ${lead.name}?`)) {
      deleteMutation.mutate();
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
          </div>
          <div className="flex items-center space-x-1">
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <FileText className="w-4 h-4" />
            </button>
            <div className="relative group">
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-6 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="py-1">
                  <button 
                    onClick={handleAttachDocument}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Attach Document
                  </button>
                  <button 
                    onClick={handleDeleteCard}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Card
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-3">
        <div className="space-y-2 text-sm">
          <div className="text-slate-700 font-medium uppercase text-xs tracking-wide">
            {lead.insuranceType}
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
