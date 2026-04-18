"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Copy, Check, Terminal, BookOpen, Key, ArrowRight, AlertCircle, ChevronRight, Play, Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

type SectionId =
    | "overview"
    | "authentication"
    | "request"
    | "parameters"
    | "response"
    | "errors"
    | "examples"
    | "playground";

interface NavSection {
    id: SectionId;
    label: string;
    icon: React.ElementType;
}

interface CopyButtonProps {
    text: string;
}

interface VerifyResult {
    email: string;
    isDisposable: boolean;
    isTemp: boolean; // legacy alias
    domain: string;
    score: number;
    confidence: "low" | "medium" | "high";
    explanation: string;
    signals: {
        // Blocklist
        inDisposableList: boolean;
        // MX
        mxValid: boolean;
        mxProviders: string[];
        mxCatchAll: boolean | null;
        // SMTP
        smtpMailboxExists: boolean | null;
        smtpCatchAll: boolean | null;
        smtpError: string | null;
        // Domain age
        domainAgeDays: number | null;
        domainRegistrar: string | null;
        isNewDomain: boolean;
        // Heuristics
        randomLookingLocalPart: boolean;
        numericHeavyUsername: boolean;
        suspiciousSubdomain: boolean;
        heuristicScore: number;
    };
    cached: boolean;
    error?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "authentication", label: "Authentication", icon: Key },
    { id: "request", label: "Request", icon: Terminal },
    { id: "parameters", label: "Parameters", icon: ChevronRight },
    { id: "response", label: "Response", icon: ArrowRight },
    { id: "errors", label: "Errors", icon: AlertCircle },
    { id: "examples", label: "Code Examples", icon: Terminal },
    { id: "playground", label: "Try It", icon: Play },
];

const CURL_EXAMPLE = `curl -X GET "${process.env.NEXT_PUBLIC_APP_URL}/api/v1/verify?email=user@mailinator.com" \\
  -H "x-api-key: YOUR_API_KEY"`;

const TS_EXAMPLE = `const response = await fetch(
  "${process.env.NEXT_PUBLIC_APP_URL}/api/v1/verify?email=user@mailinator.com",
  {
    method: "GET",
    headers: {
      "x-api-key": process.env.TEMP_API_KEY!,
    },
  }
);

if (!response.ok) {
  const { error } = await response.json();
  throw new Error(error);
}

const { email, isDisposable, domain } = await response.json();

if (isDisposable) {
  // Block or flag the signup
}`;

const PYTHON_EXAMPLE = `import requests
import os

api_key = os.environ["TEMP_API_KEY"]

response = requests.get(
    "${process.env.NEXT_PUBLIC_APP_URL}/api/v1/verify",
    params={"email": "user@mailinator.com"},
    headers={"x-api-key": api_key},
)

response.raise_for_status()
data = response.json()

# {"email": "...", "isDisposable": True, "domain": "..."}
if data["isDisposable"]:
    pass  # Block or flag the signup`;

const SUCCESS_RESPONSE = `{
  "email": "user@mailinator.com",
  "isDisposable": true,
  "isTemp": true,
  "domain": "mailinator.com",
  "score": 91,
  "confidence": "high",
  "explanation": "Known disposable provider. SMTP verification confirmed catch-all policy.",
  "signals": {
    "inDisposableList": true,
    "mxValid": true,
    "mxProviders": ["mx.mailinator.com"],
    "mxCatchAll": true,
    "smtpMailboxExists": true,
    "smtpCatchAll": true,
    "smtpError": null,
    "domainAgeDays": 4621,
    "domainRegistrar": "NameCheap, Inc.",
    "isNewDomain": false,
    "randomLookingLocalPart": false,
    "numericHeavyUsername": false,
    "suspiciousSubdomain": false,
    "heuristicScore": 0
  },
  "cached": false
}

// Example with random-looking local part on a new domain:
{
  "email": "xk92jd@tempinbox.co",
  "isDisposable": true,
  "isTemp": true,
  "domain": "tempinbox.co",
  "score": 88,
  "confidence": "high",
  "explanation": "New domain (18 days old) with random-looking address and no known MX provider.",
  "signals": {
    "inDisposableList": false,
    "mxValid": true,
    "mxProviders": ["mail.tempinbox.co"],
    "mxCatchAll": null,
    "smtpMailboxExists": null,
    "smtpCatchAll": null,
    "smtpError": "timeout",
    "domainAgeDays": 18,
    "domainRegistrar": "Unknown",
    "isNewDomain": true,
    "randomLookingLocalPart": true,
    "numericHeavyUsername": false,
    "suspiciousSubdomain": false,
    "heuristicScore": 20
  },
  "cached": false
}`;

