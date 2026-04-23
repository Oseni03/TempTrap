"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { User2, Mail, Loader2, ShieldCheck } from "lucide-react";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
    const { data: session, isPending: isLoadingSession } = authClient.useSession();
    const [isUpdating, setIsUpdating] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: session?.user?.name || "",
        },
    });

    // Update form when session data arrives
    if (session?.user?.name && !form.getValues("name") && !form.formState.isDirty) {
        form.setValue("name", session.user.name);
    }

    const onSubmit = async (values: ProfileFormValues) => {
        setIsUpdating(true);
        try {
            await authClient.updateUser({
                name: values.name,
            });
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoadingSession) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and profile information.
                </p>
            </div>

            <div className="md:col-span-4 space-y-8">
                <Card className="border-border/50 shadow-md overflow-hidden bg-card/50 backdrop-blur-md ring-1 ring-white/10">
                    <CardHeader className="border-b border-border/50 bg-muted/20 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-inner group">
                                <User2 className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold tracking-tight">Profile Information</CardTitle>
                                <CardDescription className="text-sm">
                                    Update your account's profile information and email address.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6 pt-8 pb-8 px-8">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Your full name"
                                        {...form.register("name")}
                                        className="h-11 bg-background/40 border-border/50 focus:ring-primary/20 transition-all duration-200"
                                    />
                                    {form.formState.errors.name && (
                                        <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                                            {form.formState.errors.name.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2 opacity-80 backdrop-grayscale-[0.5]">
                                    <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="email"
                                            value={session?.user?.email || ""}
                                            disabled
                                            className="h-11 pl-10 bg-muted/30 cursor-not-allowed border-dashed border-border/50"
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground/60 italic">
                                        Primary email cannot be changed.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t border-border/50 bg-muted/10 py-5 px-8 flex justify-end">
                            <Button
                                type="submit"
                                disabled={isUpdating || !form.formState.isDirty}
                                className="px-8 h-10 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 active:scale-95"
                            >
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Profile
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <Card className="border-border/50 shadow-md bg-card/50 backdrop-blur-md ring-1 ring-white/10 overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-muted/20">
                        <CardTitle className="text-xl font-bold">Preferences</CardTitle>
                        <CardDescription>
                            Customize your dashboard experience.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 pb-6 space-y-6 px-8">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30 border border-border/50 hover:bg-accent/40 transition-colors">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">Theme Preference</p>
                                <p className="text-xs text-muted-foreground">Select how the dashboard looks to you.</p>
                            </div>
                            <Button variant="outline" size="sm" className="h-9 border-border/50 bg-background/50" disabled>
                                System
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
