import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { apiKey } from "@better-auth/api-key";
import { organization } from "better-auth/plugins";
import { prisma } from "@/lib/db";
import { nextCookies } from "better-auth/next-js";
import { createOrganization } from "@/server/organizations";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await createOrganization(user.id, {
                        name: "Personal Project", 
                        slug: `project-${Math.random().toString(36).substring(2, 10)}`
                    })
                },
            },
        },
    },
    plugins: [
        apiKey({
            requireName: true,
            rateLimit: {
                enabled: true,
                timeWindow: 1000 * 60 * 1, // 1 minute
                maxRequests: 10, // 10 requests per minute
            },
            references: "user",
        }),
        organization(),
        nextCookies(),
    ],
});

