import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Carrera } from "@/types/admin";

interface CompetenciaRow {
  id: string;
  competencia: string;
  orden: number;
}

export default function PerfilEgresadoMasivoPage() {
  const { carreraId } = useParams<{ carreraId: string }>();
  const navigate = useNavigate();
  
  const [carrera, setCarrera] = useState<Carrera | null>(null);
  const [competencias, setCompetencias] = useState<CompetenciaRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (carreraId) {
      fetchCarrera();
      // Inicializar con una fila vacía
      setCompetencias([createEmptyRow()]);
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
      navigate(`/admin/perfil-egresado/${carreraId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createEmptyRow = (): CompetenciaRow => ({
    id: `temp-${Date.now()}-${Math.random()}`,
    competencia: "",
    orden: 0,
  });

  const addRow = () => {
    setCompetencias([...competencias, createEmptyRow()]);
  };

  const removeRow = (id: string) => {
    if (competencias.length > 1) {
      setCompetencias(competencias.filter(c => c.id !== id));
    } else {
      toast.warning("Debe haber al menos una competencia");
    }
  };

  const updateRow = (id: string, field: keyof CompetenciaRow, value: any) => {
    setCompetencias(competencias.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleSave = async () => {
    if (!carreraId) {
      toast.error("No hay carrera seleccionada");
      return;
    }

    // Validar que todas las competencias tengan texto
    const competenciasInvalidas = competencias.filter(c => !c.competencia.trim());
    if (competenciasInvalidas.length > 0) {
      toast.error("Todas las competencias deben tener un texto");
      return;
    }

    setIsSaving(true);

    try {
      const competenciasToInsert = competencias
        .filter(c => c.competencia.trim()) // Solo guardar competencias válidas
        .map(c => ({
          carrera_id: carreraId,
          competencia: c.competencia.trim(),
          orden: c.orden || 0,
        }));

      if (competenciasToInsert.length === 0) {
        toast.error("No hay competencias válidas para guardar");
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('perfil_egresado')
        .insert(competenciasToInsert);

      if (error) throw error;

      toast.success(`${competenciasToInsert.length} competencia(s) agregada(s) correctamente`);
      navigate(`/admin/perfil-egresado/${carreraId}`);
    } catch (error: any) {
      console.error('Error saving competencias:', error);
      toast.error(error.message || 'Error al guardar las competencias');
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
        <Button onClick={() => navigate("/admin/perfil-egresado")} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/perfil-egresado/${carreraId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Agregar Múltiples Competencias</h2>
          <p className="text-muted-foreground">
            Agrega varias competencias a la vez para {carrera.nombre}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competencias</CardTitle>
          <CardDescription>
            Completa los datos básicos de cada competencia. Puedes agregar más filas con el botón "+"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-sm font-medium">Competencia *</th>
                    <th className="text-left p-2 text-sm font-medium">Orden</th>
                    <th className="text-left p-2 text-sm font-medium w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {competencias.map((competencia, index) => (
                    <tr key={competencia.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <Textarea
                          placeholder="Ej: Implementar soluciones tecnológicas innovadoras..."
                          value={competencia.competencia}
                          onChange={(e) => updateRow(competencia.id, 'competencia', e.target.value)}
                          rows={2}
                          className="min-w-[400px]"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={competencia.orden}
                          onChange={(e) => updateRow(competencia.id, 'orden', parseInt(e.target.value) || 0)}
                          className="w-16"
                        />
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRow(competencia.id)}
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
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/admin/perfil-egresado/${carreraId}`)}
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
                      Guardar Todas ({competencias.filter(c => c.competencia.trim()).length})
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
            <li>Puedes agregar múltiples filas para agregar varias competencias a la vez</li>
            <li>Los campos con * son obligatorios</li>
            <li>El orden determina el orden de visualización</li>
            <li>Solo se guardarán las competencias que tengan texto</li>
            <li>Puedes eliminar filas vacías o no deseadas con el botón de eliminar</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
