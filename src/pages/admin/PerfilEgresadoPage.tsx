import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Plus, ArrowLeft, Edit, Trash2, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { PerfilEgresado, Carrera } from "@/types/admin";

export default function PerfilEgresadoPage() {
  const { carreraId } = useParams<{ carreraId: string }>();
  const navigate = useNavigate();
  const [selectedCarreraId, setSelectedCarreraId] = useState<string>(carreraId || "");
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [competencias, setCompetencias] = useState<PerfilEgresado[]>([]);
  const [isLoadingCarreras, setIsLoadingCarreras] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedCarrera = carreras.find(c => c.id === selectedCarreraId);

  useEffect(() => {
    fetchCarreras();
  }, []);

  useEffect(() => {
    // Si hay carreras pero no hay carrera seleccionada, seleccionar la primera
    if (carreras.length > 0 && !selectedCarreraId) {
      setSelectedCarreraId(carreras[0].id);
      return;
    }
    
    if (selectedCarreraId) {
      fetchCompetencias();
    } else if (carreras.length === 0 && !isLoadingCarreras) {
      // Si no hay carreras disponibles y ya terminó de cargar, detener la carga
      setIsLoading(false);
      setCompetencias([]);
    }
  }, [selectedCarreraId, carreras.length, isLoadingCarreras]);

  useEffect(() => {
    if (carreraId && !selectedCarreraId) {
      setSelectedCarreraId(carreraId);
    }
  }, [carreraId, selectedCarreraId]);

  const fetchCarreras = async () => {
    try {
      setIsLoadingCarreras(true);
      // Cargar TODAS las carreras (activas e inactivas) para que el usuario pueda seleccionar
      const { data, error } = await supabase
        .from('carreras')
        .select('id, nombre, activa')
        .order('activa', { ascending: false }) // Activas primero
        .order('nombre');

      if (error) {
        console.error('Error de Supabase al cargar carreras:', error);
        throw error;
      }
      
      setCarreras(data || []);
      console.log('Carreras cargadas en PerfilEgresadoPage:', data?.length || 0);
      
      if (!data || data.length === 0) {
        console.warn('No se encontraron carreras en la base de datos');
        toast.warning('No hay carreras disponibles. Crea una carrera primero.');
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Error fetching carreras:', error);
      toast.error('Error al cargar las carreras: ' + (error.message || 'Error desconocido'));
      setIsLoading(false);
    } finally {
      setIsLoadingCarreras(false);
    }
  };

  const fetchCompetencias = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('perfil_egresado')
        .select('*')
        .eq('carrera_id', selectedCarreraId)
        .order('orden');

      if (error) throw error;
      setCompetencias(data || []);
    } catch (error: any) {
      console.error('Error fetching competencias:', error);
      toast.error('Error al cargar las competencias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('perfil_egresado')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      
      toast.success("Competencia eliminada correctamente");
      setDeleteId(null);
      fetchCompetencias();
    } catch (error: any) {
      console.error('Error deleting competencia:', error);
      toast.error('Error al eliminar la competencia');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = (competenciaId: string, direction: "up" | "down") => {
    // TODO: Implement move logic
    toast.info("Funcionalidad de reordenamiento pendiente");
  };

  if (!selectedCarreraId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/carreras")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Perfil del Egresado</h2>
            <p className="text-muted-foreground">Selecciona una carrera para ver el perfil del egresado</p>
          </div>
        </div>

        <Card className="overflow-visible">
          <CardContent className="pt-6 overflow-visible">
            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar Carrera</label>
              {isLoadingCarreras ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Cargando carreras...</span>
                </div>
              ) : carreras.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No hay carreras disponibles. Crea una carrera primero.
                </div>
              ) : (
                <div className="relative">
                  <Select value={selectedCarreraId} onValueChange={(value) => {
                    console.log('Carrera seleccionada en PerfilEgresadoPage:', value);
                    setSelectedCarreraId(value);
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una carrera" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      {carreras.map((carrera) => (
                        <SelectItem key={carrera.id} value={carrera.id}>
                          {carrera.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/carreras")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Select value={selectedCarreraId} onValueChange={setSelectedCarreraId}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {carreras.map((carrera) => (
                    <SelectItem key={carrera.id} value={carrera.id}>
                      {carrera.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Perfil del Egresado - {selectedCarrera?.nombre}</h2>
              <p className="text-muted-foreground">Gestiona las competencias del egresado</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/admin/perfil-egresado/${selectedCarreraId}/crear`}>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Competencia
            </Button>
          </Link>
          <Link to={`/admin/perfil-egresado/${selectedCarreraId}/agregar-masivo`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Múltiples Competencias
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      ) : competencias.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No hay datos existentes</p>
            <Link to={`/admin/perfil-egresado/${selectedCarreraId}/crear`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Competencia
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {competencias.map((competencia, index) => (
                <div
                  key={competencia.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{competencia.competencia}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMove(competencia.id, "up")}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMove(competencia.id, "down")}
                      disabled={index === competencias.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Link to={`/admin/perfil-egresado/${selectedCarreraId}/editar/${competencia.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(competencia.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="¿Eliminar competencia?"
        description="Esta acción eliminará la competencia permanentemente."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
}
