import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { PlanEstudiosFormData, Carrera } from "@/types/admin";
import { MATERIA_COLORS, MATERIA_CATEGORIAS } from "@/lib/admin-utils";

const initialFormData: PlanEstudiosFormData = {
  carrera_id: "",
  semestre_numero: 1,
  materia_nombre: "",
  materia_color: "#2563eb",
  horas_teoria: 0,
  horas_practica: 0,
  categoria: "Otros",
  orden: 0,
};

export default function PlanEstudiosFormPage() {
  const { carreraId, id } = useParams<{ carreraId: string; id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<PlanEstudiosFormData>(initialFormData);
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
    const semestre = searchParams.get("semestre");
    if (semestre) {
      setFormData(prev => ({ ...prev, semestre_numero: parseInt(semestre) }));
    }
  }, [carreraId, searchParams]);

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      const fetchMateria = async () => {
        try {
          const { data, error } = await supabase
            .from('plan_estudios')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          
          if (data) {
            setFormData({
              carrera_id: data.carrera_id || "",
              semestre_numero: data.semestre_numero,
              materia_nombre: data.materia_nombre,
              materia_color: data.materia_color,
              horas_teoria: data.horas_teoria,
              horas_practica: data.horas_practica,
              categoria: data.categoria as typeof formData.categoria,
              orden: data.orden,
            });
          }
        } catch (error: any) {
          console.error('Error fetching materia:', error);
          toast.error('Error al cargar la materia');
        } finally {
          setIsLoading(false);
        }
      };
      fetchMateria();
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
    if (!formData.materia_nombre.trim() || formData.materia_nombre.length < 3) {
      toast.error("El nombre de la materia debe tener al menos 3 caracteres");
      return;
    }
    if (formData.horas_teoria < 0 || formData.horas_practica < 0) {
      toast.error("Las horas no pueden ser negativas");
      return;
    }
    if (formData.semestre_numero < 1 || formData.semestre_numero > 10) {
      toast.error("El semestre debe estar entre 1 y 10");
      return;
    }

    setIsSaving(true);
    
    try {
      const dataToSave = {
        carrera_id: formData.carrera_id,
        semestre_numero: formData.semestre_numero,
        materia_nombre: formData.materia_nombre,
        materia_color: formData.materia_color,
        horas_teoria: formData.horas_teoria,
        horas_practica: formData.horas_practica,
        categoria: formData.categoria,
        orden: formData.orden,
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from('plan_estudios')
          .update(dataToSave)
          .eq('id', id);

        if (error) throw error;
        toast.success("Materia actualizada correctamente");
      } else {
        const { error } = await supabase
          .from('plan_estudios')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        toast.success("Materia creada correctamente");
      }
      
      navigate(`/admin/plan-estudios/${formData.carrera_id}`);
    } catch (error: any) {
      console.error('Error saving materia:', error);
      toast.error(error.message || 'Error al guardar la materia');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof PlanEstudiosFormData, value: any) => {
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
        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/plan-estudios/${formData.carrera_id || carreraId || ""}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? "Editar Materia" : "Nueva Materia"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? "Modifica los datos de la materia" : "Completa los datos para crear una nueva materia"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información de la Materia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
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
                <Label htmlFor="semestre_numero">Semestre *</Label>
                <Select
                  value={formData.semestre_numero.toString()}
                  onValueChange={(value) => handleChange("semestre_numero", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semestre {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="materia_nombre">Nombre de la Materia *</Label>
              <Input
                id="materia_nombre"
                placeholder="Ej: Programación I"
                value={formData.materia_nombre}
                onChange={(e) => handleChange("materia_nombre", e.target.value)}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="materia_color">Color de Visualización *</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.materia_color}
                    onValueChange={(value) => handleChange("materia_color", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIA_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full border"
                              style={{ backgroundColor: color.value }}
                            />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="color"
                    value={formData.materia_color}
                    onChange={(e) => handleChange("materia_color", e.target.value)}
                    className="w-20 h-10"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className="h-6 w-6 rounded-full border-2"
                    style={{ backgroundColor: formData.materia_color }}
                  />
                  <span className="text-sm text-muted-foreground">Vista previa</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => handleChange("categoria", value as typeof formData.categoria)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIA_CATEGORIAS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="horas_teoria">Horas Teóricas *</Label>
                <Input
                  id="horas_teoria"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.horas_teoria}
                  onChange={(e) => handleChange("horas_teoria", parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Usado para calcular el porcentaje de teoría
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="horas_practica">Horas Prácticas *</Label>
                <Input
                  id="horas_practica"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.horas_practica}
                  onChange={(e) => handleChange("horas_practica", parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Usado para calcular el porcentaje de práctica
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orden">Orden dentro del Semestre</Label>
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
                onClick={() => navigate(`/admin/plan-estudios/${formData.carrera_id || carreraId || ""}`)}
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
