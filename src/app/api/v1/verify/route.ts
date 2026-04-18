import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import disposableDomains from "disposable-email-domains";
import {
    checkMX,
    checkSMTP,
    checkDomainAge,
    analyzeHeuristics,
    computeVerdict,
    isKnownLegitProvider,
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

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email") || searchParams.get("url");
        const apiKey = req.headers.get("x-api-key");

        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing x-api-key header" },
                { status: 401, headers: CORS_HEADERS },
            );
        }

        if (!email) {
            return NextResponse.json(
                { error: "Missing URL or email parameter" },
                { status: 400, headers: CORS_HEADERS },
            );
        }

        // Verify API key
        const keyRecord = await auth.api.verifyApiKey({
            body: { key: apiKey },
        });

        if (!keyRecord.valid || !keyRecord.key) {
            return NextResponse.json(
                { error: "Invalid API Key" },
                { status: 401, headers: CORS_HEADERS },
            );
        }

        // ── Check Usage Limit ────────────────────────────────────────────────
        const usageCount = await prisma.usageLog.count({
            where: {
                apiKey: {
                    referenceId: keyRecord.key.referenceId,
                },
            },
        });

        if (usageCount >= 500) {
            return NextResponse.json(
                {
                    error: "Usage limit reached",
                    message:
                        "You have reached the free tier limit of 500 requests. Please contact support to increase your limits and get pro access.",
                },
                { status: 402, headers: CORS_HEADERS },
            );
        }

        // ── Parse input ──────────────────────────────────────────────────────
        let domain = "";
        let localPart = "";

        if (email.includes("@")) {
            const parts = email.split("@");
            localPart = parts[0] ?? "";
            domain = parts[1]?.toLowerCase() ?? "";
        } else {
            try {
                domain = new URL(
                    email.startsWith("http") ? email : `https://${email}`,
                ).hostname.toLowerCase();
            } catch {
                domain = email.toLowerCase();
            }
        }

        if (!domain) {
            return NextResponse.json(
                { error: "Invalid format" },
                { status: 400, headers: CORS_HEADERS },
            );
        }

        // ── Validate email format ────────────────────────────────────────────
        if (email.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400, headers: CORS_HEADERS },
            );
        }

        // ── Check Cache ──────────────────────────────────────────────────────
        const cacheKey = `verify:domain:${domain}`;
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                const result =
                    typeof cached === "string" ? JSON.parse(cached) : cached;

                // Log usage even for cached responses
                if (keyRecord.key?.id) {
                    await prisma.usageLog
                        .create({
                            data: {
                                apiKeyId: keyRecord.key.id,
                                endpoint: "/api/v1/verify",
                                email,
                                isDisposable: result.isDisposable,
                            },
                        })
                        .catch((e) =>
                            console.error("Failed to log cached usage", e),
                        );
                }

                return NextResponse.json(
                    { ...result, email, cached: true },
                    { headers: CORS_HEADERS },
                );
            }
        } catch (e) {
            console.error("Redis cache lookup failed", e);
        }

        // ── Collect signals ──────────────────────────────────────────────────
        // Start RDAP strictly in parallel with everything else, as it is the slowest
        const domainAgePromise = checkDomainAge(domain);
        
        // MX must resolve first because SMTP needs the mail servers
        const mx = await checkMX(domain);
        
        // If it's a major provider (Google, MS), SMTP probes are often rejected or hang.
        // We know they're not disposable, so we fast-track and skip the 5s SMTP timeout.
        const legit = isKnownLegitProvider(mx.providers);
        const smtpPromise = legit 
            ? Promise.resolve({ exists: null, catchAll: null, error: "Skipped for known legit provider" })
            : checkSMTP(email, mx.providers);
            
        // Compute heuristics synchronously
        const heuristics = analyzeHeuristics(localPart, domain);

        // Wait for networking connections to finish
        const [domainAge, smtp] = await Promise.all([
            domainAgePromise,
            smtpPromise
        ]);

        // Merge catch-all result back into mx result
        mx.catchAll = smtp.catchAll;

        const signals: SignalResult = {
            disposable: disposableDomains.includes(domain),
            mx,
            smtp,
            domainAge,
            heuristics,
        };

        // ── Deterministic verdict ────────────────────────────────────────────
        const verdict = computeVerdict(signals);

        // ── Log usage ────────────────────────────────────────────────────────
        if (keyRecord.key?.id) {
            try {
                await prisma.usageLog.create({
                    data: {
                        apiKeyId: keyRecord.key.id,
                        endpoint: "/api/v1/verify",
                        email,
                        isDisposable: verdict.isDisposable,
                    },
                });
            } catch (e) {
                console.error("Failed to log usage", e);
            }
        }

        // ── Build response ───────────────────────────────────────────────────
        const responseData = {
            domain,
            isDisposable: verdict.isDisposable,
            isTemp: verdict.isDisposable, // legacy alias
            score: verdict.score,
            confidence: verdict.confidence,
            explanation: verdict.explanation,
            signals: {
                // Blocklist
                inDisposableList: signals.disposable,
                // MX
                mxValid: signals.mx.valid,
                mxProviders: signals.mx.providers,
                mxCatchAll: signals.mx.catchAll,
                // SMTP
                smtpMailboxExists: signals.smtp.exists,
                smtpCatchAll: signals.smtp.catchAll,
                smtpError: signals.smtp.error ?? null,
                // Domain age
                domainAgeDays: signals.domainAge.ageDays,
                domainRegistrar: signals.domainAge.registrar ?? null,
                isNewDomain: signals.domainAge.isNewDomain,
                // Heuristics
                randomLookingLocalPart:
                    signals.heuristics.randomLookingLocalPart,
                numericHeavyUsername: signals.heuristics.numericHeavy,
                suspiciousSubdomain: signals.heuristics.suspiciousSubdomain,
                heuristicScore: signals.heuristics.score,
            },
        };

        // ── Cache the result ─────────────────────────────────────────────────
        try {
            await redis.set(cacheKey, JSON.stringify(responseData), {
                ex: 86400, // 24 hours
            });
        } catch (e) {
            console.error("Failed to cache result", e);
        }

        // ── Response ─────────────────────────────────────────────────────────
        return NextResponse.json(
            { email, ...responseData, cached: false },
            { headers: CORS_HEADERS },
        );
    } catch (error) {
        console.error("Verify route error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: CORS_HEADERS },
        );
    }
}
