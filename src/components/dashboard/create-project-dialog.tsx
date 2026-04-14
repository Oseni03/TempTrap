"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Box, Loader2 } from "lucide-react";
import { useOrganization } from "@/contexts/organization-context";

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

interface CreateProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
    const router = useRouter();
    const { createOrganization, setActiveOrganization } = useOrganization()
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<z.infer<typeof projectSchema>>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: "",
            slug: "",
        },
    });

    React.useEffect(() => {
        if (open) {
            form.reset({ name: "", slug: "" });
        }
    }, [open, form]);

    async function onSubmit(data: z.infer<typeof projectSchema>) {
        setIsLoading(true);
        try {
            const { data: organization, error } = await createOrganization({
                name: data.name,
                slug: data.slug,
                createdAt: new Date()
            });

            if (error) {
                toast.error(error.message || "Failed to create project");
                return;
            }

            if (organization) {
                toast.success("Project created successfully");
                // Set the new organization as active
                await setActiveOrganization(organization.id);
                onOpenChange(false);
                router.refresh();
            }
        } catch (_error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    const watchName = form.watch("name");
    React.useEffect(() => {
        const autoSlug = watchName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        form.setValue("slug", autoSlug, { shouldValidate: true });
    }, [watchName, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Box className="h-5 w-5 text-primary" />
                        Create New Project
                    </DialogTitle>
                    <DialogDescription>
                        Give your project a name and a unique URL slug.
                    </DialogDescription>
                </DialogHeader>
                <form id="create-project-form" onSubmit={form.handleSubmit(onSubmit)} className="py-4">
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
                                        onChange={(e) => {
                                            field.onChange(e);
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
                                        readOnly
                                        disabled
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
                <DialogFooter className="flex justify-between sm:justify-between items-center sm:items-center">
                    <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" form="create-project-form" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
