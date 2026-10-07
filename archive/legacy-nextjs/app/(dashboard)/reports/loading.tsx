import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ReportsLoading() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Skeleton className="h-9 w-[200px]" />
                    <Skeleton className="h-4 w-[300px] mt-2" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-[100px]" />
                    <Skeleton className="h-9 w-[120px]" />
                </div>
            </div>

            {/* Filters Skeleton */}
            <Card>
                <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-[80px]" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <Skeleton className="h-10 w-[160px]" />
                        <Skeleton className="h-10 w-[220px]" />
                    </div>
                </CardContent>
            </Card>

            {/* Tabs Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-10 w-[300px]" />

                <div className="grid gap-4 md:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-[80px] mb-2" />
                                <Skeleton className="h-3 w-[100px]" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-[180px]" />
                        <Skeleton className="h-4 w-[250px]" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[200px] w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
