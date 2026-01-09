import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/admin-utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { VideoPromocionalFormData, Carrera } from "@/types/admin";

const initialFormData: VideoPromocionalFormData = {
  carrera_id: "",
  titulo: "",
  url_youtube: "",
  descripcion: "",
  activo: true,
};

export default function VideoPromocionalFormPage() {
  const { carreraId, id } = useParams<{ carreraId: string; id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<VideoPromocionalFormData>(initialFormData);
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
      const fetchVideo = async () => {
        try {
          const { data, error } = await supabase
            .from('videos_promocionales')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          
          if (data) {
            setFormData({
              carrera_id: data.carrera_id || "",
              titulo: data.titulo || "",
              url_youtube: data.url_youtube,
              descripcion: data.descripcion || "",
              activo: data.activo,
            });
          }
        } catch (error: any) {
          console.error('Error fetching video:', error);
          toast.error('Error al cargar el video');
        } finally {
          setIsLoading(false);
        }
      };
      fetchVideo();
    }
  }, [isEditing, id, carreraId]);

  const fetchCarreras = async () => {
    try {
      const { data, error } = await supabase
        .from('carreras')
        .select('id, nombre, activa')
        .order('activa', { ascending: false })
        .order('nombre');

      if (error) throw error;
      setCarreras(data || []);
      console.log('Carreras cargadas en VideoPromocionalFormPage:', data?.length || 0);
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
    if (!formData.url_youtube.trim()) {
      toast.error("La URL de YouTube es requerida");
      return;
    }

    const videoId = extractYouTubeId(formData.url_youtube);
    if (!videoId) {
      toast.error("URL de YouTube inválida");
      return;
    }

    setIsSaving(true);
    
    try {
      const dataToSave = {
        carrera_id: formData.carrera_id,
        titulo: formData.titulo || null,
        url_youtube: videoId,
        descripcion: formData.descripcion || null,
        activo: formData.activo,
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from('videos_promocionales')
          .update(dataToSave)
          .eq('id', id);

        if (error) throw error;
        toast.success("Video actualizado correctamente");
      } else {
        const { error } = await supabase
          .from('videos_promocionales')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        toast.success("Video creado correctamente");
      }
      
      navigate(`/admin/videos-promocionales/${formData.carrera_id}`);
    } catch (error: any) {
      console.error('Error saving video:', error);
      toast.error(error.message || 'Error al guardar el video');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof VideoPromocionalFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const videoId = formData.url_youtube ? extractYouTubeId(formData.url_youtube) : null;

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
        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/videos-promocionales/${formData.carrera_id || carreraId || ""}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? "Editar Video Promocional" : "Nuevo Video Promocional"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? "Modifica los datos del video" : "Completa los datos para crear un nuevo video"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle>Información del Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 overflow-visible">
              {!carreraId && (
                <div className="space-y-2">
                  <Label htmlFor="carrera_id">Carrera *</Label>
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
              )}

              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  placeholder="Ej: Video Promocional Ingeniería de Sistemas"
                  value={formData.titulo || ""}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url_youtube">URL de YouTube *</Label>
                <Input
                  id="url_youtube"
                  placeholder="URL completa o ID del video"
                  value={formData.url_youtube}
                  onChange={(e) => handleChange("url_youtube", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Ej: https://youtube.com/watch?v=ABC123 o solo ABC123
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el video..."
                  rows={4}
                  value={formData.descripcion || ""}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="activo">Video Activo</Label>
                  <p className="text-sm text-muted-foreground">
                    Los videos inactivos no se mostrarán en el frontend
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
                  onClick={() => navigate(`/admin/videos-promocionales/${formData.carrera_id || carreraId || ""}`)}
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

          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
            </CardHeader>
            <CardContent>
              {videoId ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>ID del video: {videoId}</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground text-center">
                    Ingresa una URL de YouTube para ver la vista previa
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
