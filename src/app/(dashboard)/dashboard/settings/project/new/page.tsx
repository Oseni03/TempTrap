"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Box, Loader2 } from "lucide-react";

const projectSchema = z.object({
    name: z
        .string()
        .min(2, "Project name must be at least 2 characters.")
        .max(32, "Project name must be at most 32 characters."),
    slug: z
        .string()
        .min(2, "Slug must be at least 2 characters.")
        .max(32, "Slug must be at most 32 characters.")
        .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens."),
});

export default function CreateProjectPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<z.infer<typeof projectSchema>>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: "",
            slug: "",
        },
    });

    async function onSubmit(data: z.infer<typeof projectSchema>) {
        setIsLoading(true);
        try {
            const { data: organization, error } = await authClient.organization.create({
                name: data.name,
                slug: data.slug,
            });

            if (error) {
                toast.error(error.message || "Failed to create project");
                return;
            }

            if (organization) {
                toast.success("Project created successfully");
                // Set the new organization as active
                await authClient.organization.setActive({
                    organizationId: organization.id,
                });
                router.push("/dashboard/settings/project");
                router.refresh();
            }
        } catch (_error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    // Auto-slugify the name if slug is empty or matches previous auto-slug
    const watchName = form.watch("name");
    React.useEffect(() => {
        const slug = form.getValues("slug");
        const autoSlug = watchName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        if (!slug || slug === watchName.toLowerCase().slice(0, -1).replace(/[^a-z0-9]+/g, "-")) {
            form.setValue("slug", autoSlug, { shouldValidate: true });
        }
    }, [watchName, form]);

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => router.back()}
                >
                    &larr; Back
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
                <p className="text-muted-foreground mt-2">
                    A project allows you to group your API keys and collaborate with team members.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Box className="h-5 w-5 text-primary" />
                        Project Details
                    </CardTitle>
                    <CardDescription>
                        Give your project a name and a unique URL slug.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="create-project-form" onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="project-name">
                                            Project Name
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="project-name"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="My Awesome Project"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                // Auto-generate slug if not touched
                                                if (!form.formState.dirtyFields.slug) {
                                                    const slugified = e.target.value
                                                        .toLowerCase()
                                                        .replace(/\s+/g, '-')
                                                        .replace(/[^a-z0-9-]/g, '');
                                                    form.setValue("slug", slugified);
                                                }
                                            }}
                                            autoComplete="off"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="slug"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="project-slug">
                                            Project Slug
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="project-slug"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="my-awesome-project"
                                            autoComplete="off"
                                        />
                                        <FieldDescription>The unique identifier for your project used in URLs.</FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="ghost" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" form="create-project-form" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Project
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
