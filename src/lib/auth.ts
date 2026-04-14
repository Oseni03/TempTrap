import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { apiKey } from "@better-auth/api-key";
import { organization } from "better-auth/plugins";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { prisma } from "@/lib/db";
import { nextCookies } from "better-auth/next-js";
import { createOrganization } from "@/server/organizations";

const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN || "test",
    server: 'sandbox', 
});

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
        apiKey(),
        organization(),
        polar({
            client: polarClient,
            createCustomerOnSignUp: false,
            use: [
                checkout({
                    products: [
                        { slug: "pro", productId: process.env.POLAR_PRO_PRODUCT_ID || "prod_T9111342125217" }
                    ],
                    successUrl: "/dashboard/settings/project/billing?checkout_id={CHECKOUT_ID}",
                    authenticatedUsersOnly: true
                }),
                portal(),
                usage(),
                webhooks({
                    secret: process.env.POLAR_WEBHOOK_SECRET!,
                })
            ],
        }),
        nextCookies(),
    ],
});

