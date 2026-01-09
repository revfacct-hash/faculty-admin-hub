import { useEffect, useState, useRef } from "react";
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
  const isLoadingRef = useRef(true);

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    // Timeout de seguridad para evitar carga infinita
    const safetyTimeout = setTimeout(() => {
      if (isMounted && isLoadingRef.current) {
        console.warn("Timeout de seguridad: forzando detención de carga");
        isLoadingRef.current = false;
        setIsLoading(false);
        navigate("/admin/login", { replace: true });
      }
    }, 10000); // 10 segundos máximo

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error obteniendo sesión:", sessionError);
          if (isMounted) {
            isLoadingRef.current = false;
            setIsLoading(false);
            navigate("/admin/login", { replace: true });
          }
          return;
        }
        
        if (!session) {
          if (isMounted) {
            isLoadingRef.current = false;
            setIsLoading(false);
            navigate("/admin/login", { replace: true });
          }
          return;
        }

        // Verificar que el usuario tenga perfil de administrador
        try {
          const profile = await getAdminProfile(session.user.id);
          
          if (!profile || !profile.activo) {
            await supabase.auth.signOut();
            if (isMounted) {
              isLoadingRef.current = false;
              setIsLoading(false);
              navigate("/admin/login", { replace: true });
            }
            return;
          }

          if (isMounted) {
            isLoadingRef.current = false;
            setIsAuthenticated(true);
            setIsLoading(false);
          }
        } catch (profileError) {
          console.error("Error obteniendo perfil:", profileError);
          await supabase.auth.signOut();
          if (isMounted) {
            isLoadingRef.current = false;
            setIsLoading(false);
            navigate("/admin/login", { replace: true });
          }
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        if (isMounted) {
          isLoadingRef.current = false;
          setIsLoading(false);
          navigate("/admin/login", { replace: true });
        }
      }
    };

    // Verificar autenticación inicial
    checkAuth();

    // Escuchar solo cambios de SIGNED_OUT para evitar loops
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      // Solo procesar SIGNED_OUT explícitamente
      if (event === 'SIGNED_OUT') {
        isLoadingRef.current = false;
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate("/admin/login", { replace: true });
      }
      // Ignorar todos los demás eventos (SIGNED_IN, TOKEN_REFRESHED, etc.)
      // para evitar loops infinitos
    });

    subscription = authSubscription;

    return () => {
      clearTimeout(safetyTimeout);
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
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
