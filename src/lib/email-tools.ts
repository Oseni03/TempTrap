import dns from "dns/promises";

export type SignalResult = {
    disposable: boolean;
    mx: { valid: boolean; providers: string[] };
    domainAge: { ageDays: number | null };
};

export async function checkMX(
    domain: string
): Promise<{ valid: boolean; providers: string[] }> {
    try {
        const mx = await dns.resolveMx(domain);
        return {
            valid: mx.length > 0,
            providers: mx.map((m) => m.exchange),
        };
    } catch {
        return { valid: false, providers: [] };
    }
}

export async function checkDomainAge(
    domain: string
): Promise<{ ageDays: number | null }> {
    try {
        const res = await fetch(
            `https://rdap.org/domain/${domain}`
        );
        if (!res.ok) return { ageDays: null };

        const data = await res.json();
        const events: { eventAction: string; eventDate: string }[] =
            data.events ?? [];

        const registration = events.find(
            (e) => e.eventAction === "registration"
        );
        if (!registration) return { ageDays: null };

        const created = new Date(registration.eventDate);
        const ageDays =
            (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);

        return { ageDays: Math.floor(ageDays) };
    } catch {
        return { ageDays: null };
    }
}

/** Deterministic base score — fast, no LLM needed */
export function computeBaseScore(signals: SignalResult): number {
    let score = 0;

    if (signals.disposable) score += 50;
    if (!signals.mx.valid) score += 25;

    const age = signals.domainAge.ageDays;
    if (age !== null) {
        if (age < 7) score += 20;
        else if (age < 30) score += 10;
        else if (age < 90) score += 5;
    }

    return Math.min(score, 100);
}