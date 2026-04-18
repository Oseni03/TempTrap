import dns from "dns/promises";
import net from "net";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MxResult = {
    valid: boolean;
    providers: string[];
    catchAll: boolean | null; // null = unknown / not checked
};

export type SmtpResult = {
    /** null = could not connect (firewall / timeout) */
    exists: boolean | null;
    catchAll: boolean | null;
    error?: string;
};

export type DomainAgeResult = {
    ageDays: number | null;
    registrar?: string;
    isNewDomain: boolean; // < 90 days
};

export type HeuristicResult = {
    randomLookingLocalPart: boolean;
    numericHeavy: boolean;
    suspiciousSubdomain: boolean;
    subdomainDepth: number;
    score: number; // 0–40 additive penalty
};

export type SignalResult = {
    disposable: boolean;
    mx: MxResult;
    smtp: SmtpResult;
    domainAge: DomainAgeResult;
    heuristics: HeuristicResult;
};

// ─── Known legitimate provider fast-path ─────────────────────────────────────

const KNOWN_LEGIT_MX_KEYWORDS = [
    "google.com",
    "googlemail.com",
    "gmail.com",
    "outlook.com",
    "hotmail.com",
    "microsoft.com",
    "yahoo.com",
    "yahoodns.net",
    "icloud.com",
    "apple.com",
    "protonmail.ch",
    "mail.ru",
    "yandex.ru",
    "zoho.com",
    "fastmail.com",
    "mimecast.com",
    "pphosted.com",
    "messagelabs.com",
];

export function isKnownLegitProvider(providers: string[]): boolean {
    return providers.some((p) =>
        KNOWN_LEGIT_MX_KEYWORDS.some((kw) => p.toLowerCase().includes(kw)),
    );
}

// ─── DNS MX check ────────────────────────────────────────────────────────────

export async function checkMX(domain: string): Promise<MxResult> {
    try {
        const mx = await dns.resolveMx(domain);
        return {
            valid: mx.length > 0,
            providers: mx.map((m) => m.exchange),
            catchAll: null, // populated by SMTP check
        };
    } catch {
        return { valid: false, providers: [], catchAll: null };
    }
}

// ─── SMTP verification ────────────────────────────────────────────────────────

/**
 * Connects to the first MX host and issues:
 *   EHLO → MAIL FROM → RCPT TO (target email)
 *   then RCPT TO (random probe) to detect catch-all
 *
 * Timeout is intentionally short (5 s) — better to fail fast than hang.
 * Many hosts block port-25 outbound; we degrade gracefully.
 */
export async function checkSMTP(
    email: string,
    mxProviders: string[],
): Promise<SmtpResult> {
    if (mxProviders.length === 0) return { exists: null, catchAll: null };

    const mxHost = mxProviders[0];

    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            socket.destroy();
            resolve({ exists: null, catchAll: null, error: "timeout" });
        }, 5000);

        const socket = net.createConnection(25, mxHost);
        let buffer = "";
        let stage = 0;
        let targetAccepted = false;
        let probeAccepted = false;
        const [localPart, domain] = email.split("@");
        const randomProbe = `probe_${Math.random().toString(36).slice(2)}@${domain}`;
        const heloHost = process.env.SMTP_HELO_HOST ?? "verify.local";

        socket.setTimeout(5000);

        const commands = [
            `EHLO ${heloHost}\r\n`,
            `MAIL FROM:<noreply@${heloHost}>\r\n`,
            `RCPT TO:<${email}>\r\n`,
            `RCPT TO:<${randomProbe}>\r\n`,
            `QUIT\r\n`,
        ];

        function send(cmd: string) {
            socket.write(cmd);
        }

        socket.on("data", (data) => {
            buffer += data.toString();
            const lines = buffer.split("\r\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
                const code = parseInt(line.slice(0, 3), 10);
                if (!code || line[3] === "-") continue; // multi-line response, wait

                if (stage === 0 && code === 220) {
                    // Banner received
                    stage = 1;
                    send(commands[0]); // EHLO
                } else if (stage === 1 && (code === 250 || code === 220)) {
                    stage = 2;
                    send(commands[1]); // MAIL FROM
                } else if (stage === 2 && code === 250) {
                    stage = 3;
                    send(commands[2]); // RCPT TO target
                } else if (stage === 3) {
                    targetAccepted = code === 250 || code === 251;
                    stage = 4;
                    send(commands[3]); // RCPT TO random probe
                } else if (stage === 4) {
                    probeAccepted = code === 250 || code === 251;
                    stage = 5;
                    send(commands[4]); // QUIT
                } else if (stage === 5) {
                    clearTimeout(timeout);
                    socket.destroy();
                    const catchAll = probeAccepted
                        ? true
                        : targetAccepted
                          ? false
                          : null;
                    resolve({
                        exists: targetAccepted,
                        catchAll,
                    });
                }
            }
        });

        socket.on("error", (err) => {
            clearTimeout(timeout);
            resolve({ exists: null, catchAll: null, error: err.message });
        });

        socket.on("timeout", () => {
            clearTimeout(timeout);
            socket.destroy();
            resolve({ exists: null, catchAll: null, error: "socket timeout" });
        });
    });
}

