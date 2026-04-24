"use server";

import { prisma } from "@/lib/db";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export async function getDashboardData(organizationId: string) {
	// 1. Fetch all usage logs for the last 30 days to calculate metrics in memory
	// (Given the low volume of checks for free tier, this is efficient)
	const now = new Date();
	const thirtyDaysAgo = subDays(now, 30);
	const sixtyDaysAgo = subDays(now, 60);

	const logs = await prisma.usageLog.findMany({
		where: {
			apiKey: {
				referenceId: organizationId,
			},
			createdAt: {
				gte: sixtyDaysAgo,
			},
		},
		orderBy: {
			createdAt: "asc",
		},
	});

	// Current period (last 30 days)
	const currentLogs = logs.filter((l) => l.createdAt >= thirtyDaysAgo);
	// Previous period (30-60 days ago)
	const previousLogs = logs.filter(
		(l) => l.createdAt < thirtyDaysAgo && l.createdAt >= sixtyDaysAgo,
	);

	const totalChecks = currentLogs.length;
	const prevTotalChecks = previousLogs.length;
	const totalGrowth =
		prevTotalChecks === 0
			? totalChecks > 0
				? 100
				: 0
			: ((totalChecks - prevTotalChecks) / prevTotalChecks) * 100;

	const riskDetected = currentLogs.filter((l) => l.isDisposable).length;
	const prevRiskDetected = previousLogs.filter((l) => l.isDisposable).length;
	const riskGrowth =
		prevRiskDetected === 0
			? riskDetected > 0
				? 100
				: 0
			: ((riskDetected - prevRiskDetected) / prevRiskDetected) * 100;

	// 2. Prepare 7-day chart data
	const last7Days = Array.from({ length: 7 }, (_, i) => {
		const date = subDays(now, 6 - i);
		const dateStr = format(date, "MMM dd");
		const dayLogs = currentLogs.filter(
			(l) =>
				l.createdAt >= startOfDay(date) &&
				l.createdAt <= endOfDay(date),
		);

		return {
			date: dateStr,
			total: dayLogs.length,
			blocked: dayLogs.filter((l) => l.isDisposable).length,
		};
	});

	// 3. Status distribution for the current period
	const disposableCount = currentLogs.filter((l) => l.isDisposable).length;
	const cleanCount = totalChecks - disposableCount;

	const distribution = [
		{ name: "Clean", value: cleanCount },
		{ name: "Disposable", value: disposableCount },
		// Placeholder for "Invalid" if we had that signal
		{ name: "Invalid", value: 0 },
	];

	return {
		stats: {
			totalChecks,
			totalGrowth: Math.round(totalGrowth * 10) / 10,
			riskDetected,
			riskGrowth: Math.round(riskGrowth * 10) / 10,
			avgLatency: 24, // Mock for now
			successRate: 99.9, // Mock for now
		},
		chartData: last7Days,
		distribution,
	};
}

export async function getRecentActivity(organizationId: string) {
	const recentActivity = await prisma.usageLog.findMany({
		where: {
			apiKey: {
				referenceId: organizationId,
			},
		},
		take: 5,
		orderBy: { createdAt: "desc" },
		include: {
			apiKey: true,
		},
	});

	return recentActivity;
}
