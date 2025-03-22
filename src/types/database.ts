export interface Service {
  id: string;
  client_name: string;
  phone: string;
  address: string;
  service_type: 'repair' | 'maintenance' | 'installation';
  due_date: string; // Data de entrega
  status: 'active' | 'completed' | 'pending';
  budget: number;
  budget_status: 'pending' | 'approved' | 'rejected';
  photos: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ServiceHistory {
  id: string;
  service_id: string;
  action: string;
  old_status?: string;
  new_status?: string;
  created_at: string;
}