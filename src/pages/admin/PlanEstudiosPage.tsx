import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Plus, ArrowLeft, Edit, Trash2, ChevronUp, ChevronDown, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { PlanEstudios, Carrera, DesgloseCarrera } from "@/types/admin";
import { MATERIA_CATEGORIAS } from "@/lib/admin-utils";

export default function PlanEstudiosPage() {
  const { carreraId } = useParams<{ carreraId: string }>();
  const navigate = useNavigate();
  const [selectedCarreraId, setSelectedCarreraId] = useState<string>(carreraId || "");
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [materias, setMaterias] = useState<PlanEstudios[]>([]);
  const [desglose, setDesglose] = useState<DesgloseCarrera | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedCarrera = carreras.find(c => c.id === selectedCarreraId);

  useEffect(() => {
    fetchCarreras();
  }, []);

  useEffect(() => {
    if (selectedCarreraId) {
      fetchMaterias();
      fetchDesglose();
    }
  }, [selectedCarreraId]);

  useEffect(() => {
    if (carreraId && !selectedCarreraId) {
      setSelectedCarreraId(carreraId);
    }
  }, [carreraId, selectedCarreraId]);

  const fetchCarreras = async () => {
    try {
      const { data, error } = await supabase
        .from('carreras')
        .select('*')
        .eq('activa', true)
        .order('nombre');

      if (error) throw error;
      setCarreras(data || []);
    } catch (error: any) {
      console.error('Error fetching carreras:', error);
      toast.error('Error al cargar las carreras');
    }
  };

  const fetchMaterias = async () => {
    try {
      const { data, error } = await supabase
        .from('plan_estudios')
        .select('*')
        .eq('carrera_id', selectedCarreraId)
        .order('semestre_numero')
        .order('orden');

      if (error) throw error;
      setMaterias(data || []);
    } catch (error: any) {
      console.error('Error fetching materias:', error);
      toast.error('Error al cargar las materias');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDesglose = async () => {
    try {
      const { data, error } = await supabase
        .rpc('calcular_desglose_carrera', { p_carrera_id: selectedCarreraId });

      if (error) throw error;
      if (data && data[0]) {
        setDesglose({
          porcentaje_teoria: data[0].porcentaje_teoria,
          porcentaje_practica: data[0].porcentaje_practica,
          desglose_categoria: data[0].desglose_categoria as Record<string, number>,
          total_anos: data[0].total_anos,
          total_semestres: data[0].total_semestres,
          total_horas: (data[0].total_horas_teoria || 0) + (data[0].total_horas_practica || 0),
        });
      }
    } catch (error: any) {
      console.error('Error fetching desglose:', error);
    }
  };

  useEffect(() => {
    if (carreraId && !selectedCarreraId) {
      setSelectedCarreraId(carreraId);
    }
  }, [carreraId, selectedCarreraId]);

  const materiasBySemestre = materias.reduce((acc, materia) => {
    if (!acc[materia.semestre_numero]) {
      acc[materia.semestre_numero] = [];
    }
    acc[materia.semestre_numero].push(materia);
    return acc;
  }, {} as Record<number, PlanEstudios[]>);

  const semestres = selectedCarrera ? Array.from({ length: selectedCarrera.semestres }, (_, i) => i + 1) : [];

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('plan_estudios')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      
      toast.success("Materia eliminada correctamente");
      setDeleteId(null);
      fetchMaterias();
      fetchDesglose();
    } catch (error: any) {
      console.error('Error deleting materia:', error);
      toast.error('Error al eliminar la materia');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = (materiaId: string, direction: "up" | "down") => {
    // TODO: Implement move logic
    toast.info("Funcionalidad de reordenamiento pendiente");
  };

  const categoriaColors: Record<string, string> = {
    "Electrónica": "bg-blue-500",
    "Matemática": "bg-orange-500",
    "Física": "bg-green-500",
    "Control": "bg-purple-500",
    "Otros": "bg-gray-500",
  };

  if (!selectedCarreraId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/carreras")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Plan de Estudios</h2>
            <p className="text-muted-foreground">Selecciona una carrera para ver su plan de estudios</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar Carrera</label>
              <Select value={selectedCarreraId} onValueChange={setSelectedCarreraId}>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/carreras")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Select value={selectedCarreraId} onValueChange={setSelectedCarreraId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {carreras.map((carrera) => (
                  <SelectItem key={carrera.id} value={carrera.id}>
                    {carrera.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <h2 className="text-2xl font-bold">Plan de Estudios - {selectedCarrera?.nombre}</h2>
              <p className="text-muted-foreground">Gestiona las materias por semestre</p>
            </div>
          </div>
        </div>
        <Link to={`/admin/plan-estudios/${selectedCarreraId}/crear`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Materia
          </Button>
        </Link>
      </div>

      {/* Desglose Automático */}
      {desglose && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Desglose de la Carrera
            </CardTitle>
            <CardDescription>Datos calculados automáticamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-4xl font-bold text-primary">{desglose.porcentaje_teoria}%</div>
                <div className="text-sm text-muted-foreground mt-1">Horas de teoría</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-4xl font-bold text-primary">{desglose.porcentaje_practica}%</div>
                <div className="text-sm text-muted-foreground mt-1">Horas de práctica</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Desglose por Categoría</h4>
              <div className="space-y-3">
                {Object.entries(desglose.desglose_categoria).map(([categoria, porcentaje]) => (
                  <div key={categoria}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{categoria}</span>
                      <span className="font-medium">{porcentaje}%</span>
                    </div>
                    <Progress value={porcentaje} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="text-2xl font-bold text-primary">{desglose.total_anos}</div>
                <div className="text-sm text-muted-foreground">Años de duración</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{desglose.total_semestres}</div>
                <div className="text-sm text-muted-foreground">Semestres</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Materias por Semestre */}
      <Card>
        <CardHeader>
          <CardTitle>Materias por Semestre</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="1" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {semestres.slice(0, 5).map((sem) => (
                <TabsTrigger key={sem} value={sem.toString()}>
                  Semestre {sem}
                </TabsTrigger>
              ))}
            </TabsList>
            {semestres.map((semestre) => {
              const materiasSemestre = materiasBySemestre[semestre] || [];
              return (
                <TabsContent key={semestre} value={semestre.toString()} className="mt-4">
                  <div className="space-y-3">
                    {materiasSemestre.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No hay materias en este semestre</p>
                        <Link to={`/admin/plan-estudios/${selectedCarreraId}/crear?semestre=${semestre}`}>
                          <Button variant="outline" size="sm" className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Materia
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      materiasSemestre.map((materia) => (
                        <div
                          key={materia.id}
                          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: materia.materia_color }}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{materia.materia_nombre}</div>
                            <div className="text-sm text-muted-foreground">
                              Teoría: {materia.horas_teoria}h · Práctica: {materia.horas_practica}h
                            </div>
                          </div>
                          <Badge variant="outline">{materia.categoria}</Badge>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMove(materia.id, "up")}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMove(materia.id, "down")}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Link to={`/admin/plan-estudios/${selectedCarreraId}/editar/${materia.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(materia.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="¿Eliminar materia?"
        description="Esta acción eliminará la materia del plan de estudios."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
}
