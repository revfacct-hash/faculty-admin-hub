import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
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
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatDate } from "@/lib/admin-utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Noticia } from "@/types/admin";

const categorias = ["General", "Institucional", "Académico", "Tecnología"];

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchNoticias();
  }, []);

  const fetchNoticias = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .order('fecha_publicacion', { ascending: false });

      if (error) throw error;
      setNoticias(data || []);
    } catch (error: any) {
      console.error('Error fetching noticias:', error);
      toast.error('Error al cargar las noticias');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNoticias = noticias.filter((noticia) => {
    const matchesSearch = noticia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (noticia.autor?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesCategoria = categoriaFilter === "all" || noticia.categoria === categoriaFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && noticia.activo) ||
      (statusFilter === "inactive" && !noticia.activo);
    return matchesSearch && matchesCategoria && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('noticias')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      
      toast.success("Noticia eliminada correctamente");
      setDeleteId(null);
      fetchNoticias();
    } catch (error: any) {
      console.error('Error deleting noticia:', error);
      toast.error('Error al eliminar la noticia');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Noticias</h2>
          <p className="text-muted-foreground">Gestiona las noticias de la facultad</p>
        </div>
        <Link to="/admin/noticias/crear">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Noticia
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título o autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
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
                  <TableHead>Noticia</TableHead>
                  <TableHead className="hidden md:table-cell">Autor</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                  <TableHead className="hidden lg:table-cell">Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : noticias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay datos existentes
                    </TableCell>
                  </TableRow>
                ) : filteredNoticias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron noticias con los filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNoticias.map((noticia) => (
                    <TableRow key={noticia.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {noticia.imagen_portada && (
                            <img 
                              src={noticia.imagen_portada} 
                              alt={noticia.titulo}
                              className="h-10 w-14 object-cover rounded"
                            />
                          )}
                          <Link 
                            to={`/admin/noticias/editar/${noticia.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {noticia.titulo}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {noticia.autor}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDate(noticia.fecha_publicacion)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm px-2 py-1 bg-muted rounded">{noticia.categoria}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={noticia.activo} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/noticias/editar/${noticia.id}`}>
                            <Button variant="ghost" size="icon" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Eliminar"
                            onClick={() => setDeleteId(noticia.id)}
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
        title="¿Eliminar noticia?"
        description="Esta acción eliminará la noticia permanentemente."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
}
