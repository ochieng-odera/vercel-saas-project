import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;
  const email = user.email ?? "";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings & Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your LipaInsight account and subscription.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>Your current subscription plan.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold mb-6">KES 0<span className="text-lg text-muted-foreground font-normal">/month</span></div>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Up to 3 CSV uploads per month</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Basic analytics dashboard</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <div className="w-full px-4 py-2 bg-muted text-center rounded-md font-medium text-sm">
              Current Plan
            </div>
          </CardFooter>
        </Card>

        <Card className="flex flex-col border-primary shadow-sm">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Pro Plan
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full uppercase tracking-wider">Recommended</span>
            </CardTitle>
            <CardDescription>Unlock full predictive analytics.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold mb-6">KES 500<span className="text-lg text-muted-foreground font-normal">/month</span></div>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Unlimited CSV uploads</span>
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Full predictive analytics & health scores</span>
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Unlimited bank-ready PDF credit reports</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <UpgradeButton userId={userId} email={email} />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
