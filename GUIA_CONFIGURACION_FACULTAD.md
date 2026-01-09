# ⚙️ Configuración de la Facultad - Guía para Frontend

## 🎯 Resumen

Este documento describe cómo obtener y usar la configuración general de la facultad desde Supabase. Esta configuración contiene los datos principales que se muestran en la página de inicio del sitio web.

---

## 📊 Estructura de Datos

### Tabla: `configuracion_facultad`

**Campos disponibles:**

- `id` (UUID) - Identificador único
- `titulo_hero` (TEXT) - Título principal que se muestra en el hero
- `subtitulo_hero` (TEXT) - Subtítulo que se muestra en el hero
- `imagen_hero` (TEXT) - Imagen hero en base64 (imagen de fondo)
- `descripcion_general` (TEXT) - Descripción general de la facultad
- `video_youtube` (TEXT) - URL o ID del video promocional general
- `activo` (BOOLEAN) - Si la configuración está activa
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**⚠️ Nota:** El campo `logo_facultad` existe en la base de datos pero **ya no se usa** en el panel administrativo. No es necesario obtenerlo ni mostrarlo en el frontend.

---

## 🔍 Cómo Obtener la Configuración

### Consulta Básica

```typescript
// Obtener configuración activa de la facultad
const { data: config, error } = await supabase
  .from('configuracion_facultad')
  .select('*')
  .eq('activo', true)
  .maybeSingle() // Usar maybeSingle() porque puede no haber configuración

if (error) {
  console.error('Error fetching config:', error);
  return;
}

// config contendrá todos los campos o null si no hay configuración activa
```

### Consulta Específica (Solo Campos Necesarios)

```typescript
// Obtener solo los campos que necesitas
const { data: config, error } = await supabase
  .from('configuracion_facultad')
  .select('titulo_hero, subtitulo_hero, imagen_hero, descripcion_general, video_youtube')
  .eq('activo', true)
  .maybeSingle()
```

---

## 📝 Estructura TypeScript

```typescript
interface ConfiguracionFacultad {
  id: string;
  titulo_hero: string;
  subtitulo_hero: string;
  imagen_hero?: string; // Base64 de la imagen hero
  descripcion_general: string;
  video_youtube?: string; // URL o ID del video de YouTube
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}
```

---

## 🎨 Ejemplo de Implementación

### Componente Hero Section

```tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ConfiguracionFacultad {
  titulo_hero: string;
  subtitulo_hero: string;
  imagen_hero?: string;
  descripcion_general: string;
  video_youtube?: string;
}

export default function HeroSection() {
  const [config, setConfig] = useState<ConfiguracionFacultad | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracion_facultad')
        .select('titulo_hero, subtitulo_hero, imagen_hero, descripcion_general, video_youtube')
        .eq('activo', true)
        .maybeSingle();

      if (error) throw error;
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!config) {
    return <div>No hay configuración disponible</div>;
  }

  return (
    <section 
      className="hero-section"
      style={{
        backgroundImage: config.imagen_hero 
          ? `url(${config.imagen_hero})` 
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="hero-content">
        <h1>{config.titulo_hero}</h1>
        <p className="subtitle">{config.subtitulo_hero}</p>
        {/* Resto del contenido del hero */}
      </div>
    </section>
  );
}
```

---

## 📋 Uso de Cada Campo

### 1. `titulo_hero`

**Uso:** Título principal que se muestra en la sección hero de la página principal.

**Ejemplo:**
```tsx
<h1>{config.titulo_hero}</h1>
// Muestra: "Facultad de Ciencia y Tecnología"
```

### 2. `subtitulo_hero`

**Uso:** Subtítulo que aparece debajo del título principal.

**Ejemplo:**
```tsx
<p className="subtitle">{config.subtitulo_hero}</p>
// Muestra: "Universidad Evangélica Boliviana"
```

### 3. `imagen_hero`

**Uso:** Imagen de fondo en base64 que se muestra detrás del contenido del hero.

**Ejemplo:**
```tsx
<div 
  style={{
    backgroundImage: config.imagen_hero 
      ? `url(${config.imagen_hero})` 
      : 'none'
  }}
>
  {/* Contenido */}
</div>
```

**Nota:** La imagen está en formato base64, puedes usarla directamente en `url()` o en un tag `<img src={config.imagen_hero} />`.

### 4. `descripcion_general`

**Uso:** Descripción completa de la facultad que se muestra en la página principal.

**Ejemplo:**
```tsx
<div className="description">
  <p>{config.descripcion_general}</p>
</div>
```

### 5. `video_youtube`

**Uso:** Video promocional general de la facultad. Puede contener una URL completa o solo el ID del video.

**Ejemplo:**
```tsx
// Extraer ID del video si es necesario
function extractYouTubeId(url: string): string {
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    return url; // Ya es un ID
  }
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : url;
}

// Usar en un iframe
{config.video_youtube && (
  <iframe
    src={`https://www.youtube.com/embed/${extractYouTubeId(config.video_youtube)}`}
    title="Video promocional"
    allowFullScreen
  />
)}
```

---

## 🔄 Función Helper Completa

```typescript
import { supabase } from '@/lib/supabase';

export interface ConfiguracionFacultad {
  id: string;
  titulo_hero: string;
  subtitulo_hero: string;
  imagen_hero?: string;
  descripcion_general: string;
  video_youtube?: string;
  activo: boolean;
}

