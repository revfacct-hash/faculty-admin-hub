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
import type { AmbitoLaboral, Carrera } from "@/types/admin";

export default function AmbitosLaboralesPage() {
  const { carreraId } = useParams<{ carreraId: string }>();
  const navigate = useNavigate();
  const [selectedCarreraId, setSelectedCarreraId] = useState<string>(carreraId || "");
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [ambitos, setAmbitos] = useState<AmbitoLaboral[]>([]);
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
      fetchAmbitos();
    } else if (carreras.length === 0 && !isLoadingCarreras) {
      // Si no hay carreras disponibles y ya terminó de cargar, detener la carga
      setIsLoading(false);
      setAmbitos([]);
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
      console.log('Carreras cargadas en AmbitosLaboralesPage:', data?.length || 0);
      
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

  const fetchAmbitos = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ambitos_laborales')
        .select('*')
        .eq('carrera_id', selectedCarreraId)
        .order('orden');

      if (error) throw error;
      setAmbitos(data || []);
    } catch (error: any) {
      console.error('Error fetching ambitos:', error);
      toast.error('Error al cargar los ámbitos laborales');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('ambitos_laborales')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      
      toast.success("Ámbito laboral eliminado correctamente");
      setDeleteId(null);
      fetchAmbitos();
    } catch (error: any) {
      console.error('Error deleting ambito:', error);
      toast.error('Error al eliminar el ámbito laboral');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = (ambitoId: string, direction: "up" | "down") => {
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
            <h2 className="text-2xl font-bold">Ámbitos Laborales</h2>
            <p className="text-muted-foreground">Selecciona una carrera para ver sus ámbitos laborales</p>
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
                    console.log('Carrera seleccionada en AmbitosLaboralesPage:', value);
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
              <h2 className="text-2xl font-bold">Ámbitos Laborales - {selectedCarrera?.nombre}</h2>
              <p className="text-muted-foreground">Gestiona los ámbitos laborales de la carrera</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/admin/ambitos-laborales/${selectedCarreraId}/crear`}>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Ámbito
            </Button>
          </Link>
          <Link to={`/admin/ambitos-laborales/${selectedCarreraId}/agregar-masivo`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Múltiples Ámbitos
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
      ) : ambitos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No hay datos existentes</p>
            <Link to={`/admin/ambitos-laborales/${selectedCarreraId}/crear`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Ámbito
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ambitos.map((ambito) => (
            <Card key={ambito.id} className="overflow-hidden">
              {ambito.imagen && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={ambito.imagen}
                    alt={ambito.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{ambito.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {ambito.descripcion}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMove(ambito.id, "up")}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMove(ambito.id, "down")}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/ambitos-laborales/${selectedCarreraId}/editar/${ambito.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(ambito.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="¿Eliminar ámbito laboral?"
        description="Esta acción eliminará el ámbito laboral permanentemente."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
}
