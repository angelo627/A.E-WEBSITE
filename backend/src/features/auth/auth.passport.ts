import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";

import { prisma } from "../../config/prisma-client";
import { env } from "../../config/env";
import { generateOpaqueToken, hashOpaqueToken } from "../../shared/utils/crypto";
import { signAccessToken, AccessTokenPayload } from "../../shared/utils/token";

function addDays(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function generateUsername(base: string): string {
  const slug = base.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${slug}_${Math.random().toString(36).slice(2, 7)}`;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: `${env.appBaseUrl}/api/auth/google/callback`,
      scope: ["profile", "email"]
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const firstName = profile.name?.givenName ?? profile.displayName ?? "User";
        const lastName = profile.name?.familyName ?? "";
        const avatarUrl = profile.photos?.[0]?.value ?? null;

        if (!email) {
          return done(new Error("No email provided by Google."));
        }

        // Check if user already exists (by googleId or by email)
        let user = await prisma.user.findFirst({
          where: {
            OR: [{ googleId: profile.id }, { email }]
          }
        });

        if (user) {
          // Link googleId if not already linked
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id, lastLoginAt: new Date() }
            });
          } else {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() }
            });
          }
        } else {
          // Create brand-new user — no password needed
          const username = generateUsername(`${firstName}${lastName}`);
          user = await prisma.user.create({
            data: {
              firstName,
              lastName,
              username,
              email,
              googleId: profile.id,
              avatarUrl,
              role: "STUDENT",
              status: "ACTIVE",
              emailVerifiedAt: new Date()
            }
          });
        }

        // Create a fresh session
        const refreshToken = generateOpaqueToken();
        const refreshTokenHash = hashOpaqueToken(refreshToken, env.refreshTokenSecret);

        const session = await prisma.session.create({
          data: {
            userId: user.id,
            refreshTokenHash,
            expiresAt: addDays(env.refreshTokenTtlDays),
            lastUsedAt: new Date()
          }
        });

        const accessToken = signAccessToken({
          sub: user.id,
          email: user.email,
          role: user.role as AccessTokenPayload["role"],
          status: user.status as AccessTokenPayload["status"],
          sessionId: session.id
        });

        return done(null, { user, accessToken, refreshToken } as any);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// Needed by passport even if we don't use sessions
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user as Express.User));

export { passport };
