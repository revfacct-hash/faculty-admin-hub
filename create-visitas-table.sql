-- ============================================
-- TABLA: visitas
-- Sistema de tracking de visitas del sitio web
-- ============================================

CREATE TABLE IF NOT EXISTS visitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pagina TEXT NOT NULL, -- Ruta de la página visitada (ej: '/', '/carreras/ingenieria-sistemas')
    tipo_pagina TEXT, -- Tipo: 'home', 'carrera', 'evento', 'noticia', etc.
    carrera_id UUID REFERENCES carreras(id) ON DELETE SET NULL, -- Si es una página de carrera
    ip_address TEXT, -- IP del visitante (opcional, para privacidad puede ser NULL)
    user_agent TEXT, -- Navegador y dispositivo (opcional)
    referrer TEXT, -- Página de origen (opcional)
    fecha_visita TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON visitas(fecha_visita);
CREATE INDEX IF NOT EXISTS idx_visitas_pagina ON visitas(pagina);
CREATE INDEX IF NOT EXISTS idx_visitas_tipo ON visitas(tipo_pagina);
CREATE INDEX IF NOT EXISTS idx_visitas_carrera_id ON visitas(carrera_id);
CREATE INDEX IF NOT EXISTS idx_visitas_fecha_tipo ON visitas(fecha_visita, tipo_pagina);
-- Nota: No creamos índice con DATE_TRUNC porque requiere función IMMUTABLE
-- Las consultas por mes usarán el índice de fecha_visita que es suficiente

-- Comentarios en la tabla
COMMENT ON TABLE visitas IS 'Registro de visitas al sitio web para análisis y estadísticas';
COMMENT ON COLUMN visitas.pagina IS 'Ruta de la página visitada (ej: /, /carreras/ingenieria-sistemas)';
COMMENT ON COLUMN visitas.tipo_pagina IS 'Tipo de página: home, carrera, evento, noticia, etc.';
COMMENT ON COLUMN visitas.carrera_id IS 'ID de la carrera si la visita es a una página de carrera';
COMMENT ON COLUMN visitas.ip_address IS 'Dirección IP del visitante (puede ser NULL por privacidad)';
COMMENT ON COLUMN visitas.user_agent IS 'Información del navegador y dispositivo';
COMMENT ON COLUMN visitas.referrer IS 'URL de la página de origen (de dónde vino el visitante)';

-- ============================================
-- FUNCIÓN: Obtener visitas del mes actual
-- ============================================
CREATE OR REPLACE FUNCTION obtener_visitas_mes()
RETURNS INTEGER AS $$
DECLARE
    total_visitas INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_visitas
    FROM visitas
    WHERE DATE_TRUNC('month', fecha_visita) = DATE_TRUNC('month', NOW());
    
    RETURN COALESCE(total_visitas, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Obtener visitas por tipo del mes
-- ============================================
CREATE OR REPLACE FUNCTION obtener_visitas_por_tipo_mes()
RETURNS TABLE (
    tipo_pagina TEXT,
    total_visitas BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(v.tipo_pagina, 'otro') as tipo_pagina,
        COUNT(*) as total_visitas
    FROM visitas v
    WHERE DATE_TRUNC('month', v.fecha_visita) = DATE_TRUNC('month', NOW())
    GROUP BY v.tipo_pagina
    ORDER BY total_visitas DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Obtener visitas por carrera del mes
-- ============================================
CREATE OR REPLACE FUNCTION obtener_visitas_carreras_mes()
RETURNS TABLE (
    carrera_id UUID,
    carrera_nombre TEXT,
    total_visitas BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.carrera_id,
        c.nombre as carrera_nombre,
        COUNT(*) as total_visitas
    FROM visitas v
    LEFT JOIN carreras c ON v.carrera_id = c.id
    WHERE DATE_TRUNC('month', v.fecha_visita) = DATE_TRUNC('month', NOW())
      AND v.carrera_id IS NOT NULL
    GROUP BY v.carrera_id, c.nombre
    ORDER BY total_visitas DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;

-- Política: Permitir inserción pública (el frontend puede registrar visitas)
CREATE POLICY "Permitir inserción de visitas" ON visitas
  FOR INSERT WITH CHECK (true);

-- Política: Solo administradores pueden leer las visitas
-- Nota: Esto requiere autenticación. Si quieres que sea público para lectura,
-- cambia a: FOR SELECT USING (true)
CREATE POLICY "Solo admins pueden leer visitas" ON visitas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM perfiles_administradores
      WHERE id = auth.uid() AND activo = true
    )
  );

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
