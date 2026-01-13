"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

export const ResendEmailComponent = ({ loading }: { loading: boolean }) => {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(1);

  useEffect(() => {
    setTimeout(() => {
      if (seconds === 0 && minutes !== 0) {
        setSeconds(60);
        setMinutes(0);
      }
      if (seconds !== 0 && minutes === 0) {
        setSeconds((prev) => prev - 1);
      }
    }, 1000);
  }, [seconds, minutes]);

  return (
    <CardFooter className="flex justify-center">
      <Button variant="link" disabled={seconds !== 0 || loading} type="button">
        {seconds !== 0 ? (
          "Resend email"
        ) : (
          <Link href="/verify-email/resend">Resend email</Link>
        )}
        {seconds !== 0 && (
          <span className="ml-1 font-semibold text-[16px]">
            {minutes > 9 ? minutes : `0${minutes}`} :{" "}
            {seconds > 9 ? seconds : `0${seconds}`}s
          </span>
        )}
      </Button>
    </CardFooter>
  );
};