const ERROR_REFERENCE = [
    { status: 400, message: "Missing URL or email parameter", cause: "Neither email nor url query param was provided", fix: "Add an email or url query param" },
    { status: 400, message: "Invalid format", cause: "Submitted value resolved to an empty or unparseable domain", fix: "Check the input format" },
    { status: 401, message: "Missing x-api-key header", cause: "The x-api-key header was omitted", fix: "Add the x-api-key header" },
    { status: 401, message: "Invalid API Key", cause: "The key does not match any active key", fix: "Verify or regenerate your key in the dashboard" },
    { status: 402, message: "Usage limit reached", cause: "Free tier limit of 500 requests exceeded", fix: "Contact support for a limit increase" },
    { status: 500, message: "Internal server error", cause: "Unexpected server-side error", fix: "Retry the request; contact support if it persists" },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function CopyButton({ text }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 text-white/40 hover:text-white/70 transition-all duration-150"
        >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
    );
}

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
    return (
        <div className="relative group">
            <div className="bg-[#0c0c0c] border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{language}</span>
                </div>
                <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
                    <code className="font-mono text-green-300/80 block whitespace-pre">{code}</code>
                </pre>
            </div>
            <CopyButton text={code} />
        </div>
    );
}

function InlineCode({ children }: { children: React.ReactNode }) {
    return (
        <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-[0.82em] font-mono border border-border">
            {children}
        </code>
    );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
    return (
        <h2
            id={id}
            className="text-xl font-bold tracking-tight text-foreground scroll-mt-24 mb-6 pb-3 border-b border-border flex items-center gap-2"
        >
            {children}
        </h2>
    );
}

function StatusBadge({ status }: { status: number }) {
    const color = status >= 500
        ? "bg-destructive/10 text-destructive border-destructive/20"
        : status >= 400
            ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
            : "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400";

    return (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border", color)}>
            {status}
        </span>
    );
}

function MethodBadge() {
    return (
        <span className="inline-flex items-center px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-bold font-mono">
            GET
        </span>
    );
}

// ─── Playground ────────────────────────────────────────────────────────────

