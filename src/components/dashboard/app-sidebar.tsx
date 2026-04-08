"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Key,
    Settings,
    LogOut,
    ShieldCheck,
    ChevronUp,
    User2,
} from "lucide-react";
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
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "API Keys", href: "/dashboard/keys", icon: Key },
    { name: "Project Setttings", href: "/dashboard/settings/project", icon: Settings },
    { name: "Members", href: "/dashboard/settings/project/members", icon: User2 },
];


export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = authClient.useSession();

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/");
    };

    return (
        <Sidebar className="border-r border-border bg-background">
            <SidebarHeader className="h-14 border-b border-border flex items-center px-4">
                <ProjectSwitcher />
            </SidebarHeader>

            <SidebarContent className="px-3 py-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                        Overview
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="mt-1">
                        <SidebarMenu className="gap-1">
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.name}
                                            className={`
                                                relative flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200
                                                ${isActive 
                                                    ? "bg-primary/5 text-primary font-medium" 
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}
                                            `}
                                        >
                                            <Link href={item.href}>
                                                <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                                                <span className="text-sm tracking-tight">{item.name}</span>
                                                {isActive && (
                                                    <div className="absolute right-2 h-1 w-1 rounded-full bg-primary" />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-border p-4 bg-muted/20">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="w-full h-12 flex items-center justify-between hover:bg-background border border-transparent hover:border-border rounded-lg transition-all duration-200 px-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-md bg-background flex items-center justify-center border border-border">
                                            <User2 className="h-4 w-4 text-muted-foreground font-light" />
                                        </div>
                                        <div className="flex flex-col text-left overflow-hidden">
                                            <span className="text-xs font-semibold truncate text-foreground">
                                                {session?.user?.name || "User"}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground truncate tracking-tight">
                                                {session?.user?.email || "user@example.com"}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronUp className="h-3 w-3 text-muted-foreground" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="right"
                                align="end"
                                className="w-56 mb-2 p-1 bg-background border border-border rounded-xl shadow-none z-50 animate-in fade-in zoom-in-95 duration-200"
                            >
                                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground border-b border-border/50 mb-1">
                                    Account
                                </div>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg hover:bg-muted transition-colors duration-150">
                                        <Settings className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg text-destructive hover:bg-destructive/5 transition-colors duration-150"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="text-sm">Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
