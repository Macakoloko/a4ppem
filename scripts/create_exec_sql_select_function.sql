-- Função para executar SQL dinâmico que retorna dados
CREATE OR REPLACE FUNCTION exec_sql_select(sql_query TEXT) 
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  EXECUTE sql_query INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Erro ao executar SQL: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 