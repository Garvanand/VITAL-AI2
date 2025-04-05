'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  HealthAssessmentCategory,
  HealthRiskAssessment,
  HealthMetric,
  FitnessGoal,
  HealthRiskFactor,
  getHealthAssessmentCategories,
  getHealthRiskAssessments,
  getHealthMetrics,
  getFitnessGoals,
  getHealthRiskFactors,
  getLatestHealthMetrics,
  subscribeToHealthRiskAssessments,
  subscribeToHealthMetrics,
  calculateBMI,
  getBMICategory,
  getBloodPressureCategory,
  getGlucoseCategory,
} from '@/utils/health-assessment-api';

// Types
interface HealthAssessmentContextType {
  // Data
  assessmentCategories: HealthAssessmentCategory[];
  riskAssessments: HealthRiskAssessment[];
  healthMetrics: HealthMetric[];
  latestMetrics: HealthMetric | null;
  fitnessGoals: FitnessGoal[];
  riskFactors: HealthRiskFactor[];

  // Loading states
  isLoadingCategories: boolean;
  isLoadingAssessments: boolean;
  isLoadingMetrics: boolean;
  isLoadingGoals: boolean;
  isLoadingFactors: boolean;

  // Action methods
  fetchCategories: () => Promise<void>;
  fetchRiskAssessments: () => Promise<void>;
  fetchHealthMetrics: () => Promise<void>;
  fetchFitnessGoals: () => Promise<void>;
  fetchRiskFactors: () => Promise<void>;

  // Health analytics methods
  calculateRiskLevel: (category: string, metrics: Record<string, any>) => { riskLevel: string; riskScore: number };
  getRecommendations: (category: string, riskLevel: string) => string[];
  getMetricTrend: (metricName: string) => { value: number; trend: 'up' | 'down' | 'stable' };

  // Helper functions
  calculateBMI: (weight: number, height: number) => number;
  getBMICategory: (bmi: number) => string;
  getBloodPressureCategory: (systolic: number, diastolic: number) => string;
  getGlucoseCategory: (glucose: number) => string;
}

// Default values
const defaultContext: HealthAssessmentContextType = {
  assessmentCategories: [],
  riskAssessments: [],
  healthMetrics: [],
  latestMetrics: null,
  fitnessGoals: [],
  riskFactors: [],

  isLoadingCategories: false,
  isLoadingAssessments: false,
  isLoadingMetrics: false,
  isLoadingGoals: false,
  isLoadingFactors: false,

  fetchCategories: async () => {},
  fetchRiskAssessments: async () => {},
  fetchHealthMetrics: async () => {},
  fetchFitnessGoals: async () => {},
  fetchRiskFactors: async () => {},

  calculateRiskLevel: () => ({ riskLevel: 'low', riskScore: 0 }),
  getRecommendations: () => [],
  getMetricTrend: () => ({ value: 0, trend: 'stable' }),

  calculateBMI,
  getBMICategory,
  getBloodPressureCategory,
  getGlucoseCategory,
};

// Create context
const HealthAssessmentContext = createContext<HealthAssessmentContextType>(defaultContext);

// Hook to use the context
export const useHealthAssessment = () => useContext(HealthAssessmentContext);

