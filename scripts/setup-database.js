require('dotenv').config({ path: './.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('Setting up database tables...')

  try {
    // Create clients table
    const { error: clientsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'clients',
      columns: `
        id uuid primary key default uuid_generate_v4(),
        name text not null,
        whatsapp text not null,
        birthday date,
        email text,
        address text,
        services integer default 0,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    })

    if (clientsError) throw clientsError

    // Create products table
    const { error: productsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'products',
      columns: `
        id uuid primary key default uuid_generate_v4(),
        name text not null,
        price decimal(10,2) not null,
        cost decimal(10,2) not null,
        stock integer not null default 0,
        min_stock integer not null default 5,
        category text not null,
        brand text not null,
        description text,
        barcode text,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    })

    if (productsError) throw productsError

    // Create services table
    const { error: servicesError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'services',
      columns: `
        id uuid primary key default uuid_generate_v4(),
        name text not null,
        price decimal(10,2) not null,
        duration integer not null,
        description text,
        category text not null,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    })

    if (servicesError) throw servicesError

    // Create appointments table
    const { error: appointmentsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'appointments',
      columns: `
        id uuid primary key default uuid_generate_v4(),
        client_id uuid references clients(id),
        service_id uuid references services(id),
        employee_id uuid,
        date date not null,
        start_time time not null,
        end_time time not null,
        status text not null default 'scheduled',
        notes text,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      `
    })

    if (appointmentsError) throw appointmentsError

    console.log('Database tables created successfully!')
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  }
}

setupDatabase() 