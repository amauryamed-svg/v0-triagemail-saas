import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { adminClient } from "./db/supabase"

const GMAIL_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.labels",
].join(" ")

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: GMAIL_SCOPES,
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.access_token = account.access_token
        token.refresh_token = account.refresh_token
        token.expires_at = account.expires_at
      }
      if (profile?.email) token.email = profile.email
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).access_token = token.access_token
      }
      return session
    },
    async signIn({ user, account }) {
      if (!user.email) return false
      // Upsert into users table; persist Gmail tokens for cron use.
      const sb = adminClient()
      await sb.from("users").upsert(
        {
          email: user.email,
          name: user.name ?? null,
          image_url: user.image ?? null,
          gmail_access_token: account?.access_token ?? null,
          gmail_refresh_token: account?.refresh_token ?? null,
          gmail_token_expires_at: account?.expires_at
            ? new Date(account.expires_at * 1000).toISOString()
            : null,
        },
        { onConflict: "email" },
      )
      return true
    },
  },
})
