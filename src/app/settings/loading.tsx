import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 space-y-8 min-h-screen">
      {/* Tabs Skeleton */}
      <div className="grid w-full grid-cols-3 mb-8 gap-2">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-[180px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Section Content */}
          <div className="space-y-6 mt-6">
            {/* Display Name */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-[50px]" />
              <Skeleton className="h-6 w-[250px] rounded-lg" />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-[70px]" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            {/* Avatar */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-[60px]" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </div>

            {/* Country Flag */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-[90px]" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            {/* Flair */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-[50px]" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-[120px]" />
        </CardFooter>
      </Card>
    </div>
  );
}
