import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    History
} from "lucide-react";
import { prisma } from "@/lib/db";
import { UsageStats } from "@/components/dashboard/usage-stats";

async function getSummaryData(userId: string) {
    const totalKeys = await prisma.apiKey.count({
        where: { userId }
    });

    const totalRequests = await prisma.usageLog.count({
        where: {
            apiKey: {
                userId
            }
        }
    });

    const recentActivity = await prisma.usageLog.findMany({
        where: {
            apiKey: {
                userId
            }
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
            apiKey: true
        }
    });

    return { totalKeys, totalRequests, recentActivity };
}

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const { totalRequests, recentActivity } = await getSummaryData(session.user.id);

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <p className="text-muted-foreground">
                    Welcome back, {session.user.name}. Here&apos;s a look at your API performance.
                </p>
            </header>

            <UsageStats
                totalRequests={totalRequests}
                requestsToday={totalRequests > 0 ? 1 : 0}
                successRate={99.8}
                avgLatency={45}
            />

            <Card className="border-border bg-card shadow-none">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold tracking-tight">Recent Activity</CardTitle>
                    <CardDescription>
                        The last 5 verification requests processed by your keys.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <History className="h-12 w-12 text-muted-foreground/20 mb-4" />
                                <p className="text-muted-foreground">No recent requests recorded yet.</p>
                            </div>
                        ) : (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border text-muted-foreground">
                                            <th className="h-10 px-2 text-left font-medium">Request Time</th>
                                            <th className="h-10 px-2 text-left font-medium">Key Alias</th>
                                            <th className="h-10 px-2 text-right font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentActivity.map((log) => (
                                            <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                                                <td className="p-2 align-middle">{new Date(log.createdAt).toLocaleString()}</td>
                                                <td className="p-2 align-middle font-mono text-xs">{log.apiKey.key.substring(0, 8)}...</td>
                                                <td className="p-2 align-middle text-right">
                                                    <span className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground border">
                                                        200 OK
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
