# Vital AI - Health & Wellness Platform
![Screenshot 2025-04-05 231533](https://github.com/user-attachments/assets/957d117b-083a-479f-8061-23e353ab978b)


![Screenshot 2025-04-05 231727-min](https://github.com/user-attachments/assets/b22b5059-7c8b-4c84-aaee-8a72871a6b1d)


![Screenshot 2025-04-05 231959-min](https://github.com/user-attachments/assets/3dfa1aeb-1552-4f41-9f84-83e17e6e605e)



![Screenshot 2025-04-05 232050-min](https://github.com/user-attachments/assets/bf046a0e-7365-4253-a3d9-fe4fdc765ecb)






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

The platform's predictive health analysis module evaluates various health markers to identify potential risks before they become problematic:

- Diabetes risk assessment based on lifestyle factors and metrics
- Cardiovascular health analysis with personalized recommendations
- Mental health monitoring with stress and sleep quality insights
- Skin condition analysis through visual pattern recognition
- Allergy risk evaluation based on environmental and genetic factors

Each analysis module provides actionable insights rather than just raw data, helping users make meaningful lifestyle adjustments.

## Project Structure

The application follows a modular architecture for maintainability and scalability:

- `/src/components` - UI components organized by feature
- `/src/app` - Next.js app router pages and API routes
- `/src/lib` - Shared utilities, services, and API clients
- `/src/contexts` - React context providers for state management
- `/src/data` - Static data and fallback content
- `/src/styles` - Global styles and theme configuration
- `/supabase` - Database schema and migration scripts

## API Integration

### Google Gemini API

Used for generating personalized recipe suggestions and health insights. Set up your API key in the `.env.local` file:

```
GEMINI_API_KEY=your_api_key_here
```

### Workout Database (RapidAPI)

Provides exercise information and workout plans. Configure in `.env.local`:

```
NEXT_PUBLIC_RAPIDAPI_KEY=your_api_key_here
```

## Troubleshooting

### API Connection Issues

If you experience problems with the Gemini API:

1. Verify your API key is correctly set in `.env.local`
2. Check your API quota and usage limits
3. Test the connection using the diagnostic tools in `/src/lib/api/gemini-test.ts`
