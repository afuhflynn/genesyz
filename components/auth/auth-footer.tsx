"use client";

import Link from "next/link";
import { CardFooter } from "../ui/card";
import { useQueryStates } from "nuqs";
import { searchParamsSchema } from "@/nuqs";

export const AuthFooter = ({
  footerLink,
  footerLinkText,
  footerText,
}: {
  footerText: string;
  footerLink: string;
  footerLinkText: string;
}) => {
  const [params] = useQueryStates(searchParamsSchema);
  const { redirect } = params;

  return (
    <CardFooter className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-sm">
      {footerText}{" "}
      <Link
        href={`${footerLink}${
          redirect !== null ? `?redirect=${redirect}` : ""
        }`}
        className="text-primary font-medium hover:underline"
      >
        {footerLinkText}
      </Link>
    </CardFooter>
  );
};
