import { Router } from "express";

import { authenticate } from "../../middlewares/auth";
import { authController } from "./auth.controller";
import { passport } from "./auth.passport";
import { env } from "../../config/env";
import { setRefreshTokenCookie } from "../../shared/utils/cookies";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/resend-verification", authController.resendVerificationEmail);
authRouter.get("/me", authenticate, authController.me);
authRouter.post("/change-password", authenticate, authController.changePassword);

// ── Google OAuth ──────────────────────────────────────────
// Step 1: Redirect user to Google's consent screen
authRouter.get(
  "/google",
  passport.authenticate("google", { session: false, scope: ["profile", "email"] })
);

// Step 2: Google redirects back here with a code — exchange it for tokens
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${env.clientBaseUrl}/login?error=google_failed` }),
  (req, res) => {
    const result = (req.user as unknown) as {
      user: { id: string; firstName: string; email: string; role: string; status: string };
      accessToken: string;
      refreshToken: string;
    };

    // Set the refresh token in an HttpOnly cookie (same as normal login)
    setRefreshTokenCookie(res, result.refreshToken);

    // Send the access token + user to the frontend via redirect query params
    // The frontend /auth/callback page will read these and log the user in
    const params = new URLSearchParams({
      token: result.accessToken,
      userId: result.user.id,
      firstName: result.user.firstName,
      email: result.user.email,
      role: result.user.role,
      status: result.user.status
    });

    return res.redirect(`${env.clientBaseUrl}/auth/callback?${params.toString()}`);
  }
);

export { authRouter };

