import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, FileText, TrendingUp, LogIn, UserPlus } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">WeSeg</span>
            <span className="block text-3xl md:text-4xl mt-2">Plataforma de Gestão para Corretores de Seguros</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Otimize seu negócio de seguros com nossa plataforma abrangente para gerenciar clientes, 
            apólices, sinistros e leads de vendas em um painel poderoso e integrado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Faça Login
              </Button>
            </Link>
            <Link href="/register">
              <Button 
                size="lg" 
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Gestão de Apólices</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitore e gerencie todas as suas apólices de seguro com renovações automáticas e atualizações de status.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Acompanhamento de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Mantenha perfis detalhados de clientes com histórico de contatos e registros de comunicação.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Processamento de Sinistros</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Simplifique o gerenciamento de sinistros com rastreamento de status e organização de documentos.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Pipeline de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualize e gerencie seu funil de vendas desde leads até negócios fechados.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Desenvolvido para Profissionais de Seguros</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-blue-200">Baseado na Nuvem</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Acesso de Qualquer Lugar</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">Seguro</div>
              <div className="text-blue-200">Proteção de Dados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}