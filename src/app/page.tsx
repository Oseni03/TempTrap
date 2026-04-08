import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Check, Search, Activity, Zap } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-6 w-6 text-foreground" />
                            <span className="text-xl font-bold tracking-tight font-heading">Temp</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                            <Link href="#documentation" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
                            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                Sign in
                            </Link>
                            <Button asChild size="sm" className="rounded-lg px-5">
                                <Link href="/sign-up">Get started</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-border bg-muted/50 text-xs font-bold uppercase tracking-widest text-foreground mb-8">
                            <Zap className="h-3 w-3" />
                            Reliable Verification API
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-heading mb-8 max-w-4xl mx-auto">
                            Stop fake signups <br />
                            at the threshold.
                        </h1>
                        <p className="text-lg md:text-xl text-foreground font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                            A fast, developer-first API to identify and block disposable email addresses. Improve lead quality and reduce fraud instantly.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                            <Button asChild size="lg" className="rounded-lg px-8 h-12 text-base">
                                <Link href="/sign-up">
                                    Start verifying free <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="rounded-lg px-8 h-12 text-base border-border">
                                <Link href="#documentation">Explore the docs</Link>
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">No credit card required. Up to 10k free requests.</p>
                    </div>
                </section>

                {/* Integration Section */}
                <section id="documentation" className="py-20 bg-muted/30 border-y border-border">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-bold font-heading tracking-tight">Built for modern flows</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Integrate disposable email detection into your signup forms, API endpoints, or webhooks with a single request.
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        "REST API compatible with any stack",
                                        "99.99% uptime with global edge nodes",
                                        "Database updated every 15 minutes",
                                        "Detailed verification metadata"
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-3">
                                            <div className="h-5 w-5 rounded-lg border border-border flex items-center justify-center bg-background">
                                                <Check className="h-3 w-3 text-foreground" />
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-border to-transparent blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative bg-[#090909] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                                        <div className="flex gap-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                                            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                                            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                                        </div>
                                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest ml-2">Request Example</span>
                                    </div>
                                    <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                                        <div className="flex space-x-2">
                                            <span className="text-blue-400">curl</span>
                                            <span className="text-white/60">-X</span>
                                            <span className="text-white">GET</span>
                                        </div>
                                        <div className="mt-2 text-white/80">
                                            &quot;https://api.temp.sh/v1/verify&quot; \
                                        </div>
                                        <div className="mt-1 text-white/80">
                                            <span className="text-white/40">-H</span> &quot;Authorization: Bearer YOUR_KEY&quot; \
                                        </div>
                                        <div className="mt-1 text-white/80">
                                            <span className="text-white/40">-d</span> &quot;email=user@disposable.com&quot;
                                        </div>

                                        <div className="mt-6 border-t border-white/5 pt-6">
                                            <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">Response</div>
                                            <div className="text-green-400/90 whitespace-pre">
                                                {`{
  "email": "user@disposable.com",
  "disposable": true,
  "domain": "disposable.com",
  "confidence": 1.0
}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 md:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl font-bold font-heading mb-6 tracking-tight">Focus on what matters</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                                We handle the complex domain intelligence so you can focus on building your product with high-quality user data.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12">
                            {[
                                {
                                    title: "Domain Intelligence",
                                    description: "Proprietary algorithms that detect even the most obscure throwaway email providers in real-time.",
                                    icon: Search
                                },
                                {
                                    title: "Performance First",
                                    description: "A全球distributed network ensures sub-50ms latency for every verification request.",
                                    icon: Activity
                                },
                                {
                                    title: "Clean Data",
                                    description: "Reduce marketing spend and improve engagement by ensuring your database only contains real users.",
                                    icon: Zap
                                }
                            ].map((feature) => (
                                <div key={feature.title} className="group p-8 rounded-xl border border-border bg-background hover:bg-muted/30 transition-all duration-300">
                                    <div className="h-12 w-12 rounded-lg border border-border flex items-center justify-center mb-6 bg-muted/50 text-foreground group-hover:scale-110 transition-transform duration-300">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section - simplified for landing page */}
                <section id="pricing" className="py-24 bg-foreground text-background rounded-t-[3rem] -mt-10 overflow-hidden relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8 tracking-tight">Scale without limits</h2>
                        <p className="text-background/70 max-w-xl mx-auto mb-12 text-lg">
                            Simple usage-based pricing that grows with your business. No hidden fees or tiered restrictions.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Button asChild size="lg" variant="secondary" className="rounded-lg px-8 h-12 text-base font-semibold">
                                <Link href="/sign-up">Create free account</Link>
                            </Button>
                            <Link href="#documentation" className="text-sm font-medium hover:text-background/80 transition-colors border-b border-background/20 pb-0.5">
                                View full pricing
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-background py-16 border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-6 w-6 text-foreground" />
                                <span className="text-xl font-bold tracking-tight font-heading">Temp</span>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                                Providing the infrastructure for secure and high-quality user experiences through domain intelligence.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Product</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                                    <li><Link href="#documentation" className="text-muted-foreground hover:text-foreground transition-colors">API Reference</Link></li>
                                    <li><Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Company</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                                    <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                                    <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Social</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">X (Twitter)</Link></li>
                                    <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">GitHub</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()} Temp. Built for founders by Oseni.
                        </p>
                        <div className="flex gap-4">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">System Operational</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
