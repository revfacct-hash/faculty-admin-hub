-- ============================================
-- AÑADIR CAMPO: resumen_breve a tabla carreras
-- Resumen breve que se mostrará en la sección hero del frontend
-- ============================================

-- Añadir columna resumen_breve a la tabla carreras
ALTER TABLE carreras 
ADD COLUMN IF NOT EXISTS resumen_breve TEXT;

-- Comentario en la columna para documentación
COMMENT ON COLUMN carreras.resumen_breve IS 'Resumen breve de la carrera que se muestra en la sección hero del frontend, entre el título y el botón de acción';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
