"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, CreditCard, Activity, ArrowUpRight, ArrowDownRight, Save, CheckCircle2, Loader2 } from "lucide-react";
import { CSVDropzone } from "@/components/csv-upload/dropzone";
import type { ParseResult } from "@/lib/csv-detector";
import { toast } from "sonner";
import Link from "next/link";

interface Metrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  txCount: number;
  healthScore: number;
  periodStart: Date;
  periodEnd: Date;
}

function computeMetrics(result: ParseResult): Metrics {
  let totalRevenue = 0;
  let totalExpenses = 0;
  let periodStart = new Date();
  let periodEnd = new Date(0);

  for (const tx of result.transactions) {
    if (tx.type === "credit") totalRevenue += tx.amount;
    else totalExpenses += Math.abs(tx.amount);

    if (tx.date instanceof Date && !isNaN(tx.date.getTime())) {
      if (tx.date < periodStart) periodStart = tx.date;
      if (tx.date > periodEnd) periodEnd = tx.date;
    }
  }

  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? netProfit / totalRevenue : 0;
  const healthScore = Math.round(Math.min(100, Math.max(0, 50 + margin * 100)));

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    txCount: result.transactions.length,
    healthScore,
    periodStart,
    periodEnd,
  };
}

function toCsvFormatEnum(format: string): string {
  const map: Record<string, string> = {
    mpesa_statement: "MPESA_TILL",
    mpesa_till: "MPESA_TILL",
    mpesa_paybill: "MPESA_PAYBILL",
    shopify: "SHOPIFY",
    unknown: "GENERIC",
  };
  return map[format] ?? "GENERIC";
}

function formatKES(n: number) {
  return `KES ${Math.abs(n).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
}

export default function DashboardPage() {
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const metrics = parseResult ? computeMetrics(parseResult) : null;

  const handleSaveReport = async () => {
    if (!parseResult || !metrics) return;
    setSaving(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodStart: metrics.periodStart.toISOString(),
          periodEnd: metrics.periodEnd.toISOString(),
          healthScore: metrics.healthScore,
          totalRevenue: metrics.totalRevenue,
          totalTransactions: metrics.txCount,
          csvFormat: toCsvFormatEnum(parseResult.format),
        }),
      });

      if (res.status === 409) {
        toast.info("This report has already been saved.");
        setSaved(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSaved(true);
      toast.success("Report saved! View it in Saved Reports.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save report.");
    } finally {
      setSaving(false);
    }
  };

  const handleNewParse = (result: ParseResult) => {
    setParseResult(result);
    setSaved(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
          <p className="text-muted-foreground mt-1">
            {parseResult
              ? `Showing insights from ${parseResult.formatLabel} · ${parseResult.transactions.length.toLocaleString()} transactions`
              : "Upload your latest M-Pesa statement to see insights."}
          </p>
        </div>

        {metrics && (
          <div className="flex items-center gap-3">
            {saved ? (
              <Link href="/dashboard/reports">
                <Button variant="outline" size="sm" className="h-9 gap-2 text-green-600 border-green-200 hover:bg-green-50">
                  <CheckCircle2 className="h-4 w-4" />
                  View in Reports
                </Button>
              </Link>
            ) : (
              <Button
                size="sm"
                className="h-9 gap-2"
                onClick={handleSaveReport}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving…" : "Save Report"}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* CSV Upload */}
      <CSVDropzone onParsed={handleNewParse} />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics ? formatKES(metrics.totalRevenue) : "KES 0.00"}
            </div>
            {metrics && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                {metrics.txCount} transactions
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {metrics ? formatKES(metrics.totalExpenses) : "KES 0.00"}
            </div>
            {metrics && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3 text-red-400" />
                outflows
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics && metrics.netProfit >= 0 ? "text-green-600" : "text-red-500"}`}>
              {metrics
                ? `${metrics.netProfit >= 0 ? "" : "−"}${formatKES(metrics.netProfit)}`
                : "KES 0.00"}
            </div>
            {metrics && (
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.totalRevenue > 0
                  ? `${((metrics.netProfit / metrics.totalRevenue) * 100).toFixed(1)}% margin`
                  : "no revenue"}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              !metrics ? "" :
              metrics.healthScore >= 70 ? "text-green-600" :
              metrics.healthScore >= 40 ? "text-yellow-500" : "text-red-500"
            }`}>
              {metrics ? `${metrics.healthScore}/100` : "--/100"}
            </div>
            {metrics && (
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.healthScore >= 70 ? "🟢 Healthy" : metrics.healthScore >= 40 ? "🟡 Monitor" : "🔴 At Risk"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue Velocity</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center bg-muted/20 border-t">
            <p className="text-muted-foreground text-sm">
              {parseResult ? "Charts coming in next sprint" : "Upload data to view chart"}
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Transaction Density</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center bg-muted/20 border-t">
            <p className="text-muted-foreground text-sm">
              {parseResult ? "Charts coming in next sprint" : "Upload data to view chart"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
