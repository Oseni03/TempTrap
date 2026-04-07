"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Key,
    LogOut,
    Menu,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "API Keys", href: "/dashboard/keys", icon: Key },
    // { name: "Usage History", href: "/dashboard/history", icon: History },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/");
    };

    return (
        <div className="flex min-h-screen bg-background font-sans">
            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all duration-300 md:hidden animate-in fade-in cursor-default"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-label="Close sidebar"
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card transition-transform duration-300 md:relative md:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center px-6 border-b border-border">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <span>Temp</span>
                    </Link>
                </div>
                <nav className="flex flex-col gap-1 p-4">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                    pathname === item.href
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2 mt-4 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors group"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="flex h-16 items-center justify-between px-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="mr-4 md:hidden"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h2 className="text-lg font-semibold tracking-tight">
                            {NAV_ITEMS.find(i => i.href === pathname)?.name || "Dashboard"}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* User Profile or Notification Placeholder */}
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-6xl mx-auto h-full space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
