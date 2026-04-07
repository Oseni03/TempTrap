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
        <div className="space-y-10 animate-in fade-in duration-500">
            <header className="flex flex-col gap-1">
                <h1 className="text-2x font-bold tracking-tight text-foreground">Overview</h1>
                <p className="text-sm text-foreground/80 font-light">
                    Welcome back, {session.user.name}. Here&apos;s a look at your API performance.
                </p>
            </header>

            <UsageStats
                totalRequests={totalRequests}
                requestsToday={totalRequests > 0 ? 1 : 0}
                successRate={99.8}
                avgLatency={45}
            />

            <Card className="border border-border bg-background shadow-none rounded-xl overflow-hidden">
                <CardHeader className="px-6 py-6 border-b border-border/50">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/80">
                        Recent Activity
                    </CardTitle>
                    <CardDescription className="text-xs font-light mt-1">
                        The last 5 verification requests processed by your keys.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="">
                        {recentActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <History className="h-10 w-10 text-foreground/80 mb-4 font-light" />
                                <p className="text-xs text-foreground/80 font-light">No recent requests recorded yet.</p>
                            </div>
                        ) : (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border/50 text-[10px] font-bold uppercase tracking-widest text-foreground/80 bg-muted/10">
                                            <th className="h-10 px-6 text-left font-medium">Request Time</th>
                                            <th className="h-10 px-6 text-left font-medium">Key Alias</th>
                                            <th className="h-10 px-6 text-right font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {recentActivity.map((log) => (
                                            <tr key={log.id} className="group hover:bg-muted/10 transition-colors">
                                                <td className="px-6 py-4 align-middle text-foreground/80 text-xs font-light">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 align-middle">
                                                    <span className="font-mono text-[10px] text-foreground bg-muted/30 px-2 py-0.5 rounded border border-border/50 uppercase">
                                                        {log.apiKey.key.substring(0, 8)}...
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 align-middle text-right">
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
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
