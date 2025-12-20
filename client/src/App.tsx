import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Analysis from "@/pages/Analysis";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Settings from "@/pages/Settings";
import { AuthProvider, useAuth } from "@/lib/auth";

function Router() {
  // small protected route wrapper for wouter
  function Protected({ component: Component }: { component: any }) {
    const { user, loading } = useAuth();
    const [, setLocation] = useLocation();
    if (loading) return null;
    if (!user) {
      setLocation("/login");
      return null;
    }
    return <Component />;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/settings" component={() => <Protected component={Settings} />} />
      <Route path="/" component={() => <Protected component={Dashboard} />} />
      <Route path="/transactions" component={() => <Protected component={Transactions} />} />
      <Route path="/analysis" component={() => <Protected component={Analysis} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
