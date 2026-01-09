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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge, RoleBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatDateTime, getInitials } from "@/lib/admin-utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { PerfilAdministrador } from "@/types/admin";

export default function AdministradoresPage() {
  const [administradores, setAdministradores] = useState<PerfilAdministrador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAdministradores();
  }, []);

  const fetchAdministradores = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('perfiles_administradores')
        .select('*')
        .order('nombre_completo');

      if (error) throw error;
      setAdministradores(data || []);
    } catch (error: any) {
      console.error('Error fetching administradores:', error);
      toast.error('Error al cargar los administradores');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAdministradores = administradores.filter((admin) => {
    return admin.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      // Primero eliminar el usuario de auth
      const { error: authError } = await supabase.auth.admin.deleteUser(deleteId);
      
      // Luego eliminar el perfil (se eliminará automáticamente por CASCADE)
      if (authError) {
        // Si falla auth, intentar solo eliminar el perfil
        const { error } = await supabase
          .from('perfiles_administradores')
          .delete()
          .eq('id', deleteId);
        
        if (error) throw error;
      }
      
      toast.success("Administrador eliminado correctamente");
      setDeleteId(null);
      fetchAdministradores();
    } catch (error: any) {
      console.error('Error deleting administrador:', error);
      toast.error('Error al eliminar el administrador');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Administradores</h2>
          <p className="text-muted-foreground">Gestiona los usuarios del panel administrativo</p>
        </div>
        <Link to="/admin/administradores/crear">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Administrador
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Administrador</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Rol</TableHead>
                  <TableHead className="hidden lg:table-cell">Último Acceso</TableHead>
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
                ) : administradores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay datos existentes
                    </TableCell>
                  </TableRow>
                ) : filteredAdministradores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron administradores con los filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdministradores.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(admin.nombre_completo)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{admin.nombre_completo}</div>
                            <div className="text-sm text-muted-foreground md:hidden">
                              {admin.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {admin.email}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <RoleBadge role={admin.rol} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {admin.ultimo_acceso ? formatDateTime(admin.ultimo_acceso) : "Nunca"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={admin.activo} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/administradores/editar/${admin.id}`}>
                            <Button variant="ghost" size="icon" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Eliminar"
                            onClick={() => setDeleteId(admin.id)}
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
        title="¿Eliminar administrador?"
        description="Esta acción eliminará el administrador permanentemente. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </div>
  );
}
