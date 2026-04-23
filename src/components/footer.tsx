import Link from "next/link";
import Image from "next/image";

export function Footer() {
	return (
		<footer className="bg-background py-20 border-t border-border/50">
			<div className="max-w-7xl mx-auto px-6">
				<div className="flex flex-col md:flex-row justify-between items-start gap-20">
					<div className="space-y-8 flex-1">
						<div className="flex items-center gap-2">
							<Image
								src="/logo.png"
								alt="TempTrap Logo"
								width={24}
								height={24}
								className="h-6 w-6"
							/>
							<span className="text-2xl font-bold tracking-tight">
								TempTrap
							</span>
						</div>
						<p className="text-muted-foreground font-light leading-relaxed max-w-sm">
							Building the trust layer for the modern web.
							Precision email verification and domain intelligence
							for world-class teams.
						</p>
						<div className="flex gap-4">
							<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
							<span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/60">
								System Operational
							</span>
						</div>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-20">
						{[
							{
								title: "Product",
								links: [
									{ label: "Features", href: "#features" },
									{ label: "API Docs", href: "/docs" },
									{ label: "Pricing", href: "#pricing" },
								],
							},
							{
								title: "Company",
								links: [
									{ label: "About", href: "/about" },
									{ label: "Privacy", href: "/privacy" },
									{ label: "Terms", href: "/terms" },
								],
							},
						].map((group) => (
							<div key={group.title} className="space-y-6">
								<h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
									{group.title}
								</h4>
								<ul className="space-y-3">
									{group.links.map((item) => (
										<li key={item.label}>
											<Link
												href={item.href}
												className="text-sm font-light text-muted-foreground hover:text-foreground transition-all"
											>
												{item.label}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
				<div className="mt-24 pt-10 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-8">
					<p className="text-xs text-muted-foreground/40 font-medium">
						&copy; {new Date().getFullYear()} TempTrap. Precision
						Infrastructure.
					</p>
					<div className="flex items-center gap-8">
						<span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/40">
							Status
						</span>
						<span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/40">
							Legal
						</span>
						<span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/40">
							Privacy
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
