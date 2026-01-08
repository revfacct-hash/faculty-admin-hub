import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye, FileText } from "lucide-react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge, TypeBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getInitials } from "@/lib/admin-utils";
import { toast } from "sonner";
import type { Docente } from "@/types/admin";

// Mock data
const mockDocentes: Docente[] = [
  {
    id: "1",
    carrera_id: "1",
    nombre: "Ing. Roberto Carlos Saavedra Nogales",
    especialidad: "Seguridad Informática y Auditoría de Sistemas",
    titulo: "Ingeniero de Sistemas - Magister en Seguridad Informática",
    experiencia: "25 años en desarrollo de software y seguridad informática",
    orden: 1,
    activo: true,
    carrera: { id: "1", nombre: "Ingeniería de Sistemas", slug: "ingenieria-sistemas", descripcion: "", duracion: "5 años", semestres: 10, activa: true },
  },
  {
    id: "2",
    carrera_id: "1",
    nombre: "Lic. María Elena García Torres",
    especialidad: "Desarrollo Web y Aplicaciones Móviles",
    titulo: "Licenciada en Informática - Especialista en UX/UI",
    experiencia: "15 años en desarrollo de aplicaciones web",
    orden: 2,
    activo: true,
    carrera: { id: "1", nombre: "Ingeniería de Sistemas", slug: "ingenieria-sistemas", descripcion: "", duracion: "5 años", semestres: 10, activa: true },
  },
  {
    id: "3",
    carrera_id: "2",
    nombre: "Ing. Carlos Mendoza Ríos",
    especialidad: "Electrónica de Potencia",
    titulo: "Ingeniero Electrónico - Doctor en Electrónica",
    experiencia: "20 años en sistemas electrónicos",
    orden: 1,
    activo: false,
    carrera: { id: "2", nombre: "Ingeniería Electrónica", slug: "ingenieria-electronica", descripcion: "", duracion: "5 años", semestres: 10, activa: true },
  },
];

const mockCarreras = [
  { id: "1", nombre: "Ingeniería de Sistemas" },
  { id: "2", nombre: "Ingeniería Electrónica" },
];

export default function DocentesPage() {
  const [docentes] = useState<Docente[]>(mockDocentes);
  const [searchTerm, setSearchTerm] = useState("");
  const [carreraFilter, setCarreraFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cvDocente, setCvDocente] = useState<Docente | null>(null);

  const filteredDocentes = docentes.filter((docente) => {
    const matchesSearch = docente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docente.especialidad.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCarrera = carreraFilter === "all" || docente.carrera_id === carreraFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && docente.activo) ||
      (statusFilter === "inactive" && !docente.activo);
    return matchesSearch && matchesCarrera && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setTimeout(() => {
      toast.success("Docente eliminado correctamente");
      setIsDeleting(false);
      setDeleteId(null);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Docentes</h2>
          <p className="text-muted-foreground">Gestiona el cuerpo docente de la facultad</p>
        </div>
        <Link to="/admin/docentes/crear">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Docente
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={carreraFilter} onValueChange={setCarreraFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Carrera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las carreras</SelectItem>
                {mockCarreras.map((carrera) => (
                  <SelectItem key={carrera.id} value={carrera.id}>
                    {carrera.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Docente</TableHead>
                  <TableHead className="hidden md:table-cell">Especialidad</TableHead>
                  <TableHead className="hidden lg:table-cell">Carrera</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocentes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No se encontraron docentes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocentes.map((docente) => (
                    <TableRow key={docente.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={docente.imagen_avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(docente.nombre)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link 
                              to={`/admin/docentes/editar/${docente.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {docente.nombre}
                            </Link>
                            <p className="text-sm text-muted-foreground md:hidden">
                              {docente.especialidad}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {docente.especialidad}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {docente.carrera && (
                          <TypeBadge type={docente.carrera.nombre.split(" ")[0]} />
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={docente.activo} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Ver CV"
                            onClick={() => setCvDocente(docente)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Link to={`/admin/docentes/editar/${docente.id}`}>
                            <Button variant="ghost" size="icon" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Eliminar"
                            onClick={() => setDeleteId(docente.id)}
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
        title="¿Eliminar docente?"
        description="Esta acción eliminará el docente permanentemente. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />

      <Dialog open={!!cvDocente} onOpenChange={() => setCvDocente(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>CV - {cvDocente?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {cvDocente?.cv_imagen ? (
              <img 
                src={cvDocente.cv_imagen} 
                alt={`CV de ${cvDocente.nombre}`}
                className="w-full rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                <p className="text-muted-foreground">No hay CV disponible</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
