import { prisma } from "@/lib/prisma";

const OTP_TTL_MINUTES = 10;
const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_REQUESTS = 5;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Issues a one-time code for `identifier` (email) and "sends" it.
 *
 * There is no real email/SMS provider wired in — that needs a service like
 * Resend, Postmark, or Twilio plus API credentials, none of which exist in
 * this environment. In development the code is logged to the server console
 * and also returned in the response so the flow is actually testable
 * end-to-end; `devCode` must be stripped once a real provider is wired in
 * (search this file for the one place it's read).
 */
export class RateLimitedError extends Error {
  constructor() {
    super("Too many codes requested. Wait a few minutes and try again.");
    this.name = "RateLimitedError";
  }
}

export async function requestOtp(identifier: string) {
  // DB-backed rate limit — no Redis/edge KV in this environment, but the
  // OtpCode table already has everything needed to count recent requests.
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
  const recentCount = await prisma.otpCode.count({ where: { identifier, createdAt: { gt: windowStart } } });
  if (recentCount >= RATE_LIMIT_MAX_REQUESTS) throw new RateLimitedError();

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpCode.create({ data: { identifier, code, expiresAt } });

  // eslint-disable-next-line no-console
  console.log(`[otp] code for ${identifier}: ${code} (expires in ${OTP_TTL_MINUTES}m)`);

  const isDev = process.env.NODE_ENV !== "production";
  return { ok: true, devCode: isDev ? code : undefined };
}

export async function verifyOtp(identifier: string, code: string): Promise<boolean> {
  const record = await prisma.otpCode.findFirst({
    where: { identifier, code, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return false;

  await prisma.otpCode.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
  return true;
}
