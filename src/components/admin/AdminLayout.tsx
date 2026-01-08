import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { Outlet } from "react-router-dom";
import { supabase, getAdminProfile } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface AdminLayoutProps {
  title?: string;
}

export function AdminLayout({ title }: AdminLayoutProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/admin/login", { replace: true });
          return;
        }

        // Verificar que el usuario tenga perfil de administrador
        const profile = await getAdminProfile(session.user.id);
        
        if (!profile || !profile.activo) {
          await supabase.auth.signOut();
          navigate("/admin/login", { replace: true });
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        navigate("/admin/login", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/admin/login", { replace: true });
      } else if (session) {
        const profile = await getAdminProfile(session.user.id);
        if (!profile || !profile.activo) {
          await supabase.auth.signOut();
          navigate("/admin/login", { replace: true });
        } else {
          setIsAuthenticated(true);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title={title} />
          <main className="flex-1 p-6 bg-background overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
