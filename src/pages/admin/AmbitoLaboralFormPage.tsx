import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { AmbitoLaboralFormData, Carrera } from "@/types/admin";

const initialFormData: AmbitoLaboralFormData = {
  carrera_id: "",
  titulo: "",
  descripcion: "",
  imagen: undefined,
  orden: 0,
};

export default function AmbitoLaboralFormPage() {
  const { carreraId, id } = useParams<{ carreraId: string; id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<AmbitoLaboralFormData>(initialFormData);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCarreras();
  }, []);

  useEffect(() => {
    if (carreraId) {
      setFormData(prev => ({ ...prev, carrera_id: carreraId }));
    }
  }, [carreraId]);

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      const fetchAmbito = async () => {
        try {
          const { data, error } = await supabase
            .from('ambitos_laborales')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          
          if (data) {
            setFormData({
              carrera_id: data.carrera_id || "",
              titulo: data.titulo,
              descripcion: data.descripcion || "",
              imagen: data.imagen || undefined,
              orden: data.orden || 0,
            });
          }
        } catch (error: any) {
          console.error('Error fetching ambito:', error);
          toast.error('Error al cargar el ámbito laboral');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAmbito();
    }
  }, [isEditing, id, carreraId]);

  const fetchCarreras = async () => {
    try {
      const { data, error } = await supabase
        .from('carreras')
        .select('id, nombre')
        .eq('activa', true)
        .order('nombre');

      if (error) throw error;
      setCarreras(data || []);
    } catch (error: any) {
      console.error('Error fetching carreras:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.carrera_id) {
      toast.error("Debes seleccionar una carrera");
      return;
    }
    if (!formData.titulo.trim() || formData.titulo.length < 3) {
      toast.error("El título debe tener al menos 3 caracteres");
      return;
    }
    if (!formData.descripcion.trim() || formData.descripcion.length < 10) {
      toast.error("La descripción debe tener al menos 10 caracteres");
      return;
    }

    setIsSaving(true);
    
    try {
      const dataToSave = {
        carrera_id: formData.carrera_id,
        titulo: formData.titulo,
        descripcion: formData.descripcion || null,
        imagen: formData.imagen || null,
        orden: formData.orden,
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from('ambitos_laborales')
          .update(dataToSave)
          .eq('id', id);

        if (error) throw error;
        toast.success("Ámbito laboral actualizado correctamente");
      } else {
        const { error } = await supabase
          .from('ambitos_laborales')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        toast.success("Ámbito laboral creado correctamente");
      }
      
      navigate(`/admin/ambitos-laborales/${formData.carrera_id}`);
    } catch (error: any) {
      console.error('Error saving ambito:', error);
      toast.error(error.message || 'Error al guardar el ámbito laboral');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof AmbitoLaboralFormData, value: any) => {
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
        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/ambitos-laborales/${formData.carrera_id || carreraId || ""}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? "Editar Ámbito Laboral" : "Nuevo Ámbito Laboral"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? "Modifica los datos del ámbito laboral" : "Completa los datos para crear un nuevo ámbito laboral"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Ámbito Laboral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="carrera_id">Carrera *</Label>
              <Select
                value={formData.carrera_id}
                onValueChange={(value) => handleChange("carrera_id", value)}
                disabled={!!carreraId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una carrera" />
                </SelectTrigger>
                  <SelectContent>
                    {carreras.map((carrera) => (
                      <SelectItem key={carrera.id} value={carrera.id}>
                        {carrera.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                placeholder="Ej: Gerente de área"
                value={formData.titulo}
                onChange={(e) => handleChange("titulo", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                placeholder="Ej: Liderazgo y gestión de equipos tecnológicos"
                rows={4}
                value={formData.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
              />
            </div>

            <ImageUpload
              label="Imagen del Ámbito Laboral"
              value={formData.imagen}
              onChange={(base64) => handleChange("imagen", base64)}
              helperText="JPG/PNG, máximo 1MB. Se convertirá a base64"
              aspectRatio="video"
              maxSizeBytes={1000000}
            />

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
                onClick={() => navigate(`/admin/ambitos-laborales/${formData.carrera_id || carreraId || ""}`)}
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
