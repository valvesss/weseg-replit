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
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { BrokerProfile } from "@shared/schema";

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

  const { data: profile } = useQuery<BrokerProfile>({
    queryKey: ["/api/broker-profile"],
  });

  // Filter out profile from main navigation
  const mainNavigationItems = navigationItems.filter(item => item.key !== "profile");

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
        {mainNavigationItems.map((item) => {
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

      {/* Profile Section at Bottom */}
      {profile && (
        <div className="p-4 border-t border-slate-200">
          <Link href="/profile">
            <button className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
              location === "/profile"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-slate-700 hover:bg-slate-100"
            )}>
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs font-semibold">
                {getInitials(profile.firstName, profile.lastName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{profile.firstName} {profile.lastName}</div>
                <div className="text-xs text-slate-500 truncate">{profile.email}</div>
              </div>
            </button>
          </Link>
        </div>
      )}
    </aside>
  );
}
