# Vital AI - Health & Wellness Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.io/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_API-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
![Screenshot 2025-04-05 231533](https://github.com/user-attachments/assets/69725033-1cd7-4ef6-a5a4-126669ac3f4a)

![image](https://github.com/user-attachments/assets/e23c9d5e-a681-4cfe-8567-77f3c98d9929)

![image](https://github.com/user-attachments/assets/e0224d74-e68f-4a04-8784-03438fad0218)

![image](https://github.com/user-attachments/assets/ec7b0b48-d8e0-43f0-9277-0565d0adb535)

## Core Features

### Workout Planning

- Equipment-based exercise suggestions
- Progress monitoring with adaptive difficulty adjustment
- Google Fit integration for holistic activity tracking

### Nutrition Management

- Personalized meal suggestions with complete nutritional information
- **Indian Cuisine Focus** with authentic recipes using Google's Gemini API
- Advanced filtering by diet type, spice level, and nutritional needs
- Ingredient-based recipe search for practical meal planning

### Health Monitoring Dashboard

- Unified view of all vital health metrics
- Water intake tracking with customizable goals
- Fasting schedule management
- Sleep quality monitoring and recommendations

## Technology Stack

- **Framework:** Next.js 15
- **Frontend:** React 19, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui with custom dark theme
- **Authentication:** Supabase Auth
- **Database:** PostgreSQL (Supabase)
- **AI Services:** Google Gemini API
- **Visualization:** Framer Motion, Three.js
- **3D Health Visualizations:** React Three Fiber
- **API Integration:** Google Fit, RapidAPI (workout database)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Google Gemini API key
- Supabase account

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/vital-ai.git
   cd vital-ai
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Set up environment variables

   - Copy `.env.local.example` to `.env.local`
   - Add your Gemini API key
   - Set up Supabase credentials

4. Initialize the database

   - Run the SQL setup scripts from the `supabase/` directory in your Supabase dashboard

5. Start the development server
   ```bash
   pnpm dev
   ```

## Feature Highlights

### Indian Cuisine Recipe Engine

The Indian cuisine feature showcases authentic recipes with proper regional classification and spice level indicators. The integration with Google's Gemini API enables:

- Region-specific recipes (North, South, East, West, Central Indian)
- Spice level customization (Mild 🌶️, Medium 🌶️🌶️, Hot 🌶️🌶️🌶️)
- Detailed nutritional breakdown with macros
- Dietary preference filtering (vegetarian, vegan, keto, etc.)
- Step-by-step instructions with ingredient lists

The recipe system includes a robust fallback mechanism that serves curated content when API services are unavailable, ensuring users always have access to quality recipes.

### Predictive Health Analysis
