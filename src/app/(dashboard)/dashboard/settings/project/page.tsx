"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const projectSchema = z.object({
    name: z.string().min(2, {
        message: "Project name must be at least 2 characters.",
    }),
});

export default function ProjectSettingsPage() {
    const { data: activeOrg, isPending } = authClient.useActiveOrganization();
    const router = useRouter();

    const form = useForm<z.infer<typeof projectSchema>>({
        resolver: zodResolver(projectSchema),
        values: {
            name: activeOrg?.name || "",
        },
    });

    async function onSubmit(values: z.infer<typeof projectSchema>) {
        if (!activeOrg) return;

        try {
            await authClient.organization.update({
                data: {
                    name: values.name,
                },
            });
            toast.success("Project updated successfully");
            router.refresh();
        } catch (_error) {
            toast.error("Failed to update project");
        }
    }

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
                <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Project Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your project settings and configuration.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General</CardTitle>
                    <CardDescription>
                        Update your project's name and identity.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FieldGroup>
                            <Controller
                                control={form.control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="project-name">Project Name</FieldLabel>
                                        <Input
                                            {...field}
                                            id="project-name"
                                            placeholder="My Project"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <FieldDescription>
                                            This is the display name of your project.
                                        </FieldDescription>
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
