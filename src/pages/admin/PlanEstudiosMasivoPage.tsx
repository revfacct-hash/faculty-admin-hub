import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Carrera } from "@/types/admin";
import { MATERIA_COLORS, MATERIA_CATEGORIAS } from "@/lib/admin-utils";

interface MateriaRow {
  id: string;
  semestre_numero: number;
  materia_nombre: string;
  materia_color: string;
  horas_teoria: number;
  horas_practica: number;
  categoria: string;
  orden: number;
}

export default function PlanEstudiosMasivoPage() {
  const { carreraId } = useParams<{ carreraId: string }>();
  const navigate = useNavigate();
  
  const [carrera, setCarrera] = useState<Carrera | null>(null);
  const [materias, setMaterias] = useState<MateriaRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (carreraId) {
      fetchCarrera();
      // Inicializar con una fila vacía
      setMaterias([createEmptyRow()]);
    }
  }, [carreraId]);

  const fetchCarrera = async () => {
    try {
      const { data, error } = await supabase
        .from('carreras')
        .select('*')
        .eq('id', carreraId)
        .single();

      if (error) throw error;
      setCarrera(data);
    } catch (error: any) {
      console.error('Error fetching carrera:', error);
      toast.error('Error al cargar la carrera');
      navigate(`/admin/plan-estudios/${carreraId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createEmptyRow = (): MateriaRow => ({
    id: `temp-${Date.now()}-${Math.random()}`,
    semestre_numero: 1,
    materia_nombre: "",
    materia_color: "#2563eb",
    horas_teoria: 0,
    horas_practica: 0,
    categoria: "Otros",
    orden: 0,
  });

  const addRow = () => {
    setMaterias([...materias, createEmptyRow()]);
  };

  const removeRow = (id: string) => {
    if (materias.length > 1) {
      setMaterias(materias.filter(m => m.id !== id));
    } else {
      toast.warning("Debe haber al menos una materia");
    }
  };

  const updateRow = (id: string, field: keyof MateriaRow, value: any) => {
    setMaterias(materias.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleSave = async () => {
    if (!carreraId) {
      toast.error("No hay carrera seleccionada");
      return;
    }

    // Validar que todas las materias tengan nombre
    const materiasInvalidas = materias.filter(m => !m.materia_nombre.trim());
    if (materiasInvalidas.length > 0) {
      toast.error("Todas las materias deben tener un nombre");
      return;
    }

    // Validar semestres según la carrera
    const maxSemestres = carrera?.semestres || 10;
    const semestresInvalidos = materias.filter(m => 
      m.semestre_numero < 1 || m.semestre_numero > maxSemestres
    );
    if (semestresInvalidos.length > 0) {
      toast.error(`Los semestres deben estar entre 1 y ${maxSemestres}`);
      return;
    }

    setIsSaving(true);

    try {
      const dataToSave = materias
        .filter(m => m.materia_nombre.trim()) // Solo guardar materias con nombre
        .map(m => ({
          carrera_id: carreraId,
          semestre_numero: m.semestre_numero,
          materia_nombre: m.materia_nombre.trim(),
          materia_color: m.materia_color,
          horas_teoria: m.horas_teoria,
          horas_practica: m.horas_practica,
          categoria: m.categoria,
          orden: m.orden,
        }));

      if (dataToSave.length === 0) {
        toast.error("No hay materias válidas para guardar");
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('plan_estudios')
        .insert(dataToSave);

      if (error) throw error;

      toast.success(`${dataToSave.length} materia(s) agregada(s) correctamente`);
      navigate(`/admin/plan-estudios/${carreraId}`);
    } catch (error: any) {
      console.error('Error saving materias:', error);
      toast.error(error.message || 'Error al guardar las materias');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!carrera) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carrera no encontrada</p>
        <Button onClick={() => navigate("/admin/plan-estudios")} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  const numSemestres = carrera.semestres || 10;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/plan-estudios/${carreraId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Agregar Múltiples Materias</h2>
          <p className="text-muted-foreground">
            Agrega varias materias a la vez para {carrera.nombre}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Materias</CardTitle>
          <CardDescription>
            Completa los datos básicos de cada materia. Puedes agregar más filas con el botón "+"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-sm font-medium">Semestre</th>
                    <th className="text-left p-2 text-sm font-medium">Nombre *</th>
                    <th className="text-left p-2 text-sm font-medium">H. Teoría</th>
                    <th className="text-left p-2 text-sm font-medium">H. Práctica</th>
                    <th className="text-left p-2 text-sm font-medium">Categoría</th>
                    <th className="text-left p-2 text-sm font-medium">Orden</th>
                    <th className="text-left p-2 text-sm font-medium w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {materias.map((materia, index) => (
                    <tr key={materia.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <Select
                          value={materia.semestre_numero.toString()}
                          onValueChange={(value) => updateRow(materia.id, 'semestre_numero', parseInt(value))}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: numSemestres }, (_, i) => i + 1).map((sem) => (
                              <SelectItem key={sem} value={sem.toString()}>
                                {sem}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input
                          placeholder="Nombre de la materia"
                          value={materia.materia_nombre}
                          onChange={(e) => updateRow(materia.id, 'materia_nombre', e.target.value)}
                          className="min-w-[200px]"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min={0}
                          value={materia.horas_teoria}
                          onChange={(e) => updateRow(materia.id, 'horas_teoria', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min={0}
                          value={materia.horas_practica}
                          onChange={(e) => updateRow(materia.id, 'horas_practica', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </td>
                      <td className="p-2">
                        <Select
                          value={materia.categoria}
                          onValueChange={(value) => updateRow(materia.id, 'categoria', value)}
                        >
                          <SelectTrigger className="w-32">
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
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min={0}
                          value={materia.orden}
                          onChange={(e) => updateRow(materia.id, 'orden', parseInt(e.target.value) || 0)}
                          className="w-16"
                        />
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRow(materia.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex gap-2">
                <Button variant="outline" onClick={addRow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Fila
                </Button>
                <label>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const jsonData = JSON.parse(event.target?.result as string);
                            if (Array.isArray(jsonData)) {
                              // Filtrar solo las materias de esta carrera y convertir al formato correcto
                              const materiasImportadas = jsonData
                                .filter((item: any) => item.carrera_id === carreraId || item.carrera_id === "CARRERA_ID_AQUI")
                                .map((item: any) => ({
                                  id: `temp-${Date.now()}-${Math.random()}`,
                                  semestre_numero: item.semestre_numero,
                                  materia_nombre: item.materia_nombre,
                                  materia_color: item.materia_color || "#2563eb",
                                  horas_teoria: item.horas_teoria || 0,
                                  horas_practica: item.horas_practica || 0,
                                  categoria: item.categoria || "Otros",
                                  orden: item.orden || 0,
                                }));
                              
                              if (materiasImportadas.length > 0) {
                                setMaterias(materiasImportadas);
                                toast.success(`${materiasImportadas.length} materias importadas correctamente`);
                              } else {
                                toast.warning("No se encontraron materias para esta carrera en el archivo");
                              }
                            } else {
                              toast.error("El archivo JSON no contiene un array válido");
                            }
                          } catch (error) {
                            console.error('Error parsing JSON:', error);
                            toast.error("Error al leer el archivo JSON");
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                  <Button variant="outline" type="button" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar JSON
                    </span>
                  </Button>
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/admin/plan-estudios/${carreraId}`)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Todas ({materias.filter(m => m.materia_nombre.trim()).length})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consejos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Puedes agregar múltiples filas para agregar varias materias a la vez</li>
            <li>Los campos con * son obligatorios</li>
            <li>El orden determina el orden de visualización dentro del semestre</li>
            <li>Solo se guardarán las materias que tengan nombre</li>
            <li>Puedes eliminar filas vacías o no deseadas con el botón de eliminar</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
