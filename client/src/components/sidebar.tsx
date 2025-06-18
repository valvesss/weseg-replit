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
  MoreVertical,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { BrokerProfile } from "@shared/schema";
import { useState, useRef, useEffect } from "react";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: profile } = useQuery<BrokerProfile>({
    queryKey: ["/api/broker-profile"],
  });

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Clear any cached user data and redirect to login
        window.location.href = "/login";
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: redirect to login anyway
      window.location.href = "/login";
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

      {/* User Info and Menu */}
      {profile && (
        <div className="p-3 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white relative">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
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
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center justify-center p-1.5 rounded-md text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm transition-all duration-200 flex-shrink-0 border border-transparent hover:border-slate-200"
                title="Menu"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
