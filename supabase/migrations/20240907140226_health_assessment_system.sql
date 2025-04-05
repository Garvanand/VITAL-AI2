-- Health Assessment Categories
CREATE TABLE IF NOT EXISTS public.health_assessment_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Insert default health assessment categories
INSERT INTO public.health_assessment_categories (name, description) VALUES
  ('Cardiovascular', 'Heart health and cardiovascular system assessments'),
  ('Diabetes', 'Blood glucose and diabetes risk assessments'),
  ('Mental Health', 'Mental wellbeing and psychological health assessments'),
  ('Musculoskeletal', 'Joint, bone, and muscle health assessments'),
  ('Nutrition', 'Dietary and nutritional health assessments'),
  ('Overall Fitness', 'General fitness and wellness assessments')
ON CONFLICT DO NOTHING;

-- Health Risk Assessments
CREATE TABLE IF NOT EXISTS public.health_risk_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category_id UUID REFERENCES public.health_assessment_categories(id) NOT NULL,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
  risk_score INTEGER NOT NULL, -- Score from 0-100
  metrics JSONB NOT NULL, -- Specific metrics associated with the assessment
  recommendations TEXT[], -- Array of recommendations based on risk level
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS for health risk assessments
ALTER TABLE public.health_risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health assessments" 
  ON public.health_risk_assessments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own health assessments" 
  ON public.health_risk_assessments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own health assessments" 
  ON public.health_risk_assessments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own health assessments" 
  ON public.health_risk_assessments FOR DELETE
  USING (user_id = auth.uid());

-- Health Metrics
CREATE TABLE IF NOT EXISTS public.health_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  measurement_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  -- Cardiovascular metrics
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  resting_heart_rate INTEGER,
  cholesterol_total INTEGER,
  cholesterol_hdl INTEGER,
  cholesterol_ldl INTEGER,
  -- Diabetes metrics
  blood_glucose_level INTEGER,
  hba1c_level NUMERIC(4,2),
  -- Mental health metrics
  stress_level INTEGER, -- 1-10 scale
  anxiety_level INTEGER, -- 1-10 scale
  sleep_quality INTEGER, -- 1-10 scale
  sleep_hours NUMERIC(3,1),
  -- Physical metrics
  bmi NUMERIC(4,2),
  vo2_max INTEGER,
  -- Additional fields
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS for health metrics
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health metrics" 
  ON public.health_metrics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own health metrics" 
  ON public.health_metrics FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own health metrics" 
  ON public.health_metrics FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own health metrics" 
  ON public.health_metrics FOR DELETE
  USING (user_id = auth.uid());

-- Fitness Goals
CREATE TABLE IF NOT EXISTS public.fitness_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('weight', 'body_fat', 'strength', 'endurance', 'health_metric', 'other')),
  goal_description TEXT NOT NULL,
  target_value NUMERIC(8,2),
  current_value NUMERIC(8,2),
  unit TEXT,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  target_date TIMESTAMP WITH TIME ZONE,
  is_achieved BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS for fitness goals
ALTER TABLE public.fitness_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fitness goals" 
  ON public.fitness_goals FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own fitness goals" 
  ON public.fitness_goals FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own fitness goals" 
  ON public.fitness_goals FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own fitness goals" 
  ON public.fitness_goals FOR DELETE
  USING (user_id = auth.uid());

-- Health Risk Factors
CREATE TABLE IF NOT EXISTS public.health_risk_factors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  factor_type TEXT NOT NULL CHECK (factor_type IN ('lifestyle', 'medical', 'genetic', 'environmental')),
  factor_name TEXT NOT NULL,
  description TEXT,
  severity INTEGER, -- 1-5 scale, 5 being most severe
  is_active BOOLEAN DEFAULT true,
  onset_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS for health risk factors
ALTER TABLE public.health_risk_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health risk factors" 
  ON public.health_risk_factors FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own health risk factors" 
  ON public.health_risk_factors FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own health risk factors" 
  ON public.health_risk_factors FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own health risk factors" 
  ON public.health_risk_factors FOR DELETE
  USING (user_id = auth.uid());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_risk_assessments_user_id ON public.health_risk_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_health_risk_assessments_category ON public.health_risk_assessments(category_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_id ON public.health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_goals_user_id ON public.fitness_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_health_risk_factors_user_id ON public.health_risk_factors(user_id); 