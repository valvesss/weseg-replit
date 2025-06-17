import { cn, formatCurrency } from "@/lib/utils";
import { Mail, Phone, FileText, Calendar, ChevronDown, ChevronUp, MoreVertical, Paperclip, Trash2, MessageCircle, Copy } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { PipelineLead } from "@shared/schema";
import { useState } from "react";

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
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/pipeline-leads/${lead.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      return response.json();
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

  const handleEmailClick = () => {
    window.open(`mailto:${lead.email}`, '_blank');
  };

  const handlePhoneClick = () => {
    window.open(`tel:${lead.phone}`, '_blank');
  };

  const handleWhatsAppClick = () => {
    const phone = lead.phone?.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}`, '_blank');
  };

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(lead.email);
  };

  const handleCopyPhone = async () => {
    if (lead.phone) {
      await navigator.clipboard.writeText(lead.phone);
    }
  };
  
  return (
    <div
      className={cn(
        "rounded-lg shadow-sm border border-slate-200 cursor-move hover:shadow-md transition-all duration-200 mb-2 bg-white",
        isDragging && "opacity-50 transform rotate-1 scale-105"
      )}
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onDragEnd={onDragEnd}
    >
      {/* Card Header */}
      <div className={cn("rounded-t-lg p-2", getStatusColor())}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-slate-800 truncate" title={lead.name}>
              {lead.name}
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            {/* Menu button (moved to left) */}
            <div className="relative group">
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
              {/* Dropdown Menu */}
              <div className="absolute left-0 top-6 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="py-1">
                  <button 
                    onClick={handleAttachDocument}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Anexar Documento
                  </button>
                  <button 
                    onClick={handleDeleteCard}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Card
                  </button>
                </div>
              </div>
            </div>
            
            {/* Contact expand button */}
            <button 
              onClick={() => setIsContactExpanded(!isContactExpanded)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              {isContactExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-2.5">
        <div className="space-y-2 text-sm">
          <div className="text-slate-700 font-medium uppercase text-xs tracking-wide">
            {lead.insuranceType}
          </div>
          
          {/* Contact Options */}
          {isContactExpanded && (
            <div className="space-y-1 py-2">
              {/* Email Section */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center text-xs text-slate-600">
                  <Mail className="w-3 h-3 mr-2 text-slate-500" />
                  <span className="truncate max-w-[120px]" title={lead.email}>{lead.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleEmailClick}
                    className="p-1 text-slate-500 hover:text-blue-600 transition-colors"
                    title="Abrir email"
                  >
                    <Mail className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
                    title="Copiar email"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              {/* Phone Section */}
              {lead.phone && (
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center text-xs text-slate-600">
                    <Phone className="w-3 h-3 mr-2 text-slate-500" />
                    <span>{lead.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handlePhoneClick}
                      className="p-1 text-slate-500 hover:text-green-600 transition-colors"
                      title="Ligar"
                    >
                      <Phone className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleWhatsAppClick}
                      className="p-1 text-slate-500 hover:text-green-600 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleCopyPhone}
                      className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
                      title="Copiar telefone"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div className="flex items-center text-slate-800">
              <span className="text-sm font-bold">
                {premium > 0 ? formatCurrency(premium) : formatCurrency(230)}
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
