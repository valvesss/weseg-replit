import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { BrokerProfile } from "@shared/schema";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  currentPage: string;
}

const pageTitles = {
  dashboard: { title: "Dashboard", subtitle: "Welcome back! Here's your business overview." },
  pipeline: { title: "Sales Pipeline", subtitle: "Manage your leads and track progress through the sales funnel." },
  contacts: { title: "Contact Management", subtitle: "Manage your client relationships and contact information." },
  claims: { title: "Claims Management", subtitle: "Track and process insurance claims efficiently." },
  policies: { title: "Policy Management", subtitle: "Manage and track all insurance policies." },
  documents: { title: "Document Management", subtitle: "Upload, organize, and manage all your business documents." },
  profile: { title: "My Profile", subtitle: "Manage your broker profile and account settings." },
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
        </div>
      </div>
    </header>
  );
}
