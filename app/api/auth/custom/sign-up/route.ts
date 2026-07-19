import { type NextRequest, NextResponse } from "next/server";
import { generateUniqueUsername } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { signUpSchema } from "@/lib/validators/auth";

/**
 * @description Post-signup hook to set a unique username on the user record.
 * Email verification is handled entirely by Better Auth's emailVerification
 * plugin (sendOnSignUp: true), which sends a clean 6-digit code via the
 * sendVerificationEmail hook in lib/auth.ts. This route must NOT re-send
 * the email or overwrite the verificationCode set by the hook.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = signUpSchema.parse(body);

    const existingUser = await db.user.findUnique({ where: { email } });

    if (!existingUser)
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );

    // Generate and persist a unique username — the only job of this route.
    const uniqueUsername = generateUniqueUsername(existingUser.name);

    await db.user.update({
      where: { email },
      data: { username: uniqueUsername },
    });

    return NextResponse.json(
      { success: true, message: "Signup processed successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during signup processing." },
      { status: 500 },
    );
  }
}
