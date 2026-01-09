# 📚 Guía de Integración Frontend - Supabase

## 🎯 Resumen del Proyecto

Este documento describe la estructura de la base de datos y cómo el frontend público puede conectarse a Supabase para obtener la información de la Facultad de Tecnología UEB.

## 🔗 Configuración de Supabase

### Variables de Entorno

El frontend necesita estas variables de entorno:

```env
VITE_SUPABASE_URL=https://jovxdfldxlxmwbqfkigl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdnhkZmxkeGx4bXdicWZraWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODA2NDksImV4cCI6MjA4MzQ1NjY0OX0.rMoiOqrPIcUbXK85olya5FqsZNSOALIkpAM0vYAH2e8
```

### Instalación del Cliente

```bash
npm install @supabase/supabase-js
```

### Inicialización del Cliente

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 📊 Estructura de la Base de Datos

### 1. Tabla: `carreras`

Información de las carreras de la Facultad de Tecnología.

**Campos:**
- `id` (UUID) - Identificador único
- `nombre` (TEXT) - Nombre de la carrera
- `slug` (TEXT, UNIQUE) - Slug para URLs amigables
- `descripcion` (TEXT) - Descripción completa de la carrera
- `resumen_breve` (TEXT) - Resumen breve que se muestra en la sección hero (entre el título y el botón)
- `duracion` (TEXT) - Duración de la carrera (ej: "5 años")
- `semestres` (INTEGER) - Número de semestres
- `imagen_hero` (TEXT) - Imagen hero en base64
- `descripcion_docentes` (TEXT) - Descripción de los docentes
- `video_youtube` (TEXT) - URL o ID del video de YouTube
- `activa` (BOOLEAN) - Si la carrera está activa
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Ejemplo de consulta:**
```typescript
// Obtener todas las carreras activas
const { data: carreras, error } = await supabase
  .from('carreras')
  .select('*')
  .eq('activa', true)
  .order('nombre')

// Obtener carreras con campos específicos (incluyendo resumen_breve para hero)
const { data: carreras, error } = await supabase
  .from('carreras')
  .select('id, nombre, slug, resumen_breve, imagen_hero')
  .eq('activa', true)
  .order('nombre')

// Obtener una carrera por slug
const { data: carrera, error } = await supabase
  .from('carreras')
  .select('*')
  .eq('slug', 'ingenieria-en-sistemas')
  .eq('activa', true)
  .single()

// Obtener una carrera por ID
const { data: carrera, error } = await supabase
  .from('carreras')
  .select('*')
  .eq('id', '00435597-634c-4e57-a9f5-b9a95a726acb')
  .single()
```

---

### 2. Tabla: `docentes`

Perfiles de docentes con sus CVs y especialidades.

**Campos:**
- `id` (UUID) - Identificador único
- `carrera_id` (UUID) - Referencia a `carreras.id`
- `nombre` (TEXT) - Nombre del docente
- `especialidad` (TEXT) - Especialidad del docente
- `titulo` (TEXT) - Título académico
- `experiencia` (TEXT) - Experiencia profesional
- `imagen_avatar` (TEXT) - Foto de perfil en base64 (máx. 10MB)
- `cv_imagen` (TEXT) - CV completo en base64 (JPG o PDF)
- `orden` (INTEGER) - Orden de visualización
- `activo` (BOOLEAN) - Si el docente está activo
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Ejemplo de consulta:**
```typescript
// Obtener docentes de una carrera específica
const { data: docentes, error } = await supabase
  .from('docentes')
  .select('*')
  .eq('carrera_id', '00435597-634c-4e57-a9f5-b9a95a726acb')
  .eq('activo', true)
  .order('orden', { ascending: true })

// Obtener todos los docentes activos
const { data: docentes, error } = await supabase
  .from('docentes')
  .select('*')
  .eq('activo', true)
  .order('nombre')
```

---

### 3. Tabla: `plan_estudios`

Plan de estudios dividido por semestres y materias.

