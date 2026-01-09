# 🔧 Configuración de Supabase

## Pasos para conectar con Supabase

### 1. Obtener las credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Settings** > **API**
3. Copia los siguientes valores:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon public** key (en la sección "Project API keys")

### 2. Crear archivo de variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://jovxdfldxlxmwbqfkigl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdnhkZmxkeGx4bXdicWZraWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODA2NDksImV4cCI6MjA4MzQ1NjY0OX0.rMoiOqrPIcUbXK85olya5FqsZNSOALIkpAM0vYAH2e8
```

✅ **Archivo `.env.local` ya configurado con tus credenciales.**

### 3. Reiniciar el servidor de desarrollo

Después de crear el archivo `.env.local`, reinicia el servidor:

```bash
npm run dev
```

## ⚠️ Importante

- **NUNCA** subas el archivo `.env.local` a Git (ya está en `.gitignore`)
- El archivo `.env.local` es solo para desarrollo local
- Para producción, configura las variables de entorno en tu plataforma de hosting

## 🔐 Crear primer usuario administrador

Para crear el primer usuario administrador:

1. Ve a **Authentication** > **Users** en Supabase Dashboard
2. Crea un nuevo usuario manualmente o usa el signup
3. Copia el `id` del usuario creado
4. Ejecuta este SQL en el SQL Editor de Supabase:

```sql
INSERT INTO perfiles_administradores (id, nombre_completo, email, rol, activo)
VALUES (
  'ID_DEL_USUARIO_AQUI',  -- Reemplaza con el ID del usuario
  'Nombre Completo',
  'email@ueb.edu.bo',
  'admin',
  true
);
```

## ✅ Verificar que todo funciona

1. Asegúrate de que el archivo `.env.local` existe y tiene las variables correctas
2. Reinicia el servidor de desarrollo
3. Intenta iniciar sesión con el usuario que creaste
4. Deberías poder acceder al panel administrativo

## 🐛 Solución de problemas

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env.local` existe en la raíz del proyecto
- Verifica que las variables empiezan con `VITE_`
- Reinicia el servidor después de crear/modificar `.env.local`

### Error 400 en `/auth/v1/token?grant_type=password`
Este error puede deberse a varias causas:

1. **API Key incorrecta**:
   - ⚠️ **IMPORTANTE**: Asegúrate de usar la **"anon public"** key, NO la "publishable" key
   - Ve a Supabase Dashboard > Settings > API
   - Busca la sección "Project API keys"
   - Copia la key que dice **"anon"** o **"public"** (no "publishable")
   - La key debe ser muy larga (más de 100 caracteres) y empezar con `eyJ` (es un JWT)

2. **Usuario no existe en Supabase Auth**:
   - Ve a Supabase Dashboard > Authentication > Users
   - Verifica que el usuario existe
   - Si no existe, créalo manualmente o usa el signup

3. **Credenciales incorrectas**:
   - Verifica que el email y password sean correctos
   - El email debe estar en minúsculas y sin espacios

4. **Configuración de autenticación**:
   - Ve a Supabase Dashboard > Authentication > Providers
   - Asegúrate de que "Email" está habilitado
   - Verifica que no hay restricciones de dominio

### Error: "No tienes permisos para acceder"
- Verifica que el usuario existe en `perfiles_administradores`
- Verifica que `activo = true` en el perfil
- Verifica que el `id` en `perfiles_administradores` coincide con el `id` en `auth.users`

### Verificar configuración actual
Abre la consola del navegador (F12) y verifica:
1. Que no aparezcan errores sobre variables de entorno faltantes
2. Que la URL de Supabase sea correcta (debe terminar en `.supabase.co`)
3. Que la API key tenga el formato correcto (muy larga, empieza con `eyJ`)
