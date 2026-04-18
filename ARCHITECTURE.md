# Architecture Overview: Temp Verification Platform

## Overview
Temp is a deterministic email verification and validation platform built as a multi-tenant SaaS. It exposes a rate-limited REST API to verify if an email address is real, deliverable, or disposable without relying on third-party AI LLMs for inference. The service is fast, deterministic, and highly cacheable, utilizing SMTP probing, DNS records, and domain heuristics to generate a risk score. The application is built using a modern full-stack web architecture centered around Next.js App Router, Postgres, and Better Auth.

## Key Concepts
- **Verification Engine**: The core logic that tests an email's validity through synchronous heuristic analysis, DNS MX lookups, SMTP mailbox probing, and RDAP domain age checks.
- **Better Auth**: Handles user authentication, organizations (tenants), and API key generation. Each user automatically gets a "Personal Project" organization upon signing up.
- **API Keys**: Extends Better Auth capabilities. API requests to the `/api/v1/verify` endpoint require an API key passed via the `x-api-key` header.
- **UsageLogs**: Database records mapping every API invocation to the API key used. 
- **Caching Layer**: Redis (via Upstash) is used to cache verification results by domain, dramatically speeding up repeated inquiries for the same provider and reducing expensive SMTP probes.

## How It Works
### User Onboarding and API Key Creation
1. A user signs up. A `User` record is created.
2. A database hook in Better Auth intercepts the `create` event and creates a new "Personal Project" `Organization` on behalf of the user.
3. The user generates an API key in the dashboard, linked to their organization via Better Auth's `apiKey` plugin. 

### The Verification Flow (`/api/v1/verify`)
1. **Authentication:** The client sends an email via GET parameter with their API key. Better Auth validates the key via `auth.api.verifyApiKey`.
2. **Quota Check:** The system queries `UsageLog` to ensure the API key hasn't exceeded its free tier cap (20 requests hardcoded for evaluation).
3. **Cache Lookup:** Redis checks if the domain was recently verified. If so, it logs the usage and instantly returns the cached result.
4. **Parallel Signal Collection:**
   - **RDAP Domain Age:** Initiates a domain age lookup immediately.
   - **DNS MX Check:** Resolves mail exchange records.
   - **SMTP Probe:** Uses the retrieved MX records to ping the mailbox (unless it's a known legit provider like Gmail, which we fast-track to skip timeouts).
   - **Heuristics & Blacklist:** Checks `disposable-email-domains` npm list and analyzes the local-part for suspicious characters.
5. **Verdict & Score:** All signals are passed into `computeVerdict()`, which deterministically calculates the risk score and confidence.
6. **Cache & Log:** The verdict is stored in Redis for 24 hours, logged in Postgres `UsageLog`, and returned to the client as JSON.

## Where Things Live
- **`src/app/api/v1/verify/route.ts`**: Entry point for the verification engine REST API.
- **`src/lib/email-tools.ts`**: Contains the core signal collection logic (`checkMX`, `checkSMTP`, etc.) and the deterministic compute engine (`computeVerdict`).
- **`src/lib/auth.ts`**: Better Auth configuration, database hooks for organization scaffolding, API key rules, and Resend invite emails.
- **`prisma/schema.prisma`**: The PostgreSQL database schema, including auth tables, `Organization`, `UsageLog`, and `Apikey`.
- **`src/app/(dashboard)`**: The frontend Next.js application providing the React UI for managing API keys and viewing usage stats.

## Gotchas
- **SMTP Timeout Traps:** Major email providers (Gmail, Outlook) often tarpit or reject automated SMTP probes. To avoid massive latency or request limit hangups, the engine uses `isKnownLegitProvider` to short-circuit the SMTP check for major platforms.
- **Redis Cache Keys:** The caching currently relies on the *domain* level (`verify:domain:${domain}`) to prevent massive cache fragmentation across catch-all domains, though it returns the original email in the JSON response payload.
- **Organization Invites:** Invitation emails are configured to simulate a delay (800ms) and log to the console if the Resend API key is set to "test" or missing.
- **Usage Limits:** Rate limiting is managed both on the Better Auth plugin config level (requests per minute), but absolute limits (free tier cap) are handled manually inside the route via `prisma.usageLog.count()`.
