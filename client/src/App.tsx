import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import Dashboard from "@/pages/dashboard";
import Pipeline from "@/pages/pipeline";
import Contacts from "@/pages/contacts";
import Claims from "@/pages/claims";
import Policies from "@/pages/policies";
import Documents from "@/pages/documents";
import Profile from "@/pages/profile";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Authentication routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      
      {/* Landing page for unauthenticated users */}
      <Route path="/" component={isAuthenticated ? Dashboard : Landing} />
      
      {/* Protected routes */}
      {isAuthenticated ? (
        <>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/pipeline" component={Pipeline} />
          <Route path="/contacts" component={Contacts} />
          <Route path="/claims" component={Claims} />
          <Route path="/policies" component={Policies} />
          <Route path="/documents" component={Documents} />
          <Route path="/profile" component={Profile} />
        </>
      ) : (
        <>
          {/* Redirect to landing page if not authenticated */}
          <Route path="/dashboard" component={Landing} />
          <Route path="/pipeline" component={Landing} />
          <Route path="/contacts" component={Landing} />
          <Route path="/claims" component={Landing} />
          <Route path="/policies" component={Landing} />
          <Route path="/documents" component={Landing} />
          <Route path="/profile" component={Landing} />
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