**Campos:**
- `id` (UUID) - Identificador único
- `carrera_id` (UUID) - Referencia a `carreras.id`
- `semestre_numero` (INTEGER) - Número de semestre (1, 2, 3, ...)
- `materia_nombre` (TEXT) - Nombre de la materia
- `materia_color` (TEXT) - Color hexadecimal (ej: "#2563eb")
- `horas_teoria` (INTEGER) - Horas teóricas
- `horas_practica` (INTEGER) - Horas prácticas
- `categoria` (TEXT) - Categoría: 'Electrónica', 'Matemática', 'Física', 'Control', 'Otros'
- `orden` (INTEGER) - Orden dentro del semestre
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Ejemplo de consulta:**
```typescript
// Obtener todas las materias de una carrera
const { data: materias, error } = await supabase
  .from('plan_estudios')
  .select('*')
  .eq('carrera_id', '00435597-634c-4e57-a9f5-b9a95a726acb')
  .order('semestre_numero', { ascending: true })
  .order('orden', { ascending: true })

// Obtener materias de un semestre específico
const { data: materias, error } = await supabase
  .from('plan_estudios')
  .select('*')
  .eq('carrera_id', '00435597-634c-4e57-a9f5-b9a95a726acb')
  .eq('semestre_numero', 1)
  .order('orden', { ascending: true })

// Obtener materias por categoría
const { data: materias, error } = await supabase
  .from('plan_estudios')
  .select('*')
  .eq('carrera_id', '00435597-634c-4e57-a9f5-b9a95a726acb')
  .eq('categoria', 'Electrónica')
  .order('semestre_numero', { ascending: true })
```

---

### 4. Tabla: `eventos`

Eventos académicos, culturales y deportivos de la facultad.

**Campos:**
- `id` (UUID) - Identificador único
- `titulo` (TEXT) - Título del evento
- `descripcion` (TEXT) - Descripción del evento
- `fecha_inicio` (TIMESTAMP) - Fecha y hora de inicio
- `fecha_fin` (TIMESTAMP) - Fecha y hora de fin (opcional)
- `ubicacion` (TEXT) - Ubicación del evento
- `imagen` (TEXT) - Imagen del evento en base64
- `tipo` (TEXT) - Tipo: 'Académico', 'Cultural', 'Deportivo', etc.
- `activo` (BOOLEAN) - Si el evento está activo
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Ejemplo de consulta:**
```typescript
// Obtener eventos activos ordenados por fecha
const { data: eventos, error } = await supabase
  .from('eventos')
  .select('*')
  .eq('activo', true)
  .order('fecha_inicio', { ascending: true })

// Obtener eventos próximos (fecha_inicio >= hoy)
const hoy = new Date().toISOString()
const { data: eventos, error } = await supabase
  .from('eventos')
  .select('*')
  .eq('activo', true)
  .gte('fecha_inicio', hoy)
  .order('fecha_inicio', { ascending: true })

// Obtener eventos por tipo
const { data: eventos, error } = await supabase
  .from('eventos')
  .select('*')
  .eq('activo', true)
  .eq('tipo', 'Académico')
  .order('fecha_inicio', { ascending: true })
```

---

### 5. Tabla: `ambitos_laborales`

Ámbitos laborales donde pueden trabajar los egresados.

**Campos:**
- `id` (UUID) - Identificador único
- `carrera_id` (UUID) - Referencia a `carreras.id`
- `titulo` (TEXT) - Título del ámbito laboral
- `descripcion` (TEXT) - Descripción del ámbito
- `imagen` (TEXT) - Imagen del ámbito en base64 (máx. 1MB)
- `orden` (INTEGER) - Orden de visualización
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Ejemplo de consulta:**
```typescript
// Obtener ámbitos laborales de una carrera
const { data: ambitos, error } = await supabase
  .from('ambitos_laborales')
  .select('*')
  .eq('carrera_id', '00435597-634c-4e57-a9f5-b9a95a726acb')
  .order('orden', { ascending: true })
```

---

### 6. Tabla: `perfil_egresado`

Competencias y habilidades del perfil del egresado.

