import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import LiveDeck from "./pages/LiveDeck";
import Library from "./pages/Library";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import { AppHeader } from "./components/livedeck/AppHeader";
import { TrainerPanel } from "./components/livedeck/TrainerPanel";

const queryClient = new QueryClient();

const Shell = () => (
  <div className="h-screen flex flex-col bg-background overflow-hidden">
    <AppHeader />
    <div className="flex-1 flex flex-col min-h-0">
      <Outlet />
    </div>
    <TrainerPanel />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<Index />} />
            <Route path="/livedeck" element={<LiveDeck />} />
            <Route path="/library" element={<Library />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
