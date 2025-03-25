-- Script para corrigir a tabela de agendamentos se necessário

-- Verificar se a tabela appointments existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'appointments') THEN
    -- Criar tabela se não existir
    CREATE TABLE appointments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      client_id UUID NOT NULL REFERENCES clients(id),
      professional_id UUID NOT NULL REFERENCES professionals(id),
      service_id UUID NOT NULL REFERENCES services(id),
      date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_professional_appointment UNIQUE (professional_id, date, start_time)
    );

    -- Criar índices
    CREATE INDEX idx_appointments_client_id ON appointments(client_id);
    CREATE INDEX idx_appointments_professional_id ON appointments(professional_id);
    CREATE INDEX idx_appointments_service_id ON appointments(service_id);
    CREATE INDEX idx_appointments_date ON appointments(date);
    CREATE INDEX idx_appointments_status ON appointments(status);
  ELSE
    -- Verificar se as colunas existem e adicionar se necessário
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'date') THEN
      ALTER TABLE appointments ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'start_time') THEN
      ALTER TABLE appointments ADD COLUMN start_time TIME NOT NULL DEFAULT '00:00:00';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'end_time') THEN
      ALTER TABLE appointments ADD COLUMN end_time TIME NOT NULL DEFAULT '00:00:00';
    END IF;
  END IF;
END $$; 