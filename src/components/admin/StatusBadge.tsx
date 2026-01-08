import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  active: boolean;
  activeText?: string;
  inactiveText?: string;
  className?: string;
}

export function StatusBadge({
  active,
  activeText = "Activo",
  inactiveText = "Inactivo",
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant={active ? "default" : "secondary"}
      className={cn(
        active
          ? "bg-success/10 text-success hover:bg-success/20 border-success/20"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      {active ? activeText : inactiveText}
    </Badge>
  );
}

interface TypeBadgeProps {
  type: string;
  className?: string;
}

const typeColors: Record<string, string> = {
  // Event types
  "Académico": "bg-blue-100 text-blue-700 border-blue-200",
  "Cultural": "bg-green-100 text-green-700 border-green-200",
  "Deportivo": "bg-orange-100 text-orange-700 border-orange-200",
  // Roles
  "admin": "bg-red-100 text-red-700 border-red-200",
  "editor": "bg-blue-100 text-blue-700 border-blue-200",
  "viewer": "bg-gray-100 text-gray-700 border-gray-200",
  // Categories
  "Electrónica": "bg-blue-100 text-blue-700 border-blue-200",
  "Matemática": "bg-orange-100 text-orange-700 border-orange-200",
  "Física": "bg-green-100 text-green-700 border-green-200",
  "Control": "bg-purple-100 text-purple-700 border-purple-200",
  "Otros": "bg-gray-100 text-gray-700 border-gray-200",
};

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const colorClass = typeColors[type] || "bg-gray-100 text-gray-700 border-gray-200";
  
  return (
    <Badge
      variant="outline"
      className={cn(colorClass, className)}
    >
      {type}
    </Badge>
  );
}

interface RoleBadgeProps {
  role: "admin" | "editor" | "viewer";
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-700 border-red-200",
    editor: "bg-blue-100 text-blue-700 border-blue-200",
    viewer: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    editor: "Editor",
    viewer: "Visualizador",
  };

  return (
    <Badge
      variant="outline"
      className={cn(roleColors[role] || "bg-gray-100 text-gray-700 border-gray-200", className)}
    >
      {roleLabels[role] || role}
    </Badge>
  );
}
