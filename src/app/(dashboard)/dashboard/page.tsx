import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { History, ArrowRight } from "lucide-react";
import { UsageStats } from "@/components/dashboard/usage-stats";
import { VerificationCharts } from "@/components/dashboard/verification-charts";
import Link from "next/link";
import { getDashboardData, getRecentActivity } from "@/server/dashboard";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/sign-in");
	}

	if (!session.session.activeOrganizationId) {
		return null;
	}

	const [recentActivity, dashboardData] = await Promise.all([
		getRecentActivity(session.session.activeOrganizationId),
		getDashboardData(session.session.activeOrganizationId),
	]);

	return (
		<div className="space-y-10 animate-in-fade pb-20">
			<header className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold tracking-tight text-foreground">
					Overview
				</h1>
				<div className="flex items-center gap-2">
					<p className="text-sm text-muted-foreground font-light">
						Welcome back,{" "}
						<span className="text-foreground font-medium">
							{session.user.name.split(" ")[0]}
						</span>
						.
					</p>
					<div className="h-1 w-1 rounded-full bg-border" />
					<p className="text-xs text-muted-foreground font-light italic">
						Viewing activity for the last 30 days.
					</p>
				</div>
			</header>

			<UsageStats stats={dashboardData.stats} />

			<VerificationCharts
				chartData={dashboardData.chartData}
				distribution={dashboardData.distribution}
			/>

			<Card className="border-border/50 bg-background/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-sm">
				<CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between group cursor-pointer">
					<div className="space-y-1">
						<CardTitle className="text-xl font-bold tracking-tight">
							Recent Logs
						</CardTitle>
						<CardDescription className="text-sm font-light">
							Live stream of verification requests across your
							infrastructure.
						</CardDescription>
					</div>
					<Link
						href="/dashboard/logs"
						className="p-3 rounded-2xl bg-muted/50 border border-border/50 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all"
					>
						<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
					</Link>
				</CardHeader>
				<CardContent className="p-0">
					<div className="">
						{recentActivity.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-24 text-center">
								<History className="h-12 w-12 text-muted-foreground/20 mb-6 font-light" />
								<p className="text-sm text-muted-foreground font-light">
									No verification activity recorded yet.
								</p>
								<Link
									href="/docs"
									className="mt-4 text-sm font-bold text-primary hover:underline"
								>
									View API setup guide
								</Link>
							</div>
						) : (
							<div className="relative w-full overflow-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b border-border/50 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
											<th className="h-14 px-8 text-left font-bold">
												Timestamp
											</th>
											<th className="h-14 px-8 text-left font-bold">
												API Key Alias
											</th>
											<th className="h-14 px-8 text-right font-bold">
												Response Status
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border/50">
										{recentActivity.map((log) => (
											<tr
												key={log.id}
												className="group hover:bg-muted/[0.03] transition-colors"
											>
												<td className="px-8 py-5 align-middle text-muted-foreground text-xs font-light tabular-nums">
													{new Date(
														log.createdAt,
													).toLocaleString()}
												</td>
												<td className="px-8 py-5 align-middle">
													<div className="flex items-center gap-3">
														<div className="h-2 w-2 rounded-full bg-primary/40" />
														<span className="font-mono text-[10px] font-bold text-foreground bg-muted/50 px-2 py-1 rounded-lg border border-border/50">
															{log.apiKey.key.substring(
																0,
																8,
															)}
															...
														</span>
													</div>
												</td>
												<td className="px-8 py-5 align-middle text-right">
													<span className="inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 shadow-sm">
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
