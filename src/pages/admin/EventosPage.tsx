import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
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
import { StatusBadge, TypeBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatDateTime } from "@/lib/admin-utils";
import { toast } from "sonner";
import type { Evento } from "@/types/admin";

// Mock data
const mockEventos: Evento[] = [
  {
    id: "1",
    titulo: "Openhouse Universitario 2024",
    descripcion: "Ven a conocer nuestras carreras y laboratorios...",
    fecha_inicio: "2024-03-15T09:00:00",
    fecha_fin: "2024-03-15T18:00:00",
    ubicacion: "Campus Principal UEB",
    tipo: "Académico",
    activo: true,
  },
  {
    id: "2",
    titulo: "Feria de Tecnología",
    descripcion: "Exposición de proyectos de estudiantes...",
    fecha_inicio: "2024-04-20T10:00:00",
    ubicacion: "Auditorio Central",
    tipo: "Académico",
    activo: true,
  },
  {
    id: "3",
    titulo: "Festival Cultural UEB",
    descripcion: "Celebración cultural con música y danza...",
    fecha_inicio: "2024-05-10T14:00:00",
    ubicacion: "Plaza Principal",
    tipo: "Cultural",
    activo: false,
  },
];

export default function EventosPage() {
  const [eventos] = useState<Evento[]>(mockEventos);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredEventos = eventos.filter((evento) => {
    const matchesSearch = evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === "all" || evento.tipo === tipoFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && evento.activo) ||
      (statusFilter === "inactive" && !evento.activo);
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setTimeout(() => {
      toast.success("Evento eliminado correctamente");
      setIsDeleting(false);
      setDeleteId(null);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Eventos</h2>
          <p className="text-muted-foreground">Gestiona los eventos de la facultad</p>
        </div>
        <Link to="/admin/eventos/crear">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Académico">Académico</SelectItem>
                <SelectItem value="Cultural">Cultural</SelectItem>
                <SelectItem value="Deportivo">Deportivo</SelectItem>
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
                  <TableHead>Evento</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha</TableHead>
                  <TableHead className="hidden lg:table-cell">Ubicación</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEventos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron eventos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEventos.map((evento) => (
                    <TableRow key={evento.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {evento.imagen && (
                            <img 
                              src={evento.imagen} 
                              alt={evento.titulo}
                              className="h-10 w-14 object-cover rounded"
                            />
                          )}
                          <Link 
                            to={`/admin/eventos/editar/${evento.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {evento.titulo}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDateTime(evento.fecha_inicio)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {evento.ubicacion}
                      </TableCell>
                      <TableCell>
                        <TypeBadge type={evento.tipo} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={evento.activo} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/eventos/editar/${evento.id}`}>
                            <Button variant="ghost" size="icon" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Eliminar"
                            onClick={() => setDeleteId(evento.id)}
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
        title="¿Eliminar evento?"
        description="Esta acción eliminará el evento permanentemente."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
}
