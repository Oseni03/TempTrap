"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "API Keys", href: "/dashboard/keys" },
    { name: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background text-foreground antialiased w-full">
                <AppSidebar />
                <SidebarInset className="flex flex-col min-w-0 bg-background">
                    <header className="flex h-14 items-center gap-4 px-6 border-b border-border bg-background sticky top-0 z-10">
                        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
                        <Separator orientation="vertical" className="mr-2 h-4 bg-border/50" />
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest px-1">
                                {pathname.split('/').filter(Boolean).slice(0, -1).join(' / ') || "App"}
                            </span>
                            <span className="text-muted-foreground font-light">/</span>
                            <h2 className="text-sm font-semibold tracking-tight text-foreground">
                                {NAV_ITEMS.find(i => i.href === pathname)?.name || pathname.split('/').pop()?.replace(/-/g, ' ') || "Dashboard"}
                            </h2>
                        </div>
                    </header>
                    <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
                        <div className="max-w-5xl mx-auto h-full space-y-8">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
