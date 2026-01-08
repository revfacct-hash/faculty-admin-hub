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
import { toast } from "sonner";
import type { DocenteFormData } from "@/types/admin";

const mockCarreras = [
  { id: "1", nombre: "Ingeniería de Sistemas" },
  { id: "2", nombre: "Ingeniería Electrónica" },
  { id: "3", nombre: "Ingeniería Mecatrónica" },
];

const initialFormData: DocenteFormData = {
  carrera_id: "",
  nombre: "",
  especialidad: "",
  titulo: "",
  experiencia: "",
  imagen_avatar: undefined,
  cv_imagen: undefined,
  orden: 0,
  activo: true,
};

export default function DocenteFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<DocenteFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      setTimeout(() => {
        setFormData({
          carrera_id: "1",
          nombre: "Ing. Roberto Carlos Saavedra Nogales",
          especialidad: "Seguridad Informática y Auditoría de Sistemas",
          titulo: "Ingeniero de Sistemas - Magister en Seguridad Informática",
          experiencia: "25 años en desarrollo de software y seguridad informática",
          imagen_avatar: undefined,
          cv_imagen: undefined,
          orden: 1,
          activo: true,
        });
        setIsLoading(false);
      }, 500);
    }
  }, [isEditing, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.carrera_id) {
      toast.error("Selecciona una carrera");
      return;
    }
    if (!formData.nombre.trim() || formData.nombre.length < 5) {
      toast.error("El nombre debe tener al menos 5 caracteres");
      return;
    }
    if (!formData.especialidad.trim() || formData.especialidad.length < 3) {
      toast.error("La especialidad debe tener al menos 3 caracteres");
      return;
    }
    if (!formData.titulo.trim() || formData.titulo.length < 5) {
      toast.error("El título debe tener al menos 5 caracteres");
      return;
    }
    if (!formData.experiencia.trim() || formData.experiencia.length < 10) {
      toast.error("La experiencia debe tener al menos 10 caracteres");
      return;
    }

    setIsSaving(true);
    console.log("Saving:", formData);
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success(isEditing ? "Docente actualizado correctamente" : "Docente creado correctamente");
      navigate("/admin/docentes");
    }, 1000);
  };

  const handleChange = (field: keyof DocenteFormData, value: any) => {
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
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/docentes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? "Editar Docente" : "Nuevo Docente"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? "Modifica los datos del docente" : "Completa los datos del nuevo docente"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Información del Docente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="carrera_id">Carrera *</Label>
                <Select 
                  value={formData.carrera_id} 
                  onValueChange={(value) => handleChange("carrera_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCarreras.map((carrera) => (
                      <SelectItem key={carrera.id} value={carrera.id}>
                        {carrera.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Ing. Roberto Carlos Saavedra Nogales"
                  value={formData.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="especialidad">Especialidad *</Label>
                <Input
                  id="especialidad"
                  placeholder="Ej: Seguridad Informática y Auditoría de Sistemas"
                  value={formData.especialidad}
                  onChange={(e) => handleChange("especialidad", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="titulo">Título Académico *</Label>
                <Input
                  id="titulo"
                  placeholder="Ej: Ingeniero de Sistemas - Magister en Seguridad Informática"
                  value={formData.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experiencia">Experiencia *</Label>
                <Textarea
                  id="experiencia"
                  placeholder="Ej: 25 años en desarrollo de software y seguridad informática"
                  rows={3}
                  value={formData.experiencia}
                  onChange={(e) => handleChange("experiencia", e.target.value)}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orden">Orden de Visualización</Label>
                  <Input
                    id="orden"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={formData.orden}
                    onChange={(e) => handleChange("orden", parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Menor número aparece primero
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="activo">Docente Activo</Label>
                  <p className="text-sm text-muted-foreground">
                    Los docentes inactivos no se mostrarán en el frontend
                  </p>
                </div>
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => handleChange("activo", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUpload
                label="Foto de Perfil"
                value={formData.imagen_avatar}
                onChange={(base64) => handleChange("imagen_avatar", base64)}
                helperText="Imagen pequeña para la lista. Máx 500KB"
                maxSizeBytes={500000}
                aspectRatio="square"
                circular
              />

              <ImageUpload
                label="Curriculum Vitae (CV) *"
                value={formData.cv_imagen}
                onChange={(base64) => handleChange("cv_imagen", base64)}
                helperText="CV completo en imagen. Máx 2MB"
                maxSizeBytes={2000000}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/admin/docentes")}
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
      </form>
    </div>
  );
}
