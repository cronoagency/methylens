import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { Resend } from "resend";
import { prisma } from "./prisma";

const providers = [];

if (process.env.RESEND_API_KEY) {
  providers.push(
    EmailProvider({
      server: "smtp://dummy:dummy@localhost:25", // Required by next-auth but unused — we use sendVerificationRequest
      from: process.env.EMAIL_FROM || "Methylens <onboarding@resend.dev>",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "Methylens <onboarding@resend.dev>",
          to: email,
          subject: "Sign in to Methylens",
          html: `<p>Click <a href="${url}">here</a> to sign in to Methylens.</p>`,
        });
      },
    })
  );
}

if (process.env.NODE_ENV !== "production") {
  providers.push(
    CredentialsProvider({
      name: "Dev Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password (any)", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        // Find or create user in dev
        const user = await prisma.user.upsert({
          where: { email: credentials.email as string },
          update: {},
          create: { email: credentials.email as string },
        });
        return { id: user.id, email: user.email };
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers,
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=true",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Fetch role from DB
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, plan: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.plan = dbUser.plan;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).plan = token.plan;
      }
      return session;
    },
  },
});
