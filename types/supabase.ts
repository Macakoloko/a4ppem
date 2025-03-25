export interface Client {
  id: string
  name: string
  email: string | null
  phone: string
  address: string | null
  notes: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  cost: number
  stock: number
  category: string
  image_url: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  category: string
  color: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Professional {
  id: string
  name: string
  email: string
  phone: string
  bio: string | null
  speciality: string
  color: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  client_id: string
  professional_id: string
  service_id: string
  date: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
  client?: {
    name: string
  }
  professional?: {
    name: string
  }
  service?: {
    name: string
  }
} 