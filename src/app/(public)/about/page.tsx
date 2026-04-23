import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="max-w-4xl mx-auto px-6 py-24">
				<div className="space-y-8">
					<div className="space-y-4">
						<h1 className="text-5xl md:text-6xl font-bold tracking-tight">
							About TempTrap
						</h1>
						<p className="text-xl text-muted-foreground font-light">
							Building the trust layer for the modern web.
						</p>
					</div>
				</div>
			</section>

			{/* Mission Section */}
			<section className="max-w-4xl mx-auto px-6 py-20 border-t border-border/30">
				<div className="space-y-12">
					<div>
						<h2 className="text-3xl font-bold mb-6">Our Mission</h2>
						<p className="text-lg text-muted-foreground font-light leading-relaxed mb-6">
							In a world where data integrity and security matter
							more than ever, organizations need reliable tools to
							verify and validate their user information. TempTrap
							provides precision email verification and domain
							intelligence that helps teams build trust with their
							users from day one.
						</p>
						<p className="text-lg text-muted-foreground font-light leading-relaxed">
							Our platform is designed for teams that refuse to
							compromise on quality. From startups to enterprise
							organizations, we help prevent fraud, reduce churn,
							and improve user experience through intelligent
							email verification.
						</p>
					</div>
				</div>
			</section>

			{/* Values Section */}
			<section className="max-w-4xl mx-auto px-6 py-20 border-t border-border/30">
				<h2 className="text-3xl font-bold mb-12">Our Values</h2>
				<div className="grid md:grid-cols-2 gap-12">
					{[
						{
							title: "Precision",
							description:
								"We believe in building tools that work exactly as promised. Our verification engine is designed to catch edge cases and deliver accurate results every time.",
						},
						{
							title: "Reliability",
							description:
								"Your infrastructure is only as good as your dependencies. TempTrap is built for scale, with 99.9% uptime and global redundancy.",
						},
						{
							title: "Privacy First",
							description:
								"User data protection is non-negotiable. We handle email data with the utmost care and comply with global privacy regulations.",
						},
						{
							title: "Developer Experience",
							description:
								"We've built simple, intuitive APIs because great tools shouldn't require a PhD to implement. Documentation and support that actually helps.",
						},
					].map((value) => (
						<div key={value.title} className="space-y-4">
							<h3 className="text-xl font-semibold">
								{value.title}
							</h3>
							<p className="text-muted-foreground font-light leading-relaxed">
								{value.description}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* Stats Section */}
			<section className="max-w-4xl mx-auto px-6 py-20 border-t border-border/30">
				<div className="grid md:grid-cols-3 gap-12 text-center">
					{[
						{ label: "Emails Verified", value: "1B+" },
						{ label: "API Calls/Month", value: "50M+" },
						{ label: "Teams Trust Us", value: "1K+" },
					].map((stat) => (
						<div key={stat.label} className="space-y-2">
							<p className="text-4xl font-bold">{stat.value}</p>
							<p className="text-muted-foreground text-sm">
								{stat.label}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-4xl mx-auto px-6 py-20 border-t border-border/30">
				<div className="space-y-8 text-center">
					<h2 className="text-3xl font-bold">
						Ready to build with us?
					</h2>
					<p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
						Join thousands of teams that have already improved their
						user verification and data quality with TempTrap.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							href="/sign-up"
							className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
						>
							Get Started
							<ArrowRight className="w-4 h-4" />
						</Link>
						<Link
							href="/docs"
							className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
						>
							View Documentation
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
