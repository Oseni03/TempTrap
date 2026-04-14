"use server"

import { prisma } from "@/lib/db";

export async function createOrganization(
    userId: string,
    data: { name: string; slug: string }
) {
    try {
        // Direct database creation bypassing auth API
        const organization = await prisma.organization.create({
            data: {
                name: data.name,
                slug: data.slug,
                createdAt: new Date(),
                members: {
                    create: {
                        userId: userId,
                        role: "admin",
                        createdAt: new Date()
                    },
                },
            },
            include: {
                members: true,
            },
        });

        return { data: organization, success: true };
    } catch (error) {
        console.error("Error creating organization: ", error);
        return { success: false, error };
    }
}

export async function getActiveOrganization(userId: string) {
	const memberUser = await prisma.member.findFirst({
		where: {
			userId,
		},
	});

	if (!memberUser) {
		return null;
	}

	const activeOrganization = await prisma.organization.findFirst({
		where: { id: memberUser.organizationId },
		include: {
			members: {
				include: {
					user: true,
				},
			},
            invitations: true
		},
	});

	return { ...activeOrganization, role: memberUser.role };
}