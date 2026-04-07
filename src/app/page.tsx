import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, ArrowRight, CheckCircle2, Code2, Key, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            {/* Navbar */}
            <header className="flex items-center justify-between px-6 py-6 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
                    <ShieldCheck className="h-7 w-7 text-primary" />
                    <span className="font-syne italic">Temp</span>
                </div>
                <nav className="flex items-center gap-6">
                    <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors">
                        Sign In
                    </Link>
                    <Button asChild className="rounded-full shadow-none hover:opacity-90">
                        <Link href="/sign-up">Get Started</Link>
                    </Button>
                </nav>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="px-6 py-24 sm:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4">
                        <Zap className="h-3 w-3" />
                        Disposable Email Verification API
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter mb-8 font-syne animate-in fade-in slide-in-from-bottom-6 duration-700">
                        Stop fake users <br />
                        <span className="text-muted-foreground italic">at the source.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-900 leading-relaxed">
                        Filter out throwaway emails and improve your lead quality. A fast, reliable, and developer-friendly API for modern SaaS.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <Button asChild size="lg" className="px-8 rounded-full shadow-lg shadow-primary/20 text-lg">
                            <Link href="/sign-up">
                                Start Verifying Free <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="px-8 rounded-full border-2 bg-transparent text-lg">
                            <Link href="#documentation">View Docs</Link>
                        </Button>
                    </div>
                </section>

                {/* Code Example Section */}
                <section id="documentation" className="px-6 py-24 bg-card/30 border-y border-border">
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold font-syne tracking-tight">Simple Integration</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                                    <p className="text-muted-foreground leading-snug">REST API that works with any language or framework.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                                    <p className="text-muted-foreground leading-snug">Instant results with 99.9% uptime guaranteed.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                                    <p className="text-muted-foreground leading-snug">Comprehensive database of 10k+ disposable domains.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="flex gap-1.5 mb-4 opacity-50">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                            </div>
                            <code className="text-sm font-mono leading-relaxed text-indigo-300 block">
                                <span className="text-pink-400">const</span> res = <span className="text-pink-400">await</span> fetch(<span className="text-green-400">&quot;https://api.temp.sh/v1/verify?email=test@mailinator.com&quot;</span>, &#123;
                                <br />
                                &nbsp;&nbsp;headers: &#123;
                                <br />
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-300">&quot;x-api-key&quot;</span>: <span className="text-green-400">&quot;YOUR_API_KEY&quot;</span>
                                <br />
                                &nbsp;&nbsp;&#125;
                                <br />
                                &#125;);
                                <br />
                                <br />
                                <span className="text-pink-400">const</span> data = <span className="text-pink-400">await</span> res.json();
                                <br />
                                {/* data.disposable: true */}
                            </code>
                        </div>
                    </div>
                </section>

                {/* Values / Features */}
                <section className="px-6 py-32 max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl font-bold font-syne tracking-tight mb-16">Everything you need.</h2>
                    <div className="grid sm:grid-cols-3 gap-8 text-left">
                        <Card className="border-border bg-card/20 shadow-none hover:bg-card/50 transition-colors p-6 rounded-2xl">
                            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                <Key className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Key Management</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Generate and rotate multiple keys for different staging and production environments.</p>
                        </Card>
                        <Card className="border-border bg-card/20 shadow-none hover:bg-card/50 transition-colors p-6 rounded-2xl">
                            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                <Activity className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Usage Analytics</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Real-time tracking of every request. Monitor your application&apos;s data hygiene from a central dashboard.</p>
                        </Card>
                        <Card className="border-border bg-card/20 shadow-none hover:bg-card/50 transition-colors p-6 rounded-2xl">
                            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                <Code2 className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">SDK Optimized</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Lightweight responses designed for high-throughput SDKs and webhooks.</p>
                        </Card>
                    </div>
                </section>
            </main>

            <footer className="px-6 py-12 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-6 max-w-6xl mx-auto w-full opacity-60">
                <div className="flex items-center gap-2 font-bold tracking-tighter">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-syne">Temp</span>
                </div>
                <p className="text-xs">&copy; 2026 Temp. All rights reserved.</p>
                <div className="flex gap-6 text-xs">
                    <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
                </div>
            </footer>
        </div>
    );
}
