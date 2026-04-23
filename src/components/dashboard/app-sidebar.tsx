"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	LayoutDashboard,
	Key,
	Settings,
	LogOut,
	ChevronUp,
	User2,
	BookOpen,
	Sparkles,
} from "lucide-react";
import { useState } from "react";
import { SurveyModal } from "@/components/dashboard/survey-modal";
import {
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectSwitcher } from "@/components/dashboard/project-switcher";
import { authClient } from "@/lib/auth-client";

const NAV_ITEMS = [
	{ name: "Overview", href: "/dashboard", icon: LayoutDashboard },
	{ name: "API Keys", href: "/dashboard/keys", icon: Key },
	{ name: "API Docs", href: "/docs", icon: BookOpen },
	{ name: "Settings", href: "/dashboard/settings", icon: Settings },
	{ name: "Team", href: "/dashboard/members", icon: User2 },
	{ name: "Upgrade", href: "#upgrade", icon: Sparkles, isSurvey: true },
];

export function AppSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { data: session } = authClient.useSession();

	const [surveyOpen, setSurveyOpen] = useState(false);

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/");
	};

	return (
		<Sidebar className="border-r border-border/50 bg-background/50 backdrop-blur-xl">
			<SidebarHeader className="h-16 border-b border-border/50 flex items-center px-6">
				<ProjectSwitcher />
			</SidebarHeader>

			<SidebarContent className="px-4 py-8">
				<SidebarGroup>
					<SidebarGroupLabel className="px-2 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
						Platform
					</SidebarGroupLabel>
					<SidebarGroupContent className="mt-2">
						<SidebarMenu className="gap-2">
							{NAV_ITEMS.map((item) => {
								const isActive =
									pathname === item.href ||
									(item.href !== "/dashboard" &&
										pathname.startsWith(item.href));
								const isSurvey = (item as any).isSurvey;

								return (
									<SidebarMenuItem key={item.name}>
										<SidebarMenuButton
											asChild={!isSurvey}
											isActive={isActive}
											tooltip={item.name}
											onClick={
												isSurvey
													? () => setSurveyOpen(true)
													: undefined
											}
											className={`
                                                relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                                                ${
													isActive
														? "bg-primary/10 text-primary font-semibold shadow-sm"
														: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
												}
                                                ${isSurvey ? "cursor-pointer" : ""}
                                            `}
										>
											{isSurvey ? (
												<div className="flex items-center gap-3 w-full">
													<div
														className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? "bg-primary/20" : "bg-muted/50 group-hover:bg-muted"}`}
													>
														<item.icon className="h-4 w-4 text-primary" />
													</div>
													<span className="text-sm tracking-tight font-semibold text-primary">
														{item.name}
													</span>
												</div>
											) : (
												<Link
													href={item.href}
													className="flex items-center gap-3 w-full"
												>
													<div
														className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"}`}
													>
														<item.icon className="h-4 w-4" />
													</div>
													<span className="text-sm tracking-tight">
														{item.name}
													</span>
												</Link>
											)}
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="border-t border-border/50 p-6 bg-muted/[0.02]">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton className="w-full h-14 flex items-center justify-between hover:bg-muted/50 border border-transparent hover:border-border/50 rounded-2xl transition-all duration-300 px-4 group">
									<div className="flex items-center gap-4">
										<div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center border border-border/50 group-hover:scale-105 transition-transform">
											<User2 className="h-5 w-5 text-muted-foreground/60" />
										</div>
										<div className="flex flex-col text-left overflow-hidden">
											<span className="text-xs font-bold truncate text-foreground group-hover:text-primary transition-colors">
												{session?.user?.name || "User"}
											</span>
											<span className="text-[10px] text-muted-foreground/60 truncate tracking-tight font-medium">
												{session?.user?.email ||
													"user@example.com"}
											</span>
										</div>
									</div>
									<ChevronUp className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="right"
								align="end"
								className="w-64 mb-4 p-2 bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200"
							>
								<div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 border-b border-border/50 mb-2">
									Account Settings
								</div>
								<DropdownMenuItem asChild>
									<Link
										href="/settings"
										className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl hover:bg-muted transition-colors duration-150"
									>
										<Settings className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm font-medium">
											Settings
										</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={handleSignOut}
									className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl text-destructive hover:bg-destructive/10 transition-colors duration-150"
								>
									<LogOut className="h-4 w-4" />
									<span className="text-sm font-bold">
										Sign Out
									</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SurveyModal open={surveyOpen} onOpenChange={setSurveyOpen} />
		</Sidebar>
	);
}
