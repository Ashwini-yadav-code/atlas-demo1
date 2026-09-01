import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";

// Credentials + database sessions don't mix in NextAuth (the adapter's
// database-session strategy is only wired for OAuth providers), so this
// runs JWT sessions and resolves the app User row ourselves in authorize().
// Account/Session models stay in schema.prisma for when a real OAuth
// provider (Google, per the checklist) gets added later.
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/auth" },
  providers: [
    Credentials({
      id: "otp",
      name: "Email code",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(creds) {
        const email = String(creds?.email ?? "").trim().toLowerCase();
        const code = String(creds?.code ?? "").trim();
        if (!email || !code) return null;

        const ok = await verifyOtp(email, code);
        if (!ok) return null;

        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            name: typeof creds?.name === "string" && creds.name ? creds.name : null,
          },
        });

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
