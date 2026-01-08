import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { generateSlug, extractYouTubeId } from "@/lib/admin-utils";
import { toast } from "sonner";
import type { CarreraFormData } from "@/types/admin";

const initialFormData: CarreraFormData = {
  nombre: "",
  slug: "",
  descripcion: "",
  duracion: "",
  semestres: 10,
  imagen_hero: undefined,
  descripcion_docentes: "",
  video_youtube: "",
  activa: true,
};

export default function CarreraFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<CarreraFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-generate slug from nombre
  useEffect(() => {
    if (!isEditing && formData.nombre) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.nombre)
      }));
    }
  }, [formData.nombre, isEditing]);

  // Load carrera data when editing
  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      // TODO: Fetch from Supabase
      setTimeout(() => {
        setFormData({
          nombre: "Ingeniería de Sistemas",
          slug: "ingenieria-sistemas",
          descripcion: "Formamos profesionales capaces de diseñar y desarrollar sistemas informáticos innovadores...",
          duracion: "5 años",
          semestres: 10,
          imagen_hero: undefined,
          descripcion_docentes: "Nuestro equipo docente está conformado por profesionales con amplia experiencia...",
          video_youtube: "dQw4w9WgXcQ",
          activa: true,
        });
        setIsLoading(false);
      }, 500);
    }
  }, [isEditing, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nombre.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("El slug es requerido");
      return;
    }
    if (!formData.descripcion.trim() || formData.descripcion.length < 50) {
      toast.error("La descripción debe tener al menos 50 caracteres");
      return;
    }
    if (!formData.duracion.trim()) {
      toast.error("La duración es requerida");
      return;
    }
    if (formData.semestres < 1 || formData.semestres > 20) {
      toast.error("Los semestres deben estar entre 1 y 20");
      return;
    }

    setIsSaving(true);
    
    // Extract YouTube ID if full URL provided
    const youtubeId = formData.video_youtube 
      ? extractYouTubeId(formData.video_youtube) 
      : undefined;

    const dataToSave = {
      ...formData,
      video_youtube: youtubeId || undefined,
    };

    // TODO: Save to Supabase
    console.log("Saving:", dataToSave);
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success(isEditing ? "Carrera actualizada correctamente" : "Carrera creada correctamente");
      navigate("/admin/carreras");
    }, 1000);
  };

  const handleChange = (field: keyof CarreraFormData, value: any) => {
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
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/carreras")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? "Editar Carrera" : "Nueva Carrera"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? "Modifica los datos de la carrera" : "Completa los datos para crear una nueva carrera"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información de la Carrera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Carrera *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Ingeniería de Sistemas"
                  value={formData.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL amigable) *</Label>
                <Input
                  id="slug"
                  placeholder="ej: ingenieria-sistemas"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Se genera automáticamente desde el nombre
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción de la Carrera *</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe la carrera..."
                rows={4}
                value={formData.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 50 caracteres ({formData.descripcion.length}/50)
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duracion">Duración *</Label>
                <Input
                  id="duracion"
                  placeholder="Ej: 5 años"
                  value={formData.duracion}
                  onChange={(e) => handleChange("duracion", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semestres">Número de Semestres *</Label>
                <Input
                  id="semestres"
                  type="number"
                  min={1}
                  max={20}
                  placeholder="Ej: 10"
                  value={formData.semestres}
                  onChange={(e) => handleChange("semestres", parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <ImageUpload
              label="Imagen Hero de la Carrera"
              value={formData.imagen_hero}
              onChange={(base64) => handleChange("imagen_hero", base64)}
              helperText="Imagen principal que se muestra en la página de la carrera"
              aspectRatio="video"
              maxSizeBytes={1000000}
            />

            <div className="space-y-2">
              <Label htmlFor="video_youtube">Video Promocional (YouTube)</Label>
              <Input
                id="video_youtube"
                placeholder="URL completa o ID del video"
                value={formData.video_youtube || ""}
                onChange={(e) => handleChange("video_youtube", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Ej: https://youtube.com/watch?v=ABC123 o solo ABC123
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion_docentes">Descripción del Cuerpo Docente</Label>
              <Textarea
                id="descripcion_docentes"
                placeholder="Describe el equipo docente..."
                rows={3}
                value={formData.descripcion_docentes || ""}
                onChange={(e) => handleChange("descripcion_docentes", e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="activa">Carrera Activa</Label>
                <p className="text-sm text-muted-foreground">
                  Las carreras inactivas no se mostrarán en el frontend
                </p>
              </div>
              <Switch
                id="activa"
                checked={formData.activa}
                onCheckedChange={(checked) => handleChange("activa", checked)}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/admin/carreras")}
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