// ─── Domain age via RDAP ──────────────────────────────────────────────────────

export async function checkDomainAge(domain: string): Promise<DomainAgeResult> {
    try {
        const res = await fetch(`https://rdap.org/domain/${domain}`, {
            signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) return { ageDays: null, isNewDomain: false };

        const data = await res.json();
        const events: { eventAction: string; eventDate: string }[] =
            data.events ?? [];

        const registration = events.find(
            (e) => e.eventAction === "registration",
        );
        if (!registration) return { ageDays: null, isNewDomain: false };

        const created = new Date(registration.eventDate);
        const ageDays =
            (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
        const ageDaysFloor = Math.floor(ageDays);

        const registrar: string | undefined = (() => {
            const registrarEntities =
                (
                    data.entities as
                        | Array<{ roles?: string[]; vcardArray?: unknown[][] }>
                        | undefined
                )?.filter((e) => e.roles?.includes("registrar")) ?? [];
            for (const e of registrarEntities) {
                const props = e.vcardArray?.[1] as Array<unknown[]> | undefined;
                const fn = props?.find(
                    (v) => Array.isArray(v) && v[0] === "fn",
                );
                if (fn) return fn[3] as string;
            }
            return undefined;
        })();

        return {
            ageDays: ageDaysFloor,
            registrar,
            isNewDomain: ageDaysFloor < 90,
        };
    } catch {
        return { ageDays: null, isNewDomain: false };
    }
}

// ─── Heuristic / pattern analysis ────────────────────────────────────────────

/** Entropy estimator — uniform distribution over charset gives high entropy */
function shannonEntropy(s: string): number {
    const freq: Record<string, number> = {};
    for (const c of s) freq[c] = (freq[c] ?? 0) + 1;
    let h = 0;
    for (const count of Object.values(freq)) {
        const p = count / s.length;
        h -= p * Math.log2(p);
    }
    return h;
}

/** Fraction of characters that are digits */
function digitRatio(s: string): number {
    const digits = s.replace(/\D/g, "").length;
    return digits / s.length;
}

/** Known disposable subdomain patterns */
const SUSPICIOUS_SUBDOMAIN_PATTERNS = [
    /^mail\d+\./,
    /^m\d+\./,
    /^temp/,
    /^disposable/,
    /^trash/,
    /^spam/,
    /^guerrilla/,
    /^throwaway/,
];

export function analyzeHeuristics(
    localPart: string,
    domain: string,
): HeuristicResult {
    const parts = domain.split(".");
    const subdomainDepth = parts.length - 2; // e.g. foo.bar.com → 1

    // Strip +tags before analysis
    const local = localPart.split("+")[0].toLowerCase();

    const entropy = shannonEntropy(local);
    const numRatio = digitRatio(local);

    // Random-looking: short, high entropy, no vowels or all consonants
    const vowels = (local.match(/[aeiou]/g) ?? []).length;
    const randomLookingLocalPart =
        (entropy > 3.5 && local.length >= 6) ||
        (vowels === 0 && local.length >= 5);

    const numericHeavy = numRatio > 0.5 && local.length >= 4;

    const suspiciousSubdomain =
        subdomainDepth > 0 &&
        SUSPICIOUS_SUBDOMAIN_PATTERNS.some((rx) => rx.test(domain));

    // Additive penalty score
    let score = 0;
    if (randomLookingLocalPart) score += 20;
    if (numericHeavy) score += 10;
    if (suspiciousSubdomain) score += 15;
    if (subdomainDepth > 1) score += 5;

    return {
        randomLookingLocalPart,
        numericHeavy,
        suspiciousSubdomain,
        subdomainDepth,
        score: Math.min(score, 40),
    };
}

// ─── Deterministic verdict engine ────────────────────────────────────────────

export type Verdict = {
    score: number;
    isDisposable: boolean;
    confidence: "low" | "medium" | "high";
    explanation: string;
};

/**
 * Fully deterministic email risk engine.
 * No external API calls — all decisions are made from the signals alone.
 *
 * Scoring weights (additive, capped 0–100):
 *   +60  in disposable blocklist
 *   +30  no valid MX records
 *   +25  SMTP: mailbox explicitly rejected
 *   +12  SMTP: catch-all domain
 *   +22  domain < 7 days old
 *   +15  domain 7–30 days old
 *   +8   domain 30–90 days old
 *   − 8  domain > 5 years old  (trust bonus)
 *   −25  known-legit MX provider (Google, Microsoft, Apple …)
 *   up to +40 from heuristic analysis
 *
 * isDisposable threshold : score ≥ 55
 * Confidence is derived from how many signals were conclusive.
 */
export function computeVerdict(signals: SignalResult): Verdict {
    const reasons: string[] = [];
    const trustReasons: string[] = [];
    let score = 0;

    // ── Blocklist ──────────────────────────────────────────────────────────
    if (signals.disposable) {
        score += 60;
        reasons.push("domain is on the disposable-email blocklist");
    }

    // ── MX ────────────────────────────────────────────────────────────────
    if (!signals.mx.valid) {
        score += 30;
        reasons.push("domain has no valid mail server (MX) records");
    }

    const isLegit = isKnownLegitProvider(signals.mx.providers);
    if (isLegit) {
        score -= 25;
        trustReasons.push("hosted on a major provider");
    }

    // ── SMTP ──────────────────────────────────────────────────────────────
    if (signals.smtp.exists === false) {
        score += 25;
        reasons.push(
            "mailbox was rejected by the mail server (RCPT TO failed)",
        );
    } else if (signals.smtp.exists === true && !signals.smtp.catchAll) {
        // Confirmed existing non-catch-all mailbox is a trust signal
        score -= 5;
        trustReasons.push("mailbox confirmed to exist");
    }

    if (signals.smtp.catchAll === true) {
        score += 12;
        reasons.push("mail server accepts all addresses (catch-all)");
    }

    // ── Domain age ────────────────────────────────────────────────────────
    const age = signals.domainAge.ageDays;
    if (age !== null) {
        if (age < 7) {
            score += 22;
            reasons.push(
                `domain registered only ${age} day${age === 1 ? "" : "s"} ago`,
            );
        } else if (age < 30) {
            score += 15;
            reasons.push(`domain is very new (${age} days old)`);
        } else if (age < 90) {
            score += 8;
            reasons.push(`domain is recently registered (${age} days old)`);
        } else if (age > 1825) {
            score -= 8;
            trustReasons.push(
                `domain has ${Math.floor(age / 365)} years of history`,
            );
        }
    }

    // ── Heuristics ────────────────────────────────────────────────────────
    score += signals.heuristics.score;

    if (signals.heuristics.randomLookingLocalPart) {
        reasons.push("username looks randomly generated");
    }
    if (signals.heuristics.numericHeavy) {
        reasons.push("username is mostly numeric digits");
    }
    if (signals.heuristics.suspiciousSubdomain) {
        reasons.push("domain uses a suspicious subdomain pattern");
    }

    // ── Clamp ─────────────────────────────────────────────────────────────
    score = Math.min(Math.max(score, 0), 100);

    // ── Verdict & confidence ──────────────────────────────────────────────
    const isDisposable = score >= 55;

    // Count how many signal groups gave conclusive data
    let conclusiveSignals = 0;
    if (signals.disposable) conclusiveSignals += 2; // strong
    if (signals.mx.valid || !signals.mx.valid) conclusiveSignals += 1; // MX always resolves
    if (signals.smtp.exists !== null) conclusiveSignals += 2; // SMTP connected
    if (signals.smtp.catchAll !== null) conclusiveSignals += 1;
    if (age !== null) conclusiveSignals += 1;
    if (signals.heuristics.score > 0) conclusiveSignals += 1;
    if (isLegit) conclusiveSignals += 1;

    const confidence: "low" | "medium" | "high" =
        conclusiveSignals >= 5
            ? "high"
            : conclusiveSignals >= 3
              ? "medium"
              : "low";

    // ── Explanation ───────────────────────────────────────────────────────
    let explanation: string;

    if (isDisposable) {
        if (reasons.length === 0) {
            explanation =
                "Multiple weak signals suggest this may be a temporary address.";
        } else if (reasons.length === 1) {
            explanation = `Flagged as disposable: ${reasons[0]}.`;
        } else {
            const [first, ...rest] = reasons;
            explanation = `Flagged as disposable: ${first}${rest.length ? `, and ${rest.slice(0, 2).join("; ")}` : ""}.`;
        }
    } else {
        if (trustReasons.length > 0) {
            explanation = `Appears legitimate: ${trustReasons.slice(0, 2).join(", ")}.`;
        } else if (reasons.length === 0) {
            explanation = "No significant risk signals detected.";
        } else {
            explanation = `Low risk overall despite some flags: ${reasons[0]}.`;
        }
    }

    return { score, isDisposable, confidence, explanation };
}
