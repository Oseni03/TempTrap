"use client";

import React, {
    createContext,
    useContext,
    useMemo,
    type ReactNode,
} from "react";
import { authClient } from "@/lib/auth-client";
import { Organization, OrganizationInput } from "better-auth/plugins";
import { useRouter } from "next/navigation";
import { getActiveOrganization } from "@/server/organizations";

/** Full active organization shape returned by Better Auth + your custom fields. */
export type ActiveOrganization = {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    logo?: string | null | undefined | undefined;
    metadata?: any;
    members: Array<{
        id: string;
        userId: string;
        role: string;
        createdAt: Date;
        user: { id: string; name: string; email: string; image?: string | null };
    }>;
};

/** Shape of a member's own membership record in the active org. */
export interface ActiveMember {
    id: string;
    userId: string;
    organizationId: string;
    role: "owner" | "admin" | "member" | string;
    createdAt: Date;
}

// ---------------------------------------------------------------------------
// Context value
// ---------------------------------------------------------------------------

interface OrganizationContextValue {
    /** The currently active organization (null if none selected). */
    activeOrganization: ActiveOrganization | null;
    /** True while the active organization is being fetched. */
    isLoadingActive: boolean;

    /** All organizations the current user belongs to. */
    organizations: Organization[]
    /** True while the organization list is being fetched. */
    isLoadingList: boolean;

    /** The current user's membership record in the active organization. */
    activeMember: ActiveMember | null;
    /** True while the active member record is being fetched. */
    isLoadingMember: boolean;

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Switch the active organization. */
    setActiveOrganization: (organizationId: string) => Promise<void>;

    /** Query organization. */
    getFullOrganization: (
        userId: string,
        query: Partial<{
            organizationId?: string | undefined;
            organizationSlug?: string | undefined;
            membersLimit?: string | number | undefined;
        }>
    ) => Promise<{
        data: ActiveOrganization
    }>;

    /** Create a new organization with your custom fields. */
    createOrganization: (
        data: OrganizationInput
    ) => Promise<{
        data?: any, error: {
            code?: string | undefined;
            message?: string | undefined;
            status: number;
            statusText: string;
        } | null
    }>;

    /** Update the active organization's data. */
    updateOrganization: (
        data: Partial<OrganizationInput>
    ) => Promise<void>;

    /** Invite a member to the active organization. */
    inviteMember: (email: string, role?: "admin" | "member") => Promise<void>;

    /** Remove a member from the active organization by email or member ID. */
    removeMember: (emailOrMemberId: string) => Promise<void>;

    /** Promote / demote a member's role. */
    updateMemberRole: (
        memberId: string,
        role: "owner" | "admin" | "member"
    ) => Promise<void>;

    /** Check whether the current member has a specific permission. */
    hasPermission: (
        permission: Record<string, string[]>
    ) => Promise<boolean>;

    // ── Derived helpers ───────────────────────────────────────────────────────

    /** True if the current user is an owner of the active organization. */
    isOwner: boolean;

    /** True if the current user is an admin or owner of the active organization. */
    isAdmin: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const OrganizationContext = createContext<OrganizationContextValue | null>(
    null
);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const { data: rawActive, isPending: isLoadingActive } =
        authClient.useActiveOrganization();
    const { data: rawList, isPending: isLoadingList } =
        authClient.useListOrganizations();
    const { data: rawMember, isPending: isLoadingMember } =
        authClient.useActiveMember();

    const router = useRouter()

    // Cast to our typed shape (Better Auth merges additionalFields at runtime)
    const activeOrganization = rawActive as ActiveOrganization
    const activeMember = rawMember
    const organizations = rawList ?? []

    // ── Derived values ────────────────────────────────────────────────────────

    const isOwner = activeMember?.role === "owner";
    const isAdmin = isOwner || activeMember?.role === "admin";

    // ── Actions ───────────────────────────────────────────────────────────────

    const setActiveOrganization = async (organizationId: string) => {
        await authClient.organization.setActive({ organizationId });
        router.refresh()
    };

    const getFullOrganization = async (
        userId: string,
        query: Partial<{
            organizationId?: string | undefined;
            organizationSlug?: string | undefined;
            membersLimit?: string | number | undefined;
        }>
    ) => {
        let activeOrg = (await authClient.organization.getFullOrganization({
            query
        })).data as ActiveOrganization
        if (!activeOrg) {
            activeOrg = await getActiveOrganization(userId) as ActiveOrganization
        }

        return { data: activeOrg }
    }

    const createOrganization = async (
        data: Parameters<OrganizationContextValue["createOrganization"]>[0]
    ) => {
        const { data: resp, error } = await authClient.organization.create(data as never);
        return { data: resp, error }
    };

    const updateOrganization = async (
        data: Partial<OrganizationInput>
    ) => {
        if (!activeOrganization) return;
        await authClient.organization.update({
            organizationId: activeOrganization.id,
            data: data as never,
        });
    };

    const inviteMember = async (
        email: string,
        role: "admin" | "member" = "member"
    ) => {
        await authClient.organization.inviteMember({ email, role });
    };

    const removeMember = async (emailOrMemberId: string) => {
        await authClient.organization.removeMember({
            memberIdOrEmail: emailOrMemberId,
        });
    };

    const updateMemberRole = async (
        memberId: string,
        role: "owner" | "admin" | "member"
    ) => {
        await authClient.organization.updateMemberRole({ memberId, role });
    };

    const hasPermission = async (
        permission: Record<string, string[]>
    ): Promise<boolean> => {
        const result = await authClient.organization.hasPermission({ permissions: permission });
        return result.data?.success ?? false;
    };

    // ── Context value ─────────────────────────────────────────────────────────

    const value = useMemo<OrganizationContextValue>(
        () => ({
            activeOrganization,
            isLoadingActive,
            organizations,
            isLoadingList,
            activeMember,
            isLoadingMember,
            setActiveOrganization,
            getFullOrganization,
            createOrganization,
            updateOrganization,
            inviteMember,
            removeMember,
            updateMemberRole,
            hasPermission,
            isOwner,
            isAdmin,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            activeOrganization,
            isLoadingActive,
            organizations,
            isLoadingList,
            activeMember,
            isLoadingMember,
            isOwner,
            isAdmin,
        ]
    );

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the organization context from any client component.
 *
 * @example
 * const { activeOrganization, isAdmin, updateOrganization } = useOrganization();
 */
export function useOrganization(): OrganizationContextValue {
    const ctx = useContext(OrganizationContext);
    if (!ctx) {
        throw new Error(
            "useOrganization must be used inside <OrganizationProvider>. " +
            "Wrap your layout or page with <OrganizationProvider>."
        );
    }
    return ctx;
}