**Campos:**
- `id` (UUID) - Identificador único
- `carrera_id` (UUID) - Referencia a `carreras.id`
- `competencia` (TEXT) - Texto de la competencia
- `orden` (INTEGER) - Orden de visualización
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Ejemplo de consulta:**
```typescript
// Obtener competencias del perfil de egresado de una carrera
const { data: competencias, error } = await supabase
  .from('perfil_egresado')
  .select('*')
  .eq('carrera_id', '00435597-634c-4e57-a9f5-b9a95a726acb')
  .order('orden', { ascending: true })
```

---

### 7. Tabla: `videos_promocionales`

Videos promocionales de YouTube por carrera.

**Campos:**
- `id` (UUID) - Identificador único
- `carrera_id` (UUID) - Referencia a `carreras.id`
- `titulo` (TEXT) - Título del video
- `url_youtube` (TEXT) - URL o ID del video de YouTube
- `descripcion` (TEXT) - Descripción del video
- `activo` (BOOLEAN) - Si el video está activo
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Ejemplo de consulta:**
```typescript
// Obtener videos promocionales de una carrera
const { data: videos, error } = await supabase
  .from('videos_promocionales')
  .select('*')
  .eq('carrera_id', '00435597-634c-4e57-a9f5-b9a95a726acb')
  .eq('activo', true)
  .order('created_at', { ascending: false })
```

---

### 8. Tabla: `noticias`

Noticias y actualizaciones de la facultad.

**Campos:**
- `id` (UUID) - Identificador único
- `titulo` (TEXT) - Título de la noticia
- `contenido` (TEXT) - Contenido de la noticia
- `imagen_portada` (TEXT) - Imagen de portada en base64
- `autor` (TEXT) - Autor de la noticia
- `fecha_publicacion` (TIMESTAMP) - Fecha de publicación
- `categoria` (TEXT) - Categoría: 'General', 'Académico', etc.
- `activo` (BOOLEAN) - Si la noticia está activa
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Ejemplo de consulta:**
```typescript
// Obtener noticias activas ordenadas por fecha
const { data: noticias, error } = await supabase
  .from('noticias')
  .select('*')
  .eq('activo', true)
  .order('fecha_publicacion', { ascending: false })

// Obtener noticias recientes (últimas 10)
const { data: noticias, error } = await supabase
  .from('noticias')
  .select('*')
  .eq('activo', true)
  .order('fecha_publicacion', { ascending: false })
  .limit(10)

// Obtener noticias por categoría
const { data: noticias, error } = await supabase
  .from('noticias')
  .select('*')
  .eq('activo', true)
  .eq('categoria', 'Académico')
  .order('fecha_publicacion', { ascending: false })
```

---

### 9. Tabla: `configuracion_facultad`

Configuración general de la página principal de la facultad.

**Campos:**
- `id` (UUID) - Identificador único
- `titulo_hero` (TEXT) - Título principal del hero
- `subtitulo_hero` (TEXT) - Subtítulo del hero
- `imagen_hero` (TEXT) - Imagen hero en base64
- `logo_facultad` (TEXT) - Logo de la facultad en base64
- `descripcion_general` (TEXT) - Descripción general de la facultad
- `video_youtube` (TEXT) - URL o ID del video promocional general
- `activo` (BOOLEAN) - Si la configuración está activa
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Ejemplo de consulta:**
```typescript
// Obtener configuración activa de la facultad
const { data: config, error } = await supabase
  .from('configuracion_facultad')
  .select('*')
  .eq('activo', true)
  .maybeSingle() // Usar maybeSingle() porque puede no haber configuración
```

---

## 🔧 Funciones RPC (Remote Procedure Calls)

### Función: `calcular_desglose_carrera`

Calcula automáticamente el desglose de una carrera: porcentajes teoría/práctica, desglose por categoría, semestres y años.

**Parámetros:**
- `p_carrera_id` (UUID) - ID de la carrera

**Retorna:**
```typescript
{
  total_horas_teoria: number
  total_horas_practica: number
  porcentaje_teoria: number
  porcentaje_practica: number
  total_semestres: number
  total_anos: number
  desglose_categoria: Record<string, number> // JSONB con porcentajes por categoría
}
```

