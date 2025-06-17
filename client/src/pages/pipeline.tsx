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
  { key: "leads", title: "Leads", bgColor: "bg-slate-100", badgeColor: "bg-slate-600" },
  { key: "qualified", title: "Qualified", bgColor: "bg-blue-50", badgeColor: "bg-blue-600" },
  { key: "proposal", title: "Proposal", bgColor: "bg-amber-50", badgeColor: "bg-amber-600" },
  { key: "closed", title: "Closed", bgColor: "bg-green-50", badgeColor: "bg-green-600" },
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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold text-slate-800">
              {formatCurrency(totalPipelineValue)}
            </h3>
            <p className="text-slate-600">Total Pipeline Value</p>
          </div>
        </div>
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
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-slate-800">{column.title}</h4>
                  <p className="text-sm text-slate-600 font-medium">{formatCurrency(columnValue)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "text-white text-xs px-2 py-1 rounded-full",
                    column.badgeColor
                  )}>
                    {columnLeads.length}
                  </span>
                  <button className="w-6 h-6 bg-slate-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-slate-700 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
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
