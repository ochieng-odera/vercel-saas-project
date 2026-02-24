"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, TrendingUp, Activity, Calendar, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Report {
  id: string;
  business_name: string;
  period_start: string;
  period_end: string;
  health_score: number;
  total_revenue: number;
  total_transactions: number;
  generated_at: string;
  created_at: string;
}

function formatKES(n: number) {
  return `KES ${Number(n).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => setReports(data.reports ?? []))
      .catch(() => toast.error("Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success("Report deleted");
    } catch {
      toast.error("Failed to delete report");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Reports</h1>
          <p className="text-muted-foreground mt-1">
            {reports.length > 0
              ? `${reports.length} report${reports.length !== 1 ? "s" : ""} saved`
              : "Your analysis history will appear here"}
          </p>
        </div>
        <Link href="/dashboard">
          <Button className="bg-primary hover:bg-primary/90">
            <FileText className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && reports.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No saved reports yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Upload a CSV on the Analytics page and save your first report.
            </p>
            <Link href="/dashboard">
              <Button variant="outline">Go to Analytics</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {reports.map((report) => (
            <Card key={report.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base leading-tight">{report.business_name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleDelete(report.id)}
                    disabled={deletingId === report.id}
                  >
                    {deletingId === report.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(report.period_start)} – {formatDate(report.period_end)}
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <TrendingUp className="h-3 w-3" />
                      Revenue
                    </div>
                    <div className="text-sm font-bold text-green-600 truncate">
                      {formatKES(report.total_revenue)}
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Activity className="h-3 w-3" />
                      Transactions
                    </div>
                    <div className="text-sm font-bold">
                      {report.total_transactions.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Health Score</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          report.health_score >= 70 ? "bg-green-500" :
                          report.health_score >= 40 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${report.health_score}%` }}
                      />
                    </div>
                    <span className={cn(
                      "text-xs font-bold",
                      report.health_score >= 70 ? "text-green-600" :
                      report.health_score >= 40 ? "text-yellow-500" : "text-red-500"
                    )}>
                      {report.health_score}/100
                    </span>
                  </div>
                </div>
              </CardContent>

              <div className="px-6 py-3 border-t bg-muted/10 text-xs text-muted-foreground">
                Saved {formatDate(report.created_at)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