**Ejemplo de uso:**
```typescript
const { data, error } = await supabase
  .rpc('calcular_desglose_carrera', { 
    p_carrera_id: '00435597-634c-4e57-a9f5-b9a95a726acb' 
  })

if (data && data[0]) {
  const desglose = data[0]
  console.log(`Teoría: ${desglose.porcentaje_teoria}%`)
  console.log(`Práctica: ${desglose.porcentaje_practica}%`)
  console.log(`Categorías:`, desglose.desglose_categoria)
}
```

---

## 📝 Ejemplos de Consultas Completas

### Obtener información completa de una carrera

```typescript
async function getCarreraCompleta(carreraId: string) {
  // Obtener carrera
  const { data: carrera, error: carreraError } = await supabase
    .from('carreras')
    .select('*')
    .eq('id', carreraId)
    .eq('activa', true)
    .single()

  if (carreraError) throw carreraError

  // Obtener docentes
  const { data: docentes, error: docentesError } = await supabase
    .from('docentes')
    .select('*')
    .eq('carrera_id', carreraId)
    .eq('activo', true)
    .order('orden', { ascending: true })

  // Obtener plan de estudios
  const { data: materias, error: materiasError } = await supabase
    .from('plan_estudios')
    .select('*')
    .eq('carrera_id', carreraId)
    .order('semestre_numero', { ascending: true })
    .order('orden', { ascending: true })

  // Obtener ámbitos laborales
  const { data: ambitos, error: ambitosError } = await supabase
    .from('ambitos_laborales')
    .select('*')
    .eq('carrera_id', carreraId)
    .order('orden', { ascending: true })

  // Obtener perfil de egresado
  const { data: competencias, error: competenciasError } = await supabase
    .from('perfil_egresado')
    .select('*')
    .eq('carrera_id', carreraId)
    .order('orden', { ascending: true })

  // Obtener videos promocionales
  const { data: videos, error: videosError } = await supabase
    .from('videos_promocionales')
    .select('*')
    .eq('carrera_id', carreraId)
    .eq('activo', true)

  // Calcular desglose
  const { data: desgloseData, error: desgloseError } = await supabase
    .rpc('calcular_desglose_carrera', { p_carrera_id: carreraId })

  return {
    carrera,
    docentes: docentes || [],
    materias: materias || [],
    ambitos: ambitos || [],
    competencias: competencias || [],
    videos: videos || [],
    desglose: desgloseData?.[0] || null
  }
}
```

### Obtener página principal

```typescript
async function getPaginaPrincipal() {
  // Configuración de la facultad
  const { data: config, error: configError } = await supabase
    .from('configuracion_facultad')
    .select('*')
    .eq('activo', true)
    .maybeSingle()

  // Carreras activas
  const { data: carreras, error: carrerasError } = await supabase
    .from('carreras')
    .select('id, nombre, slug, descripcion, imagen_hero')
    .eq('activa', true)
    .order('nombre')

  // Eventos próximos (próximos 5)
  const hoy = new Date().toISOString()
  const { data: eventos, error: eventosError } = await supabase
    .from('eventos')
    .select('*')
    .eq('activo', true)
    .gte('fecha_inicio', hoy)
    .order('fecha_inicio', { ascending: true })
    .limit(5)

  // Noticias recientes (últimas 5)
  const { data: noticias, error: noticiasError } = await supabase
    .from('noticias')
    .select('*')
    .eq('activo', true)
    .order('fecha_publicacion', { ascending: false })
    .limit(5)

  return {
    config: config || null,
    carreras: carreras || [],
    eventos: eventos || [],
    noticias: noticias || []
  }
}
```

---

## 🔐 Políticas de Seguridad (RLS)

**⚠️ IMPORTANTE:** Para que el frontend público pueda leer los datos, necesitas configurar Row Level Security (RLS) en Supabase.

### Configurar RLS para lectura pública

Ejecuta estos comandos SQL en el SQL Editor de Supabase:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE carreras ENABLE ROW LEVEL SECURITY;
ALTER TABLE docentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_estudios ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambitos_laborales ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_egresado ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos_promocionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_facultad ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública (solo datos activos)
CREATE POLICY "Carreras públicas" ON carreras
  FOR SELECT USING (activa = true);

CREATE POLICY "Docentes públicos" ON docentes
  FOR SELECT USING (activo = true);

