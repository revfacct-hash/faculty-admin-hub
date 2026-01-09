import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase, getAdminProfile } from "@/lib/supabase";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    
    try {
      // Validar formato de email antes de intentar autenticar
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast.error("Por favor, ingresa un correo electrónico válido");
        setIsLoading(false);
        return;
      }

      console.log('Intentando autenticar con:', { email: email.trim().toLowerCase() });
      
      // Autenticar con Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        console.error('❌ Error de autenticación completo:', {
          message: authError.message,
          status: authError.status,
          name: authError.name
        });
        
        // Mensajes de error más específicos
        let errorMessage = "Error al iniciar sesión";
        if (authError.message.includes('Invalid login credentials') || authError.message.includes('invalid_grant')) {
          errorMessage = "Correo electrónico o contraseña incorrectos";
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = "Por favor, confirma tu correo electrónico primero";
        } else if (authError.message.includes('User not found')) {
          errorMessage = "Usuario no encontrado. Verifica tu correo electrónico";
        } else if (authError.status === 400) {
          errorMessage = "Error en la solicitud. Verifica tus credenciales o contacta al administrador";
        } else {
          errorMessage = authError.message || "Error al iniciar sesión. Intenta nuevamente";
        }
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error("Error al iniciar sesión");
        setIsLoading(false);
        return;
      }

      // Obtener perfil del administrador
      const profile = await getAdminProfile(authData.user.id);

      if (!profile) {
        toast.error("No tienes permisos para acceder al panel administrativo");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      if (!profile.activo) {
        toast.error("Tu cuenta está desactivada. Contacta al administrador");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      // Actualizar último acceso
      await supabase
        .from('perfiles_administradores')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', authData.user.id);

      toast.success(`Bienvenido, ${profile.nombre_completo}`);
      navigate("/admin");
    } catch (error) {
      console.error("Error en login:", error);
      toast.error("Error al iniciar sesión. Intenta nuevamente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Panel Administrativo</CardTitle>
            <CardDescription className="text-base mt-2">
              Facultad de Ciencia y Tecnología - UEB
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ueb.edu.bo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
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
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Olvidaste tu contraseña? Contacta al administrador
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
