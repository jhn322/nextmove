import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="space-y-6">
        {/* Title and Description */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>

        {/* Table */}
        <div className="space-y-4">
          {/* Table Header */}
          <Skeleton className="h-12 w-full rounded-lg" />

          {/* Table Rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-16 w-[15%] rounded-lg" /> {/* Date */}
              <Skeleton className="h-16 w-[20%] rounded-lg" /> {/* Opponent */}
              <Skeleton className="h-16 w-[15%] rounded-lg" />{" "}
              {/* Difficulty */}
              <Skeleton className="h-16 w-[20%] rounded-lg" /> {/* Result */}
              <Skeleton className="h-16 w-[15%] rounded-lg" /> {/* Moves */}
              <Skeleton className="h-16 w-[15%] rounded-lg" /> {/* Time */}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stat Cards */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-8 w-[150px]" /> {/* Title */}
            <Skeleton className="h-20 w-full rounded-lg" /> {/* Content */}
          </div>
        ))}
      </div>

      {/* Bot Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Clear History Button */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-[120px] rounded-md" />
      </div>
    </div>
  );
}
