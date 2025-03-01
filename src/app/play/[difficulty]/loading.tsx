import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 p-4 min-h-[calc(100vh-4rem)]">
      <main className="flex flex-col w-full items-center justify-start">
        <div className="flex flex-col lg:flex-row w-full lg:items-start sm:items-center justify-center gap-4">
          <div className="relative w-full max-w-[min(80vh,90vw)] lg:max-w-[107vh]">
            {/* Player Profile (Top) - Mobile */}
            <div className="flex mb-4 lg:hidden">
              <SkeletonPlayerProfile />
            </div>

            <div className="relative w-full aspect-square">
              <div className="flex flex-col lg:flex-row w-full items-center lg:items-start justify-center gap-4">
                {/* Player Profiles - Desktop */}
                <div className="hidden lg:flex flex-col justify-between self-stretch">
                  <SkeletonPlayerProfile />
                  <div className="mt-4">
                    <SkeletonPlayerProfile />
                  </div>
                </div>

                {/* Chess Board */}
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="w-full h-full aspect-square rounded-lg" />
                </div>
              </div>
            </div>

            {/* Player Profile (Bottom) - Mobile */}
            <div className="flex mt-4 lg:hidden">
              <SkeletonPlayerProfile />
            </div>
          </div>

          {/* Game Controls / Bot Selection Panel */}
          <div className="w-full lg:w-80 lg:flex flex-col">
            <SkeletonBotSelectionPanel />
          </div>
        </div>
      </main>
    </div>
  );
}

// Skeleton Components
const SkeletonPlayerProfile = () => (
  <Card className="sm:w-[180px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <CardHeader className="flex flex-row items-center gap-2 space-y-0 p-2">
      <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
      <div className="flex flex-col gap-0.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </CardHeader>
  </Card>
);

const SkeletonBotSelectionPanel = () => (
  <div className="space-y-4 rounded-lg border border-border bg-card p-3 w-full lg:min-w-[280px] lg:max-w-md lg:p-4">
    <Card className="border-0 shadow-none">
      <CardHeader className="p-3 pb-2 lg:p-4 lg:pb-2">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="p-3 pt-0 lg:p-4 lg:pt-0">
        {/* Mobile Layout */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2 p-2 rounded-md">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-3 w-5" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);
