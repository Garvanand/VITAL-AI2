-- Create llm_parameters table
CREATE TABLE IF NOT EXISTS public.llm_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_type TEXT UNIQUE NOT NULL,
    parameters JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.llm_parameters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service roles can do anything" ON public.llm_parameters
    FOR ALL
    TO service_role
    USING (true);

CREATE POLICY "Authenticated users can read" ON public.llm_parameters
    FOR SELECT
    TO authenticated
    USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_llm_parameters_response_type ON public.llm_parameters(response_type);

-- Create stored procedure to create table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_llm_parameters_table()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'llm_parameters'
    ) THEN
        -- Create the table
        CREATE TABLE public.llm_parameters (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            response_type TEXT UNIQUE NOT NULL,
            parameters JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add RLS policies
        ALTER TABLE public.llm_parameters ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Service roles can do anything" ON public.llm_parameters
            FOR ALL
            TO service_role
            USING (true);

        CREATE POLICY "Authenticated users can read" ON public.llm_parameters
            FOR SELECT
            TO authenticated
            USING (true);

        -- Create indexes
        CREATE INDEX idx_llm_parameters_response_type ON public.llm_parameters(response_type);
    END IF;
END;
$$; 