import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reports: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    businessName,
    periodStart,
    periodEnd,
    healthScore,
    totalRevenue,
    totalTransactions,
    csvFormat,
  } = body;

  const reportHash = crypto
    .createHash("sha256")
    .update(`${user.id}-${periodStart}-${periodEnd}-${totalTransactions}`)
    .digest("hex")
    .slice(0, 32);

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      user_id: user.id,
      report_hash: reportHash,
      business_name: businessName || "My Business",
      period_start: periodStart,
      period_end: periodEnd,
      health_score: healthScore,
      total_revenue: totalRevenue,
      total_transactions: totalTransactions,
      generated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (reportError) {
    if (reportError.code === "23505") {
      return NextResponse.json({ error: "Report already saved" }, { status: 409 });
    }
    return NextResponse.json({ error: reportError.message }, { status: 500 });
  }

  await supabase.from("usage_logs").insert({
    user_id: user.id,
    action: "CSV_UPLOAD",
    csv_format: csvFormat,
    transaction_count: totalTransactions,
  });

  return NextResponse.json({ report }, { status: 201 });
}
