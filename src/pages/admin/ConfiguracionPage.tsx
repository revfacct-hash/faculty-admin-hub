import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { extractYouTubeId } from "@/lib/admin-utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { ConfiguracionFacultadFormData } from "@/types/admin";

const initialFormData: ConfiguracionFacultadFormData = {
  titulo_hero: "Facultad de Ciencia y Tecnología",
  subtitulo_hero: "Universidad Evangélica Boliviana",
  imagen_hero: undefined,
  descripcion_general: "",
  video_youtube: "",
  activo: true,
};

export default function ConfiguracionPage() {
  const [formData, setFormData] = useState<ConfiguracionFacultadFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('configuracion_facultad')
          .select('*')
          .eq('activo', true)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setFormData({
            titulo_hero: data.titulo_hero || "Facultad de Ciencia y Tecnología",
            subtitulo_hero: data.subtitulo_hero || "Universidad Evangélica Boliviana",
            imagen_hero: data.imagen_hero || undefined,
            descripcion_general: data.descripcion_general || "",
            video_youtube: data.video_youtube || "",
            activo: data.activo,
          });
        }
      } catch (error: any) {
        console.error('Error fetching config:', error);
        toast.error('Error al cargar la configuración');
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo_hero.trim()) {
      toast.error("El título principal es requerido");
      return;
    }
    if (!formData.subtitulo_hero.trim()) {
      toast.error("El subtítulo es requerido");
      return;
    }
    if (!formData.descripcion_general.trim() || formData.descripcion_general.length < 50) {
      toast.error("La descripción general debe tener al menos 50 caracteres");
      return;
    }

    if (formData.video_youtube) {
      const videoId = extractYouTubeId(formData.video_youtube);
      if (!videoId) {
        toast.error("URL de YouTube inválida");
        return;
      }
    }

    setIsSaving(true);
    
    try {
      const youtubeId = formData.video_youtube 
        ? extractYouTubeId(formData.video_youtube) 
        : null;

      const dataToSave = {
        titulo_hero: formData.titulo_hero,
        subtitulo_hero: formData.subtitulo_hero,
        imagen_hero: formData.imagen_hero || null,
        descripcion_general: formData.descripcion_general || null,
        video_youtube: youtubeId || null,
        activo: formData.activo,
      };

      // Verificar si ya existe configuración
      const { data: existing } = await supabase
        .from('configuracion_facultad')
        .select('id')
        .maybeSingle();

      if (existing) {
        // Actualizar
        const { error } = await supabase
          .from('configuracion_facultad')
          .update(dataToSave)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Crear
        const { error } = await supabase
          .from('configuracion_facultad')
          .insert(dataToSave);

        if (error) throw error;
      }
      
      toast.success("Configuración guardada correctamente");
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast.error(error.message || 'Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof ConfiguracionFacultadFormData, value: any) => {
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
      <div>
        <h2 className="text-2xl font-bold">Configuración General</h2>
        <p className="text-muted-foreground">
          Configura los datos generales de la facultad
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Configuración de la Facultad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="titulo_hero">Título Principal *</Label>
                <Input
                  id="titulo_hero"
                  placeholder="Facultad de Ciencia y Tecnología"
                  value={formData.titulo_hero}
                  onChange={(e) => handleChange("titulo_hero", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitulo_hero">Subtítulo *</Label>
                <Input
                  id="subtitulo_hero"
                  placeholder="Universidad Evangélica Boliviana"
                  value={formData.subtitulo_hero}
                  onChange={(e) => handleChange("subtitulo_hero", e.target.value)}
                />
              </div>
            </div>

            <ImageUpload
              label="Imagen Hero de la Página Principal *"
              value={formData.imagen_hero}
              onChange={(base64) => handleChange("imagen_hero", base64)}
              helperText="Imagen grande que se muestra en el hero. JPG/PNG, máximo 2MB"
              aspectRatio="video"
              maxSizeBytes={2000000}
            />

            <div className="space-y-2">
              <Label htmlFor="descripcion_general">Descripción del Video Promocional *</Label>
              <Textarea
                id="descripcion_general"
                placeholder="Describe el video promocional..."
                rows={5}
                value={formData.descripcion_general}
                onChange={(e) => handleChange("descripcion_general", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 50 caracteres ({formData.descripcion_general.length}/50)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_youtube">Video Promocional General (YouTube)</Label>
              <Input
                id="video_youtube"
                placeholder="URL completa o ID del video"
                value={formData.video_youtube || ""}
                onChange={(e) => handleChange("video_youtube", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Video que se muestra en la página principal
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="activo">Configuración Activa</Label>
                <p className="text-sm text-muted-foreground">
                  La configuración inactiva no se mostrará en el frontend
                </p>
              </div>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => handleChange("activo", checked)}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
