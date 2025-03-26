// Script para verificar as tabelas necessárias no Supabase
// Executar com: node scripts/setup-supabase.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Carregar variáveis de ambiente do arquivo .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Inicializar o cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Array com as tabelas necessárias
const requiredTables = ['clients', 'products', 'services', 'professionals', 'appointments']

// Função para verificar se uma tabela existe
async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (error) {
      if (error.message.includes('does not exist')) {
        return { exists: false, error: null }
      }
      return { exists: false, error }
    }

    // Contar registros na tabela
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error(`Erro ao contar registros na tabela ${tableName}:`, countError)
      return { exists: true, count: 0, error: null }
    }

    return { exists: true, count, error: null }
  } catch (error) {
    return { exists: false, error }
  }
}

// Função principal para verificar o banco de dados
async function checkDatabase() {
  console.log('Verificando tabelas no banco de dados...\n')
  
  const missingTables = []
  
  for (const table of requiredTables) {
    const { exists, count, error } = await checkTableExists(table)
    
    if (error) {
      console.error(`Erro ao verificar tabela ${table}:`, error)
      continue
    }
    
    if (!exists) {
      missingTables.push(table)
      console.log(`❌ Tabela ${table} não encontrada`)
    } else {
      console.log(`✅ Tabela ${table} encontrada (${count} registros)`)
    }
  }
  
  if (missingTables.length > 0) {
    console.log('\nAlgumas tabelas não foram encontradas. Para criar as tabelas:')
    console.log('1. Acesse o painel do Supabase (https://supabase.com)')
    console.log('2. Vá para o SQL Editor')
    console.log('3. Cole o conteúdo do arquivo scripts/setup-tables.sql')
    console.log('4. Execute o script para criar as tabelas\n')
  } else {
    console.log('\nTodas as tabelas necessárias foram encontradas! 🎉')
  }
}

// Executar a verificação
checkDatabase() 