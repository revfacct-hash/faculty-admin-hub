import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { EVENTO_TIPOS } from "@/lib/admin-utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { EventoFormData } from "@/types/admin";

const initialFormData: EventoFormData = {
  titulo: "",
  descripcion: "",
  fecha_inicio: "",
  fecha_fin: "",
  ubicacion: "",
  imagen: undefined,
  tipo: "Académico",
  activo: true,
};

export default function EventoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<EventoFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      const fetchEvento = async () => {
        try {
          const { data, error } = await supabase
            .from('eventos')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          
          if (data) {
            setFormData({
              titulo: data.titulo,
              descripcion: data.descripcion || "",
              fecha_inicio: new Date(data.fecha_inicio).toISOString().slice(0, 16),
              fecha_fin: data.fecha_fin ? new Date(data.fecha_fin).toISOString().slice(0, 16) : "",
              ubicacion: data.ubicacion || "",
              imagen: data.imagen || undefined,
              tipo: data.tipo as "Académico" | "Cultural" | "Deportivo",
              activo: data.activo,
            });
          }
        } catch (error: any) {
          console.error('Error fetching evento:', error);
          toast.error('Error al cargar el evento');
        } finally {
          setIsLoading(false);
        }
      };
      fetchEvento();
    }
  }, [isEditing, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || formData.titulo.length < 5) {
      toast.error("El título debe tener al menos 5 caracteres");
      return;
    }
    if (!formData.descripcion.trim() || formData.descripcion.length < 20) {
      toast.error("La descripción debe tener al menos 20 caracteres");
      return;
    }
    if (!formData.fecha_inicio) {
      toast.error("La fecha de inicio es requerida");
      return;
    }
    if (!formData.ubicacion.trim()) {
      toast.error("La ubicación es requerida");
      return;
    }
    if (formData.fecha_fin && formData.fecha_fin < formData.fecha_inicio) {
      toast.error("La fecha de fin debe ser posterior a la de inicio");
      return;
    }

    setIsSaving(true);
    
    try {
      const dataToSave = {
        titulo: formData.titulo,
        descripcion: formData.descripcion || null,
        fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
        fecha_fin: formData.fecha_fin ? new Date(formData.fecha_fin).toISOString() : null,
        ubicacion: formData.ubicacion || null,
        imagen: formData.imagen || null,
        tipo: formData.tipo,
        activo: formData.activo,
      };

      console.log('Guardando evento...', { 
        isEditing, 
        id, 
        titulo: dataToSave.titulo,
        tieneImagen: !!dataToSave.imagen,
        fecha_inicio: dataToSave.fecha_inicio
      });

      if (isEditing && id) {
        // Type assertion para evitar errores de tipos de Supabase generados
        const { error } = await (supabase
          .from('eventos') as any)
          .update(dataToSave)
          .eq('id', id);

        if (error) {
          console.error('Error de Supabase:', error);
          throw error;
        }
        toast.success("Evento actualizado correctamente");
      } else {
        // Type assertion para evitar errores de tipos de Supabase generados
        const { error } = await (supabase
          .from('eventos') as any)
          .insert(dataToSave)
          .select()
          .single();

        if (error) {
          console.error('Error de Supabase:', error);
          throw error;
        }
        toast.success("Evento creado correctamente");
      }
      
      // Pequeño delay para que el usuario vea el mensaje de éxito
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate("/admin/eventos");
    } catch (error: any) {
      console.error('Error saving evento:', error);
      const errorMessage = error?.message || error?.error_description || 'Error al guardar el evento';
      console.error('Detalles del error:', {
        code: error?.code,
        message: errorMessage,
        details: error?.details,
        hint: error?.hint
      });
      toast.error(errorMessage);
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof EventoFormData, value: any) => {
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
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/eventos")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? "Editar Evento" : "Nuevo Evento"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? "Modifica los datos del evento" : "Completa los datos del nuevo evento"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título del Evento *</Label>
              <Input
                id="titulo"
                placeholder="Ej: Openhouse Universitario 2024"
                value={formData.titulo}
                onChange={(e) => handleChange("titulo", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe el evento..."
                rows={4}
                value={formData.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 20 caracteres ({formData.descripcion.length}/20)
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Fecha y Hora de Inicio *</Label>
                <Input
                  id="fecha_inicio"
                  type="datetime-local"
                  value={formData.fecha_inicio}
                  onChange={(e) => handleChange("fecha_inicio", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_fin">Fecha y Hora de Fin</Label>
                <Input
                  id="fecha_fin"
                  type="datetime-local"
                  value={formData.fecha_fin || ""}
                  onChange={(e) => handleChange("fecha_fin", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ubicacion">Ubicación *</Label>
                <Input
                  id="ubicacion"
                  placeholder="Ej: Campus Principal UEB"
                  value={formData.ubicacion}
                  onChange={(e) => handleChange("ubicacion", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Evento *</Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(value: any) => handleChange("tipo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENTO_TIPOS.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ImageUpload
              label="Imagen del Evento"
              value={formData.imagen}
              onChange={(base64) => handleChange("imagen", base64)}
              helperText="Imagen promocional del evento. Máx 1MB"
              aspectRatio="video"
              maxSizeBytes={1000000}
            />

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="activo">Evento Activo</Label>
                <p className="text-sm text-muted-foreground">
                  Los eventos inactivos no se mostrarán en el calendario
                </p>
              </div>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => handleChange("activo", checked)}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/admin/eventos")}
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
