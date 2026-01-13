"use client";

import Link from "next/link";
import { useQueryStates } from "nuqs";
import { searchParamsSchema } from "@/nuqs";
import { CardFooter } from "../ui/card";

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
