import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PipelineCard } from "@/components/pipeline-card";
import { useState } from "react";
import { Plus, Search, TrendingUp, Users, DollarSign, Filter } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { PipelineLead, InsertPipelineLead } from "@shared/schema";
import { insertPipelineLeadSchema } from "@shared/schema";
import { z } from "zod";

const statusColumns = [
  { key: "leads", title: "Contato", bgColor: "bg-red-100", badgeColor: "bg-red-500", headerColor: "bg-red-200" },
  { key: "qualified", title: "Negociação", bgColor: "bg-yellow-100", badgeColor: "bg-yellow-500", headerColor: "bg-yellow-200" },
  { key: "proposal", title: "Fechamento", bgColor: "bg-blue-100", badgeColor: "bg-blue-500", headerColor: "bg-blue-200" },
  { key: "closed", title: "Finalizado", bgColor: "bg-green-100", badgeColor: "bg-green-500", headerColor: "bg-green-200" },
];

const addCardSchema = insertPipelineLeadSchema.extend({
  annualPremium: z.string().min(1, "Valor anual é obrigatório"),
});

type AddCardFormData = z.infer<typeof addCardSchema>;

export default function Pipeline() {
  const [draggedLead, setDraggedLead] = useState<PipelineLead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [insuranceFilter, setInsuranceFilter] = useState<string>("all");
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [addCardStatus, setAddCardStatus] = useState<string>("leads");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

  const addLeadMutation = useMutation({
    mutationFn: (data: InsertPipelineLead) =>
      apiRequest("POST", "/api/pipeline-leads", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipeline-leads"] });
      setIsAddCardOpen(false);
      form.reset();
    },
  });

  const form = useForm<AddCardFormData>({
    resolver: zodResolver(addCardSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      insuranceType: "auto",
      annualPremium: "",
      status: "leads",
    },
  });

  const onAddCardSubmit = (data: AddCardFormData) => {
    const leadData: InsertPipelineLead = {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      insuranceType: data.insuranceType,
      annualPremium: data.annualPremium,
      status: addCardStatus,
    };
    addLeadMutation.mutate(leadData);
  };

  const handleAddCard = (status: string) => {
    setAddCardStatus(status);
    form.setValue("status", status);
    setIsAddCardOpen(true);
  };

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
    let filteredLeads = leads.filter(lead => lead.status === status);
    
    // Apply insurance type filter
    if (insuranceFilter !== "all") {
      filteredLeads = filteredLeads.filter(lead => lead.insuranceType === insuranceFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.insuranceType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filteredLeads;
  };

  const uniqueInsuranceTypes = leads.reduce((types: string[], lead) => {
    if (!types.includes(lead.insuranceType)) {
      types.push(lead.insuranceType);
    }
    return types;
  }, []);

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
                  <p className="text-sm font-medium text-slate-600">Pipeline Total</p>
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
                  <p className="text-sm font-medium text-slate-600">Total de Leads</p>
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
                  <p className="text-sm font-medium text-slate-600">Valor Médio</p>
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
                  <p className="text-sm font-medium text-slate-600">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-slate-900">{conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, email ou tipo de seguro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={insuranceFilter} onValueChange={setInsuranceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo de Seguro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {uniqueInsuranceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(searchQuery || insuranceFilter !== "all") && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setInsuranceFilter("all");
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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
                    <h4 className="font-semibold text-slate-800">{column.title}</h4>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{formatCurrency(columnValue)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600 text-sm px-3 py-1 rounded-full font-medium bg-slate-100">
                      {columnLeads.length}
                    </span>
                    <button 
                      onClick={() => handleAddCard(column.key)}
                      className="w-8 h-8 bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-800 transition-colors rounded-full flex items-center justify-center"
                      title="Adicionar Novo Lead"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-2 space-y-2 h-[calc(100vh-280px)] overflow-y-auto">
                {columnLeads.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">Nenhum lead nesta etapa</p>
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

      {/* Add Card Dialog */}
      <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Lead</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddCardSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do lead" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="insuranceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Seguro</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="home">Residencial</SelectItem>
                        <SelectItem value="life">Vida</SelectItem>
                        <SelectItem value="business">Empresarial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="annualPremium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Anual (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        step="0.01"
                        min="0"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddCardOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={addLeadMutation.isPending}
                >
                  {addLeadMutation.isPending ? "Criando..." : "Criar Lead"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
