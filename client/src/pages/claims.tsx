import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Edit, Eye } from "lucide-react";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Claim } from "@shared/schema";

const statusColors = {
  open: "bg-blue-100 text-blue-800",
  in_review: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  closed: "bg-slate-100 text-slate-800",
  denied: "bg-red-100 text-red-800",
};

const statusLabels = {
  open: "Open",
  in_review: "In Review",
  approved: "Approved",
  closed: "Closed",
  denied: "Denied",
};

export default function Claims() {
  const { data: claims = [], isLoading } = useQuery<Claim[]>({
    queryKey: ["/api/claims"],
  });

  if (isLoading) {
    return (
      <Layout currentPage="claims">
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

  const activeClaims = claims.filter(c => c.status === 'open' || c.status === 'in_review').length;

  return (
    <Layout currentPage="claims">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Claims Management</h3>
            <p className="text-slate-600">Track and process insurance claims efficiently</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Claim
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
                  placeholder="Search claims..."
                  className="pl-10 w-64"
                />
              </div>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-slate-600">
              {activeClaims} active claims
            </span>
          </div>

          {claims.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No claims yet</h3>
              <p className="text-slate-600 mb-4">Claims will appear here when filed</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Claim
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Policy Type</TableHead>
                    <TableHead>Claim Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Filed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim.id} className="table-row">
                      <TableCell>
                        <span className="font-mono text-sm text-slate-800">
                          {claim.claimId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary text-sm font-medium">
                              MC
                            </span>
                          </div>
                          <span className="text-slate-800 font-medium">
                            Contact #{claim.contactId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {claim.type} Insurance
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-700 font-medium">
                        {formatCurrency(parseFloat(claim.amount.toString()))}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={statusColors[claim.status as keyof typeof statusColors]}
                          variant="secondary"
                        >
                          {statusLabels[claim.status as keyof typeof statusLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {formatDate(claim.dateFiled)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
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
