import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { 
  Search, 
  Upload, 
  FileText, 
  Download, 
  Share, 
  Trash2,
  File,
  FileSpreadsheet,
  Plus,
  CloudUpload,
  Folder,
  Users,
  ClipboardList,
  Handshake
} from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@shared/schema";

const categoryIcons = {
  policies: FileText,
  claims: File,
  contracts: Handshake,
  forms: ClipboardList,
};

const fileTypeIcons = {
  'application/pdf': FileText,
  'application/msword': FileText,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
  'application/vnd.ms-excel': FileSpreadsheet,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
};

const fileTypeColors = {
  'application/pdf': 'text-red-600 bg-red-100',
  'application/msword': 'text-blue-600 bg-blue-100',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'text-blue-600 bg-blue-100',
  'application/vnd.ms-excel': 'text-green-600 bg-green-100',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'text-green-600 bg-green-100',
};

export default function Documents() {
  const [dragOver, setDragOver] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('forms');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao enviar documento",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso",
      });
    },
  });

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', selectedCategory);
    
    uploadMutation.mutate(formData);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const getFileIcon = (mimeType: string) => {
    const Icon = fileTypeIcons[mimeType as keyof typeof fileTypeIcons] || File;
    return Icon;
  };

  const getFileColors = (mimeType: string) => {
    return fileTypeColors[mimeType as keyof typeof fileTypeColors] || 'text-slate-600 bg-slate-100';
  };

  const getCategoryStats = () => {
    const stats = {
      policies: documents.filter(d => d.category === 'policies').length,
      claims: documents.filter(d => d.category === 'claims').length,
      contracts: documents.filter(d => d.category === 'contracts').length,
      forms: documents.filter(d => d.category === 'forms').length,
    };
    return stats;
  };

  const categoryStats = getCategoryStats();
  const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
  const usagePercentage = (totalSize / (10 * 1024 * 1024 * 1024)) * 100; // 10GB limit

  if (isLoading) {
    return (
      <Layout currentPage="documents">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-32 bg-slate-200 rounded"></div>
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-slate-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="h-8 bg-slate-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="documents">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Document Management</h3>
            <p className="text-slate-600">Upload, organize, and manage all your business documents</p>
          </div>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* File Upload Area */}
          <Card>
            <CardContent className="p-6">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors file-upload-area ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-slate-300'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center cursor-pointer">
                  <CloudUpload className="w-16 h-16 text-slate-400 mb-4" />
                  <h4 className="text-lg font-medium text-slate-800 mb-2">
                    Drop files here or click to upload
                  </h4>
                  <p className="text-slate-600 mb-4">
                    Support for PDF, DOC, DOCX, XLS, XLSX files up to 10MB
                  </p>
                  <div className="flex items-center space-x-4 mb-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="policies">Policies</SelectItem>
                        <SelectItem value="claims">Claims</SelectItem>
                        <SelectItem value="contracts">Contracts</SelectItem>
                        <SelectItem value="forms">Forms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button">
                    Choose Files
                  </Button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Document List */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-slate-800">Recent Documents</h4>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search documents..."
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="policies">Policies</SelectItem>
                      <SelectItem value="claims">Claims</SelectItem>
                      <SelectItem value="contracts">Contracts</SelectItem>
                      <SelectItem value="forms">Forms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No documents yet</h3>
                  <p className="text-slate-600 mb-4">Upload your first document to get started</p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {documents.map((document) => {
                    const Icon = getFileIcon(document.mimeType);
                    const colors = getFileColors(document.mimeType);
                    
                    return (
                      <div key={document.id} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colors}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-slate-800">{document.originalName}</h5>
                            <p className="text-sm text-slate-600 capitalize">
                              {document.category} Document
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                              <span>{formatFileSize(document.fileSize)}</span>
                              <span>•</span>
                              <span>Uploaded {formatDate(document.uploadedAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteMutation.mutate(document.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Document Categories */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Categories</h4>
              <div className="space-y-3">
                {Object.entries(categoryStats).map(([category, count]) => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons];
                  
                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="text-slate-700 capitalize">{category}</span>
                      </div>
                      <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Storage Usage</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Used</span>
                    <span className="text-sm font-medium text-slate-800">
                      {formatFileSize(totalSize)} of 10 GB
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Upgrade Storage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
