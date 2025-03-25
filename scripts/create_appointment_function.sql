-- Função para criar agendamentos
CREATE OR REPLACE FUNCTION create_appointment(
  p_client_id UUID,
  p_professional_id UUID,
  p_service_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO appointments (
    client_id,
    professional_id,
    service_id,
    date,
    start_time,
    end_time,
    status,
    notes
  ) VALUES (
    p_client_id,
    p_professional_id,
    p_service_id,
    p_date,
    p_start_time,
    p_end_time,
    'scheduled',
    p_notes
  );
END;
$$ LANGUAGE plpgsql; 