/** Temporary logout button — calls the logout API and redirects to home. */
"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LOGOUT_API = "/api/auth/logout";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(LOGOUT_API, { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });

  return (
    <Button
      variant="outline"
      className={cn(className)}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {mutation.isPending ? "Logging out…" : "Log out"}
    </Button>
  );
}
