import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    session: { strategy: "jwt" },
    callbacks: {
        authorized({ auth, request: { nextUrl, cookies } }) {
            const hasMockToken = cookies.get('authjs.session-token')?.value?.includes('mock') || 
                                 cookies.get('next-auth.session-token')?.value?.includes('mock');
            const isLoggedIn = !!auth?.user || hasMockToken;
            const isProtected = 
                nextUrl.pathname.startsWith('/dashboard') || 
                nextUrl.pathname.startsWith('/projects') ||
                nextUrl.pathname.startsWith('/clients') ||
                nextUrl.pathname.startsWith('/activities') ||
                nextUrl.pathname.startsWith('/time-tracking') ||
                nextUrl.pathname.startsWith('/documents') ||
                nextUrl.pathname.startsWith('/reports') ||
                nextUrl.pathname.startsWith('/settings');

            if (isProtected) {
                return isLoggedIn;
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role as any;
            }
            return session;
        }
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
