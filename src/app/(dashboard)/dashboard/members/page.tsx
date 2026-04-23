"use client";

import { MembersTable } from "@/components/dashboard/project/members-table";
import { InviteMemberDialog } from "@/components/dashboard/project/invite-member-dialog";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/contexts/organization-context";

export default function MembersSettingsPage() {
    const { activeOrganization: activeOrg, isLoadingActive: isPending } = useOrganization()
    const router = useRouter();

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!activeOrg) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-muted-foreground text-center max-w-md">
                    No active project found. Please select or create a project first.
                </p>
                <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                >
                    Go to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Members</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage members and roles in your project.
                    </p>
                </div>
                <InviteMemberDialog />
            </div>

            <MembersTable />
        </div>
    );
}
