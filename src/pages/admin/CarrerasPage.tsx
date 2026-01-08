import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";
import type { Carrera } from "@/types/admin";

// Mock data - will be replaced with Supabase queries
const mockCarreras: Carrera[] = [
  {
    id: "1",
    nombre: "Ingeniería de Sistemas",
    slug: "ingenieria-sistemas",
    descripcion: "Formamos profesionales capaces de diseñar y desarrollar sistemas informáticos...",
    duracion: "5 años",
    semestres: 10,
    activa: true,
  },
  {
    id: "2",
    nombre: "Ingeniería Electrónica",
    slug: "ingenieria-electronica",
    descripcion: "Carrera enfocada en el diseño y desarrollo de sistemas electrónicos...",
    duracion: "5 años",
    semestres: 10,
    activa: true,
  },
  {
    id: "3",
    nombre: "Ingeniería Mecatrónica",
    slug: "ingenieria-mecatronica",
    descripcion: "Integración de mecánica, electrónica e informática...",
    duracion: "5 años",
    semestres: 10,
    activa: false,
  },
];

export default function CarrerasPage() {
  const [carreras] = useState<Carrera[]>(mockCarreras);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredCarreras = carreras.filter((carrera) => {
    const matchesSearch = carrera.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrera.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && carrera.activa) ||
      (statusFilter === "inactive" && !carrera.activa);
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    // TODO: Implement Supabase delete
    setTimeout(() => {
      toast.success("Carrera eliminada correctamente");
      setIsDeleting(false);
      setDeleteId(null);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Carreras</h2>
          <p className="text-muted-foreground">Gestiona las carreras de la facultad</p>
        </div>
        <Link to="/admin/carreras/crear">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Carrera
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="inactive">Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Slug</TableHead>
                  <TableHead className="hidden lg:table-cell">Duración</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCarreras.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No se encontraron carreras
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCarreras.map((carrera) => (
                    <TableRow key={carrera.id}>
                      <TableCell>
                        <Link 
                          to={`/admin/carreras/editar/${carrera.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {carrera.nombre}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {carrera.slug}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {carrera.duracion} · {carrera.semestres} semestres
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={carrera.activa} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/plan-estudios?carrera=${carrera.id}`}>
                            <Button variant="ghost" size="icon" title="Ver Plan de Estudios">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/admin/carreras/editar/${carrera.id}`}>
                            <Button variant="ghost" size="icon" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Eliminar"
                            onClick={() => setDeleteId(carrera.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="¿Eliminar carrera?"
        description="Esta acción eliminará la carrera y todos sus datos relacionados (docentes, plan de estudios, etc.). Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
}
