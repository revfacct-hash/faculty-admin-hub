-- ============================================
-- FIX: Función calcular_desglose_carrera
-- Corrige el error "aggregate function calls cannot be nested"
-- ============================================

CREATE OR REPLACE FUNCTION calcular_desglose_carrera(p_carrera_id UUID)
RETURNS TABLE (
    total_horas_teoria INTEGER,
    total_horas_practica INTEGER,
    porcentaje_teoria NUMERIC,
    porcentaje_practica NUMERIC,
    total_semestres INTEGER,
    total_anos NUMERIC,
    desglose_categoria JSONB
) AS $$
DECLARE
    total_horas INTEGER;
BEGIN
    -- Calcular totales de horas
    SELECT 
        COALESCE(SUM(horas_teoria), 0),
        COALESCE(SUM(horas_practica), 0),
        COALESCE(MAX(semestre_numero), 0)
    INTO 
        total_horas_teoria,
        total_horas_practica,
        total_semestres
    FROM plan_estudios
    WHERE carrera_id = p_carrera_id;
    
    -- Calcular total de horas
    total_horas := total_horas_teoria + total_horas_practica;
    
    -- Calcular porcentajes
    IF total_horas > 0 THEN
        porcentaje_teoria := ROUND((total_horas_teoria::NUMERIC / total_horas::NUMERIC) * 100, 1);
        porcentaje_practica := ROUND((total_horas_practica::NUMERIC / total_horas::NUMERIC) * 100, 1);
    ELSE
        porcentaje_teoria := 0;
        porcentaje_practica := 0;
    END IF;
    
    -- Calcular años (semestres / 2)
    total_anos := ROUND(total_semestres::NUMERIC / 2, 1);
    
    -- Calcular desglose por categoría
    -- Usamos una subconsulta para calcular primero los totales por categoría,
    -- y luego calculamos el porcentaje sin anidar funciones agregadas
    SELECT jsonb_object_agg(
        categoria,
        porcentaje
    )
    INTO desglose_categoria
    FROM (
        SELECT 
            categoria,
            ROUND((SUM(horas_teoria + horas_practica)::NUMERIC / NULLIF(total_horas, 0)::NUMERIC) * 100, 1) AS porcentaje
        FROM plan_estudios
        WHERE carrera_id = p_carrera_id
        GROUP BY categoria
    ) AS categorias_porcentajes;
    
    RETURN QUERY SELECT 
        total_horas_teoria,
        total_horas_practica,
        porcentaje_teoria,
        porcentaje_practica,
        total_semestres,
        total_anos,
        COALESCE(desglose_categoria, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;
