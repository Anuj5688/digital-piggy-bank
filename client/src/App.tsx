import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { PiggyBank } from "lucide-react";

// Pages
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import SendMoney from "@/pages/send-money";
import ManageFunds from "@/pages/manage-funds";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-primary">
        <div className="relative">
          <PiggyBank size={48} className="animate-bounce" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full animate-ping"></div>
        </div>
        <p className="font-display font-bold animate-pulse">Loading PiggyLink...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/" /> : <LoginPage />}
      </Route>
      <Route path="/register">
        {isAuthenticated ? <Redirect to="/" /> : <RegisterPage />}
      </Route>
      <Route path="/">
        {!isAuthenticated && !isLoading ? (
          <LandingPage />
        ) : (
          <ProtectedRoute component={Dashboard} />
        )}
      </Route>
      <Route path="/send" component={() => <ProtectedRoute component={SendMoney} />} />
      <Route path="/manage" component={() => <ProtectedRoute component={ManageFunds} />} />
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