// Provider component
export function HealthAssessmentProvider({ children }: { children: ReactNode }) {
  // State
  const [assessmentCategories, setAssessmentCategories] = useState<HealthAssessmentCategory[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<HealthRiskAssessment[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [latestMetrics, setLatestMetrics] = useState<HealthMetric | null>(null);
  const [fitnessGoals, setFitnessGoals] = useState<FitnessGoal[]>([]);
  const [riskFactors, setRiskFactors] = useState<HealthRiskFactor[]>([]);

  // Loading states
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [isLoadingFactors, setIsLoadingFactors] = useState(false);

  // Fetch methods
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const categories = await getHealthAssessmentCategories();
      setAssessmentCategories(categories);
    } catch (error) {
      console.error('Error fetching assessment categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchRiskAssessments = async () => {
    setIsLoadingAssessments(true);
    try {
      const assessments = await getHealthRiskAssessments();
      setRiskAssessments(assessments);
    } catch (error) {
      console.error('Error fetching risk assessments:', error);
    } finally {
      setIsLoadingAssessments(false);
    }
  };

  const fetchHealthMetrics = async () => {
    setIsLoadingMetrics(true);
    try {
      const metrics = await getHealthMetrics();
      setHealthMetrics(metrics);

      const latest = await getLatestHealthMetrics();
      setLatestMetrics(latest);
    } catch (error) {
      console.error('Error fetching health metrics:', error);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const fetchFitnessGoals = async () => {
    setIsLoadingGoals(true);
    try {
      const goals = await getFitnessGoals();
      setFitnessGoals(goals);
    } catch (error) {
      console.error('Error fetching fitness goals:', error);
    } finally {
      setIsLoadingGoals(false);
    }
  };

  const fetchRiskFactors = async () => {
    setIsLoadingFactors(true);
    try {
      const factors = await getHealthRiskFactors();
      setRiskFactors(factors);
    } catch (error) {
      console.error('Error fetching risk factors:', error);
    } finally {
      setIsLoadingFactors(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    // Subscribe to health risk assessments
    const assessmentsSubscription = subscribeToHealthRiskAssessments((payload) => {
      // Refresh risk assessments when there's a change
      fetchRiskAssessments();
    });

    // Subscribe to health metrics
    const metricsSubscription = subscribeToHealthMetrics((payload) => {
      // Refresh health metrics when there's a change
      fetchHealthMetrics();
    });

    return () => {
      // Unsubscribe when the component unmounts
      assessmentsSubscription.unsubscribe();
      metricsSubscription.unsubscribe();
    };
  }, []);

  // Analytics methods
  const calculateRiskLevel = (category: string, metrics: Record<string, any>) => {
    let riskScore = 0;

    // Different calculation based on category
    switch (category.toLowerCase()) {
      case 'cardiovascular':
        // Blood pressure risk
        if (metrics.systolic >= 140 || metrics.diastolic >= 90) {
          riskScore += 40;
        } else if (metrics.systolic >= 120 || metrics.diastolic >= 80) {
          riskScore += 20;
        }

        // Cholesterol risk
        if (metrics.cholesterol > 240) {
          riskScore += 30;
        } else if (metrics.cholesterol > 200) {
          riskScore += 15;
        }

        // Smoking risk
        if (metrics.isSmoker) {
          riskScore += 20;
        }

        break;

      case 'diabetes':
        // Blood glucose risk
        if (metrics.bloodGlucose >= 126) {
          riskScore += 40;
        } else if (metrics.bloodGlucose >= 100) {
          riskScore += 20;
        }

        // HbA1c risk
        if (metrics.hba1c >= 6.5) {
          riskScore += 40;
        } else if (metrics.hba1c >= 5.7) {
          riskScore += 20;
        }

        // BMI risk
        if (metrics.bmi >= 30) {
          riskScore += 15;
        } else if (metrics.bmi >= 25) {
          riskScore += 10;
        }

        break;

      case 'mental health':
        // Stress level risk
        if (metrics.stressLevel >= 7) {
          riskScore += 25;
        } else if (metrics.stressLevel >= 5) {
          riskScore += 15;
        }

        // Anxiety level risk
        if (metrics.anxietyLevel >= 7) {
          riskScore += 25;
        } else if (metrics.anxietyLevel >= 5) {
          riskScore += 15;
        }

        // Sleep quality risk
        if (metrics.sleepQuality <= 3) {
          riskScore += 20;
        } else if (metrics.sleepQuality <= 5) {
          riskScore += 10;
        }

        // Sleep hours risk
        if (metrics.sleepHours < 6) {
          riskScore += 15;
        } else if (metrics.sleepHours < 7) {
          riskScore += 10;
        }

        break;

      default:
        // General health risk calculation
        if (metrics.bmi >= 30) {
          riskScore += 20;
        }

        if (metrics.systolic >= 140 || metrics.diastolic >= 90) {
          riskScore += 20;
        }

        if (metrics.bloodGlucose >= 126) {
          riskScore += 20;
        }

        if (metrics.stressLevel >= 7) {
          riskScore += 20;
        }

        break;
    }

    // Determine risk level based on score
    let riskLevel = 'low';
    if (riskScore >= 60) {
      riskLevel = 'high';
    } else if (riskScore >= 30) {
      riskLevel = 'moderate';
    }

    return { riskLevel, riskScore };
  };

  const getRecommendations = (category: string, riskLevel: string) => {
    const recommendations: Record<string, Record<string, string[]>> = {
      cardiovascular: {
        low: [
          'Maintain a heart-healthy diet with fruits, vegetables, and whole grains',
          'Continue regular physical activity of at least 150 minutes per week',
          'Schedule annual health check-ups',
          'Maintain healthy weight',
          'Limit sodium and saturated fat intake',
        ],
        moderate: [
          'Increase physical activity to 30 minutes daily',
          'Reduce sodium intake to less than 2,300mg per day',
          'Maintain a heart-healthy diet',
          'Monitor blood pressure regularly',
          'Consider stress reduction techniques',
          'Schedule semi-annual health check-ups',
        ],
        high: [
          'Consult with a cardiologist or healthcare provider',
          'Follow medication regimen as prescribed',
          'Monitor blood pressure daily',
          'Adopt a DASH or Mediterranean diet',
          'Engage in supervised physical activity',
          'Eliminate tobacco use',
          'Limit alcohol consumption',
          'Schedule quarterly health check-ups',
        ],
      },
      diabetes: {
        low: [
          'Maintain a balanced diet rich in fiber and low in refined sugars',
          'Engage in regular physical activity',
          'Maintain a healthy weight',
          'Monitor blood glucose annually',
          'Stay hydrated',
        ],
        moderate: [
          'Monitor blood glucose levels regularly',
          'Consult with a nutritionist for a tailored meal plan',
          'Increase physical activity to 30 minutes daily',
          'Focus on weight management',
          'Reduce intake of refined carbohydrates and sugars',
          'Schedule semi-annual check-ups with healthcare provider',
        ],
        high: [
          'Consult with an endocrinologist or healthcare provider immediately',
          'Monitor blood glucose levels daily',
          'Follow a strict diet plan as recommended by healthcare professionals',
          'Consider medication options if prescribed',
          'Engage in regular physical activity as advised',
          'Join a diabetes education program',
          'Schedule quarterly health check-ups',
        ],
      },
      'mental health': {
        low: [
          'Continue practicing healthy sleep hygiene',
          'Engage in regular physical activity',
          'Practice stress management techniques',
          'Maintain social connections',
          'Consider mindfulness or meditation practices',
        ],
        moderate: [
          'Prioritize regular sleep schedule',
          'Incorporate daily stress reduction activities',
          'Consider talking to a mental health professional',
          'Increase physical activity',
          'Limit alcohol and caffeine consumption',
          'Build a strong support system',
        ],
        high: [
          'Consult with a mental health professional',
          'Consider therapy options',
          'Establish consistent sleep and wake times',
          'Practice daily relaxation techniques',
          'Join support groups',
          'Follow treatment plan as prescribed',
          'Limit stressors when possible',
          'Maintain regular check-ins with health providers',
        ],
      },
      default: {
        low: [
          'Maintain a balanced diet with plenty of fruits and vegetables',
          'Engage in regular physical activity',
          'Get adequate sleep',
          'Stay hydrated',
          'Manage stress levels',
        ],
        moderate: [
          'Improve diet quality by reducing processed foods',
          'Increase physical activity',
          'Establish consistent sleep patterns',
          'Consider stress reduction techniques',
          'Schedule regular health check-ups',
        ],
        high: [
          'Consult with healthcare providers for personalized advice',
          'Follow medical recommendations closely',
          'Adopt lifestyle changes as advised',
          'Monitor key health metrics regularly',
          'Seek support from professionals and loved ones',
        ],
      },
    };

    const categoryKey = category.toLowerCase();
    const riskKey = riskLevel.toLowerCase();

    return recommendations[categoryKey]?.[riskKey] || recommendations.default[riskKey];
  };

  const getMetricTrend = (metricName: string) => {
    // Ensure there are enough metrics to calculate a trend
    if (healthMetrics.length < 2) {
      return { value: 0, trend: 'stable' as const };
    }

    // Get the two most recent metrics for the given name
    const sortedMetrics = [...healthMetrics].sort(
      (a, b) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime(),
    );

    const latest = sortedMetrics[0];
    const previous = sortedMetrics[1];

    // Extract the metric value
    const getMetricValue = (metric: HealthMetric) => {
      switch (metricName) {
        case 'bloodPressureSystolic':
          return metric.blood_pressure_systolic || 0;
        case 'bloodPressureDiastolic':
          return metric.blood_pressure_diastolic || 0;
        case 'restingHeartRate':
          return metric.resting_heart_rate || 0;
        case 'bloodGlucose':
          return metric.blood_glucose_level || 0;
        case 'hba1c':
          return metric.hba1c_level || 0;
        case 'stressLevel':
          return metric.stress_level || 0;
        case 'anxietyLevel':
          return metric.anxiety_level || 0;
        case 'sleepQuality':
          return metric.sleep_quality || 0;
        case 'sleepHours':
          return metric.sleep_hours || 0;
        case 'bmi':
          return metric.bmi || 0;
        case 'vo2Max':
          return metric.vo2_max || 0;
        default:
          return 0;
      }
    };

    const latestValue = getMetricValue(latest);
    const previousValue = getMetricValue(previous);
    const difference = latestValue - previousValue;

    let trend: 'up' | 'down' | 'stable';

    // Determine trend direction based on the metric
    // For metrics where lower is better (like stress, blood pressure, etc.)
    const lowerIsBetter = [
      'bloodPressureSystolic',
      'bloodPressureDiastolic',
      'bloodGlucose',
      'hba1c',
      'stressLevel',
      'anxietyLevel',
    ];

    if (Math.abs(difference) < 0.05 * previousValue) {
      trend = 'stable';
    } else if (lowerIsBetter.includes(metricName)) {
      trend = difference < 0 ? 'up' : 'down';
    } else {
      trend = difference > 0 ? 'up' : 'down';
    }

    return { value: latestValue, trend };
  };

  const contextValue: HealthAssessmentContextType = {
    assessmentCategories,
    riskAssessments,
    healthMetrics,
    latestMetrics,
    fitnessGoals,
    riskFactors,

    isLoadingCategories,
    isLoadingAssessments,
    isLoadingMetrics,
    isLoadingGoals,
    isLoadingFactors,

    fetchCategories,
    fetchRiskAssessments,
    fetchHealthMetrics,
    fetchFitnessGoals,
    fetchRiskFactors,

    calculateRiskLevel,
    getRecommendations,
    getMetricTrend,

    calculateBMI,
    getBMICategory,
    getBloodPressureCategory,
    getGlucoseCategory,
  };

  return <HealthAssessmentContext.Provider value={contextValue}>{children}</HealthAssessmentContext.Provider>;
}
