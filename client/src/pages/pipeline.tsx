import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PipelineCard } from "@/components/pipeline-card";
import { useState } from "react";
import { Plus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { PipelineLead } from "@shared/schema";

const statusColumns = [
  { key: "leads", title: "Contato", bgColor: "bg-red-100", badgeColor: "bg-red-500", headerColor: "bg-red-200" },
  { key: "qualified", title: "Negociação", bgColor: "bg-yellow-100", badgeColor: "bg-yellow-500", headerColor: "bg-yellow-200" },
  { key: "proposal", title: "Fechamento", bgColor: "bg-blue-100", badgeColor: "bg-blue-500", headerColor: "bg-blue-200" },
  { key: "closed", title: "Finalizado", bgColor: "bg-green-100", badgeColor: "bg-green-500", headerColor: "bg-green-200" },
];

export default function Pipeline() {
  const [draggedLead, setDraggedLead] = useState<PipelineLead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery<PipelineLead[]>({
    queryKey: ["/api/pipeline-leads"],
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PUT", `/api/pipeline-leads/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipeline-leads"] });
    },
  });

  const handleDragStart = (e: React.DragEvent, lead: PipelineLead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedLead && draggedLead.status !== newStatus) {
      updateLeadMutation.mutate({
        id: draggedLead.id,
        status: newStatus,
      });
    }
  };

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status);
  };

  if (isLoading) {
    return (
      <Layout currentPage="pipeline">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {statusColumns.map((column) => (
            <Card key={column.key} className={column.bgColor}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-slate-300 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-20 bg-white rounded"></div>
                    <div className="h-20 bg-white rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Layout>
    );
  }

  const totalPipelineValue = leads.reduce((sum, lead) => {
    const premium = lead.annualPremium ? parseFloat(lead.annualPremium.toString()) : 0;
    return sum + premium;
  }, 0);

  return (
    <Layout currentPage="pipeline">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-1">
          Total de seguros em negociação: {leads.length}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => {
          const columnLeads = getLeadsByStatus(column.key);
          const isOver = dragOverColumn === column.key;
          const columnValue = columnLeads.reduce((sum, lead) => {
            const premium = lead.annualPremium ? parseFloat(lead.annualPremium.toString()) : 0;
            return sum + premium;
          }, 0);
          
          return (
            <div
              key={column.key}
              className={cn(
                "rounded-xl p-4 pipeline-column",
                column.bgColor,
                isOver && "drag-over"
              )}
              onDragOver={(e) => handleDragOver(e, column.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.key)}
            >
              <div className={cn("rounded-lg p-4 mb-4", column.headerColor)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-semibold text-slate-800">{column.title}</h4>
                    <span className={cn(
                      "text-white text-sm px-3 py-1 rounded-full font-medium",
                      column.badgeColor
                    )}>
                      {columnLeads.length}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{formatCurrency(columnValue)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="w-8 h-8 bg-slate-600 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 text-slate-600 hover:text-slate-800 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 min-h-[400px]">
                {columnLeads.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">No leads in this stage</p>
                  </div>
                ) : (
                  columnLeads.map((lead) => (
                    <PipelineCard
                      key={lead.id}
                      lead={lead}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedLead?.id === lead.id}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
