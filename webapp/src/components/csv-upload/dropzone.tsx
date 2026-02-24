"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { parseCSVFile, type ParseResult, type CSVFormat } from "@/lib/csv-detector";
import { cn } from "@/lib/utils";

interface CSVDropzoneProps {
  onParsed: (result: ParseResult) => void;
  className?: string;
}

const FORMAT_BADGES: Record<CSVFormat, { label: string; color: string }> = {
  mpesa_statement: { label: "M-Pesa Statement", color: "bg-green-100 text-green-800 border-green-200" },
  mpesa_till:      { label: "M-Pesa Till",      color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  mpesa_paybill:   { label: "M-Pesa Paybill",   color: "bg-teal-100 text-teal-800 border-teal-200" },
  shopify:         { label: "Shopify Orders",    color: "bg-purple-100 text-purple-800 border-purple-200" },
  unknown:         { label: "Unknown Format",    color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
};

type UploadState = "idle" | "dragging" | "parsing" | "success" | "error";

export function CSVDropzone({ onParsed, className }: CSVDropzoneProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setState("error");
      setErrorMsg("Please upload a valid CSV file.");
      return;
    }

    setFileName(file.name);
    setState("parsing");
    setProgress(0);

    const fakeProgress = setInterval(() => {
      setProgress((p) => Math.min(p + 12, 85));
    }, 120);

    try {
      const parsed = await parseCSVFile(file, () => {
        clearInterval(fakeProgress);
        setProgress(100);
      });

      clearInterval(fakeProgress);
      setProgress(100);

      if (parsed.errors.length > 0 && parsed.totalRows === 0) {
        setState("error");
        setErrorMsg(parsed.errors[0]);
      } else {
        setResult(parsed);
        setState("success");
        onParsed(parsed);
      }
    } catch (err) {
      clearInterval(fakeProgress);
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to parse file.");
    }
  }, [onParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("dragging");
  }, []);

  const handleDragLeave = useCallback(() => {
    setState("idle");
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }, [processFile]);

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setFileName("");
    setErrorMsg("");
    setProgress(0);
  };

  const formatBadge = result ? FORMAT_BADGES[result.format] : null;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Drop Zone */}
      {state !== "success" && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => state === "idle" && fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none",
            "min-h-[220px] p-8 text-center",
            state === "idle" && "border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/50",
            state === "dragging" && "border-primary bg-primary/5 scale-[1.01] shadow-md",
            state === "parsing" && "border-primary/40 bg-muted/20 cursor-default pointer-events-none",
            state === "error" && "border-destructive/50 bg-destructive/5 cursor-default"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />

          {state === "idle" && (
            <>
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UploadCloud className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Drop your CSV file here</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                Auto-detects M-Pesa Till, Paybill, Statement, and Shopify formats
              </p>
              <Button size="sm" variant="outline" className="pointer-events-none">
                Browse Files
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                🔒 Processed entirely in your browser — never uploaded
              </p>
            </>
          )}

          {state === "dragging" && (
            <>
              <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-pulse">
                <UploadCloud className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary">Release to upload</h3>
            </>
          )}

          {state === "parsing" && (
            <>
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Loader2 className="h-7 w-7 text-primary animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Parsing {fileName}</h3>
              <p className="text-sm text-muted-foreground mb-4">Detecting format and reading transactions…</p>
              <div className="w-full max-w-xs">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-right">{progress}%</p>
              </div>
            </>
          )}

          {state === "error" && (
            <>
              <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertCircle className="h-7 w-7 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-destructive mb-1">Upload Failed</h3>
              <p className="text-sm text-muted-foreground mb-4">{errorMsg}</p>
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
                Try Again
              </Button>
            </>
          )}
        </div>
      )}

      {/* Success State */}
      {state === "success" && result && (
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{fileName}</span>
                  {formatBadge && (
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full border font-medium",
                      formatBadge.color
                    )}>
                      {formatBadge.label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {result.totalRows.toLocaleString()} rows · {result.transactions.length.toLocaleString()} transactions parsed
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleReset}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Parse warnings */}
          {result.errors.length > 0 && (
            <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-800">{result.errors[0]}</p>
            </div>
          )}

          {/* Preview table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Date</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Description</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium">Amount</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {result.transactions.slice(0, 8).map((tx, i) => (
                  <tr key={tx.id + i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                      {tx.date instanceof Date && !isNaN(tx.date.getTime())
                        ? tx.date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-2 max-w-[240px] truncate">{tx.description || "—"}</td>
                    <td className={cn(
                      "px-4 py-2 text-right font-mono font-medium whitespace-nowrap",
                      tx.type === "credit" ? "text-green-600" : "text-red-500"
                    )}>
                      {tx.type === "credit" ? "+" : "−"}
                      {Math.abs(tx.amount).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-medium",
                        tx.type === "credit"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      )}>
                        {tx.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.transactions.length > 8 && (
            <div className="px-4 py-2 border-t bg-muted/10">
              <p className="text-xs text-muted-foreground text-center">
                Showing 8 of {result.transactions.length.toLocaleString()} transactions
              </p>
            </div>
          )}

          {/* Re-upload option */}
          <div className="px-4 py-3 border-t bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span>Ready to analyze</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => { handleReset(); setTimeout(() => fileInputRef.current?.click(), 50); }}
            >
              Upload different file
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
