-- Enable RLS on services_table
ALTER TABLE services_table ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all services" ON services_table;
DROP POLICY IF EXISTS "Users can create their own services" ON services_table;
DROP POLICY IF EXISTS "Users can update their own services" ON services_table;
DROP POLICY IF EXISTS "Users can delete their own services" ON services_table;

-- Create policies for services_table
CREATE POLICY "Users can view all services"
    ON services_table FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create their own services"
    ON services_table FOR INSERT
    TO authenticated
    WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Users can update their own services"
    ON services_table FOR UPDATE
    TO authenticated
    USING (provider_id = auth.uid())
    WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Users can delete their own services"
    ON services_table FOR DELETE
    TO authenticated
    USING (provider_id = auth.uid()); 