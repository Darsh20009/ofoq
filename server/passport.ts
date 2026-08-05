import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// @ts-ignore — passport-apple has no bundled types
import AppleStrategy from "passport-apple";
import { UserModel } from "./models/index.js";

// This app can be reached from several domains depending on environment
// (Replit dev preview subdomain, a custom production domain, Render). OAuth
// providers redirect back to a pre-registered callback URL, so instead of a
// static APP_URL we use a relative callbackURL + `proxy: true`, which makes
// passport-oauth2 resolve it against the *actual* incoming request's host
// (respecting `trust proxy`). Register the callback path for every domain
// you test from in the provider's console.
export const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
export const appleEnabled = Boolean(
  process.env.APPLE_CLIENT_ID &&
  process.env.APPLE_TEAM_ID &&
  process.env.APPLE_KEY_ID &&
  process.env.APPLE_PRIVATE_KEY
);

// Passport is used here purely as an OAuth handshake helper — the app issues
// its own JWTs afterwards, so no passport session serialization is needed.
passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

// OAuth callbacks must point to the running API service. Keep this separate
// from APP_URL because the public marketing domain may be hosted elsewhere.
const BASE_URL = (
  process.env.OAUTH_BASE_URL ||
  process.env.APP_URL ||
  "https://www.ofoqhc.com"
).replace(/\/$/, "");

if (googleEnabled) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${BASE_URL}/api/auth/google/callback`,
      proxy: true,
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error("لم يتم الحصول على بريد إلكتروني من Google"));

        let user = await UserModel.findOne({ $or: [{ googleId: profile.id }, { email }] });
        if (!user) {
          user = await UserModel.create({
            fullName: profile.displayName || email.split("@")[0],
            email,
            googleId: profile.id,
            role: "client",
            status: "active",
            emailVerified: true,
            avatar: profile.photos?.[0]?.value,
          });
        } else if (!user.googleId) {
          user.googleId = profile.id;
          if (!user.emailVerified) user.emailVerified = true;
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  ));
  console.log("✅ Google OAuth strategy configured");
} else {
  console.warn("⚠️  Google OAuth not configured — set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET to enable it");
}

if (appleEnabled) {
  passport.use(new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID!,
      teamID: process.env.APPLE_TEAM_ID!,
      keyID: process.env.APPLE_KEY_ID!,
      privateKeyString: process.env.APPLE_PRIVATE_KEY!,
      callbackURL: `${BASE_URL}/api/auth/apple/callback`,
      proxy: true,
      passReqToCallback: false,
      scope: ["name", "email"],
    },
    async (_accessToken: string, _refreshToken: string, idTokenOrProfile: any, profile: any, done: any) => {
      try {
        // passport-apple gives the decoded id_token claims as the 3rd/4th arg
        // depending on version; normalize by checking both.
        const claims = profile?.id ? profile : idTokenOrProfile;
        const appleId: string = claims?.id || claims?.sub;
        const email: string | undefined = claims?.email?.toLowerCase();
        if (!appleId) return done(new Error("لم يتم الحصول على هوية Apple"));

        let user = email
          ? await UserModel.findOne({ $or: [{ appleId }, { email }] })
          : await UserModel.findOne({ appleId });

        if (!user) {
          if (!email) return done(new Error("مطلوب بريد إلكتروني لإنشاء حساب جديد عبر Apple"));
          user = await UserModel.create({
            fullName: email.split("@")[0],
            email,
            appleId,
            role: "client",
            status: "active",
            emailVerified: true,
          });
        } else if (!user.appleId) {
          user.appleId = appleId;
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  ));
  console.log("✅ Apple OAuth strategy configured");
} else {
  console.warn("⚠️  Apple Sign-In not configured — set APPLE_CLIENT_ID / APPLE_TEAM_ID / APPLE_KEY_ID / APPLE_PRIVATE_KEY to enable it");
}

export default passport;
