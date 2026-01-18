import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "@/lib/i18n";
import { Loader2 } from "lucide-react";

// Lazy load all pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Cases = lazy(() => import("./pages/Cases"));
const CaseDetail = lazy(() => import("./pages/CaseDetail"));
const Documents = lazy(() => import("./pages/Documents"));
const Invoices = lazy(() => import("./pages/Invoices"));
const InvoiceDetail = lazy(() => import("./pages/InvoiceDetail"));
const Clients = lazy(() => import("./pages/Clients"));
const ClientDetail = lazy(() => import("./pages/ClientDetail"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Reports = lazy(() => import("./pages/Reports"));
const AIFeatures = lazy(() => import("./pages/AIFeatures"));
const Templates = lazy(() => import("./pages/Templates"));
const Settings = lazy(() => import("./pages/Settings"));
const ClientLogin = lazy(() => import("./pages/ClientLogin"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const ClientInvite = lazy(() => import("./pages/ClientInvite"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
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
