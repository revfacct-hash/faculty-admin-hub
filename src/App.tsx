import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Admin imports
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CarrerasPage from "./pages/admin/CarrerasPage";
import CarreraFormPage from "./pages/admin/CarreraFormPage";
import DocentesPage from "./pages/admin/DocentesPage";
import DocenteFormPage from "./pages/admin/DocenteFormPage";
import EventosPage from "./pages/admin/EventosPage";
import EventoFormPage from "./pages/admin/EventoFormPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="carreras" element={<CarrerasPage />} />
            <Route path="carreras/crear" element={<CarreraFormPage />} />
            <Route path="carreras/editar/:id" element={<CarreraFormPage />} />
            <Route path="docentes" element={<DocentesPage />} />
            <Route path="docentes/crear" element={<DocenteFormPage />} />
            <Route path="docentes/editar/:id" element={<DocenteFormPage />} />
            <Route path="eventos" element={<EventosPage />} />
            <Route path="eventos/crear" element={<EventoFormPage />} />
            <Route path="eventos/editar/:id" element={<EventoFormPage />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
