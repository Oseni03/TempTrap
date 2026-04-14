import { Polar } from "@polar-sh/sdk";

export const polarServer = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN || "test",
    server: "sandbox",
});

/**
 * Checks if the specified organization has an active Polar subscription.
 * Note: This uses the Polar Admin API to verify the status securely on the server side.
 */
export async function checkOrganizationProAccess(organizationId: string): Promise<boolean> {
    if (!organizationId) return false;

    try {
        // List active subscriptions
        // The BetterAuth plugin stores the referenceId in the subscription metadata
        const response = await polarServer.subscriptions.list({
            active: true,
            limit: 100, 
        });

        if (!response.result.items) {
            return false;
        }

        // Check if any active subscription has the referenceId equal to our organizationId
        const hasSub = response.result.items.some(sub => 
            sub.metadata && sub.metadata.referenceId === organizationId
        );

        return hasSub;
    } catch (error) {
        console.error("[Billing Check] Failed to verify subscription:", error);
        return false;
    }
}
