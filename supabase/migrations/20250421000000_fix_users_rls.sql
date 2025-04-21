-- Enable RLS on user_table
ALTER TABLE public.user_table ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all users" ON public.user_table;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_table;

-- Create policy: Allow authenticated users to view all user profiles
CREATE POLICY "Users can view all users"
    ON public.user_table
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy: Allow authenticated users to update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.user_table
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
