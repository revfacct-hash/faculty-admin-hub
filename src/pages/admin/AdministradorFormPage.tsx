import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import type { PerfilAdministrador, AppRole } from "@/types/admin";

const initialFormData = {
  email: "",
  password: "",
  nombre_completo: "",
  rol: "editor" as AppRole,
  activo: true,
};

const editFormData = {
  nombre_completo: "",
  rol: "editor" as AppRole,
  activo: true,
  newPassword: "",
  confirmPassword: "",
};

export default function AdministradorFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState(isEditing ? editFormData : initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      const fetchAdmin = async () => {
        try {
          const { data, error } = await supabase
            .from('perfiles_administradores')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          
          if (data) {
            setFormData({
              nombre_completo: data.nombre_completo,
              rol: data.rol,
              activo: data.activo,
              newPassword: "",
              confirmPassword: "",
            });
          }
        } catch (error: any) {
          console.error('Error fetching admin:', error);
          toast.error('Error al cargar el administrador');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAdmin();
    }
  }, [isEditing, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      const editData = formData as typeof editFormData;
      if (!editData.nombre_completo.trim() || editData.nombre_completo.length < 3) {
        toast.error("El nombre completo debe tener al menos 3 caracteres");
        return;
      }
      if (editData.newPassword && editData.newPassword.length < 8) {
        toast.error("La nueva contraseña debe tener al menos 8 caracteres");
        return;
      }
      if (editData.newPassword !== editData.confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return;
      }
    } else {
      const createData = formData as typeof initialFormData;
      if (!createData.email.trim() || !createData.email.includes("@")) {
        toast.error("Email inválido");
        return;
      }
      if (!createData.password || createData.password.length < 8) {
        toast.error("La contraseña debe tener al menos 8 caracteres");
        return;
      }
      if (!createData.nombre_completo.trim() || createData.nombre_completo.length < 3) {
        toast.error("El nombre completo debe tener al menos 3 caracteres");
        return;
      }
    }

    setIsSaving(true);
    
    try {
      if (isEditing && id) {
        const editData = formData as typeof editFormData;
        
        // Actualizar perfil
        const { error: profileError } = await supabase
          .from('perfiles_administradores')
          .update({
            nombre_completo: editData.nombre_completo,
            rol: editData.rol,
            activo: editData.activo,
          })
          .eq('id', id);

        if (profileError) throw profileError;

        // Actualizar contraseña si se proporcionó
        if (editData.newPassword) {
          const { error: passwordError } = await supabase.auth.admin.updateUserById(
            id,
            { password: editData.newPassword }
          );
          
          if (passwordError) {
            console.error('Error updating password:', passwordError);
            toast.warning('Perfil actualizado pero hubo un error al cambiar la contraseña');
          }
        }

        toast.success("Administrador actualizado correctamente");
      } else {
        const createData = formData as typeof initialFormData;
        
        // Crear usuario en auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: createData.email,
          password: createData.password,
          email_confirm: true,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('No se pudo crear el usuario');

        // Crear perfil
        const { error: profileError } = await supabase
          .from('perfiles_administradores')
          .insert({
            id: authData.user.id,
            nombre_completo: createData.nombre_completo,
            email: createData.email,
            rol: createData.rol,
            activo: createData.activo,
          });

        if (profileError) {
          // Si falla el perfil, eliminar el usuario de auth
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw profileError;
        }

        toast.success("Administrador creado correctamente");
      }
      
      navigate("/admin/administradores");
    } catch (error: any) {
      console.error('Error saving admin:', error);
      toast.error(error.message || 'Error al guardar el administrador');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/administradores")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? "Editar Administrador" : "Nuevo Administrador"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? "Modifica los datos del administrador" : "Completa los datos para crear un nuevo administrador"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Administrador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEditing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email del Administrador *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@ueb.edu.bo"
                    value={(formData as typeof initialFormData).email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Se creará un usuario en Supabase Auth con este email
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña Temporal *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={(formData as typeof initialFormData).password}
                      onChange={(e) => handleChange("password", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    El usuario deberá cambiar la contraseña en el primer login
                  </p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="nombre_completo">Nombre Completo *</Label>
              <Input
                id="nombre_completo"
                placeholder="Ej: Juan Pérez"
                value={isEditing ? (formData as typeof editFormData).nombre_completo : (formData as typeof initialFormData).nombre_completo}
                onChange={(e) => handleChange("nombre_completo", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol *</Label>
              <Select
                value={isEditing ? (formData as typeof editFormData).rol : (formData as typeof initialFormData).rol}
                onValueChange={(value) => handleChange("rol", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador (acceso completo)</SelectItem>
                  <SelectItem value="editor">Editor (crear/editar, no eliminar)</SelectItem>
                  <SelectItem value="viewer">Visualizador (solo lectura)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {isEditing && "No puedes cambiar tu propio rol"}
              </p>
            </div>

            {isEditing && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña (opcional)</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Dejar vacío para mantener la actual"
                      value={(formData as typeof editFormData).newPassword}
                      onChange={(e) => handleChange("newPassword", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirma la nueva contraseña"
                      value={(formData as typeof editFormData).confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="activo">Administrador Activo</Label>
                <p className="text-sm text-muted-foreground">
                  {isEditing && "No puedes desactivarte a ti mismo"}
                </p>
              </div>
              <Switch
                id="activo"
                checked={isEditing ? (formData as typeof editFormData).activo : (formData as typeof initialFormData).activo}
                onCheckedChange={(checked) => handleChange("activo", checked)}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/admin/administradores")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
<Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Actualizando..." : "Creando..."}
                </>
                ) : (
                  isEditing ? "Actualizar" : "Crear Administrador"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
