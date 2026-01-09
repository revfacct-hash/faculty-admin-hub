import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { PerfilEgresadoFormData, Carrera } from "@/types/admin";

const initialFormData: PerfilEgresadoFormData = {
  carrera_id: "",
  competencia: "",
  orden: 0,
};

export default function PerfilEgresadoFormPage() {
  const { carreraId, id } = useParams<{ carreraId: string; id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<PerfilEgresadoFormData>(initialFormData);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialCarreraSet, setInitialCarreraSet] = useState(false);

  useEffect(() => {
    fetchCarreras();
  }, []);

  useEffect(() => {
    // Solo establecer carrera_id desde URL si no estamos editando y no se ha establecido antes
    if (carreraId && !isEditing && !initialCarreraSet) {
      setFormData(prev => ({ ...prev, carrera_id: carreraId }));
      setInitialCarreraSet(true);
    }
  }, [carreraId, isEditing, initialCarreraSet]);

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      const fetchCompetencia = async () => {
        try {
          const { data, error } = await supabase
            .from('perfil_egresado')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          
          if (data) {
            setFormData({
              carrera_id: data.carrera_id || "",
              competencia: data.competencia,
              orden: data.orden || 0,
            });
            setInitialCarreraSet(true); // Marcar como establecido para evitar sobrescritura
          }
        } catch (error: any) {
          console.error('Error fetching competencia:', error);
          toast.error('Error al cargar la competencia');
        } finally {
          setIsLoading(false);
        }
      };
      fetchCompetencia();
    }
  }, [isEditing, id]);

  const fetchCarreras = async () => {
    try {
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
      console.log('Carreras cargadas en PerfilEgresadoFormPage:', data?.length || 0);
    } catch (error: any) {
      console.error('Error fetching carreras:', error);
      toast.error('Error al cargar las carreras');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.carrera_id) {
      toast.error("Debes seleccionar una carrera");
      return;
    }
    if (!formData.competencia.trim() || formData.competencia.length < 10) {
      toast.error("La competencia debe tener al menos 10 caracteres");
      return;
    }

    setIsSaving(true);
    
    try {
      const dataToSave = {
        carrera_id: formData.carrera_id,
        competencia: formData.competencia,
        orden: formData.orden,
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from('perfil_egresado')
          .update(dataToSave)
          .eq('id', id);

        if (error) throw error;
        toast.success("Competencia actualizada correctamente");
      } else {
        const { error } = await supabase
          .from('perfil_egresado')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        toast.success("Competencia creada correctamente");
      }
      
      navigate(`/admin/perfil-egresado/${formData.carrera_id}`);
    } catch (error: any) {
      console.error('Error saving competencia:', error);
      toast.error(error.message || 'Error al guardar la competencia');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof PerfilEgresadoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/perfil-egresado/${formData.carrera_id || carreraId || ""}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? "Editar Competencia" : "Nueva Competencia"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? "Modifica la competencia" : "Completa los datos para crear una nueva competencia"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle>Información de la Competencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 overflow-visible">
            {!carreraId && (
              <div className="space-y-2">
                <Label htmlFor="carrera_id">Carrera *</Label>
                <div className="relative">
                  <Select
                    value={formData.carrera_id}
                    onValueChange={(value) => handleChange("carrera_id", value)}
                  >
                    <SelectTrigger>
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
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="competencia">Competencia *</Label>
              <Textarea
                id="competencia"
                placeholder="Ej: Implementar soluciones tecnológicas innovadoras..."
                rows={4}
                value={formData.competencia}
                onChange={(e) => handleChange("competencia", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orden">Orden</Label>
              <Input
                id="orden"
                type="number"
                min={0}
                placeholder="0"
                value={formData.orden}
                onChange={(e) => handleChange("orden", parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Menor número aparece primero. Default: 0
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/admin/perfil-egresado/${formData.carrera_id || carreraId || ""}`)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
