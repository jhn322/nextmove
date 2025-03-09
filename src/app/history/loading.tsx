import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function HistoryLoading() {
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 space-y-8">
      {/* Tab Bar */}
      <div className="grid w-full grid-cols-3 gap-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-lg" />
        ))}
      </div>

      {/* Game History Tab Content */}
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="w-full min-w-[800px]">
              <div className="grid grid-cols-6 gap-4 py-4 border-b">
                <Skeleton className="h-4 w-20" /> {/* Date */}
                <Skeleton className="h-4 w-24" /> {/* Opponent */}
                <Skeleton className="h-4 w-24" /> {/* Difficulty */}
                <Skeleton className="h-4 w-20" /> {/* Result */}
                <Skeleton className="h-4 w-16" /> {/* Moves */}
                <Skeleton className="h-4 w-16" /> {/* Time */}
              </div>

              {/* Table Rows */}
              {[...Array(8)].map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4 py-4 border-b">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-24" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clear History Button Skeleton */}
      <div className="flex justify-start">
        <Skeleton className="h-9 w-[120px]" />
      </div>
    </div>
  );
}
