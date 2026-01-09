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
  const [selectedCarrera, setSelectedCarrera] = useState<Carrera | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCarreras, setIsLoadingCarreras] = useState(true);
  const [initialCarreraSet, setInitialCarreraSet] = useState(false);

  useEffect(() => {
    fetchCarreras();
  }, []);

  useEffect(() => {
    // Solo establecer carrera_id una vez cuando viene en la URL al montar el componente
    // Esto permite que el usuario pueda cambiar la carrera después
    if (carreraId && !initialCarreraSet && !isEditing) {
      setFormData(prev => ({ ...prev, carrera_id: carreraId }));
      setInitialCarreraSet(true);
    }
    const semestre = searchParams.get("semestre");
    if (semestre) {
      setFormData(prev => ({ ...prev, semestre_numero: parseInt(semestre) }));
    }
  }, [carreraId, searchParams, initialCarreraSet, isEditing]);

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
            
            // Cargar la información de la carrera para obtener el número de semestres
            if (data.carrera_id) {
              const carrera = carreras.find(c => c.id === data.carrera_id);
              if (carrera) {
                setSelectedCarrera(carrera);
              }
            }
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
      setIsLoadingCarreras(true);
      // Cargar TODAS las carreras (activas e inactivas) con el campo semestres
      const { data, error } = await supabase
        .from('carreras')
        .select('id, nombre, activa, semestres')
        .order('activa', { ascending: false }) // Activas primero
        .order('nombre');

      if (error) {
        console.error('Error de Supabase al cargar carreras:', error);
        throw error;
      }
      
      setCarreras(data || []);
      console.log('Carreras cargadas:', data?.length || 0, data);
      
      // Si hay una carrera pre-seleccionada, establecerla
      if (carreraId && data) {
        const preSelectedCarrera = data.find(c => c.id === carreraId);
        if (preSelectedCarrera) {
          setSelectedCarrera(preSelectedCarrera);
        }
      }
      
      if (!data || data.length === 0) {
        console.warn('No se encontraron carreras en la base de datos');
        toast.warning('No hay carreras disponibles. Crea una carrera primero.');
      }
    } catch (error: any) {
      console.error('Error fetching carreras:', error);
      toast.error('Error al cargar las carreras: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsLoadingCarreras(false);
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
    // Validar semestre según la carrera seleccionada
    const carrera = carreras.find(c => c.id === formData.carrera_id);
    const maxSemestres = carrera?.semestres || 10;
    if (formData.semestre_numero < 1 || formData.semestre_numero > maxSemestres) {
      toast.error(`El semestre debe estar entre 1 y ${maxSemestres}`);
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
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      
      // Si se cambia la carrera, actualizar la carrera seleccionada y resetear el semestre si es necesario
      if (field === 'carrera_id') {
        const carrera = carreras.find(c => c.id === value);
        if (carrera) {
          setSelectedCarrera(carrera);
          // Si el semestre actual es mayor que los semestres de la nueva carrera, resetear a 1
          if (newFormData.semestre_numero > (carrera.semestres || 10)) {
            newFormData.semestre_numero = 1;
          }
        } else {
          setSelectedCarrera(null);
        }
      }
      
      return newFormData;
    });
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
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle>Información de la Materia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 overflow-visible">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="carrera_id">Carrera *</Label>
                {isLoadingCarreras ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando carreras...
                  </div>
                ) : carreras.length === 0 ? (
                  <div className="text-sm text-destructive">
                    No hay carreras activas disponibles. Crea una carrera primero.
                  </div>
                ) : (
                  <Select
                    value={formData.carrera_id}
                    onValueChange={(value) => {
                      console.log('Carrera seleccionada:', value);
                      handleChange("carrera_id", value);
                    }}
                  >
                    <SelectTrigger id="carrera-select-trigger" className="w-full">
                      <SelectValue placeholder="Selecciona una carrera" />
                    </SelectTrigger>
                    <SelectContent 
                      position="popper"
                      className="z-[9999] max-h-[300px] w-[var(--radix-select-trigger-width)]"
                      sideOffset={5}
                    >
                      {carreras.length > 0 ? (
                        carreras.map((carrera) => (
                          <SelectItem key={carrera.id} value={carrera.id}>
                            <div className="flex items-center gap-2">
                              <span>{carrera.nombre}</span>
                              {!carrera.activa && (
                                <span className="text-xs text-muted-foreground">(Inactiva)</span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No hay carreras disponibles
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
                {carreraId && carreras.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Puedes cambiar la carrera si lo deseas
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="semestre_numero">Semestre *</Label>
                <Select
                  value={formData.semestre_numero.toString()}
                  onValueChange={(value) => handleChange("semestre_numero", parseInt(value))}
                  disabled={!formData.carrera_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.carrera_id ? "Selecciona un semestre" : "Primero selecciona una carrera"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      // Obtener el número de semestres de la carrera seleccionada
                      const numSemestres = selectedCarrera?.semestres || (formData.carrera_id ? 10 : 0);
                      return Array.from({ length: numSemestres }, (_, i) => i + 1).map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semestre {sem}
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
                {selectedCarrera && (
                  <p className="text-xs text-muted-foreground">
                    Esta carrera tiene {selectedCarrera.semestres} semestres
                  </p>
                )}
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
