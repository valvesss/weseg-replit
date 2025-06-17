import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  FileText,
  Shield,
  FolderOpen,
  User,
  Kanban,
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
}

const navigationItems = [
  {
    name: "Dashboard",
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
    name: "Contacts",
    href: "/contacts",
    icon: Users,
    key: "contacts",
  },
  {
    name: "Claims",
    href: "/claims",
    icon: FileText,
    key: "claims",
  },
  {
    name: "Policies",
    href: "/policies",
    icon: Shield,
    key: "policies",
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FolderOpen,
    key: "documents",
  },
  {
    name: "My Profile",
    href: "/profile",
    icon: User,
    key: "profile",
  },
];

export function Sidebar({ currentPage }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className="w-56 bg-white shadow-lg border-r border-slate-200 fixed h-full z-10">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🛡️</div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">WeSeg</h1>
            <p className="text-sm text-slate-500">Insurance Broker</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
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
    </aside>
  );
}
