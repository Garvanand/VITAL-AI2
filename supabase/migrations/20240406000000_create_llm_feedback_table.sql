-- Create llm_feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.llm_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    response_id TEXT NOT NULL,
    response_type TEXT NOT NULL,
    rating TEXT,
    comment TEXT,
    context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.llm_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security model)
CREATE POLICY "Admins can do anything" ON public.llm_feedback
    FOR ALL
    TO authenticated
    USING (
        (SELECT is_admin FROM public.users WHERE id = auth.uid())
    );

CREATE POLICY "Users can view their own feedback" ON public.llm_feedback
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
    );

CREATE POLICY "Service roles can do anything" ON public.llm_feedback
    FOR ALL
    TO service_role
    USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_llm_feedback_user_id ON public.llm_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_feedback_response_type ON public.llm_feedback(response_type);
CREATE INDEX IF NOT EXISTS idx_llm_feedback_rating ON public.llm_feedback(rating);

-- Create stored procedure to create table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_llm_feedback_table()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'llm_feedback'
    ) THEN
        -- Create the table
        CREATE TABLE public.llm_feedback (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            response_id TEXT NOT NULL,
            response_type TEXT NOT NULL,
            rating TEXT,
            comment TEXT,
            context JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add RLS policies
        ALTER TABLE public.llm_feedback ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Admins can do anything" ON public.llm_feedback
            FOR ALL
            TO authenticated
            USING (
                (SELECT is_admin FROM public.users WHERE id = auth.uid())
            );

        CREATE POLICY "Users can view their own feedback" ON public.llm_feedback
            FOR SELECT
            TO authenticated
            USING (
                user_id = auth.uid()
            );

        CREATE POLICY "Service roles can do anything" ON public.llm_feedback
            FOR ALL
            TO service_role
            USING (true);

        -- Create indexes
        CREATE INDEX idx_llm_feedback_user_id ON public.llm_feedback(user_id);
        CREATE INDEX idx_llm_feedback_response_type ON public.llm_feedback(response_type);
        CREATE INDEX idx_llm_feedback_rating ON public.llm_feedback(rating);
    END IF;
END;
$$; 