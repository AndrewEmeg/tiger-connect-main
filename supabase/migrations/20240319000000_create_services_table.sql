-- Create services table
CREATE TABLE IF NOT EXISTS services_table (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rate DECIMAL(10,2) NOT NULL,
    rateType VARCHAR(20) NOT NULL CHECK (rateType IN ('hourly', 'fixed')),
    category VARCHAR(100) NOT NULL,
    provider_id UUID NOT NULL REFERENCES auth.users(id),
    availability TEXT[] NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_services_provider ON services_table(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services_table(category); 