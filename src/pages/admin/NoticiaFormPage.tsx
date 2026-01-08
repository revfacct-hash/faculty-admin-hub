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
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { NoticiaFormData } from "@/types/admin";

const initialFormData: NoticiaFormData = {
  titulo: "",
  contenido: "",
  imagen_portada: undefined,
  autor: "",
  fecha_publicacion: new Date().toISOString().split('T')[0],
  categoria: "General",
  activo: true,
};

const categorias = ["General", "Institucional", "Académico", "Tecnología"];

export default function NoticiaFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<NoticiaFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      const fetchNoticia = async () => {
        try {
          const { data, error } = await supabase
            .from('noticias')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          
          if (data) {
            setFormData({
              titulo: data.titulo,
              contenido: data.contenido || "",
              imagen_portada: data.imagen_portada || undefined,
              autor: data.autor || "",
              fecha_publicacion: data.fecha_publicacion.split('T')[0],
              categoria: data.categoria,
              activo: data.activo,
            });
          }
        } catch (error: any) {
          console.error('Error fetching noticia:', error);
          toast.error('Error al cargar la noticia');
        } finally {
          setIsLoading(false);
        }
      };
      fetchNoticia();
    }
  }, [isEditing, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || formData.titulo.length < 5) {
      toast.error("El título debe tener al menos 5 caracteres");
      return;
    }
    if (!formData.contenido.trim() || formData.contenido.length < 20) {
      toast.error("El contenido debe tener al menos 20 caracteres");
      return;
    }
    if (!formData.autor.trim()) {
      toast.error("El autor es requerido");
      return;
    }
    if (!formData.fecha_publicacion) {
      toast.error("La fecha de publicación es requerida");
      return;
    }

    setIsSaving(true);
    
    try {
      const dataToSave = {
        titulo: formData.titulo,
        contenido: formData.contenido || null,
        imagen_portada: formData.imagen_portada || null,
        autor: formData.autor || null,
        fecha_publicacion: new Date(formData.fecha_publicacion).toISOString(),
        categoria: formData.categoria,
        activo: formData.activo,
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from('noticias')
          .update(dataToSave)
          .eq('id', id);

        if (error) throw error;
        toast.success("Noticia actualizada correctamente");
      } else {
        const { error } = await supabase
          .from('noticias')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        toast.success("Noticia creada correctamente");
      }
      
      navigate("/admin/noticias");
    } catch (error: any) {
      console.error('Error saving noticia:', error);
      toast.error(error.message || 'Error al guardar la noticia');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof NoticiaFormData, value: any) => {
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
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/noticias")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? "Editar Noticia" : "Nueva Noticia"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? "Modifica los datos de la noticia" : "Completa los datos para crear una nueva noticia"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información de la Noticia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                placeholder="Ej: Nuevo Laboratorio de Inteligencia Artificial"
                value={formData.titulo}
                onChange={(e) => handleChange("titulo", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contenido">Contenido *</Label>
              <Textarea
                id="contenido"
                placeholder="Escribe el contenido de la noticia..."
                rows={10}
                value={formData.contenido}
                onChange={(e) => handleChange("contenido", e.target.value)}
                className="font-sans"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 20 caracteres ({formData.contenido.length}/20)
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="autor">Autor *</Label>
                <Input
                  id="autor"
                  placeholder="Ej: Dr. Juan Pérez"
                  value={formData.autor}
                  onChange={(e) => handleChange("autor", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_publicacion">Fecha de Publicación *</Label>
                <Input
                  id="fecha_publicacion"
                  type="date"
                  value={formData.fecha_publicacion}
                  onChange={(e) => handleChange("fecha_publicacion", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => handleChange("categoria", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ImageUpload
              label="Imagen de Portada"
              value={formData.imagen_portada}
              onChange={(base64) => handleChange("imagen_portada", base64)}
              helperText="JPG/PNG, máximo 1MB. Se convertirá a base64"
              aspectRatio="video"
              maxSizeBytes={1000000}
            />

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="activo">Noticia Activa</Label>
                <p className="text-sm text-muted-foreground">
                  Las noticias inactivas no se mostrarán en el frontend
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
                onClick={() => navigate("/admin/noticias")}
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
