import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell } from "@/components/layout/Shell";
import { userStorage } from "@/lib/user-storage";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Analysis from "@/pages/Analysis";
import Login from "@/pages/Login";

function ProtectedRoute({ component: Component }: { component: any }) {
  const username = userStorage.getUser();
  if (!username) {
    return <Login />;
  }
  return <Shell><Component /></Shell>;
}

function Router() {
  const [location] = useLocation();

  // If user tries to access /login but already logged in, redirect to dashboard
  if (location === "/login" && userStorage.getUser()) {
    return <Dashboard />;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/transactions">
        {() => <ProtectedRoute component={Transactions} />}
      </Route>
      <Route path="/analysis">
        {() => <ProtectedRoute component={Analysis} />}
      </Route>
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
