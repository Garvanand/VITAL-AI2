import { Card } from '@/components/ui/card';
import { FiFile } from 'react-icons/fi';

export default function Loading() {
  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Card className="bg-background/50 backdrop-blur-[24px] border-border p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <FiFile className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold">Document Management</h1>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg bg-background/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="w-8 h-8 mb-3 rounded-full bg-muted animate-pulse" />
                <div className="w-32 h-4 mb-2 rounded bg-muted animate-pulse" />
                <div className="w-24 h-3 rounded bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-background/50 backdrop-blur-[24px] border-border p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 rounded bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 rounded bg-muted animate-pulse" />
                    <div className="w-24 h-3 rounded bg-muted animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="w-8 h-8 rounded bg-muted animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
