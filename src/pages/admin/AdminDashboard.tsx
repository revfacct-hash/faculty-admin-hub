import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  TrendingUp,
  ArrowRight,
  Clock,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const quickActions = [
  { title: "Nueva Carrera", href: "/admin/carreras/crear", icon: GraduationCap },
  { title: "Nuevo Docente", href: "/admin/docentes/crear", icon: Users },
  { title: "Nuevo Evento", href: "/admin/eventos/crear", icon: Calendar },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    carreras: 0,
    docentes: 0,
    eventos: 0,
    visitasMes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      const [carrerasRes, docentesRes, eventosRes, visitasRes] = await Promise.all([
        supabase.from('carreras').select('id', { count: 'exact' }).eq('activa', true),
        supabase.from('docentes').select('id', { count: 'exact' }).eq('activo', true),
        supabase.from('eventos').select('id', { count: 'exact' }).eq('activo', true),
        supabase.rpc('obtener_visitas_mes'),
      ]);

      setStats({
        carreras: carrerasRes.count || 0,
        docentes: docentesRes.count || 0,
        eventos: eventosRes.count || 0,
        visitasMes: visitasRes.data || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Si hay error con visitas, no fallar todo el dashboard
      setStats(prev => ({ ...prev, visitasMes: 0 }));
    } finally {
      setIsLoading(false);
    }
  };

  const statsData = [
    { 
      title: "Carreras Activas", 
      value: isLoading ? "..." : stats.carreras.toString(), 
      icon: GraduationCap, 
      description: "Programas académicos",
      href: "/admin/carreras"
    },
    { 
      title: "Docentes", 
      value: isLoading ? "..." : stats.docentes.toString(), 
      icon: Users, 
      description: "Profesores activos",
      href: "/admin/docentes"
    },
    { 
      title: "Eventos", 
      value: isLoading ? "..." : stats.eventos.toString(), 
      icon: Calendar, 
      description: "Próximos eventos",
      href: "/admin/eventos"
    },
    { 
      title: "Visitas del Mes", 
      value: isLoading ? "..." : stats.visitasMes.toLocaleString(), 
      icon: TrendingUp, 
      description: "Total de visitas este mes",
      href: "/admin"
    },
  ];
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">¡Bienvenido al Panel!</h2>
        <p className="text-muted-foreground">
          Gestiona el contenido de la Facultad de Ciencia y Tecnología
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Crea nuevo contenido fácilmente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.href}>
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <action.icon className="h-4 w-4" />
                    {action.title}
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas modificaciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center py-4">
                La actividad reciente se mostrará aquí cuando haya cambios en el sistema
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
