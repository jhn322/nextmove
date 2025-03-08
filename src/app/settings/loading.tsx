import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-[180px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tabs */}
          <div className="grid w-full grid-cols-2 gap-2">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>

          {/* Profile Section Content */}
          <div className="space-y-6 mt-6">
            {/* Display Name */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full rounded-md" />
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
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-[120px]" />
        </CardFooter>
      </Card>
    </div>
  );
}
