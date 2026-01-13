import { toast } from "sonner";
import { signIn } from "../auth-client";
import { privateAxios } from "@/config/axios.config";

export const signInWithOAuth = async (
  provider: "google" | "github",
  callback?: string
) => {
  await signIn.social({
    provider,
    callbackURL: callback ?? "/dashboard",
    fetchOptions: {
      onSuccess: async (context) => {
        const user = context?.data?.user;
        await privateAxios.post("/auth/custom/sign-up/social", {
          email: user?.email,
        });

        toast.success("Signup successful!");
      },
    },
  });
};
