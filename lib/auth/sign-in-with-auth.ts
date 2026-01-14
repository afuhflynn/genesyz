import { signIn } from "../auth-client";

export const signInWithOAuth = async (
  provider: "google" | "github",
  callback: string | null
) => {
  await signIn.social({
    provider,
    callbackURL: callback !== null ? callback : "/dashboard",
    // fetchOptions: {
    //   onResponse(context) {
    //       const user = context?.data?.user;
    //       await privateAxios.post("/auth/custom/sign-up/social", {
    //         email: user?.email,
    //       });

    //       toast.success("Signup successful!");
    //   },
    // },
  });
};
