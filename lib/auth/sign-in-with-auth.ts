import { signIn } from "../auth-client";

export const signInWithOAuth = async (
  provider: "google" | "github",
  callback?: string
) => {
  await signIn.social({ provider, callbackURL: callback ?? "/dashboard" });
};
