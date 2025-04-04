export interface Tier {
  name: string;
  id: 'starter' | 'pro' | 'advanced';
  icon: string;
  description: string;
  features: string[];
  featured: boolean;
  priceId: Record<string, string>;
}

export const PricingTier: Tier[] = [
  {
    name: 'Disease Prediction',
    id: 'starter',
    icon: '/assets/icons/price-tiers/free-icon.svg',
    description: 'AI-powered screening tools for early detection and risk assessment.',
    features: [
      'Heart Disease Analysis',
      'Diabetes Risk Assessment',
      'Cancer Screening Support',
      'Basic Health Reporting',
    ],
    featured: false,
    priceId: { month: 'pri_01hsxyh9txq4rzbrhbyngkhy46', year: 'pri_01hsxyh9txq4rzbrhbyngkhy46' },
  },
  {
    name: 'Health Monitoring',
    id: 'pro',
    icon: '/assets/icons/price-tiers/basic-icon.svg',
    description: 'Comprehensive monitoring tools for ongoing health management.',
    features: [
      'Vital Signs Monitoring',
      'Chronic Disease Management',
      'Medication Tracking',
      'Health Alerts & Notifications',
      'Everything in Disease Prediction',
    ],
    featured: true,
    priceId: { month: 'pri_01hsxycme6m95sejkz7sbz5e9g', year: 'pri_01hsxyeb2bmrg618bzwcwvdd6q' },
  },
  {
    name: 'Medical Analytics',
    id: 'advanced',
    icon: '/assets/icons/price-tiers/pro-icon.svg',
    description: 'Advanced analytics and insights for comprehensive healthcare management.',
    features: [
      'Lab Results Analysis',
      'Treatment Response Prediction',
      'Health Trend Analysis',
      'Patient Data Integration',
      'Healthcare Provider Dashboard',
      'Everything in Health Monitoring',
    ],
    featured: false,
    priceId: { month: 'pri_01hsxyff091kyc9rjzx7zm6yqh', year: 'pri_01hsxyfysbzf90tkh2wqbfxwa5' },
  },
];