CREATE POLICY "Plan de estudios público" ON plan_estudios
  FOR SELECT USING (true);

CREATE POLICY "Eventos públicos" ON eventos
  FOR SELECT USING (activo = true);

CREATE POLICY "Ámbitos laborales públicos" ON ambitos_laborales
  FOR SELECT USING (true);

CREATE POLICY "Perfil egresado público" ON perfil_egresado
  FOR SELECT USING (true);

CREATE POLICY "Videos promocionales públicos" ON videos_promocionales
  FOR SELECT USING (activo = true);

CREATE POLICY "Noticias públicas" ON noticias
  FOR SELECT USING (activo = true);

CREATE POLICY "Configuración pública" ON configuracion_facultad
  FOR SELECT USING (activo = true);

-- Política para la función RPC
CREATE POLICY "Desglose carrera público" ON plan_estudios
  FOR SELECT USING (true);
```

---

## 🎨 Utilidades y Helpers

### Extraer ID de YouTube

Si guardas URLs completas de YouTube, puedes extraer el ID:

```typescript
function extractYouTubeId(url: string): string {
  // Si ya es un ID, retornarlo
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    return url
  }
  
  // Extraer de diferentes formatos
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return url
}

// Obtener thumbnail de YouTube
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}
```

### Formatear fechas

```typescript
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function formatDate(dateString: string): string {
  return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es })
}

function formatDateTime(dateString: string): string {
  return format(new Date(dateString), "dd/MM/yyyy 'a las' HH:mm", { locale: es })
}
```

---

## 📋 Resumen de Tablas y Campos Principales

| Tabla | Campos Principales | Filtros Recomendados |
|-------|-------------------|---------------------|
| `carreras` | `id`, `nombre`, `slug`, `descripcion`, `resumen_breve`, `imagen_hero`, `video_youtube`, `semestres` | `activa = true` |
| `docentes` | `id`, `carrera_id`, `nombre`, `especialidad`, `titulo`, `imagen_avatar`, `cv_imagen` | `activo = true`, `carrera_id` |
| `plan_estudios` | `id`, `carrera_id`, `semestre_numero`, `materia_nombre`, `materia_color`, `horas_teoria`, `horas_practica`, `categoria` | `carrera_id`, ordenar por `semestre_numero` y `orden` |
| `eventos` | `id`, `titulo`, `descripcion`, `fecha_inicio`, `fecha_fin`, `ubicacion`, `imagen`, `tipo` | `activo = true`, `fecha_inicio >= hoy` |
| `ambitos_laborales` | `id`, `carrera_id`, `titulo`, `descripcion`, `imagen` | `carrera_id`, ordenar por `orden` |
| `perfil_egresado` | `id`, `carrera_id`, `competencia` | `carrera_id`, ordenar por `orden` |
| `videos_promocionales` | `id`, `carrera_id`, `titulo`, `url_youtube`, `descripcion` | `carrera_id`, `activo = true` |
| `noticias` | `id`, `titulo`, `contenido`, `imagen_portada`, `autor`, `fecha_publicacion`, `categoria` | `activo = true`, ordenar por `fecha_publicacion DESC` |
| `configuracion_facultad` | `id`, `titulo_hero`, `subtitulo_hero`, `imagen_hero`, `logo_facultad`, `descripcion_general`, `video_youtube` | `activo = true` |

---

## 🚀 Casos de Uso Comunes

### 1. Página Principal

```typescript
const { config, carreras, eventos, noticias } = await getPaginaPrincipal()
```

### 2. Página de Carrera Individual

```typescript
const carreraCompleta = await getCarreraCompleta(carreraId)
// Incluye: carrera, docentes, materias, ámbitos, competencias, videos, desglose
```

### 3. Listado de Carreras

```typescript
const { data: carreras } = await supabase
  .from('carreras')
  .select('id, nombre, slug, descripcion, imagen_hero, semestres')
  .eq('activa', true)
  .order('nombre')
```

### 4. Plan de Estudios por Semestre

```typescript
// Agrupar materias por semestre
const { data: materias } = await supabase
  .from('plan_estudios')
  .select('*')
  .eq('carrera_id', carreraId)
  .order('semestre_numero')
  .order('orden')

