import { NextResponse } from "next/server";
import { z } from "zod";
import { requestOtp } from "@/lib/otp";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const { devCode } = await requestOtp(parsed.data.email.trim().toLowerCase());
  // devCode is only ever set outside production — see the comment in
  // src/lib/otp.ts. A real deployment needs an email/SMS provider wired
  // into requestOtp() before this route is safe to ship.
  return NextResponse.json({ ok: true, devCode });
}
