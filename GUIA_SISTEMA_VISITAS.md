# 📊 Sistema de Visitas - Guía de Implementación

## 🎯 Resumen

Este documento explica cómo implementar el sistema de tracking de visitas para el sitio web. El sistema registra las visitas de los usuarios y muestra estadísticas en el panel administrativo.

---

## 📋 Pasos de Implementación

### 1. Crear la Tabla en Supabase

Ejecuta el script SQL `create-visitas-table.sql` en el SQL Editor de Supabase:

1. Ve a tu proyecto en Supabase Dashboard
2. Abre el **SQL Editor**
3. Copia y pega el contenido de `create-visitas-table.sql`
4. Ejecuta el script

Esto creará:
- La tabla `visitas` para almacenar las visitas
- Índices para optimizar las consultas
- Funciones RPC para obtener estadísticas
- Políticas RLS para seguridad

---

## 🔧 Implementación en el Frontend Público

### Opción A: Usar el Hook de React (Recomendado)

```tsx
import { useVisitaTracker } from '@/lib/visitas-tracker';

function CarreraPage({ carreraId }: { carreraId: string }) {
  // Registra automáticamente la visita cuando se monta el componente
  useVisitaTracker({
    tipoPagina: 'carrera',
    carreraId: carreraId
  });

  return (
    <div>
      {/* Contenido de la página */}
    </div>
  );
}
```

### Opción B: Registrar Manualmente

```tsx
import { useEffect } from 'react';
import { registrarVisita } from '@/lib/visitas-tracker';

function HomePage() {
  useEffect(() => {
    registrarVisita({
      pagina: window.location.pathname,
      tipoPagina: 'home'
    });
  }, []);

  return <div>Home</div>;
}
```

### Opción C: Registrar con Detección Automática

```tsx
import { useEffect } from 'react';
import { registrarVisita, determinarTipoPagina, obtenerCarreraIdDeSlug } from '@/lib/visitas-tracker';

function DynamicPage() {
  useEffect(() => {
    const pathname = window.location.pathname;
    const tipoPagina = determinarTipoPagina(pathname);
    
    // Si es una página de carrera, obtener el ID
    if (tipoPagina === 'carrera') {
      const slug = pathname.split('/').pop();
      if (slug) {
        obtenerCarreraIdDeSlug(slug).then(carreraId => {
          registrarVisita({
            pagina: pathname,
            tipoPagina,
            carreraId
          });
        });
      }
    } else {
      registrarVisita({
        pagina: pathname,
        tipoPagina
      });
    }
  }, []);

  return <div>Página</div>;
}
```

---

## 📍 Dónde Implementar el Tracking

### Páginas Principales

1. **Página Home (`/`)**
```tsx
useVisitaTracker({ tipoPagina: 'home' });
```

2. **Página de Carrera (`/carreras/:slug`)**
```tsx
useVisitaTracker({ 
  tipoPagina: 'carrera',
  carreraId: carrera.id 
});
```

3. **Página de Evento (`/eventos/:id`)**
```tsx
useVisitaTracker({ 
  tipoPagina: 'evento'
});
```

4. **Página de Noticia (`/noticias/:id`)**
```tsx
useVisitaTracker({ 
  tipoPagina: 'noticia'
});
```

---

## 📊 Ver Estadísticas en el Dashboard

Una vez implementado, las visitas del mes se mostrarán automáticamente en el panel administrativo (`/admin`).

### Funciones RPC Disponibles

#### 1. Obtener Total de Visitas del Mes

```typescript
const { data, error } = await supabase.rpc('obtener_visitas_mes');
// Retorna: número entero con el total de visitas del mes actual
```

#### 2. Obtener Visitas por Tipo del Mes

```typescript
const { data, error } = await supabase.rpc('obtener_visitas_por_tipo_mes');
// Retorna: Array de { tipo_pagina: string, total_visitas: number }
```

#### 3. Obtener Visitas por Carrera del Mes

```typescript
const { data, error } = await supabase.rpc('obtener_visitas_carreras_mes');
// Retorna: Array de { carrera_id: UUID, carrera_nombre: string, total_visitas: number }
```

---

## 🎨 Ejemplo de Página de Estadísticas Avanzadas

Si quieres crear una página dedicada a estadísticas:

```tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function EstadisticasPage() {
  const [visitasMes, setVisitasMes] = useState(0);
  const [visitasPorTipo, setVisitasPorTipo] = useState([]);
  const [visitasPorCarrera, setVisitasPorCarrera] = useState([]);

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      const [mesRes, tipoRes, carreraRes] = await Promise.all([
        supabase.rpc('obtener_visitas_mes'),
        supabase.rpc('obtener_visitas_por_tipo_mes'),
        supabase.rpc('obtener_visitas_carreras_mes'),
      ]);

      setVisitasMes(mesRes.data || 0);
      setVisitasPorTipo(tipoRes.data || []);
      setVisitasPorCarrera(carreraRes.data || []);
    } catch (error) {
      console.error('Error fetching estadísticas:', error);
    }
  };

  return (
    <div>
      <h2>Estadísticas de Visitas</h2>
      <p>Visitas del mes: {visitasMes}</p>
      
      <h3>Por Tipo de Página</h3>
      <ul>
        {visitasPorTipo.map(item => (
          <li key={item.tipo_pagina}>
            {item.tipo_pagina}: {item.total_visitas}
          </li>
        ))}
      </ul>

      <h3>Carreras Más Visitadas</h3>
      <ul>
        {visitasPorCarrera.map(item => (
          <li key={item.carrera_id}>
            {item.carrera_nombre}: {item.total_visitas} visitas
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🔒 Seguridad y Privacidad

### Políticas RLS

- **Inserción:** Pública (cualquiera puede registrar visitas)
- **Lectura:** Solo administradores autenticados

### Datos Recopilados

- **Página visitada:** Ruta de la URL
- **Tipo de página:** Categoría (home, carrera, evento, etc.)
- **Carrera ID:** Si aplica
- **User Agent:** Navegador y dispositivo (opcional)
- **Referrer:** Página de origen (opcional)
- **IP Address:** NO se guarda por defecto (puede activarse si es necesario)

### Consideraciones de Privacidad

- El sistema NO guarda información personal identificable
- Las IPs están deshabilitadas por defecto
- Cumple con principios básicos de privacidad
- Puedes ajustar las políticas RLS según tus necesidades

---

## 🚀 Optimizaciones

### 1. Debounce para Evitar Visitas Duplicadas

Si un usuario navega rápidamente, puedes agregar un debounce:

```tsx
import { useVisitaTracker } from '@/lib/visitas-tracker';
import { useRef } from 'react';

function Page() {
  const hasTracked = useRef(false);
  
  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      // Registrar visita después de 2 segundos
      setTimeout(() => {
        useVisitaTracker({ tipoPagina: 'home' });
      }, 2000);
    }
  }, []);

  return <div>...</div>;
}
```

### 2. No Registrar Visitas de Bots

Puedes filtrar bots comunes:

```typescript
function isBot(userAgent: string): boolean {
  const bots = ['bot', 'crawler', 'spider', 'scraper'];
  return bots.some(bot => userAgent.toLowerCase().includes(bot));
}

// En registrarVisita:
if (userAgent && isBot(userAgent)) {
  return; // No registrar visitas de bots
}
```

---

## 📝 Checklist de Implementación

- [ ] Ejecutar `create-visitas-table.sql` en Supabase
- [ ] Verificar que las políticas RLS estén configuradas
- [ ] Implementar `useVisitaTracker` en la página home
- [ ] Implementar tracking en páginas de carreras
- [ ] Implementar tracking en páginas de eventos
- [ ] Implementar tracking en páginas de noticias
- [ ] Verificar que las visitas se registren correctamente
- [ ] Confirmar que el dashboard muestre las visitas del mes
- [ ] (Opcional) Crear página de estadísticas avanzadas

---

## 🐛 Solución de Problemas

### Las visitas no se registran

1. Verifica que la tabla `visitas` existe en Supabase
2. Revisa la consola del navegador para errores
3. Verifica que las políticas RLS permitan inserción pública
4. Confirma que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configurados

### El dashboard muestra 0 visitas

1. Verifica que la función `obtener_visitas_mes()` existe
2. Confirma que hay visitas registradas en la tabla
3. Verifica que el usuario esté autenticado como administrador
4. Revisa los logs de Supabase para errores

### Errores de permisos

1. Verifica las políticas RLS en Supabase Dashboard
2. Asegúrate de que la política de inserción sea pública
3. Confirma que el usuario admin tenga permisos de lectura

---

## 📚 Referencias

- **Archivo SQL:** `create-visitas-table.sql`
- **Utilidad de tracking:** `src/lib/visitas-tracker.ts`
- **Dashboard:** `src/pages/admin/AdminDashboard.tsx`
- **Guía de Supabase:** `GUIA_FRONTEND_SUPABASE.md`

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0
