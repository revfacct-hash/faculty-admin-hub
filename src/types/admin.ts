// Types for UEB Faculty Admin Panel

export type AppRole = 'admin' | 'editor' | 'viewer';

export interface Carrera {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  duracion: string;
  semestres: number;
  imagen_hero?: string;
  descripcion_docentes?: string;
  video_youtube?: string;
  activa: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Docente {
  id: string;
  carrera_id: string;
  nombre: string;
  especialidad: string;
  titulo: string;
  experiencia: string;
  imagen_avatar?: string;
  cv_imagen?: string;
  orden: number;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  carrera?: Carrera;
}

export interface PlanEstudios {
  id: string;
  carrera_id: string;
  semestre_numero: number;
  materia_nombre: string;
  materia_color: string;
  horas_teoria: number;
  horas_practica: number;
  categoria: 'Electrónica' | 'Matemática' | 'Física' | 'Control' | 'Otros';
  orden: number;
  created_at?: string;
  updated_at?: string;
}

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin?: string;
  ubicacion: string;
  imagen?: string;
  tipo: 'Académico' | 'Cultural' | 'Deportivo';
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AmbitoLaboral {
  id: string;
  carrera_id: string;
  titulo: string;
  descripcion: string;
  imagen?: string;
  orden: number;
  created_at?: string;
  updated_at?: string;
}

export interface PerfilEgresado {
  id: string;
  carrera_id: string;
  competencia: string;
  orden: number;
  created_at?: string;
  updated_at?: string;
}

export interface VideoPromocional {
  id: string;
  carrera_id: string;
  titulo?: string;
  url_youtube: string;
  descripcion?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Noticia {
  id: string;
  titulo: string;
  contenido: string;
  imagen_portada?: string;
  autor: string;
  fecha_publicacion: string;
  categoria: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ConfiguracionFacultad {
  id: string;
  titulo_hero: string;
  subtitulo_hero: string;
  imagen_hero?: string;
  logo_facultad?: string;
  descripcion_general: string;
  video_youtube?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PerfilAdministrador {
  id: string;
  nombre_completo: string;
  email: string;
  rol: AppRole;
  activo: boolean;
  ultimo_acceso?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DesgloseCarrera {
  porcentaje_teoria: number;
  porcentaje_practica: number;
  desglose_categoria: Record<string, number>;
  total_anos: number;
  total_semestres: number;
  total_horas: number;
}

// Form types
export type CarreraFormData = Omit<Carrera, 'id' | 'created_at' | 'updated_at'>;
export type DocenteFormData = Omit<Docente, 'id' | 'created_at' | 'updated_at' | 'carrera'>;
export type PlanEstudiosFormData = Omit<PlanEstudios, 'id' | 'created_at' | 'updated_at'>;
export type EventoFormData = Omit<Evento, 'id' | 'created_at' | 'updated_at'>;
export type AmbitoLaboralFormData = Omit<AmbitoLaboral, 'id' | 'created_at' | 'updated_at'>;
export type PerfilEgresadoFormData = Omit<PerfilEgresado, 'id' | 'created_at' | 'updated_at'>;
export type VideoPromocionalFormData = Omit<VideoPromocional, 'id' | 'created_at' | 'updated_at'>;
export type NoticiaFormData = Omit<Noticia, 'id' | 'created_at' | 'updated_at'>;
export type ConfiguracionFacultadFormData = Omit<ConfiguracionFacultad, 'id' | 'created_at' | 'updated_at'>;
