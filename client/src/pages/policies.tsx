import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Edit, Eye, Download } from "lucide-react";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Policy } from "@shared/schema";

const statusColors = {
  active: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  cancelled: "bg-slate-100 text-slate-800",
};

const typeColors = {
  auto: "bg-blue-100 text-blue-800",
  home: "bg-green-100 text-green-800",
  life: "bg-purple-100 text-purple-800",
  business: "bg-orange-100 text-orange-800",
};

export default function Policies() {
  const { data: policies = [], isLoading } = useQuery<Policy[]>({
    queryKey: ["/api/policies"],
  });

  if (isLoading) {
    return (
      <Layout currentPage="policies">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-slate-300 rounded w-1/4"></div>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  const activePolicies = policies.filter(p => p.status === 'active').length;

  return (
    <Layout currentPage="policies">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Gestão de Apólices</h3>
            <p className="text-slate-600">Gerencie e acompanhe todas as apólices de seguro</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Criar Apólice
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar apólices..."
                  className="pl-10 w-64"
                />
              </div>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Todos os Tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="auto">Automóvel</SelectItem>
                  <SelectItem value="home">Residencial</SelectItem>
                  <SelectItem value="life">Vida</SelectItem>
                  <SelectItem value="business">Empresarial</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-slate-600">
              {activePolicies} active policies
            </span>
          </div>

          {policies.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No policies yet</h3>
              <p className="text-slate-600 mb-4">Get started by creating your first policy</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Policy
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Renewal Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id} className="table-row">
                      <TableCell>
                        <span className="font-mono text-sm text-slate-800">
                          {policy.policyNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary text-sm font-medium">
                              C{policy.contactId}
                            </span>
                          </div>
                          <span className="text-slate-800 font-medium">
                            Contact #{policy.contactId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={typeColors[policy.type as keyof typeof typeColors]}
                          variant="secondary"
                        >
                          {policy.type} Insurance
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-700 font-medium">
                        {formatCurrency(parseFloat(policy.premium.toString()))}/year
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={statusColors[policy.status as keyof typeof statusColors]}
                          variant="secondary"
                        >
                          {policy.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {formatDate(policy.renewalDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
