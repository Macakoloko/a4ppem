-- Script SQL para criar a tabela clients
-- Copie e cole este script no SQL Editor do Supabase

-- Criar extensão para UUID se ainda não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  birthday DATE,
  email TEXT,
  address TEXT,
  services INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar índices para otimização
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_whatsapp ON clients(whatsapp);

-- Função para atualizar o timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp 'updated_at'
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Inserir cliente de teste
INSERT INTO clients (name, whatsapp, email, birthday, address, services)
VALUES ('Cliente de Teste', '+351 912 345 678', 'teste@exemplo.pt', '1990-01-01', 'Rua de Teste, 123, Lisboa', 0)
ON CONFLICT (id) DO NOTHING; 