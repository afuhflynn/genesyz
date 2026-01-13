import { toast } from "sonner";
import { signIn } from "../auth-client";

export const signInWithOAuth = async (
  provider: "google" | "github",
  callback?: string
) => {
  await signIn.social({
    provider,
    callbackURL: callback ?? "/dashboard",
    fetchOptions: {
      onSuccess(context) {
        //   context.data.
        //     const res = await privateAxios.post("/auth/custom/sign-up/social", {
        //   email: data.,
        // });

        toast.success("Signup successful!");
      },
    },
  });
};
