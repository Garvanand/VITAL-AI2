import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        <h2 className="text-xl font-medium text-gray-700">Loading Indian Cuisine...</h2>
        <p className="text-gray-500">Preparing delicious recipes just for you</p>
      </div>
    </div>
  );
}
