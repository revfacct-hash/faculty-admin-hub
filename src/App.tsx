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
import PlanEstudiosPage from "./pages/admin/PlanEstudiosPage";
import PlanEstudiosFormPage from "./pages/admin/PlanEstudiosFormPage";
import AmbitosLaboralesPage from "./pages/admin/AmbitosLaboralesPage";
import AmbitoLaboralFormPage from "./pages/admin/AmbitoLaboralFormPage";
import PerfilEgresadoPage from "./pages/admin/PerfilEgresadoPage";
import PerfilEgresadoFormPage from "./pages/admin/PerfilEgresadoFormPage";
import VideosPromocionalesPage from "./pages/admin/VideosPromocionalesPage";
import VideoPromocionalFormPage from "./pages/admin/VideoPromocionalFormPage";
import NoticiasPage from "./pages/admin/NoticiasPage";
import NoticiaFormPage from "./pages/admin/NoticiaFormPage";
import ConfiguracionPage from "./pages/admin/ConfiguracionPage";
import AdministradoresPage from "./pages/admin/AdministradoresPage";
import AdministradorFormPage from "./pages/admin/AdministradorFormPage";

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
            <Route path="plan-estudios" element={<PlanEstudiosPage />} />
            <Route path="plan-estudios/:carreraId" element={<PlanEstudiosPage />} />
            <Route path="plan-estudios/:carreraId/crear" element={<PlanEstudiosFormPage />} />
            <Route path="plan-estudios/:carreraId/editar/:id" element={<PlanEstudiosFormPage />} />
            <Route path="ambitos-laborales" element={<AmbitosLaboralesPage />} />
            <Route path="ambitos-laborales/:carreraId" element={<AmbitosLaboralesPage />} />
            <Route path="ambitos-laborales/:carreraId/crear" element={<AmbitoLaboralFormPage />} />
            <Route path="ambitos-laborales/:carreraId/editar/:id" element={<AmbitoLaboralFormPage />} />
            <Route path="perfil-egresado" element={<PerfilEgresadoPage />} />
            <Route path="perfil-egresado/:carreraId" element={<PerfilEgresadoPage />} />
            <Route path="perfil-egresado/:carreraId/crear" element={<PerfilEgresadoFormPage />} />
            <Route path="perfil-egresado/:carreraId/editar/:id" element={<PerfilEgresadoFormPage />} />
            <Route path="videos-promocionales" element={<VideosPromocionalesPage />} />
            <Route path="videos-promocionales/:carreraId" element={<VideosPromocionalesPage />} />
            <Route path="videos-promocionales/:carreraId/crear" element={<VideoPromocionalFormPage />} />
            <Route path="videos-promocionales/:carreraId/editar/:id" element={<VideoPromocionalFormPage />} />
            <Route path="noticias" element={<NoticiasPage />} />
            <Route path="noticias/crear" element={<NoticiaFormPage />} />
            <Route path="noticias/editar/:id" element={<NoticiaFormPage />} />
            <Route path="configuracion" element={<ConfiguracionPage />} />
            <Route path="administradores" element={<AdministradoresPage />} />
            <Route path="administradores/crear" element={<AdministradorFormPage />} />
            <Route path="administradores/editar/:id" element={<AdministradorFormPage />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