function Playground() {
    const [email, setEmail] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<VerifyResult | null>(null);
    const [httpStatus, setHttpStatus] = useState<number | null>(null);

    const handleRun = async () => {
        if (!email.trim() || !apiKey.trim()) return;
        setLoading(true);
        setResult(null);
        setHttpStatus(null);

        try {
            const res = await fetch(
                `/api/v1/verify?email=${encodeURIComponent(email.trim())}`,
                { headers: { "x-api-key": apiKey.trim() } }
            );
            setHttpStatus(res.status);
            const data = await res.json() as VerifyResult;
            setResult(data);
        } catch {
            setResult({
                email,
                isDisposable: false,
                isTemp: false,
                domain: "",
                score: 0,
                confidence: "low",
                explanation: "",
                signals: {
                    inDisposableList: false,
                    mxValid: false,
                    mxProviders: [],
                    mxCatchAll: null,
                    smtpMailboxExists: null,
                    smtpCatchAll: null,
                    smtpError: null,
                    domainAgeDays: null,
                    domainRegistrar: null,
                    isNewDomain: false,
                    randomLookingLocalPart: false,
                    numericHeavyUsername: false,
                    suspiciousSubdomain: false,
                    heuristicScore: 0,
                },
                cached: false,
                error: "Network error — check your connection."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 bg-muted/30 border-b border-border">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Live Playground</span>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <div className="flex-1 space-y-1">
                        <label htmlFor="playground-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Email or Domain</label>
                        <Input
                            id="playground-email"
                            placeholder="user@mailinator.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleRun()}
                            className="font-mono text-sm"
                        />
                    </div>
                    <div className="flex-1 space-y-1">
                        <label htmlFor="playground-api-key" className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">API Key</label>
                        <Input
                            id="playground-api-key"
                            placeholder="YOUR_API_KEY"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleRun()}
                            className="font-mono text-sm"
                        />
                    </div>
                </div>
                <Button
                    id="playground-run"
                    onClick={handleRun}
                    disabled={loading || !email.trim() || !apiKey.trim()}
                    className="w-full sm:w-auto gap-2"
                >
                    {loading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Running…</>
                    ) : (
                        <><Play className="h-4 w-4" /> Send Request</>
                    )}
                </Button>

                {result && (
                    <div className="mt-4 rounded-lg border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 border-b border-border">
                            <StatusBadge status={httpStatus ?? 200} />
                            <span className="text-xs text-muted-foreground font-mono">
                                GET /api/v1/verify?email={encodeURIComponent(email)}
                            </span>
                        </div>
                        <div className="bg-[#0c0c0c] p-4">
                            {result.error ? (
                                <pre className="font-mono text-sm text-destructive whitespace-pre-wrap">{result.error}</pre>
                            ) : (
                                <div className="space-y-4">
                                    {/* Result Banner */}
                                    {!result.error && httpStatus === 200 && (
                                        <div className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg border",
                                            result.isDisposable
                                                ? "bg-destructive/10 border-destructive/20"
                                                : "bg-green-500/10 border-green-500/20"
                                        )}>
                                            {result.isDisposable
                                                ? <ShieldX className="h-5 w-5 text-destructive shrink-0" />
                                                : <ShieldCheck className="h-5 w-5 text-green-500 shrink-0" />
                                            }
                                            <div>
                                                <p className={cn("text-sm font-semibold", result.isDisposable ? "text-destructive" : "text-green-600 dark:text-green-400")}>
                                                    {result.isDisposable ? "Disposable email detected" : "Legitimate email address"}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-xs text-muted-foreground">Score: {result.score}%</p>
                                                    <span className="text-xs text-muted-foreground/30">•</span>
                                                    <p className="text-xs text-muted-foreground">Confidence: {result.confidence}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 italic border-l-2 border-muted pl-2 py-0.5">
                                                    "{result.explanation}"
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {/* Raw JSON */}
                                    <pre className="font-mono text-sm text-green-300/80 whitespace-pre">
                                        {JSON.stringify(result, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Docs Page ─────────────────────────────────────────────────────────

export function DocsPage() {
    const [activeSection, setActiveSection] = useState<SectionId>("overview");
    const observerRef = useRef<IntersectionObserver | null>(null);

    const handleNavClick = useCallback((id: SectionId) => {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);

    useEffect(() => {
        const sections = NAV_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) {
                    setActiveSection(visible[0].target.id as SectionId);
                }
            },
            { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
        );

        sections.forEach((s) => { observerRef.current?.observe(s); });
        return () => observerRef.current?.disconnect();
    }, []);

    return (
        <div className="flex gap-0 min-h-screen">
            {/* On-page nav */}
            <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-5 gap-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-3">
                    On this page
                </p>
                {NAV_SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                        <button
                            key={section.id}
                            type="button"
                            onClick={() => handleNavClick(section.id)}
                            className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left transition-all duration-150",
                                isActive
                                    ? "bg-primary/5 text-foreground font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                            )}
                        >
                            <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                            <span className="truncate">{section.label}</span>
                            {isActive && <div className="ml-auto h-1 w-1 rounded-full bg-primary shrink-0" />}
                        </button>
                    );
                })}
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0 p-8 lg:p-12 lg:pr-16 space-y-16 overflow-y-auto">

                {/* ── Overview ───────────────────────────────────────── */}
                <section id="overview" className="scroll-mt-6 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                                <MethodBadge />
                                <code className="text-base font-mono font-semibold text-foreground">/v1/verify</code>
                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">
                                    v1
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Verify Email / Domain
                            </h1>
                            <p className="text-muted-foreground leading-relaxed max-w-2xl">
                                Check whether an email address or domain belongs to a known disposable email provider.
                                Returns a JSON response indicating whether the domain is disposable, along with the extracted domain.
                            </p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                        {[
                            { label: "Method", value: "GET" },
                            { label: "Base URL", value: "api.temp.sh" },
                            { label: "Auth", value: "x-api-key header" },
                        ].map((item) => (
                            <div key={item.label} className="rounded-lg border border-border bg-muted/20 p-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{item.label}</p>
                                <p className="font-mono text-sm font-semibold text-foreground">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    <CodeBlock code={`GET ${process.env.NEXT_PUBLIC_APP_URL}/api/v1/verify?email=user@mailinator.com`} language="endpoint" />
                </section>

                {/* ── Authentication ─────────────────────────────────── */}
                <section id="authentication" className="scroll-mt-6 space-y-6">
                    <SectionHeading id="authentication-heading"><Key className="h-5 w-5 text-muted-foreground" /> Authentication</SectionHeading>

                    <p className="text-muted-foreground leading-relaxed">
                        All requests must include a valid API key in the <InlineCode>x-api-key</InlineCode> request header.
                        Keys are scoped to your project and tracked per-request in your usage log.
                    </p>

                    <div className="rounded-lg border border-border overflow-hidden">
                        <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Required Header</p>
                        </div>
                        <div className="divide-y divide-border">
                            {[
                                { field: "x-api-key", type: "string", required: true, description: "Your API key from the dashboard" },
                            ].map((row) => (
                                <div key={row.field} className="flex items-start gap-4 px-4 py-3">
                                    <InlineCode>{row.field}</InlineCode>
                                    <span className="text-xs text-muted-foreground font-mono pt-0.5">{row.type}</span>
                                    <Badge variant="outline" className="text-[10px] shrink-0">required</Badge>
                                    <span className="text-sm text-muted-foreground">{row.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <div className="text-sm text-muted-foreground leading-relaxed">
                            Never expose your API key in browser-side code. Always call this endpoint from a server-side route or API handler with the key stored in an environment variable.
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">How to find your key</p>
                        <div className="flex flex-col gap-2">
                            {["Sign in to your dashboard", "Navigate to API Keys in the sidebar", "Create a new key — it is only shown once"].map((step, i) => (
                                <div key={step} className="flex items-start gap-3">
                                    <div className="h-5 w-5 rounded-full border border-border bg-muted/50 flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 mt-0.5">
                                        {i + 1}
                                    </div>
                                    <span className="text-sm text-muted-foreground">{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Request ────────────────────────────────────────── */}
                <section id="request" className="scroll-mt-6 space-y-6">
                    <SectionHeading id="request-heading"><Terminal className="h-5 w-5 text-muted-foreground" /> Request</SectionHeading>

                    <div className="rounded-xl border border-border bg-muted/10 p-5 font-mono text-sm space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <MethodBadge />
                            <span className="text-foreground">{`${process.env.NEXT_PUBLIC_APP_URL}/api/v1/verify`}</span>
                        </div>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed">
                        The endpoint accepts a single <InlineCode>email</InlineCode> (or its alias <InlineCode>url</InlineCode>) query parameter.
                        It supports three input forms: a full email address, a bare domain, or a full URL. The domain is always extracted and normalised to lowercase before the check is performed.
                    </p>

                    {/* Input format table */}
                    <div className="rounded-lg border border-border overflow-hidden">
                        <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Accepted Input Formats</p>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/10">
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Input Type</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Example</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Extracted Domain</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {[
                                    { type: "Email address", example: "user@mailinator.com", domain: "mailinator.com" },
                                    { type: "Full URL", example: "https://guerrillamail.com", domain: "guerrillamail.com" },
                                    { type: "Bare domain", example: "tempmail.com", domain: "tempmail.com" },
                                ].map((row) => (
                                    <tr key={row.type} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3 text-foreground font-medium">{row.type}</td>
                                        <td className="px-4 py-3"><InlineCode>{row.example}</InlineCode></td>
                                        <td className="px-4 py-3 font-mono text-muted-foreground text-xs">{row.domain}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── Parameters ─────────────────────────────────────── */}
                <section id="parameters" className="scroll-mt-6 space-y-6">
                    <SectionHeading id="parameters-heading"><ChevronRight className="h-5 w-5 text-muted-foreground" /> Parameters</SectionHeading>

                    <div className="rounded-lg border border-border overflow-hidden">
                        <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Query Parameters</p>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/10">
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Parameter</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Type</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Required</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                <tr className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-3"><InlineCode>email</InlineCode></td>
                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string</td>
                                    <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">required*</Badge></td>
                                    <td className="px-4 py-3 text-muted-foreground">An email address, domain, or URL to check</td>
                                </tr>
                                <tr className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-3"><InlineCode>url</InlineCode></td>
                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string</td>
                                    <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">alias</Badge></td>
                                    <td className="px-4 py-3 text-muted-foreground">Alias for <InlineCode>email</InlineCode>. Accepts the same value. <InlineCode>email</InlineCode> takes precedence if both are present.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        * One of <InlineCode>email</InlineCode> or <InlineCode>url</InlineCode> must be provided. If neither is present, the API returns <InlineCode>400</InlineCode>.
                    </p>
                </section>

                {/* ── Response ───────────────────────────────────────── */}
                <section id="response" className="scroll-mt-6 space-y-6">
                    <SectionHeading id="response-heading"><ArrowRight className="h-5 w-5 text-muted-foreground" /> Response</SectionHeading>

                    <p className="text-muted-foreground text-sm leading-relaxed">
                        All verified requests — disposable or not — return <InlineCode>200 OK</InlineCode> with a JSON body.
                        The result describes the input as submitted, the extracted domain, and the disposable verdict.
                    </p>

                    <div className="rounded-lg border border-border overflow-hidden">
                        <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-3">
                            <StatusBadge status={200} />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Success Response</p>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/10">
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Field</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Type</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {[
                                    { field: "email", type: "string", description: "The exact value submitted in the request" },
                                    { field: "isDisposable", type: "boolean", description: "true if the AI+heuristics verdict classifies this as disposable" },
                                    { field: "isTemp", type: "boolean", description: "Legacy alias for isDisposable — kept for backwards compatibility" },
                                    { field: "domain", type: "string", description: "The extracted domain used for the check" },
                                    { field: "score", type: "number", description: "0–100 risk score — higher means more likely disposable" },
                                    { field: "confidence", type: "enum", description: "'low', 'medium', or 'high' — how many signals contributed to the verdict" },
                                    { field: "explanation", type: "string", description: "One-sentence AI reasoning in plain English" },
                                    { field: "signals.inDisposableList", type: "boolean", description: "Domain matched the disposable-email-domains blocklist" },
                                    { field: "signals.mxValid", type: "boolean", description: "Domain has at least one valid MX record" },
                                    { field: "signals.mxProviders", type: "string[]", description: "MX hostnames returned by DNS" },
                                    { field: "signals.mxCatchAll", type: "boolean?", description: "Whether the domain accepts any address (catch-all)" },
                                    { field: "signals.smtpMailboxExists", type: "boolean?", description: "RCPT TO accepted (null = SMTP blocked/timeout)" },
                                    { field: "signals.smtpCatchAll", type: "boolean?", description: "Random probe also accepted — confirms catch-all" },
                                    { field: "signals.smtpError", type: "string?", description: "SMTP connection error message, if any" },
                                    { field: "signals.domainAgeDays", type: "number?", description: "Days since domain registration via RDAP" },
                                    { field: "signals.domainRegistrar", type: "string?", description: "Domain registrar name from RDAP" },
                                    { field: "signals.isNewDomain", type: "boolean", description: "true if domain age < 90 days" },
                                    { field: "signals.randomLookingLocalPart", type: "boolean", description: "Heuristic: high-entropy or consonant-only local part" },
                                    { field: "signals.numericHeavyUsername", type: "boolean", description: "Heuristic: >50% digits in the local part" },
                                    { field: "signals.suspiciousSubdomain", type: "boolean", description: "Heuristic: uses a known temp-mail subdomain pattern" },
                                    { field: "signals.heuristicScore", type: "number", description: "0–40 additive penalty from pattern analysis" },
                                    { field: "cached", type: "boolean", description: "Result was served from 24h domain-level cache" },
                                ].map((row) => (
                                    <tr key={row.field} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3"><InlineCode>{row.field}</InlineCode></td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.type}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{row.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <CodeBlock code={SUCCESS_RESPONSE} language="json" />
                </section>

                {/* ── Errors ─────────────────────────────────────────── */}
                <section id="errors" className="scroll-mt-6 space-y-6">
                    <SectionHeading id="errors-heading"><AlertCircle className="h-5 w-5 text-muted-foreground" /> Errors</SectionHeading>

                    <p className="text-muted-foreground text-sm leading-relaxed">
                        All error responses return JSON with a single <InlineCode>error</InlineCode> field containing a plain-English message.
                    </p>

                    <CodeBlock code={`{ "error": "Missing x-api-key header" }`} language="json" />

                    <div className="rounded-lg border border-border overflow-hidden">
                        <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Error Reference</p>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/10">
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Status</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Message</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">Cause</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Fix</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {ERROR_REFERENCE.map((row) => (
                                    <tr key={row.message} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3 shrink-0"><StatusBadge status={row.status} /></td>
                                        <td className="px-4 py-3"><InlineCode>{row.message}</InlineCode></td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">{row.cause}</td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{row.fix}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── Code Examples ──────────────────────────────────── */}
                <section id="examples" className="scroll-mt-6 space-y-6">
                    <SectionHeading id="examples-heading"><Terminal className="h-5 w-5 text-muted-foreground" /> Code Examples</SectionHeading>

                    <Tabs defaultValue="curl">
                        <TabsList className="mb-4 border border-border bg-muted/30">
                            <TabsTrigger value="curl" className="font-mono text-xs">cURL</TabsTrigger>
                            <TabsTrigger value="typescript" className="font-mono text-xs">TypeScript</TabsTrigger>
                            <TabsTrigger value="python" className="font-mono text-xs">Python</TabsTrigger>
                        </TabsList>
                        <TabsContent value="curl">
                            <CodeBlock code={CURL_EXAMPLE} language="bash" />
                        </TabsContent>
                        <TabsContent value="typescript">
                            <CodeBlock code={TS_EXAMPLE} language="typescript" />
                        </TabsContent>
                        <TabsContent value="python">
                            <CodeBlock code={PYTHON_EXAMPLE} language="python" />
                        </TabsContent>
                    </Tabs>

                    {/* Integration pattern */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Signup Protection Pattern (Next.js)</p>
                        <CodeBlock
                            language="typescript"
                            code={`// app/api/auth/register/route.ts
export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Verify before creating the account
  const check = await fetch(
    \`${process.env.NEXT_PUBLIC_APP_URL}/api/v1/verify?email=\${encodeURIComponent(email)}\`,
    { headers: { "x-api-key": process.env.TEMP_API_KEY! } }
  );
  const { isDisposable } = await check.json();

  if (isDisposable) {
    return Response.json(
      { error: "Disposable email addresses are not allowed." },
      { status: 400 }
    );
  }

  // Proceed with registration...
}`}
                        />
                    </div>
                </section>

                {/* ── Playground ─────────────────────────────────────── */}
                <section id="playground" className="scroll-mt-6 space-y-6">
                    <SectionHeading id="playground-heading"><Play className="h-5 w-5 text-muted-foreground" /> Try It</SectionHeading>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Send a live request directly from this page. Your API key is sent directly to the API — it is never stored or logged by the docs page.
                    </p>
                    <Playground />
                </section>

            </div>
        </div>
    );
}
