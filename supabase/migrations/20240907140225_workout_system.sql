-- Exercise categories
CREATE TABLE IF NOT EXISTS public.exercise_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Insert default exercise categories
INSERT INTO public.exercise_categories (name) VALUES
  ('Chest'),
  ('Back'),
  ('Legs'),
  ('Shoulders'),
  ('Arms'),
  ('Core'),
  ('Cardio'),
  ('Full Body'),
  ('Other')
ON CONFLICT DO NOTHING;

-- Exercises library
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.exercise_categories(id),
  primary_muscles TEXT[],
  secondary_muscles TEXT[],
  instructions TEXT,
  image_url TEXT,
  video_url TEXT,
  is_default BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS for exercises
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view default exercises" 
  ON public.exercises FOR SELECT
  USING (is_default = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own exercises" 
  ON public.exercises FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own exercises" 
  ON public.exercises FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own exercises" 
  ON public.exercises FOR DELETE
  USING (user_id = auth.uid());

-- Workouts
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  duration INTEGER, -- in minutes
  is_completed BOOLEAN DEFAULT false,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS for workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workouts" 
  ON public.workouts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own workouts" 
  ON public.workouts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own workouts" 
  ON public.workouts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own workouts" 
  ON public.workouts FOR DELETE
  USING (user_id = auth.uid());

-- Workout exercises (link between workouts and exercises)
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) NOT NULL,
  order_index INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS for workout exercises
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workout exercises" 
  ON public.workout_exercises FOR SELECT
  USING (
    workout_id IN (
      SELECT id FROM public.workouts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own workout exercises" 
  ON public.workout_exercises FOR INSERT
  WITH CHECK (
    workout_id IN (
      SELECT id FROM public.workouts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own workout exercises" 
  ON public.workout_exercises FOR UPDATE
  USING (
    workout_id IN (
      SELECT id FROM public.workouts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own workout exercises" 
  ON public.workout_exercises FOR DELETE
  USING (
    workout_id IN (
      SELECT id FROM public.workouts WHERE user_id = auth.uid()
    )
  );

-- Exercise sets
CREATE TABLE IF NOT EXISTS public.exercise_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_exercise_id UUID REFERENCES public.workout_exercises(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL,
  weight NUMERIC(8,2), -- in kg
  reps INTEGER,
  duration INTEGER, -- in seconds, for time-based exercises
  distance NUMERIC(8,2), -- in km, for distance-based exercises
  is_completed BOOLEAN DEFAULT false,
  is_warmup BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS for exercise sets
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exercise sets" 
  ON public.exercise_sets FOR SELECT
  USING (
    workout_exercise_id IN (
      SELECT we.id FROM public.workout_exercises we
      JOIN public.workouts w ON we.workout_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own exercise sets" 
  ON public.exercise_sets FOR INSERT
  WITH CHECK (
    workout_exercise_id IN (
      SELECT we.id FROM public.workout_exercises we
      JOIN public.workouts w ON we.workout_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own exercise sets" 
  ON public.exercise_sets FOR UPDATE
  USING (
    workout_exercise_id IN (
      SELECT we.id FROM public.workout_exercises we
      JOIN public.workouts w ON we.workout_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own exercise sets" 
  ON public.exercise_sets FOR DELETE
  USING (
    workout_exercise_id IN (
      SELECT we.id FROM public.workout_exercises we
      JOIN public.workouts w ON we.workout_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

-- Body measurements
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  weight NUMERIC(5,2), -- in kg
  body_fat NUMERIC(5,2), -- in percentage
  measurement_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS for body measurements
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own body measurements" 
  ON public.body_measurements FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own body measurements" 
  ON public.body_measurements FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own body measurements" 
  ON public.body_measurements FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own body measurements" 
  ON public.body_measurements FOR DELETE
  USING (user_id = auth.uid());

-- Default exercises
INSERT INTO public.exercises (name, description, category_id, primary_muscles, secondary_muscles, instructions, image_url, is_default) VALUES
  ('Bench Press', 'A compound chest exercise', (SELECT id FROM public.exercise_categories WHERE name = 'Chest'), ARRAY['chest', 'triceps'], ARRAY['shoulders'], 'Lie on a bench, lower the bar to your chest, then push it back up', 'https://www.inspireusafoundation.org/wp-content/uploads/2022/11/barbell-bench-press-benefits.jpg', true),
  ('Squat', 'A compound lower body exercise', (SELECT id FROM public.exercise_categories WHERE name = 'Legs'), ARRAY['quadriceps', 'glutes'], ARRAY['hamstrings', 'calves'], 'Stand with feet shoulder-width apart, bend knees and hips to lower your body, then stand back up', 'https://www.inspireusafoundation.org/wp-content/uploads/2022/05/high-bar-vs-low-bar-squat.jpg', true),
  ('Deadlift', 'A compound back exercise', (SELECT id FROM public.exercise_categories WHERE name = 'Back'), ARRAY['back', 'hamstrings'], ARRAY['glutes', 'forearms'], 'Stand with feet hip-width apart, bend at hips and knees to grip the bar, then stand up straight', 'https://www.inspireusafoundation.org/wp-content/uploads/2022/08/romanian-deadlift-form.jpg', true),
  ('Overhead Press', 'A compound shoulder exercise', (SELECT id FROM public.exercise_categories WHERE name = 'Shoulders'), ARRAY['shoulders'], ARRAY['triceps', 'core'], 'Stand with feet shoulder-width apart, press the bar from shoulders to overhead', 'https://www.inspireusafoundation.org/wp-content/uploads/2023/01/woman-doing-an-overhead-barbell-press.jpg', true),
  ('Bicep Curl', 'An isolation exercise for biceps', (SELECT id FROM public.exercise_categories WHERE name = 'Arms'), ARRAY['biceps'], ARRAY['forearms'], 'Stand with feet shoulder-width apart, curl the weight upward while keeping elbows fixed', 'https://www.inspireusafoundation.org/wp-content/uploads/2022/06/dumbbell-curl.jpg', true),
  ('Tricep Extension', 'An isolation exercise for triceps', (SELECT id FROM public.exercise_categories WHERE name = 'Arms'), ARRAY['triceps'], NULL, 'Hold weight overhead, bend elbows to lower weight behind head, then extend arms', 'https://www.inspireusafoundation.org/wp-content/uploads/2022/04/triceps-cable-pushdown.jpg', true),
  ('Plank', 'A core stabilizing exercise', (SELECT id FROM public.exercise_categories WHERE name = 'Core'), ARRAY['core'], ARRAY['shoulders'], 'Hold a push-up position with arms straight or on forearms, keeping body in a straight line', 'https://www.inspireusafoundation.org/wp-content/uploads/2022/04/forearm-plank.jpg', true),
  ('Pull-up', 'A compound back exercise', (SELECT id FROM public.exercise_categories WHERE name = 'Back'), ARRAY['back', 'biceps'], ARRAY['shoulders'], 'Hang from a bar with palms facing away, pull your body up until chin is over the bar', 'https://www.inspireusafoundation.org/wp-content/uploads/2022/08/pull-up-exercise-guide.jpg', true),
  ('Lunges', 'A unilateral leg exercise', (SELECT id FROM public.exercise_categories WHERE name = 'Legs'), ARRAY['quadriceps', 'glutes'], ARRAY['hamstrings'], 'Step forward with one leg, lowering your hips until both knees are bent at 90 degrees', 'https://www.inspireusafoundation.org/wp-content/uploads/2023/01/walking-lunges.jpg', true),
  ('Push-up', 'A bodyweight chest exercise', (SELECT id FROM public.exercise_categories WHERE name = 'Chest'), ARRAY['chest', 'triceps'], ARRAY['shoulders', 'core'], 'Start in plank position, lower your body until chest nearly touches floor, then push back up', 'https://www.inspireusafoundation.org/wp-content/uploads/2022/04/push-up-exercise.jpg', true)
ON CONFLICT DO NOTHING; 