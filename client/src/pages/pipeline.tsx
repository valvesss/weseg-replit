import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PipelineCard } from "@/components/pipeline-card";
import { useState } from "react";
import { Plus, Search, TrendingUp, Users, DollarSign } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
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
    const filteredLeads = leads.filter(lead => lead.status === status);
    if (!searchQuery) return filteredLeads;
    return filteredLeads.filter(lead => 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.insuranceType.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  const averageDealValue = leads.length > 0 ? totalPipelineValue / leads.length : 0;
  const conversionRate = leads.length > 0 ? (leads.filter(l => l.status === 'closed').length / leads.length) * 100 : 0;

  return (
    <Layout currentPage="pipeline">
      {/* Top Stats and Search */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Pipeline</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalPipelineValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Leads</p>
                  <p className="text-2xl font-bold text-slate-900">{leads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg Deal Value</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(averageDealValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg mr-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search leads by name, email, or insurance type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
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
              className="bg-white rounded-xl shadow-sm border border-slate-200"
              onDragOver={(e) => handleDragOver(e, column.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.key)}
            >
              <div className={cn("rounded-t-xl p-4", column.headerColor)}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-slate-800">{column.title}</h4>
                      <span className={cn(
                        "text-white text-sm px-3 py-1 rounded-full font-medium",
                        column.badgeColor
                      )}>
                        {columnLeads.length}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{formatCurrency(columnValue)}</p>
                  </div>
                  <div className="flex items-center space-x-1 relative group">
                    <div className="w-8 h-8 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer flex items-center justify-center">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                      </svg>
                    </div>
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <div className="py-1">
                        <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Card
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3 min-h-[400px]">
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
