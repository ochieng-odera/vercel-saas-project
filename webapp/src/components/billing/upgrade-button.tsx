"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";

export function UpgradeButton({ userId, email }: { userId: string; email?: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      toast.error("Something went wrong during checkout.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={onClick} disabled={isLoading} className="w-full sm:w-auto">
      <CreditCard className="mr-2 h-4 w-4" />
      {isLoading ? "Redirecting..." : "Upgrade to Pro"}
    </Button>
  );
}
