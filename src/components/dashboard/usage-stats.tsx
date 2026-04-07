"use client";

import { 
	Card, 
	CardContent, 
	CardDescription, 
	CardHeader, 
	CardTitle 
} from "@/components/ui/card";
import { 
	TrendingUp, 
	Clock,
	Activity,
	ArrowUpRight
} from "lucide-react";

interface UsageStatsProps {
	totalRequests: number;
	requestsToday: number;
	successRate: number;
	avgLatency: number;
}

export function UsageStats({ 
	totalRequests, 
	requestsToday, 
	successRate, 
	avgLatency 
}: UsageStatsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card className="border-border bg-card shadow-none">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Requests</CardTitle>
					<Activity className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
					<p className="text-xs text-muted-foreground">All time usage</p>
				</CardContent>
			</Card>
			<Card className="border-border bg-card shadow-none">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Requests Today</CardTitle>
					<ArrowUpRight className="h-4 w-4 text-primary" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">+{requestsToday}</div>
					<p className="text-xs text-muted-foreground">Last 24 hours</p>
				</CardContent>
			</Card>
			<Card className="border-border bg-card shadow-none">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Success Rate</CardTitle>
					<TrendingUp className="h-4 w-4 text-green-500" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{successRate}%</div>
					<p className="text-xs text-muted-foreground">Verification accuracy</p>
				</CardContent>
			</Card>
			<Card className="border-border bg-card shadow-none">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
					<Clock className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{avgLatency}ms</div>
					<p className="text-xs text-muted-foreground">Response time</p>
				</CardContent>
			</Card>
		</div>
	);
}
