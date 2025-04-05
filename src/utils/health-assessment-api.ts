import { createClient } from '@/utils/supabase/client';

// Types
export interface HealthAssessmentCategory {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface HealthRiskAssessment {
  id: string;
  user_id: string;
  category_id: string;
  category_name?: string; // Joined field
  assessment_date: string;
  risk_level: 'low' | 'moderate' | 'high';
  risk_score: number; // 0-100
  metrics: Record<string, any>;
  recommendations: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HealthMetric {
  id: string;
  user_id: string;
  measurement_date: string;
  // Cardiovascular metrics
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  resting_heart_rate?: number;
  cholesterol_total?: number;
  cholesterol_hdl?: number;
  cholesterol_ldl?: number;
  // Diabetes metrics
  blood_glucose_level?: number;
  hba1c_level?: number;
  // Mental health metrics
  stress_level?: number;
  anxiety_level?: number;
  sleep_quality?: number;
  sleep_hours?: number;
  // Physical metrics
  bmi?: number;
  vo2_max?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FitnessGoal {
  id: string;
  user_id: string;
  goal_type: 'weight' | 'body_fat' | 'strength' | 'endurance' | 'health_metric' | 'other';
  goal_description: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  start_date: string;
  target_date?: string;
  is_achieved: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HealthRiskFactor {
  id: string;
  user_id: string;
  factor_type: 'lifestyle' | 'medical' | 'genetic' | 'environmental';
  factor_name: string;
  description?: string;
  severity?: number; // 1-5 scale
  is_active: boolean;
  onset_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// API Functions for Health Assessment Categories
export async function getHealthAssessmentCategories(): Promise<HealthAssessmentCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('health_assessment_categories').select('*').order('name');

  if (error) {
    console.error('Error fetching health assessment categories:', error);
    throw error;
  }

  return data || [];
}

// API Functions for Health Risk Assessments
export async function getHealthRiskAssessments(): Promise<HealthRiskAssessment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('health_risk_assessments')
    .select(
      `
      *,
      health_assessment_categories (
        id,
        name
      )
    `,
    )
    .order('assessment_date', { ascending: false });

  if (error) {
    console.error('Error fetching health risk assessments:', error);
    throw error;
  }

  // Format data to include category_name
  return (data || []).map((assessment) => ({
    ...assessment,
    category_name: assessment.health_assessment_categories?.name,
    health_assessment_categories: undefined,
  }));
}

export async function getHealthRiskAssessmentById(id: string): Promise<HealthRiskAssessment | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('health_risk_assessments')
    .select(
      `
      *,
      health_assessment_categories (
        id,
        name
      )
    `,
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching health risk assessment with ID ${id}:`, error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    category_name: data.health_assessment_categories?.name,
    health_assessment_categories: undefined,
  };
}

export async function createHealthRiskAssessment(
  assessment: Omit<HealthRiskAssessment, 'id' | 'created_at' | 'updated_at'>,
): Promise<HealthRiskAssessment | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('health_risk_assessments').insert(assessment).select().single();

  if (error) {
    console.error('Error creating health risk assessment:', error);
    throw error;
  }

  return data;
}

export async function updateHealthRiskAssessment(
  id: string,
  assessment: Partial<HealthRiskAssessment>,
): Promise<HealthRiskAssessment | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('health_risk_assessments')
    .update(assessment)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating health risk assessment with ID ${id}:`, error);
    throw error;
  }

  return data;
}

export async function deleteHealthRiskAssessment(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('health_risk_assessments').delete().eq('id', id);

  if (error) {
    console.error(`Error deleting health risk assessment with ID ${id}:`, error);
    throw error;
  }
}

// API Functions for Health Metrics
export async function getHealthMetrics(): Promise<HealthMetric[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('health_metrics')
    .select('*')
    .order('measurement_date', { ascending: false });

  if (error) {
    console.error('Error fetching health metrics:', error);
    throw error;
  }

  return data || [];
}

export async function getLatestHealthMetrics(): Promise<HealthMetric | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('health_metrics')
    .select('*')
    .order('measurement_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching latest health metrics:', error);
    return null;
  }

  return data;
}

export async function createHealthMetrics(
  metrics: Omit<HealthMetric, 'id' | 'created_at' | 'updated_at'>,
): Promise<HealthMetric | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('health_metrics').insert(metrics).select().single();

  if (error) {
    console.error('Error creating health metrics:', error);
    throw error;
  }

  return data;
}

// API Functions for Fitness Goals
export async function getFitnessGoals(): Promise<FitnessGoal[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('fitness_goals').select('*').order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching fitness goals:', error);
    throw error;
  }

  return data || [];
}

export async function createFitnessGoal(
  goal: Omit<FitnessGoal, 'id' | 'created_at' | 'updated_at'>,
): Promise<FitnessGoal | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('fitness_goals').insert(goal).select().single();

  if (error) {
    console.error('Error creating fitness goal:', error);
    throw error;
  }

  return data;
}

export async function updateFitnessGoal(id: string, goal: Partial<FitnessGoal>): Promise<FitnessGoal | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('fitness_goals').update(goal).eq('id', id).select().single();

  if (error) {
    console.error(`Error updating fitness goal with ID ${id}:`, error);
    throw error;
  }

  return data;
}

// API Functions for Health Risk Factors
export async function getHealthRiskFactors(): Promise<HealthRiskFactor[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('health_risk_factors')
    .select('*')
    .order('severity', { ascending: false });

  if (error) {
    console.error('Error fetching health risk factors:', error);
    throw error;
  }

  return data || [];
}

export async function createHealthRiskFactor(
  factor: Omit<HealthRiskFactor, 'id' | 'created_at' | 'updated_at'>,
): Promise<HealthRiskFactor | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('health_risk_factors').insert(factor).select().single();

  if (error) {
    console.error('Error creating health risk factor:', error);
    throw error;
  }

  return data;
}

// Helper functions for risk assessments
export function calculateBMI(weight: number, height: number): number {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function getBloodPressureCategory(systolic: number, diastolic: number): string {
  if (systolic < 120 && diastolic < 80) return 'Normal';
  if (systolic < 130 && diastolic < 80) return 'Elevated';
  if (systolic < 140 || diastolic < 90) return 'Hypertension Stage 1';
  if (systolic >= 140 || diastolic >= 90) return 'Hypertension Stage 2';
  if (systolic > 180 || diastolic > 120) return 'Hypertensive Crisis';
  return 'Unknown';
}

export function getGlucoseCategory(glucose: number): string {
  if (glucose < 100) return 'Normal';
  if (glucose < 126) return 'Prediabetes';
  return 'Diabetes';
}

// Subscription setup for real-time updates
export function subscribeToHealthRiskAssessments(callback: (payload: any) => void) {
  const supabase = createClient();

  return supabase
    .channel('health_risk_assessments_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'health_risk_assessments',
      },
      callback,
    )
    .subscribe();
}

export function subscribeToHealthMetrics(callback: (payload: any) => void) {
  const supabase = createClient();

  return supabase
    .channel('health_metrics_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'health_metrics',
      },
      callback,
    )
    .subscribe();
}
