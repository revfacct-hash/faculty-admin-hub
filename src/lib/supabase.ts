import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno de Supabase faltantes');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ Faltante');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configurado' : '❌ Faltante');
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Validar formato de URL
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.warn('⚠️ Advertencia: La URL de Supabase puede no ser válida:', supabaseUrl);
}

// Validar formato de API key (debe empezar con 'eyJ' para JWT o ser una key válida)
if (supabaseAnonKey.length < 50) {
  console.warn('⚠️ Advertencia: La API key de Supabase parece ser muy corta. Verifica que sea la "anon public" key correcta.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper para obtener el usuario actual
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper para obtener el perfil del administrador
export const getAdminProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('perfiles_administradores')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching admin profile:', error);
    return null;
  }
  
  return data;
};
