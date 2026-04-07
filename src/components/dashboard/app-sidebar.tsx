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
        <Sidebar>
            <SidebarHeader className="border-b border-border/50">

                <ProjectSwitcher />
            </SidebarHeader>


            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                        General
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {NAV_ITEMS.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.href}
                                        tooltip={item.name}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-border/50 p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="w-full h-12 flex items-center justify-between hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-150">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center border">
                                            <User2 className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col text-left overflow-hidden">
                                            <span className="text-sm font-semibold truncate leading-none mb-1">
                                                {session?.user?.name || "User"}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground truncate leading-none">
                                                {session?.user?.email || "user@example.com"}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronUp className="h-4 w-4 opacity-50" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width] mb-2 p-1 bg-popover/95 backdrop-blur-sm border rounded-lg z-50"
                            >
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-150">
                                        <Settings className="h-4 w-4" />
                                        <span>Account Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg text-destructive hover:bg-destructive/10 transition-colors duration-150"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
