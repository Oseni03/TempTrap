import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Search, Activity, Zap } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default async function LandingPage() {
	return (
		<div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10 font-sans">
			<Header />

			<main className="flex-1">
				{/* Hero Section */}
				<section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden flex flex-col items-center">
					{/* Background Glow */}
					<div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-full max-w-7xl aspect-video bg-primary/20 blur-[120px] rounded-full opacity-20 pointer-events-none" />

					<div className="max-w-7xl mx-auto px-6 text-center relative z-10">
						<div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-border/50 bg-muted/30 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-10 animate-in-fade">
							<div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
							Reliable Verification Infrastructure
						</div>

						<h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 max-w-5xl mx-auto leading-[0.9] text-gradient">
							Stop fake signups <br className="hidden md:block" />
							at the threshold.
						</h1>

						<p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light animate-in-slide-up">
							The fastest, developer-first API to identify fraud
							and disposable email addresses in real-time. Reach
							your real users, instantly.
						</p>

						<div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16 animate-in-slide-up">
							<Button
								asChild
								size="lg"
								className="rounded-full px-10 h-14 text-base font-semibold shadow-2xl shadow-primary/20"
							>
								<Link href="/sign-up">
									Start verifying free{" "}
									<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								size="lg"
								className="rounded-full px-10 h-14 text-base border-border/50 hover:bg-muted/30 transition-all"
							>
								<Link href="/docs">View documentation</Link>
							</Button>
						</div>

						{/* Social Proof Intro */}
						<div className="pt-10 border-t border-border/30 w-full animate-in-fade">
							<p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 mb-8">
								Trusted by developers at
							</p>
							<div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-40 grayscale contrast-125">
								{/* Placeholders for logos */}
								<div className="text-2xl font-black italic tracking-tighter">
									VERCEL
								</div>
								<div className="text-2xl font-black italic tracking-tighter">
									STRIPE
								</div>
								<div className="text-2xl font-black italic tracking-tighter">
									GITHUB
								</div>
								<div className="text-2xl font-black italic tracking-tighter">
									LINEAR
								</div>
								<div className="text-2xl font-black italic tracking-tighter">
									SUPABASE
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Features Section - Bento Grid */}
				<section id="features" className="py-24 md:py-40 relative">
					<div className="max-w-7xl mx-auto px-6">
						<div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20 animate-in-fade">
							<div className="max-w-2xl">
								<h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
									Designed for scale.
								</h2>
								<p className="text-lg text-muted-foreground leading-relaxed font-light">
									We handle the complex domain intelligence so
									you can focus on building your product with
									high-quality user data.
								</p>
							</div>
							<Link
								href="/docs"
								className="group flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
							>
								Explore full capabilities{" "}
								<div className="h-0.5 w-4 bg-primary group-hover:w-6 transition-all" />
							</Link>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{/* Feature: Domain Intelligence */}
							<div className="bento-card flex flex-col justify-end group">
								<div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
									<Search className="h-24 w-24 text-primary" />
								</div>
								<div className="relative z-10">
									<div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
										<Search className="h-5 w-5 text-primary" />
									</div>
									<h3 className="text-xl font-bold mb-3 tracking-tight">
										Domain Intelligence
									</h3>
									<p className="text-sm text-muted-foreground font-light leading-relaxed">
										Detect throwaway emails with advanced
										domain monitoring.
									</p>
								</div>
							</div>

							{/* Feature: Speed */}
							<div className="bento-card group">
								<div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 border border-orange-500/20">
									<Activity className="h-5 w-5 text-orange-500" />
								</div>
								<h3 className="text-xl font-bold mb-3 tracking-tight">
									Edge Performance
								</h3>
								<p className="text-sm text-muted-foreground font-light leading-relaxed">
									Sub-50ms latency worldwide with our global
									network.
								</p>
							</div>

							{/* Feature: Data Quality */}
							<div className="bento-card group">
								<div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
									<Zap className="h-5 w-5 text-blue-500" />
								</div>
								<h3 className="text-xl font-bold mb-3 tracking-tight">
									Clean Pipelines
								</h3>
								<p className="text-sm text-muted-foreground font-light leading-relaxed">
									Ensure high-quality users with verified
									data.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Pricing Section */}
				<section id="pricing" className="py-24 md:py-40">
					<div className="max-w-7xl mx-auto px-6 text-center">
						<div className="max-w-3xl mx-auto mb-20 animate-in-fade">
							<h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-gradient">
								Simple, transparent scale.
							</h2>
							<p className="text-lg text-muted-foreground font-light leading-relaxed">
								No complex tiers or hidden restrictions. Simple
								usage-based pricing that grows as your business
								scales.
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-8 text-left h-full">
							{[
								{
									name: "Developer",
									price: "0",
									desc: "Perfect for hobby projects",
									features: [
										"1,000 monthly checks",
										"Standard detection",
										"API Access",
										"Community Support",
									],
								},
								{
									name: "Pro",
									price: "49",
									desc: "For growing production apps",
									features: [
										"50,000 monthly checks",
										"Advanced Intelligence",
										"Priority Support",
										"Detailed Metadata",
									],
									popular: true,
								},
								{
									name: "Enterprise",
									price: "Custom",
									desc: "Unlimited scale for teams",
									features: [
										"Unlimited monthly checks",
										"Custom SLAs",
										"Dedicated Account Manager",
										"On-premise Options",
									],
								},
							].map((plan) => (
								<div
									key={plan.name}
									className={`relative flex flex-col p-8 rounded-3xl border ${plan.popular ? "border-primary ring-1 ring-primary/20 bg-primary/[0.02]" : "border-border/50 bg-background/50 hover:border-primary/20"} transition-all group`}
								>
									{plan.popular && (
										<div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-primary text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-lg">
											Most Popular
										</div>
									)}
									<div className="mb-8">
										<h3 className="text-xl font-bold mb-2">
											{plan.name}
										</h3>
										<p className="text-sm text-muted-foreground font-light">
											{plan.desc}
										</p>
									</div>
									<div className="mb-8 flex items-baseline gap-1">
										<span className="text-4xl font-bold tracking-tight">
											{plan.price === "Custom" ? "" : "$"}
										</span>
										<span className="text-5xl font-bold tracking-tight">
											{plan.price}
										</span>
										{plan.price !== "Custom" && (
											<span className="text-muted-foreground font-light">
												/mo
											</span>
										)}
									</div>
									<ul className="space-y-4 mb-10 flex-1">
										{plan.features.map((f) => (
											<li
												key={f}
												className="flex items-center gap-3 text-sm font-light"
											>
												<div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
													<Check className="h-3 w-3 text-primary" />
												</div>
												{f}
											</li>
										))}
									</ul>
									<Button
										asChild
										variant={
											plan.popular ? "default" : "outline"
										}
										className="w-full h-12 rounded-full font-bold shadow-lg"
									>
										<Link href="/sign-up">
											{plan.price === "Custom"
												? "Contact sales"
												: "Get started"}
										</Link>
									</Button>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section className="py-24 md:py-40 bg-muted/20 border-y border-border/50">
					<div className="max-w-4xl mx-auto px-6">
						<h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16 text-center">
							Frequently asked questions
						</h2>
						<div className="space-y-4">
							{[
								{
									q: "How fast is the verification API?",
									a: "Extremely. Our global edge network ensures a sub-50ms response time for 99% of requests.",
								},
								{
									q: "How often is the database updated?",
									a: "Every 15 minutes. We monitor domain registrations and throwaway providers around the clock.",
								},
								{
									q: "Is there a free trial?",
									a: "Yes, every developer account starts with 1,000 free monthly verifications. No credit card required.",
								},
								{
									q: "Do you offer bulk enterprise rates?",
									a: "We do. For high-volume users requiring custom SLAs or on-premise solutions, please contact our enterprise team.",
								},
							].map((item, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<div
									key={i}
									className="p-8 rounded-2xl border border-border/50 bg-background/50 group hover:border-primary/20 transition-all"
								>
									<h3 className="text-lg font-bold mb-4 flex items-center justify-between">
										{item.q}
									</h3>
									<p className="text-muted-foreground font-light leading-relaxed">
										{item.a}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Final CTA */}
				<section className="py-32 md:py-48 relative overflow-hidden text-center bg-foreground text-background">
					<div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full translate-y-1/2 pointer-events-none" />
					<div className="max-w-4xl mx-auto px-6 relative z-10">
						<h2 className="text-5xl md:text-8xl font-bold tracking-tight mb-12 leading-[0.9]">
							Ready to clean <br /> your database?
						</h2>
						<div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
							<Button
								asChild
								size="lg"
								variant="secondary"
								className="rounded-full px-12 h-16 text-lg font-bold shadow-2xl"
							>
								<Link href="/sign-up">
									Create your free account
								</Link>
							</Button>
						</div>
						<p className="mt-10 text-background/40 font-mono text-[10px] uppercase tracking-[0.3em]">
							No credit card required &bull; 1k free monthly
							checks
						</p>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
}
