import { cn, formatCurrency } from "@/lib/utils";
import { Mail, Phone, FileText, Calendar, ChevronDown, ChevronUp, MoreVertical, Paperclip, Trash2, MessageCircle, Copy, Upload } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { PipelineLead } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [isAttachDialogOpen, setIsAttachDialogOpen] = useState(false);
  const [documentType, setDocumentType] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
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
    setIsAttachDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Apenas arquivos PDF são permitidos');
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        alert('Arquivo deve ter no máximo 25MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadDocument = () => {
    if (!selectedFile || !documentType) {
      alert('Selecione um arquivo e o tipo de documento');
      return;
    }
    
    // Here you would upload the file
    console.log('Uploading document:', selectedFile.name, 'Type:', documentType);
    alert(`Documento "${selectedFile.name}" (${documentType}) anexado a ${lead.name}`);
    
    // Reset and close
    setSelectedFile(null);
    setDocumentType("");
    setIsAttachDialogOpen(false);
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
            {/* Attach button */}
            <button 
              onClick={handleAttachDocument}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              title="Anexar Documento"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            
            {/* Menu button */}
            <div className="relative group">
              <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <MoreVertical className="w-4 h-4" />
              </button>
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-6 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="py-1">
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
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              {isContactExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-2.5">
        <div className="space-y-2 text-sm">
          <div className="text-slate-700 font-medium text-xs tracking-wide">
            {lead.insuranceType.charAt(0).toUpperCase() + lead.insuranceType.slice(1)}
          </div>
          
          {/* Contact Options */}
          {isContactExpanded && (
            <div className="space-y-1 py-2">
              {/* Email Section */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center text-xs text-slate-600 flex-1 mr-2">
                  <Mail className="w-3 h-3 mr-2 text-slate-500" />
                  <span className="truncate" title={lead.email}>{lead.email}</span>
                </div>
                <div className="flex items-center">
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
                {firstContactDate.toLocaleDateString('pt-BR', { 
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attach Document Dialog */}
      <Dialog open={isAttachDialogOpen} onOpenChange={setIsAttachDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Anexar Documento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="documentType">Tipo de Documento</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orçamento">Orçamento</SelectItem>
                  <SelectItem value="proposta">Proposta</SelectItem>
                  <SelectItem value="seguro">Seguro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="file">Arquivo (PDF, máx. 25MB)</Label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
              />
              {selectedFile && (
                <p className="text-xs text-slate-600 mt-1">
                  Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAttachDialogOpen(false);
                  setSelectedFile(null);
                  setDocumentType("");
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUploadDocument}
                disabled={!selectedFile || !documentType}
              >
                <Upload className="w-4 h-4 mr-2" />
                Anexar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
