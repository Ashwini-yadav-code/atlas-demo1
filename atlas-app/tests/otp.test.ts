import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { RateLimitedError, requestOtp, verifyOtp } from "@/lib/otp";

function uniqueEmail() {
  return `otp-test-${Date.now()}-${Math.random().toString(36).slice(2)}@test.dev`;
}

afterAll(async () => {
  await prisma.$disconnect();
});

describe("requestOtp / verifyOtp", () => {
  it("issues a 6-digit code that verifies correctly", async () => {
    const email = uniqueEmail();
    const { devCode } = await requestOtp(email);
    expect(devCode).toMatch(/^\d{6}$/);
    const ok = await verifyOtp(email, devCode!);
    expect(ok).toBe(true);
  });

  it("rejects a wrong code", async () => {
    const email = uniqueEmail();
    await requestOtp(email);
    const ok = await verifyOtp(email, "000000");
    expect(ok).toBe(false);
  });

  it("a code can only be used once", async () => {
    const email = uniqueEmail();
    const { devCode } = await requestOtp(email);
    const first = await verifyOtp(email, devCode!);
    const second = await verifyOtp(email, devCode!);
    expect(first).toBe(true);
    expect(second).toBe(false);
  });

  it("a code for one identifier does not verify another", async () => {
    const emailA = uniqueEmail();
    const emailB = uniqueEmail();
    const { devCode } = await requestOtp(emailA);
    const ok = await verifyOtp(emailB, devCode!);
    expect(ok).toBe(false);
  });

  it("an expired code does not verify", async () => {
    const email = uniqueEmail();
    const { devCode } = await requestOtp(email);
    // backdate the record past its expiry instead of waiting 10 real minutes
    await prisma.otpCode.updateMany({ where: { identifier: email }, data: { expiresAt: new Date(Date.now() - 1000) } });
    const ok = await verifyOtp(email, devCode!);
    expect(ok).toBe(false);
  });

  it("rate-limits after 5 requests in the window", async () => {
    const email = uniqueEmail();
    for (let i = 0; i < 5; i++) {
      await requestOtp(email);
    }
    await expect(requestOtp(email)).rejects.toThrow(RateLimitedError);
  });

  it("rate limiting is per-identifier, not global", async () => {
    const busyEmail = uniqueEmail();
    for (let i = 0; i < 5; i++) {
      await requestOtp(busyEmail);
    }
    const freshEmail = uniqueEmail();
    await expect(requestOtp(freshEmail)).resolves.toMatchObject({ ok: true });
  });
});
