import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ApiKeyManager } from "@/components/dashboard/api-key-manager";

export default async function ApiKeysPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const apiKeys = await prisma.apiKey.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    // Cast Prisma Date to string as needed for JS object transfer (though BetterAuth types might handle it)
    const formattedKeys = apiKeys.map((key) => ({
        ...key,
        // Prisma returns Date objects, but for client components we might need to handle serializability 
        // if not using Next.js 14+ RSC to Client boundary features correctly.
        // However, standard Next.js 14 RSC to Client can handle Date objects.
    }));

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">API Management</h1>
                <p className="text-sm text-muted-foreground font-light">
                    Manage your access tokens for the Temp verification service.
                </p>
            </header>

            <ApiKeyManager initialKeys={formattedKeys as any} />
        </div>
    );
}
