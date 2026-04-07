"use client";

import {
    ChevronDown,
    Plus,
    Box,
    Check,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";


export function ProjectSwitcher() {
    const { isMobile } = useSidebar();
    const router = useRouter();
    
    const { data: organizations, isPending } = authClient.useListOrganizations();
    const { data: activeOrg } = authClient.useActiveOrganization();

    const handleSwitch = async (orgId: string) => {
        await authClient.organization.setActive({
            organizationId: orgId,
        });
        router.refresh();
    };

    const handleCreateProject = () => {
        // We'll implement a dialog for this later or redirect to a creation page
        router.push("/dashboard/settings/project/new");
    };

    if (isPending) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" className="w-full animate-pulse bg-accent/50 rounded-lg" disabled>
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-accent" />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <div className="h-4 w-24 bg-accent-foreground/10 rounded" />
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground border">
                                <Box className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {activeOrg?.name || "Select Project"}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    Project
                                </span>
                            </div>
                            <ChevronDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Projects
                        </DropdownMenuLabel>
                        {(organizations ?? []).map((org) => (
                            <DropdownMenuItem
                                key={org.id}
                                onClick={() => handleSwitch(org.id)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    <Box className="size-4 shrink-0" />
                                </div>
                                {org.name}
                                {activeOrg?.id === org.id && (
                                    <Check className="ml-auto size-4" />
                                )}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2" onClick={handleCreateProject}>
                            <div className="flex size-6 items-center justify-center rounded-lg border bg-background">
                                <Plus className="size-4" />
                            </div>
                            <div className="font-medium text-muted-foreground">Add Project</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
