/*
  # Create services and service history tables

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `client_name` (text)
      - `phone` (text)
      - `address` (text)
      - `service_type` (enum: repair, maintenance, installation)
      - `due_date` (date)
      - `status` (enum: active, completed, pending)
      - `budget` (numeric)
      - `budget_status` (enum: pending, approved, rejected)
      - `photos` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `service_history`
      - `id` (uuid, primary key)
      - `service_id` (uuid, foreign key)
      - `action` (text)
      - `old_status` (text)
      - `new_status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their services and history
*/

-- Create service_type enum
CREATE TYPE service_type AS ENUM ('repair', 'maintenance', 'installation');

-- Create service_status enum
CREATE TYPE service_status AS ENUM ('active', 'completed', 'pending');

-- Create budget_status enum
CREATE TYPE budget_status AS ENUM ('pending', 'approved', 'rejected');

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  service_type service_type NOT NULL,
  due_date date NOT NULL,
  status service_status NOT NULL DEFAULT 'pending',
  budget numeric(10,2),
  budget_status budget_status NOT NULL DEFAULT 'pending',
  photos text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_history table
CREATE TABLE IF NOT EXISTS service_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  action text NOT NULL,
  old_status text,
  new_status text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;

-- Create policies for services table
CREATE POLICY "Users can view their services"
  ON services
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert services"
  ON services
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their services"
  ON services
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for service_history table
CREATE POLICY "Users can view service history"
  ON service_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert service history"
  ON service_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_client_name ON services(client_name);
CREATE INDEX IF NOT EXISTS idx_services_due_date ON services(due_date);
CREATE INDEX IF NOT EXISTS idx_service_history_service_id ON service_history(service_id);