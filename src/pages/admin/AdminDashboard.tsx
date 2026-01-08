import { 
  GraduationCap, 
  Users, 
  Calendar, 
  TrendingUp,
  ArrowRight,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data - will be replaced with Supabase queries
const stats = [
  { 
    title: "Carreras Activas", 
    value: "5", 
    icon: GraduationCap, 
    description: "Programas académicos",
    href: "/admin/carreras"
  },
  { 
    title: "Docentes", 
    value: "24", 
    icon: Users, 
    description: "Profesores activos",
    href: "/admin/docentes"
  },
  { 
    title: "Eventos", 
    value: "3", 
    icon: Calendar, 
    description: "Próximos eventos",
    href: "/admin/eventos"
  },
  { 
    title: "Visitas del Mes", 
    value: "1,234", 
    icon: TrendingUp, 
    description: "+12% vs mes anterior",
    href: "/admin"
  },
];

const recentActivities = [
  { action: "Nuevo docente agregado", target: "Ing. Roberto Saavedra", time: "Hace 2 horas" },
  { action: "Evento actualizado", target: "Openhouse 2024", time: "Hace 5 horas" },
  { action: "Carrera editada", target: "Ingeniería de Sistemas", time: "Hace 1 día" },
  { action: "Nueva materia agregada", target: "Programación III", time: "Hace 2 días" },
];

const quickActions = [
  { title: "Nueva Carrera", href: "/admin/carreras/crear", icon: GraduationCap },
  { title: "Nuevo Docente", href: "/admin/docentes/crear", icon: Users },
  { title: "Nuevo Evento", href: "/admin/eventos/crear", icon: Calendar },
];

export default function AdminDashboard() {
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
        {stats.map((stat) => (
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
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.target}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
