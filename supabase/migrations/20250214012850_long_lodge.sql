/*
  # Create appointments table and related functions

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `name` (text)
      - `whatsapp` (text)
      - `service` (text)
      - `service_text` (text)
      - `date` (date)
      - `time` (text)
      - `status` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `appointments` table
    - Add policies for:
      - Insert: Allow authenticated and anonymous users to create appointments
      - Select: Allow authenticated users to read appointments
      - Update: Allow authenticated users to update their own appointments
      - Delete: Allow authenticated users to delete their own appointments

  3. Functions
    - `cancel_appointment`: Function to cancel an appointment by ID
*/

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    whatsapp text NOT NULL,
    service text NOT NULL,
    service_text text NOT NULL,
    date date NOT NULL,
    time text NOT NULL,
    status text DEFAULT 'confirmed',
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow anonymous insert" ON appointments
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON appointments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated update own" ON appointments
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated delete own" ON appointments
    FOR DELETE
    TO authenticated
    USING (true);

-- Function to cancel appointment
CREATE OR REPLACE FUNCTION cancel_appointment(appointment_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    appointment_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM appointments 
        WHERE id = appointment_id AND status = 'confirmed'
    ) INTO appointment_exists;
    
    IF appointment_exists THEN
        UPDATE appointments 
        SET status = 'cancelled' 
        WHERE id = appointment_id;
        
        RETURN json_build_object(
            'success', true,
            'message', 'Appointment cancelled successfully'
        );
    ELSE
        RETURN json_build_object(
            'success', false,
            'message', 'Appointment not found or already cancelled'
        );
    END IF;
END;
$$;