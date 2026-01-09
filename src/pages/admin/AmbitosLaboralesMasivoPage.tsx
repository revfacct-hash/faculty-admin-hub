import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Carrera } from "@/types/admin";

interface AmbitoRow {
  id: string;
  titulo: string;
  descripcion: string;
  orden: number;
  imagen: string | null;
}

export default function AmbitosLaboralesMasivoPage() {
  const { carreraId } = useParams<{ carreraId: string }>();
  const navigate = useNavigate();
  
  const [carrera, setCarrera] = useState<Carrera | null>(null);
  const [ambitos, setAmbitos] = useState<AmbitoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (carreraId) {
      fetchCarrera();
      // Inicializar con una fila vacía
      setAmbitos([createEmptyRow()]);
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
      navigate(`/admin/ambitos-laborales/${carreraId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createEmptyRow = (): AmbitoRow => ({
    id: `temp-${Date.now()}-${Math.random()}`,
    titulo: "",
    descripcion: "",
    orden: 0,
    imagen: null,
  });

  const addRow = () => {
    setAmbitos([...ambitos, createEmptyRow()]);
  };

  const removeRow = (id: string) => {
    if (ambitos.length > 1) {
      setAmbitos(ambitos.filter(a => a.id !== id));
    } else {
      toast.warning("Debe haber al menos un ámbito laboral");
    }
  };

  const updateRow = (id: string, field: keyof AmbitoRow, value: any) => {
    setAmbitos(ambitos.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  const handleImageChange = async (id: string, file: File | null) => {
    if (!file) {
      updateRow(id, 'imagen', null);
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10000000) {
      toast.error('La imagen no debe superar 10MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateRow(id, 'imagen', base64String);
      };
      reader.onerror = () => {
        toast.error('Error al leer la imagen');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error converting image:', error);
      toast.error('Error al procesar la imagen');
    }
  };

  const handleSave = async () => {
    if (!carreraId) {
      toast.error("No hay carrera seleccionada");
      return;
    }

    // Validar que todos los ámbitos tengan título y descripción
    const ambitosInvalidos = ambitos.filter(a => !a.titulo.trim() || !a.descripcion.trim());
    if (ambitosInvalidos.length > 0) {
      toast.error("Todos los ámbitos deben tener título y descripción");
      return;
    }

    setIsSaving(true);

    try {
      const ambitosToInsert = ambitos
        .filter(a => a.titulo.trim() && a.descripcion.trim()) // Solo guardar ámbitos válidos
        .map(a => ({
          carrera_id: carreraId,
          titulo: a.titulo.trim(),
          descripcion: a.descripcion.trim(),
          orden: a.orden || 0,
          imagen: a.imagen || null,
        }));

      if (ambitosToInsert.length === 0) {
        toast.error("No hay ámbitos válidos para guardar");
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('ambitos_laborales')
        .insert(ambitosToInsert);

      if (error) throw error;

      toast.success(`${ambitosToInsert.length} ámbito(s) laboral(es) agregado(s) correctamente`);
      navigate(`/admin/ambitos-laborales/${carreraId}`);
    } catch (error: any) {
      console.error('Error saving ambitos:', error);
      toast.error(error.message || 'Error al guardar los ámbitos laborales');
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
        <Button onClick={() => navigate("/admin/ambitos-laborales")} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/ambitos-laborales/${carreraId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Agregar Múltiples Ámbitos Laborales</h2>
          <p className="text-muted-foreground">
            Agrega varios ámbitos laborales a la vez para {carrera.nombre}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ámbitos Laborales</CardTitle>
          <CardDescription>
            Completa los datos básicos de cada ámbito laboral. Puedes agregar más filas con el botón "+"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-sm font-medium">Título *</th>
                    <th className="text-left p-2 text-sm font-medium">Descripción *</th>
                    <th className="text-left p-2 text-sm font-medium">Orden</th>
                    <th className="text-left p-2 text-sm font-medium">Imagen</th>
                    <th className="text-left p-2 text-sm font-medium w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {ambitos.map((ambito, index) => (
                    <tr key={ambito.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <Input
                          placeholder="Ej: Gerente de área"
                          value={ambito.titulo}
                          onChange={(e) => updateRow(ambito.id, 'titulo', e.target.value)}
                          className="min-w-[200px]"
                        />
                      </td>
                      <td className="p-2">
                        <Textarea
                          placeholder="Ej: Liderazgo y gestión de equipos tecnológicos"
                          value={ambito.descripcion}
                          onChange={(e) => updateRow(ambito.id, 'descripcion', e.target.value)}
                          rows={2}
                          className="min-w-[250px]"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={ambito.orden}
                          onChange={(e) => updateRow(ambito.id, 'orden', parseInt(e.target.value) || 0)}
                          className="w-16"
                        />
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleImageChange(ambito.id, file);
                            }}
                            className="text-xs cursor-pointer w-full max-w-[200px]"
                          />
                          {ambito.imagen && (
                            <p className="text-xs text-muted-foreground">Imagen cargada</p>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRow(ambito.id)}
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
                  onClick={() => navigate(`/admin/ambitos-laborales/${carreraId}`)}
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
                      Guardar Todas ({ambitos.filter(a => a.titulo.trim() && a.descripcion.trim()).length})
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
            <li>Puedes agregar múltiples filas para agregar varios ámbitos laborales a la vez</li>
            <li>Los campos con * son obligatorios</li>
            <li>El orden determina el orden de visualización</li>
            <li>Solo se guardarán los ámbitos que tengan título y descripción completos</li>
            <li>Las imágenes son opcionales (máx. 1MB) y se pueden agregar después editando individualmente</li>
            <li>Puedes eliminar filas vacías o no deseadas con el botón de eliminar</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
