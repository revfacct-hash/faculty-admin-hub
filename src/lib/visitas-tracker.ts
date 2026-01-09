/**
 * Utilidad para registrar visitas en el frontend público
 * 
 * Uso:
 * import { registrarVisita } from '@/lib/visitas-tracker';
 * 
 * // En un componente o página:
 * useEffect(() => {
 *   registrarVisita({
 *     pagina: window.location.pathname,
 *     tipoPagina: 'carrera',
 *     carreraId: 'uuid-de-la-carrera'
 *   });
 * }, []);
 */

import { supabase } from './supabase';

export interface VisitaData {
  pagina: string; // Ruta de la página (ej: '/', '/carreras/ingenieria-sistemas')
  tipoPagina?: 'home' | 'carrera' | 'evento' | 'noticia' | 'otro'; // Tipo de página
  carreraId?: string; // ID de la carrera si aplica
  referrer?: string; // Página de origen (opcional)
}

/**
 * Registra una visita en la base de datos
 * Esta función es segura y no lanza errores si falla (para no afectar la UX)
 */
export async function registrarVisita(data: VisitaData): Promise<void> {
  try {
    // Obtener información adicional del navegador (opcional)
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
    const referrer = data.referrer || (typeof document !== 'undefined' ? document.referrer : null);

    const visitaData = {
      pagina: data.pagina,
      tipo_pagina: data.tipoPagina || 'otro',
      carrera_id: data.carreraId || null,
      referrer: referrer || null,
      user_agent: userAgent || null,
      // ip_address se puede obtener desde el backend si es necesario
      // Por ahora lo dejamos como NULL por privacidad
    };

    const { error } = await supabase
      .from('visitas')
      .insert(visitaData);

    if (error) {
      // Solo loguear en desarrollo, no mostrar errores al usuario
      if (import.meta.env.DEV) {
        console.warn('Error al registrar visita:', error);
      }
    }
  } catch (error) {
    // Silenciar errores para no afectar la experiencia del usuario
    if (import.meta.env.DEV) {
      console.warn('Error al registrar visita:', error);
    }
  }
}

/**
 * Hook de React para registrar visitas automáticamente
 * 
 * Uso:
 * import { useVisitaTracker } from '@/lib/visitas-tracker';
 * 
 * function MiComponente() {
 *   useVisitaTracker({
 *     tipoPagina: 'carrera',
 *     carreraId: 'uuid'
 *   });
 *   return <div>...</div>;
 * }
 */
import { useEffect } from 'react';

export function useVisitaTracker(data: Omit<VisitaData, 'pagina'>) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      registrarVisita({
        pagina: window.location.pathname,
        ...data,
      });
    }
  }, [data.tipoPagina, data.carreraId]); // Solo re-ejecutar si cambian estos valores
}

/**
 * Determina el tipo de página basado en la ruta
 */
export function determinarTipoPagina(pathname: string): VisitaData['tipoPagina'] {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.includes('/carreras/')) return 'carrera';
  if (pathname.includes('/eventos/')) return 'evento';
  if (pathname.includes('/noticias/')) return 'noticia';
  return 'otro';
}

/**
 * Extrae el ID de carrera de la URL si está presente
 * Ejemplo: '/carreras/ingenieria-sistemas' -> buscar carrera por slug
 */
export async function obtenerCarreraIdDeSlug(slug: string): Promise<string | undefined> {
  try {
    const { data, error } = await supabase
      .from('carreras')
      .select('id')
      .eq('slug', slug)
      .eq('activa', true)
      .single();

    if (error || !data) return undefined;
    return data.id;
  } catch {
    return undefined;
  }
}
