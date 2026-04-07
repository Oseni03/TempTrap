"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		await authClient.signIn.email({
			email,
			password,
			callbackURL: "/dashboard",
		}, {
			onRequest: () => setLoading(true),
			onResponse: () => setLoading(false),
			onSuccess: () => {
				toast.success("Signed in successfully!");
				router.push("/dashboard");
			},
			onError: (ctx) => {
				toast.error(ctx.error.message);
			},
		});
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<Card className="w-full max-w-md border-border bg-card shadow-none">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold tracking-tight">Sign in</CardTitle>
					<CardDescription>
						Enter your email below to sign in to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSignIn} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="bg-background"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="bg-background"
							/>
						</div>
						<Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Sign In
						</Button>
					</form>
					<div className="mt-4 text-center text-sm text-muted-foreground">
						Don't have an account?{" "}
						<Link href="/sign-up" className="font-medium text-foreground hover:underline">
							Sign Up
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
