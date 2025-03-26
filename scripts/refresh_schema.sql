-- Script para forçar o refresh do schema do PostgREST

-- Atualizar a tabela appointments para forçar o PostgREST a recarregar seu schema
DROP VIEW IF EXISTS pgrest_schema_refresh_view;

CREATE OR REPLACE VIEW pgrest_schema_refresh_view AS
SELECT
    format('ALTER TABLE %I.%I RENAME TO %I_temp', table_schema, table_name, table_name) AS rename_sql,
    format('ALTER TABLE %I.%I_temp RENAME TO %I', table_schema, table_name, table_name) AS restore_sql
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'appointments';

DO $$
DECLARE 
    temp_record RECORD;
BEGIN
    FOR temp_record IN SELECT rename_sql, restore_sql FROM pgrest_schema_refresh_view LOOP
        EXECUTE temp_record.rename_sql;
        EXECUTE temp_record.restore_sql;
    END LOOP;
END $$;

-- Verificar se a tabela appointments existe e mostrar sua estrutura
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'appointments') THEN
    RAISE NOTICE 'A tabela appointments existe e tem as seguintes colunas:';
    FOR temp_record IN
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'appointments'
      ORDER BY ordinal_position
    LOOP
      RAISE NOTICE '%: %', temp_record.column_name, temp_record.data_type;
    END LOOP;
  ELSE
    RAISE NOTICE 'A tabela appointments não existe!';
  END IF;
END $$; 