/**
 * Obtiene la configuración activa de la facultad
 */
export async function getConfiguracionFacultad(): Promise<ConfiguracionFacultad | null> {
  try {
    const { data, error } = await supabase
      .from('configuracion_facultad')
      .select('*')
      .eq('activo', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching config:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching config:', error);
    return null;
  }
}

// Uso
const config = await getConfiguracionFacultad();
if (config) {
  console.log('Título:', config.titulo_hero);
  console.log('Tiene imagen:', !!config.imagen_hero);
}
```

---

## ⚠️ Consideraciones Importantes

### 1. Campo Opcional

La configuración puede no existir. Siempre verifica que `config` no sea `null` antes de usarla:

```typescript
if (!config) {
  // Mostrar valores por defecto o mensaje
  return <div>Configuración no disponible</div>;
}
```

### 2. Valores por Defecto

Puedes usar valores por defecto si la configuración no existe:

```typescript
const titulo = config?.titulo_hero || 'Facultad de Ciencia y Tecnología';
const subtitulo = config?.subtitulo_hero || 'Universidad Evangélica Boliviana';
```

### 3. Imagen Hero

La imagen hero es opcional. Si no existe, puedes:
- No mostrar imagen de fondo
- Usar una imagen por defecto
- Mostrar un color sólido

```tsx
const backgroundStyle = config?.imagen_hero
  ? { backgroundImage: `url(${config.imagen_hero})` }
  : { backgroundColor: '#1a1a1a' }; // Color por defecto
```

### 4. Video de YouTube

El video es opcional. Verifica que exista antes de mostrarlo:

```tsx
{config?.video_youtube && (
  <iframe src={`https://www.youtube.com/embed/${extractYouTubeId(config.video_youtube)}`} />
)}
```

---

## 📍 Dónde Usar la Configuración

### Página Principal (`/`)

La configuración se usa principalmente en:

1. **Sección Hero:**
   - `titulo_hero` - Título principal
   - `subtitulo_hero` - Subtítulo
   - `imagen_hero` - Imagen de fondo

2. **Sección de Descripción:**
   - `descripcion_general` - Texto descriptivo de la facultad

3. **Sección de Video:**
   - `video_youtube` - Video promocional

---

## 🎨 Ejemplo Completo de Página Principal

```tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data } = await supabase
      .from('configuracion_facultad')
      .select('*')
      .eq('activo', true)
      .maybeSingle();
    
    setConfig(data);
    setIsLoading(false);
  };

  if (isLoading) return <div>Cargando...</div>;
  if (!config) return <div>No hay configuración disponible</div>;

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="hero min-h-screen flex items-center justify-center text-white"
        style={{
          backgroundImage: config.imagen_hero 
            ? `url(${config.imagen_hero})` 
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="hero-overlay bg-black/50 absolute inset-0" />
        <div className="hero-content relative z-10 text-center">
          <h1 className="text-5xl font-bold mb-4">
            {config.titulo_hero}
          </h1>
          <p className="text-2xl">
            {config.subtitulo_hero}
          </p>
        </div>
      </section>

      {/* Descripción */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <p className="text-lg leading-relaxed">
            {config.descripcion_general}
          </p>
        </div>
      </section>

      {/* Video Promocional */}
      {config.video_youtube && (
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="aspect-video max-w-4xl mx-auto">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${extractYouTubeId(config.video_youtube)}`}
                title="Video promocional"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
```

---

## 🔒 Políticas RLS

**Nota:** Asegúrate de que las políticas RLS en Supabase permitan lectura pública de la configuración activa:

```sql
-- Política para lectura pública de configuración activa
CREATE POLICY "Configuración pública" ON configuracion_facultad
  FOR SELECT USING (activo = true);
```

---

## 📚 Referencias

- **Guía completa de Supabase:** Ver `GUIA_FRONTEND_SUPABASE.md`
- **Tabla en base de datos:** `configuracion_facultad`
- **Panel administrativo:** `/admin/configuracion`

---

## ✅ Checklist de Implementación

- [ ] Obtener configuración desde Supabase usando `.eq('activo', true)`
- [ ] Manejar el caso cuando no hay configuración (`maybeSingle()`)
- [ ] Usar `titulo_hero` y `subtitulo_hero` en la sección hero
- [ ] Mostrar `imagen_hero` como imagen de fondo
- [ ] Mostrar `descripcion_general` en la sección de descripción
- [ ] Mostrar `video_youtube` si existe (con extracción de ID si es necesario)
- [ ] Implementar valores por defecto para campos opcionales
- [ ] Verificar que las políticas RLS permitan lectura pública

---

## 🐛 Solución de Problemas

### La configuración no se carga

1. Verifica que existe una configuración con `activo = true` en Supabase
2. Revisa las políticas RLS en Supabase Dashboard
3. Confirma que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configurados
4. Revisa la consola del navegador para errores

### La imagen hero no se muestra

1. Verifica que `config.imagen_hero` no sea `null` o vacío
2. Confirma que la imagen está en formato base64 válido
3. Verifica que el CSS `backgroundImage` esté correctamente aplicado

### El video no se reproduce

1. Verifica que `config.video_youtube` no sea `null`
2. Confirma que la función `extractYouTubeId` funciona correctamente
3. Verifica que la URL del iframe sea correcta

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0
