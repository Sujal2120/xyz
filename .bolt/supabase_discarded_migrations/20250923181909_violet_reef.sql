/*
  # Create Profiles Table

  1. New Table: profiles
    - id (uuid, primary key, references auth.users)
    - name (text, required)
    - role (user_role, default 'tourist')
    - digital_id (text, unique, blockchain-style ID)
    - phone (text, optional)
    - emergency_contact (text, optional)
    - location (geography point, current location)
    - status (user_status, default 'active')
    - created_at (timestamptz)
    - updated_at (timestamptz)

  2. Security
    - Enable RLS
    - Users can read/update own profile
    - Admins can read all profiles

  3. Functions
    - Auto-generate digital ID on insert
    - Update timestamp trigger
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role user_role DEFAULT 'tourist',
  digital_id text UNIQUE,
  phone text,
  emergency_contact text,
  location geography(POINT, 4326),
  status user_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to generate digital ID
CREATE OR REPLACE FUNCTION generate_digital_id()
RETURNS text AS $$
DECLARE
  prefix text := 'DID';
  timestamp_part text;
  random_part text;
  digital_id text;
BEGIN
  -- Get timestamp part (YYYYMMDD)
  timestamp_part := to_char(now(), 'YYYYMMDD');
  
  -- Generate random part (8 characters)
  random_part := upper(substring(gen_random_uuid()::text from 1 for 8));
  
  -- Combine parts
  digital_id := prefix || '-' || timestamp_part || '-' || random_part;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM profiles WHERE profiles.digital_id = digital_id) LOOP
    random_part := upper(substring(gen_random_uuid()::text from 1 for 8));
    digital_id := prefix || '-' || timestamp_part || '-' || random_part;
  END LOOP;
  
  RETURN digital_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name, digital_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    generate_digital_id()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();