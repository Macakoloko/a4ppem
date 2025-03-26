-- Função para executar SQL dinâmico
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT) 
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 