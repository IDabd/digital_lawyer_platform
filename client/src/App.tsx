import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "@/lib/i18n";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import Documents from "./pages/Documents";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import AIFeatures from "./pages/AIFeatures";
import Templates from "./pages/Templates";
import Settings from "./pages/Settings";
import ClientLogin from "./pages/ClientLogin";
import ClientDashboard from "./pages/ClientDashboard";
import ClientInvite from "./pages/ClientInvite";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/cases"} component={Cases} />
      <Route path={"/cases/:id"} component={CaseDetail} />
      <Route path={"/documents"} component={Documents} />
      <Route path={"/invoices"} component={Invoices} />
      <Route path={"/invoices/:id"} component={InvoiceDetail} />
      <Route path={"/clients"} component={Clients} />
      <Route path={"/clients/:id"} component={ClientDetail} />
      <Route path={"/calendar"} component={Calendar} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/ai"} component={AIFeatures} />
      <Route path={"/templates"} component={Templates} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/client-portal/login"} component={ClientLogin} />
      <Route path={"/client-portal/dashboard"} component={ClientDashboard} />
      <Route path={"/client-portal/invite/:token"} component={ClientInvite} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
