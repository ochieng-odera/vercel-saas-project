"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
      onClick={handleSignOut}
    >
      <LogOut size={20} className="mr-3" />
      Sign Out
    </Button>
  );
}
