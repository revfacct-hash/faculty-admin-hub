// Tipos generados automáticamente para Supabase
// Puedes generar estos tipos usando: npx supabase gen types typescript --project-id jovxdfldxlxmwbqfkigl > src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      carreras: {
        Row: {
          id: string
          nombre: string
          slug: string
          descripcion: string | null
          duracion: string | null
          semestres: number | null
          imagen_hero: string | null
          descripcion_docentes: string | null
          video_youtube: string | null
          activa: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          slug: string
          descripcion?: string | null
          duracion?: string | null
          semestres?: number | null
          imagen_hero?: string | null
          descripcion_docentes?: string | null
          video_youtube?: string | null
          activa?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          slug?: string
          descripcion?: string | null
          duracion?: string | null
          semestres?: number | null
          imagen_hero?: string | null
          descripcion_docentes?: string | null
          video_youtube?: string | null
          activa?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      docentes: {
        Row: {
          id: string
          carrera_id: string | null
          nombre: string
          especialidad: string | null
          titulo: string | null
          experiencia: string | null
          imagen_avatar: string | null
          cv_imagen: string | null
          orden: number
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          carrera_id?: string | null
          nombre: string
          especialidad?: string | null
          titulo?: string | null
          experiencia?: string | null
          imagen_avatar?: string | null
          cv_imagen?: string | null
          orden?: number
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          carrera_id?: string | null
          nombre?: string
          especialidad?: string | null
          titulo?: string | null
          experiencia?: string | null
          imagen_avatar?: string | null
          cv_imagen?: string | null
          orden?: number
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      plan_estudios: {
        Row: {
          id: string
          carrera_id: string | null
          semestre_numero: number
          materia_nombre: string
          materia_color: string
          horas_teoria: number
          horas_practica: number
          categoria: string
          orden: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          carrera_id?: string | null
          semestre_numero: number
          materia_nombre: string
          materia_color?: string
          horas_teoria?: number
          horas_practica?: number
          categoria?: string
          orden?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          carrera_id?: string | null
          semestre_numero?: number
          materia_nombre?: string
          materia_color?: string
          horas_teoria?: number
          horas_practica?: number
          categoria?: string
          orden?: number
          created_at?: string
          updated_at?: string
        }
      }
      eventos: {
        Row: {
          id: string
          titulo: string
          descripcion: string | null
          fecha_inicio: string
          fecha_fin: string | null
          ubicacion: string | null
          imagen: string | null
          tipo: string
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descripcion?: string | null
          fecha_inicio: string
          fecha_fin?: string | null
          ubicacion?: string | null
          imagen?: string | null
          tipo?: string
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descripcion?: string | null
          fecha_inicio?: string
          fecha_fin?: string | null
          ubicacion?: string | null
          imagen?: string | null
          tipo?: string
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ambitos_laborales: {
        Row: {
          id: string
          carrera_id: string | null
          titulo: string
          descripcion: string | null
          imagen: string | null
          orden: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          carrera_id?: string | null
          titulo: string
          descripcion?: string | null
          imagen?: string | null
          orden?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          carrera_id?: string | null
          titulo?: string
          descripcion?: string | null
          imagen?: string | null
          orden?: number
          created_at?: string
          updated_at?: string
        }
      }
      perfil_egresado: {
        Row: {
          id: string
          carrera_id: string | null
          competencia: string
          orden: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          carrera_id?: string | null
          competencia: string
          orden?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          carrera_id?: string | null
          competencia?: string
          orden?: number
          created_at?: string
          updated_at?: string
        }
      }
      videos_promocionales: {
        Row: {
          id: string
          carrera_id: string | null
          titulo: string | null
          url_youtube: string
          descripcion: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          carrera_id?: string | null
          titulo?: string | null
          url_youtube: string
          descripcion?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          carrera_id?: string | null
          titulo?: string | null
          url_youtube?: string
          descripcion?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      noticias: {
        Row: {
          id: string
          titulo: string
          contenido: string | null
          imagen_portada: string | null
          autor: string | null
          fecha_publicacion: string
          categoria: string
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          contenido?: string | null
          imagen_portada?: string | null
          autor?: string | null
          fecha_publicacion?: string
          categoria?: string
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          contenido?: string | null
          imagen_portada?: string | null
          autor?: string | null
          fecha_publicacion?: string
          categoria?: string
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      configuracion_facultad: {
        Row: {
          id: string
          titulo_hero: string
          subtitulo_hero: string
          imagen_hero: string | null
          logo_facultad: string | null
          descripcion_general: string | null
          video_youtube: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo_hero?: string
          subtitulo_hero?: string
          imagen_hero?: string | null
          logo_facultad?: string | null
          descripcion_general?: string | null
          video_youtube?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo_hero?: string
          subtitulo_hero?: string
          imagen_hero?: string | null
          logo_facultad?: string | null
          descripcion_general?: string | null
          video_youtube?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      perfiles_administradores: {
        Row: {
          id: string
          nombre_completo: string
          email: string
          rol: 'admin' | 'editor' | 'viewer'
          activo: boolean
          ultimo_acceso: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nombre_completo: string
          email: string
          rol?: 'admin' | 'editor' | 'viewer'
          activo?: boolean
          ultimo_acceso?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre_completo?: string
          email?: string
          rol?: 'admin' | 'editor' | 'viewer'
          activo?: boolean
          ultimo_acceso?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      calcular_desglose_carrera: {
        Args: {
          p_carrera_id: string
        }
        Returns: {
          total_horas_teoria: number
          total_horas_practica: number
          porcentaje_teoria: number
          porcentaje_practica: number
          total_semestres: number
          total_anos: number
          desglose_categoria: Json
        }[]
      }
    }
  }
}
