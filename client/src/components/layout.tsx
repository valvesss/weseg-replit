import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

export function Layout({ children, currentPage }: LayoutProps) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar currentPage={currentPage} />
      <main className="flex-1 ml-56">
        <Header currentPage={currentPage} />
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
