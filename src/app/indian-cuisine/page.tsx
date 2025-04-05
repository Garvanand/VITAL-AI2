import { Metadata } from 'next';
import { RecipeGrid } from '@/components/indian-cuisine/recipe-grid';
import { ChevronRight, Utensils, Leaf, Drumstick, FlameIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Indian Cuisine - Authentic Recipes with Dietary Customization',
  description:
    'Discover authentic Indian recipes with customizable spice levels and dietary options. Explore regional cuisine from across India.',
};

export default function IndianCuisinePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-600 to-orange-500 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/indian-food-pattern.png')] bg-repeat opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-500"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Authentic Indian Cuisine</h1>
              <p className="text-xl opacity-90 mb-6">
                Explore carefully curated recipes from across India with customizable spice levels and dietary options.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Leaf className="h-5 w-5" />
                  <span>Dietary Customization</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <FlameIcon className="h-5 w-5" />
                  <span>Adjustable Spice Levels</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Utensils className="h-5 w-5" />
                  <span>Authentic Recipes</span>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-center">
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="space-y-4">
                  <div className="h-40 w-full rounded-lg overflow-hidden shadow-xl transform -rotate-3">
                    <img
                      src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                      alt="Butter Chicken"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="h-48 w-full rounded-lg overflow-hidden shadow-xl transform rotate-3">
                    <img
                      src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                      alt="Masala Dosa"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="h-48 w-full rounded-lg overflow-hidden shadow-xl transform rotate-3">
                    <img
                      src="https://images.unsplash.com/photo-1631916969933-bcd1ab93edda?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                      alt="Paneer Tikka"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="h-40 w-full rounded-lg overflow-hidden shadow-xl transform -rotate-3">
                    <img
                      src="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                      alt="Pav Bhaji"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-8 bg-orange-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap gap-4 justify-around">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Drumstick className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium">Regional Varieties</h3>
                <p className="text-sm text-gray-600">Explore cuisines from all regions of India</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium">Dietary Options</h3>
                <p className="text-sm text-gray-600">Vegetarian, vegan, and gluten-free recipes</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <FlameIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium">Spice Regulation</h3>
                <p className="text-sm text-gray-600">Adjust spice levels to suit your preference</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recipe Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Indian Recipes</h2>
            <div className="flex items-center text-orange-600 hover:text-orange-700 cursor-pointer group">
              <span className="font-medium">Explore All</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <RecipeGrid />
        </div>
      </section>
    </div>
  );
}