const materiasPorSemestre = materias.reduce((acc, materia) => {
  if (!acc[materia.semestre_numero]) {
    acc[materia.semestre_numero] = []
  }
  acc[materia.semestre_numero].push(materia)
  return acc
}, {})
```

### 5. Calendario de Eventos

```typescript
const { data: eventos } = await supabase
  .from('eventos')
  .select('*')
  .eq('activo', true)
  .order('fecha_inicio')
```

---

## 📦 Estructura de Datos de Ejemplo

### Carrera Completa

```json
{
  "carrera": {
    "id": "00435597-634c-4e57-a9f5-b9a95a726acb",
    "nombre": "Ingeniería en Sistemas",
    "slug": "ingenieria-en-sistemas",
    "descripcion": "Descripción completa de la carrera...",
    "resumen_breve": "Forma profesionales capaces de diseñar y desarrollar soluciones tecnológicas innovadoras.",
    "semestres": 8,
    "imagen_hero": "data:image/jpeg;base64,...",
    "video_youtube": "dQw4w9WgXcQ"
  },
  "docentes": [
    {
      "id": "...",
      "nombre": "Dr. Juan Pérez",
      "especialidad": "Inteligencia Artificial",
      "imagen_avatar": "data:image/jpeg;base64,..."
    }
  ],
  "materias": [
    {
      "id": "...",
      "semestre_numero": 1,
      "materia_nombre": "Programación I",
      "horas_teoria": 3,
      "horas_practica": 4,
      "categoria": "Otros"
    }
  ],
  "ambitos": [
    {
      "id": "...",
      "titulo": "Gerente de área",
      "descripcion": "Liderazgo y gestión...",
      "imagen": "data:image/jpeg;base64,..."
    }
  ],
  "competencias": [
    {
      "id": "...",
      "competencia": "Implementar soluciones tecnológicas..."
    }
  ],
  "desglose": {
    "porcentaje_teoria": 45.2,
    "porcentaje_practica": 54.8,
    "total_semestres": 8,
    "total_anos": 4.0,
    "desglose_categoria": {
      "Electrónica": 15.5,
      "Matemática": 20.3,
      "Otros": 64.2
    }
  }
}
```

---

## 🔍 Índices Disponibles

Las siguientes columnas tienen índices para mejorar el rendimiento:

- `carreras.slug` - Para búsquedas por slug
- `carreras.activa` - Para filtrar carreras activas
- `docentes.carrera_id` - Para obtener docentes por carrera
- `docentes.activo` - Para filtrar docentes activos
- `plan_estudios.carrera_id` - Para obtener materias por carrera
- `plan_estudios.semestre_numero` - Para filtrar por semestre
- `plan_estudios.categoria` - Para filtrar por categoría
- `eventos.fecha_inicio` - Para ordenar eventos por fecha
- `noticias.fecha_publicacion` - Para ordenar noticias por fecha

---

## ⚠️ Notas Importantes

1. **Imágenes en Base64**: Todas las imágenes se almacenan como strings base64. Úsalas directamente en `<img src={imagen} />`.

2. **Filtros de Activos**: Siempre filtra por `activa = true` o `activo = true` para mostrar solo contenido activo.

3. **Ordenamiento**: Usa `.order()` para asegurar un orden consistente (especialmente importante para `plan_estudios`, `docentes`, `ambitos_laborales`, `perfil_egresado`).

4. **Videos de YouTube**: El campo `video_youtube` puede contener URLs completas o solo IDs. Usa la función `extractYouTubeId()` para normalizar.

5. **Fechas**: Las fechas están en formato ISO 8601 con timezone. Usa `new Date(dateString)` para parsearlas.

6. **RLS**: Asegúrate de configurar las políticas RLS en Supabase para permitir lectura pública de los datos activos.

---

## 📞 Soporte

Si tienes problemas con las consultas o necesitas ayuda adicional, revisa:
- La consola del navegador para errores de Supabase
- Los logs de Supabase Dashboard > Logs
- La documentación oficial: https://supabase.com/docs/reference/javascript

---

**Última actualización:** Diciembre 2024
**Versión del esquema:** 1.0
