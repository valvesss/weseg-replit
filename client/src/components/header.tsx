import { Bell, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { BrokerProfile } from "@shared/schema";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  currentPage: string;
}

const pageTitles = {
  dashboard: { title: "Painel de Controle", subtitle: "Bem-vindo de volta! Aqui está a visão geral do seu negócio." },
  pipeline: { title: "Pipeline de Vendas", subtitle: "Gerencie seus leads e acompanhe o progresso através do funil de vendas." },
  contacts: { title: "Gestão de Contatos", subtitle: "Gerencie seus relacionamentos com clientes e informações de contato." },
  claims: { title: "Gestão de Sinistros", subtitle: "Rastreie e processe sinistros de seguro com eficiência." },
  policies: { title: "Gestão de Apólices", subtitle: "Gerencie e acompanhe todas as apólices de seguro." },
  documents: { title: "Gestão de Documentos", subtitle: "Envie, organize e gerencie todos os documentos do seu negócio." },
  profile: { title: "Meu Perfil", subtitle: "Gerencie seu perfil de corretor e configurações da conta." },
};

export function Header({ currentPage }: HeaderProps) {
  const { data: profile } = useQuery<BrokerProfile>({
    queryKey: ["/api/broker-profile"],
  });

  const pageInfo = pageTitles[currentPage as keyof typeof pageTitles] || pageTitles.dashboard;
  const userInitials = profile ? getInitials(profile.firstName, profile.lastName) : "JD";
  const userName = profile ? `${profile.firstName} ${profile.lastName}` : "John Doe";

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{pageInfo.title}</h2>
          <p className="text-slate-600 mt-1">{pageInfo.subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-slate-600 hover:text-slate-800 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{userInitials}</span>
            </div>
            <span className="text-slate-700 font-medium">{userName}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                const response = await fetch('/api/auth/logout', {
                  method: 'POST',
                  credentials: 'include',
                });
                
                if (response.ok) {
                  window.location.href = "/login";
                }
              } catch (error) {
                console.error('Logout error:', error);
                window.location.href = "/login";
              }
            }}
            className="ml-4"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
