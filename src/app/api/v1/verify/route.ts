import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import disposableDomains from "disposable-email-domains";
import {
    checkMX,
    checkDomainAge,
    computeBaseScore,
    type SignalResult,
} from "@/lib/email-tools";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: CORS_HEADERS });
}

// ─── AI reasoning layer ───────────────────────────────────────────────────────

async function getAIVerdict(
    email: string,
    domain: string,
    signals: SignalResult,
    baseScore: number
): Promise<{
    score: number;
    isTemp: boolean;
    confidence: "low" | "medium" | "high";
    explanation: string;
}> {
    const prompt = `You are an email risk analysis agent. Analyze the following signals and return a JSON verdict.

Email: ${email}
Domain: ${domain}

Signals collected:
- Is in disposable domain list: ${signals.disposable}
- Has valid MX records: ${signals.mx.valid}
- MX providers: ${signals.mx.providers.join(", ") || "none"}
- Domain age in days: ${signals.domainAge.ageDays ?? "unknown"}

Deterministic base score (0–100): ${baseScore}

Your task:
1. Review the signals critically. The base score is a starting point — you may adjust it by ±20 based on your reasoning (e.g. a known legitimate provider with a young domain should score lower).
2. Determine if this is a temporary / disposable / fraudulent email.
3. Assign a confidence level based on how many signals you had available.

Respond ONLY with a valid JSON object, no markdown, no explanation outside the JSON:
{
  "score": <number 0–100>,
  "isTemp": <boolean>,
  "confidence": <"low" | "medium" | "high">,
  "explanation": <one sentence human-readable reason>
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 256,
            messages: [{ role: "user", content: prompt }],
        }),
    });

    if (!response.ok) throw new Error("AI API request failed");

    const data = await response.json();
    const raw = data.content
        .filter((b: { type: string }) => b.type === "text")
        .map((b: { text: string }) => b.text)
        .join("");

    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email") || searchParams.get("url");
        const apiKey = req.headers.get("x-api-key");

        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing x-api-key header" },
                { status: 401, headers: CORS_HEADERS }
            );
        }

        if (!email) {
            return NextResponse.json(
                { error: "Missing URL or email parameter" },
                { status: 400, headers: CORS_HEADERS }
            );
        }

        // Verify API key
        const keyRecord = await auth.api.verifyApiKey({ body: {key: apiKey} })

        if (!keyRecord.valid || !keyRecord.key) {
            return NextResponse.json(
                { error: "Invalid API Key" },
                { status: 401, headers: CORS_HEADERS }
            );
        }

        // ── Check Usage Limit ────────────────────────────────────────────────
        const usageCount = await prisma.usageLog.count({
            where: {
                apiKey: {
                    userId: keyRecord.key.referenceId,
                },
            },
        });

        if (usageCount >= 20) {
            return NextResponse.json(
                {
                    error: "Usage limit reached",
                    message: "You have reached the free tier limit of 20 requests. Please contact support to increase your limits and get pro access.",
                },
                { status: 402, headers: CORS_HEADERS }
            );
        }

        // Extract domain
        let domain = "";
        if (email.includes("@")) {
            domain = email.split("@")[1]?.toLowerCase();
        } else {
            try {
                domain = new URL(
                    email.startsWith("http") ? email : `https://${email}`
                ).hostname.toLowerCase();
            } catch {
                domain = email.toLowerCase();
            }
        }

        if (!domain) {
            return NextResponse.json(
                { error: "Invalid format" },
                { status: 400, headers: CORS_HEADERS }
            );
        }

        // ── Check Cache ──────────────────────────────────────────────────────
        const cacheKey = `verify:domain:${domain}`;
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                const result = typeof cached === "string" ? JSON.parse(cached) : cached;
                return NextResponse.json(
                    {
                        ...result,
                        email, // Keep requested email
                        cached: true,
                    },
                    { headers: CORS_HEADERS }
                );
            }
        } catch (e) {
            console.error("Redis cache lookup failed", e);
        }

        // ── Collect signals in parallel ──────────────────────────────────────
        const [mx, domainAge] = await Promise.all([
            checkMX(domain),
            checkDomainAge(domain),
        ]);

        const signals: SignalResult = {
            disposable: disposableDomains.includes(domain),
            mx,
            domainAge,
        };

        const baseScore = computeBaseScore(signals);

        // ── AI reasoning layer ───────────────────────────────────────────────
        let verdict: {
            score: number;
            isTemp: boolean;
            confidence: "low" | "medium" | "high";
            explanation: string;
        };

        try {
            verdict = await getAIVerdict(email, domain, signals, baseScore);
        } catch (e) {
            // Graceful degradation: fall back to deterministic result
            console.error("AI verdict failed, falling back to base score", e);
            verdict = {
                score: baseScore,
                isTemp: signals.disposable || !signals.mx.valid,
                confidence: "low",
                explanation:
                    "AI analysis unavailable; result based on deterministic checks only.",
            };
        }

        // ── Log usage ────────────────────────────────────────────────────────
        if (keyRecord.key?.id) {
            try {
                await prisma.usageLog.create({
                    data: {
                        apiKeyId: keyRecord.key.id,
                        endpoint: "/api/v1/verify",
                        email,
                        isDisposable: verdict.isTemp,
                    },
                });
            } catch (e) {
                console.error("Failed to log usage", e);
            }
        }

        // ── Cache the result ─────────────────────────────────────────────────
        const responseData = {
            domain,
            isDisposable: verdict.isTemp,
            score: verdict.score,
            confidence: verdict.confidence,
            explanation: verdict.explanation,
            signals: {
                disposable: signals.disposable,
                mxValid: signals.mx.valid,
                mxProviders: signals.mx.providers,
                domainAgeDays: signals.domainAge.ageDays,
            },
        };

        try {
            await redis.set(cacheKey, JSON.stringify(responseData), {
                ex: 86400, // 24 hours
            });
        } catch (e) {
            console.error("Failed to cache result", e);
        }

        // ── Response ─────────────────────────────────────────────────────────
        return NextResponse.json(
            {
                email,
                ...responseData,
                cached: false,
            },
            { headers: CORS_HEADERS }
        );
    } catch (error) {
        console.error("Verify route error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}