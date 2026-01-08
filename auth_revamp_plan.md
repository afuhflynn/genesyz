# Implementation Plan: Auth & Email Revamp

This plan outlines the steps to refine the authentication flow, integrate Better Auth internals for password management, and implement a premium email system using `lib/email`.

## 1. Email System Refinement (`lib/email`)
- [x] **Add Verification Template**: Implement `sendVerificationEmail` in `lib/email/send.ts` with a 6-digit OTP code and a "Verify Email" button.
- [x] **Add Password Reset Template**: Implement `sendPasswordResetEmail` in `lib/email/send.ts` with a secure reset link.
- [x] **Branding**: Ensure all emails use the `IdeasVault` logo and consistent color palette.

## 2. Better Auth Configuration (`lib/auth.ts`)
- [x] **Enable Email/Password**: Set `emailAndPassword.enabled: true`.
- [x] **Email Verification Plugin**: Handled manually as per user request.
- [x] **Password Reset**: Ensure `auth.api.requestPasswordReset` and `auth.api.resetPassword` are correctly configured.

## 3. API Client & Hooks Integration
- [x] **Update `lib/api-client.ts`**: Add auth mutations:
  - `auth.forgotPassword(email)`
  - `auth.resetPassword(password, token)`
  - `auth.verifyEmail(code, email)`
  - `auth.resendVerification(email)`
- [x] **Update `hooks/index.ts`**: Add corresponding React Query hooks:
  - `useForgotPassword()`
  - `useResetPassword()`
  - `useVerifyEmail()`
  - `useResendVerification()`

## 4. Refactor Custom Auth API Routes (`app/api/auth/custom/*`)
- [x] **`forgot-password`**: Refactor to use Better Auth's `requestPasswordReset` and `lib/email`.
- [x] **`reset-password`**: Refactor to use Better Auth's `resetPassword`.
- [x] **`verify-email`**: Refactor to use manual OTP check that updates the `User` model.
- [x] **`resend-verification-email`**: Refactor to use `lib/email` and manual verification token generation.

## 5. Refactor Auth UI Pages (`app/(auth)/*`)
- [x] **Sign Up**: Use `authClient.signUp.email()` and then redirect to the verification page.
- [x] **Sign In**: Use `authClient.signIn.email()`.
- [x] **Verify Email**: Implement a clean OTP input (using `input-otp`) and use the `useVerifyEmail` hook.
- [x] **Forgot Password**: Use the `useForgotPassword` hook.
- [x] **Reset Password**: Use the `useResetPassword` hook.

## 6. Schema & Cleanup
- [x] **Prisma Schema**: Ensure the `User` model has the necessary fields for Better Auth and our manual verification flow.
- [x] **Code Cleanup**: Remove redundant `@/utils/send.emails` references and consolidate under `lib/email`.
