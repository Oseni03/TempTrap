"use client";

import { 
	Card, 
	CardContent, 
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
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			{[
				{ label: "Total Requests", value: totalRequests.toLocaleString(), desc: "All time usage", icon: Activity },
				{ label: "Requests Today", value: `+${requestsToday}`, desc: "Last 24 hours", icon: ArrowUpRight },
				{ label: "Success Rate", value: `${successRate}%`, desc: "Verification accuracy", icon: TrendingUp },
				{ label: "Avg Latency", value: `${avgLatency}ms`, desc: "Response time", icon: Clock },
			].map((stat) => (
				<Card key={stat.label} className="border border-border bg-background shadow-none rounded-xl overflow-hidden group hover:border-primary/20 transition-all duration-300">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
						<CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
							{stat.label}
						</CardTitle>
						<stat.icon className="h-4 w-4 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
					</CardHeader>
					<CardContent className="px-6 pb-6 pt-1">
						<div className="text-3xl font-bold tracking-tighter text-foreground">
							{stat.value}
						</div>
						<p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
							<span className="w-1 h-1 rounded-full bg-primary/40" />
							{stat.desc}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
