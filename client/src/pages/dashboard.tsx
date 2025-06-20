import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ArrowUp, Clock, Plus, Upload, FileText, Shield, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  activePolicies: number;
  openClaims: number;
  monthlyRevenue: number;
  newLeads: number;
  totalClients: number;
  pendingClaims: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <Layout currentPage="dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Apólices Ativas</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {stats?.activePolicies || 0}
                </p>
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <ArrowUp className="w-4 h-4 mr-1" /> +12% do mês passado
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Sinistros Abertos</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {stats?.openClaims || 0}
                </p>
                <p className="text-sm text-amber-600 mt-2 flex items-center">
                  <Clock className="w-4 h-4 mr-1" /> {stats?.pendingClaims || 0} aguardando análise
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="text-amber-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Receita Mensal</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {stats ? formatCurrency(stats.monthlyRevenue) : "R$ 0"}
                </p>
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <ArrowUp className="w-4 h-4 mr-1" /> +8,2% do mês passado
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">R$</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Novos Leads</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {stats?.newLeads || 0}
                </p>
                <p className="text-sm text-primary mt-2 flex items-center">
                  <User className="w-4 h-4 mr-1" /> 8 esta semana
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="text-blue-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Atividade Recente</h3>
              <div className="space-y-4">
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Nenhuma atividade recente para exibir</p>
                  <p className="text-sm">A atividade aparecerá aqui conforme você usar a plataforma</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                  <Plus className="text-primary w-5 h-5" />
                  <span className="text-slate-700 font-medium">Adicionar Novo Cliente</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                  <Shield className="text-primary w-5 h-5" />
                  <span className="text-slate-700 font-medium">Criar Apólice</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                  <FileText className="text-primary w-5 h-5" />
                  <span className="text-slate-700 font-medium">Processar Sinistro</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                  <Upload className="text-primary w-5 h-5" />
                  <span className="text-slate-700 font-medium">Enviar Documento</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
