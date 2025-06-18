import { Link, useLocation } from "wouter";
import { cn, getInitials } from "@/lib/utils";
import {
  BarChart3,
  Users,
  FileText,
  Shield,
  FolderOpen,
  User,
  Kanban,
  LogOut,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { BrokerProfile } from "@shared/schema";

interface SidebarProps {
  currentPage: string;
}

const navigationItems = [
  {
    name: "Painel",
    href: "/",
    icon: BarChart3,
    key: "dashboard",
  },
  {
    name: "Pipeline",
    href: "/pipeline",
    icon: Kanban,
    key: "pipeline",
  },
  {
    name: "Contatos",
    href: "/contacts",
    icon: Users,
    key: "contacts",
  },
  {
    name: "Sinistros",
    href: "/claims",
    icon: FileText,
    key: "claims",
  },
  {
    name: "Apólices",
    href: "/policies",
    icon: Shield,
    key: "policies",
  },
  {
    name: "Documentos",
    href: "/documents",
    icon: FolderOpen,
    key: "documents",
  },
  {
    name: "Meu Perfil",
    href: "/profile",
    icon: User,
    key: "profile",
  },
];

export function Sidebar({ currentPage }: SidebarProps) {
  const [location] = useLocation();

  const { data: profile } = useQuery<BrokerProfile>({
    queryKey: ["/api/broker-profile"],
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <aside className="w-56 bg-white shadow-lg border-r border-slate-200 fixed h-full z-10 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🛡️</div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">WeSeg</h1>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2 flex-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.key} href={item.href}>
              <button
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors font-medium",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            </Link>
          );
        })}
      </nav>

      {/* User Info and Logout */}
      {profile && (
        <div className="p-3 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start space-x-2 min-w-0 flex-1">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 shadow-sm">
                {getInitials(profile.firstName, profile.lastName)}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="font-medium text-xs text-slate-800 leading-tight mb-0.5">
                  {profile.firstName} {profile.lastName}
                </div>
                <div 
                  className="text-xs text-slate-500 leading-tight break-all"
                  style={{ 
                    wordBreak: 'break-all',
                    lineHeight: '1.2',
                    fontSize: '10px'
                  }}
                  title={profile.email}
                >
                  {profile.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-1.5 rounded-md text-slate-500 hover:bg-white hover:text-red-600 hover:shadow-sm transition-all duration-200 flex-shrink-0 border border-transparent hover:border-slate-200"
              title="Sair da conta"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
