# 📝 Cambio: Nuevo Campo `resumen_breve` en Carreras

## 🎯 Resumen del Cambio

Se ha añadido un nuevo campo opcional `resumen_breve` a la tabla `carreras` en Supabase. Este campo contiene un texto corto que debe mostrarse en la **sección hero** de la página de cada carrera, específicamente **entre el título de la carrera y el botón de acción** (ej: "Inicia tu Proceso de Admisión").

---

## 📊 Detalles Técnicos

### Campo en Base de Datos

- **Tabla:** `carreras`
- **Columna:** `resumen_breve`
- **Tipo:** `TEXT` (opcional, puede ser `NULL`)
- **Descripción:** Resumen breve de la carrera que se muestra en la sección hero del frontend

### Estructura de Datos

```typescript
interface Carrera {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  resumen_breve?: string;  // ⬅️ NUEVO CAMPO
  duracion: string;
  semestres: number;
  imagen_hero?: string;
  descripcion_docentes?: string;
  video_youtube?: string;
  activa: boolean;
  // ... otros campos
}
```

---

## 🔍 Cómo Obtener el Campo

### Consulta Básica

El campo `resumen_breve` se incluye automáticamente cuando consultas la tabla `carreras`:

```typescript
// Obtener una carrera con todos los campos (incluye resumen_breve)
const { data: carrera, error } = await supabase
  .from('carreras')
  .select('*')
  .eq('slug', 'ingenieria-en-sistemas')
  .eq('activa', true)
  .single()

// carrera.resumen_breve estará disponible (puede ser null)
```

### Consulta Específica para Hero Section

Si solo necesitas los campos para la sección hero:

```typescript
const { data: carrera, error } = await supabase
  .from('carreras')
  .select('id, nombre, slug, resumen_breve, imagen_hero, video_youtube')
  .eq('slug', 'ingenieria-en-sistemas')
  .eq('activa', true)
  .single()
```

---

## 🎨 Dónde y Cómo Mostrarlo

### Ubicación en la UI

El campo `resumen_breve` debe mostrarse en la **sección hero** de la página de la carrera, con este orden:

```
┌─────────────────────────────────────┐
│  [Imagen Hero de Fondo]             │
│                                      │
│  Título: "Ingeniería de Sistemas"  │
│                                      │
│  ➡️ resumen_breve AQUÍ ⬅️           │
│  (Texto corto descriptivo)           │
│                                      │
│  [Botón: "Inicia tu Proceso..."]    │
└─────────────────────────────────────┘
```

### Ejemplo de Implementación

```tsx
// Componente Hero Section
function CarreraHero({ carrera }: { carrera: Carrera }) {
  return (
    <section className="hero-section" style={{ backgroundImage: `url(${carrera.imagen_hero})` }}>
      <div className="hero-content">
        {/* Título */}
        <h1>{carrera.nombre}</h1>
        
        {/* Resumen Breve - NUEVO */}
        {carrera.resumen_breve && (
          <p className="hero-resumen">{carrera.resumen_breve}</p>
        )}
        
        {/* Botón de Acción */}
        <button className="cta-button">
          Inicia tu Proceso de Admisión
        </button>
      </div>
    </section>
  );
}
```

### Estilos Sugeridos

- **Tipo de texto:** Párrafo o subtítulo
- **Tamaño:** Mediano (entre el título y el botón)
- **Color:** Blanco o color de contraste según el diseño
- **Longitud:** El texto puede variar, pero generalmente será corto (50-150 caracteres)
- **Validación:** Verificar que `resumen_breve` no sea `null` o vacío antes de mostrarlo

---

## ⚠️ Consideraciones Importantes

### 1. Campo Opcional

El campo `resumen_breve` es **opcional**. Puede ser `null` o estar vacío. Siempre verifica su existencia antes de mostrarlo:

```typescript
// ✅ Correcto
{carrera.resumen_breve && (
  <p>{carrera.resumen_breve}</p>
)}

// ✅ También correcto
{carrera.resumen_breve?.trim() && (
  <p>{carrera.resumen_breve}</p>
)}
```

### 2. Diferenciación con `descripcion`

- **`resumen_breve`**: Texto corto para la sección hero (50-150 caracteres aprox.)
- **`descripcion`**: Descripción completa y detallada de la carrera (múltiples párrafos)

**No confundir estos dos campos.** El `resumen_breve` es específico para la sección hero, mientras que `descripcion` se usa en otras partes de la página.

### 3. Fallback

Si `resumen_breve` no está disponible, puedes:

- **Opción A:** No mostrar nada (recomendado)
- **Opción B:** Mostrar un texto por defecto
- **Opción C:** Usar una parte truncada de `descripcion` (no recomendado, mejor esperar a que se complete el campo)

```typescript
// Ejemplo con fallback
const textoHero = carrera.resumen_breve?.trim() || null;

{textoHero ? (
  <p className="hero-resumen">{textoHero}</p>
) : (
  // No mostrar nada, o mostrar un placeholder sutil
  <p className="hero-resumen placeholder">Descripción breve no disponible</p>
)}
```

---

## 📋 Checklist de Implementación

- [ ] Actualizar el tipo/interfaz `Carrera` en TypeScript para incluir `resumen_breve?: string`
- [ ] Verificar que las consultas a Supabase incluyan el campo `resumen_breve`
- [ ] Añadir el campo en la sección hero de la página de carrera
- [ ] Implementar validación para campos opcionales (`null` check)
- [ ] Ajustar estilos CSS para el nuevo texto en la hero section
- [ ] Probar con carreras que tengan `resumen_breve` y sin él
- [ ] Verificar que el diseño se vea bien en móvil y desktop

---

## 🔄 Migración de Datos Existentes

**Nota:** Las carreras existentes en la base de datos tendrán `resumen_breve = NULL` hasta que un administrador complete el campo desde el panel administrativo. El frontend debe manejar este caso correctamente.

---

## 📞 Ejemplo Completo de Consulta

```typescript
// Función para obtener datos completos de una carrera
async function getCarreraCompleta(slug: string) {
  const { data: carrera, error } = await supabase
    .from('carreras')
    .select(`
      *,
      docentes:docentes(*),
      materias:plan_estudios(*),
      ambitos:ambitos_laborales(*),
      competencias:perfil_egresado(*)
    `)
    .eq('slug', slug)
    .eq('activa', true)
    .single()

  if (error) throw error

  return carrera
}

// Uso en componente
const carrera = await getCarreraCompleta('ingenieria-en-sistemas')

// El campo resumen_breve estará disponible aquí
console.log(carrera.resumen_breve) // Puede ser string o null
```

---

## 📚 Referencias

- **Guía completa de integración:** Ver `GUIA_FRONTEND_SUPABASE.md`
- **Esquema de base de datos:** Ver `supabase-schema.sql`
- **Panel administrativo:** El campo se puede editar en `/admin/carreras/:id`

---

## ✅ Estado del Cambio

- ✅ Campo añadido a la base de datos
- ✅ Campo disponible en el panel administrativo
- ✅ Documentación actualizada
- ⏳ **Pendiente:** Implementación en frontend público

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0
