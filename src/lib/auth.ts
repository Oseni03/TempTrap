import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { apiKey } from "@better-auth/api-key";
import { organization } from "better-auth/plugins";
import { prisma } from "@/lib/db";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true
    },
    plugins: [
        apiKey(),
        organization(),
    ],
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await auth.api.createOrganization({
                        headers: new Headers(),
                        body: {
                            name: "Personal Project",
                            userId: user.id,
                            slug: `project-${Math.random().toString(36).substring(2, 10)}`,
                            keepCurrentActiveOrganization: true
                        },
                    });
                },
            },
        },
    },
});

