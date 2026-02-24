import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col overflow-hidden">

      {/* ── Particle / bokeh background ─────────────────────────── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* radial glow centre */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-[#E8643A]/5 blur-[120px]" />
        {/* scattered bokeh dots */}
        <div className="absolute top-[18%] left-[12%]  w-2 h-2 rounded-full bg-white/20 blur-[2px]" />
        <div className="absolute top-[35%] left-[28%]  w-1 h-1 rounded-full bg-white/30" />
        <div className="absolute top-[22%] left-[55%]  w-1.5 h-1.5 rounded-full bg-white/25 blur-[1px]" />
        <div className="absolute top-[60%] left-[70%]  w-2 h-2 rounded-full bg-white/15 blur-[2px]" />
        <div className="absolute top-[75%] left-[40%]  w-1 h-1 rounded-full bg-white/20" />
        <div className="absolute top-[45%] left-[85%]  w-1.5 h-1.5 rounded-full bg-white/20 blur-[1px]" />
        <div className="absolute top-[10%] left-[80%]  w-1 h-1 rounded-full bg-[#E8643A]/40" />
        <div className="absolute top-[88%] left-[15%]  w-1 h-1 rounded-full bg-[#E8643A]/30" />
        <div className="absolute top-[50%] left-[5%]   w-1.5 h-1.5 rounded-full bg-white/10 blur-[1px]" />
        <div className="absolute top-[30%] left-[95%]  w-1 h-1 rounded-full bg-white/15" />
        {/* bottom dust strip */}
        <div className="absolute bottom-[15%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute bottom-[18%] left-[10%] right-[10%] h-[60px] bg-[#E8643A]/3 blur-[40px] rounded-full" />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <header className="relative z-10 px-8 lg:px-14 flex items-center h-20">
        <Link href="/" className="font-bold text-xl tracking-tight text-white">
          Lipa<span className="text-[#E8643A]">Insight</span>
        </Link>
        <nav className="ml-auto flex gap-3 items-center">
          <Link href="/login">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/8 text-sm">
              Log in
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-[#E8643A] hover:bg-[#d4582f] text-white text-sm px-5 h-9 rounded-full">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col">
        <section className="flex-1 flex flex-col lg:flex-row items-center px-8 lg:px-14 pt-12 pb-24 gap-12 max-w-[1400px] mx-auto w-full">

          {/* Left — tagline */}
          <div className="lg:w-52 shrink-0 text-sm text-white/60 leading-relaxed hidden lg:block">
            <p>You innovate,</p>
            <p className="text-white font-semibold">we automate.</p>
          </div>

          {/* Centre — headline + CTA */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8643A] animate-pulse" />
              Phase 1 MVP · Available Now
            </div>

            <h1 className="text-[clamp(2.8rem,6vw,5.5rem)] font-extrabold leading-[1.05] tracking-tight mb-8">
              — The smarter way<br />
              to{" "}
              <span className="text-[#E8643A]">grow,</span>{" "}
              <span className="text-[#E8643A]">track,</span>{" "}
              and{" "}
              <span className="text-[#E8643A]">scale</span>{" "}
              your business.
            </h1>

            <div className="flex flex-col sm:flex-row gap-8 items-center lg:items-start mb-16">
              <div className="text-left max-w-[200px]">
                <p className="text-sm text-white/70">See LipaInsight in action</p>
                <p className="text-xs text-white/40 mt-1">Upload a CSV and explore all features live.</p>
              </div>
              <div className="w-px h-10 bg-white/15 hidden sm:block self-center" />
              <Link href="/dashboard">
                <Button className="bg-[#E8643A] hover:bg-[#d4582f] text-white h-12 px-7 rounded-xl text-sm font-medium flex items-center gap-2 shadow-[0_0_24px_#E8643A33]">
                  <CalendarCheck className="h-4 w-4" />
                  Upload Your First CSV
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-col sm:flex-row gap-10 lg:gap-16">
              <div>
                <div className="text-4xl font-extrabold text-[#E8643A] tracking-tight">
                  100<span className="text-2xl">%</span>
                </div>
                <div className="text-sm text-white/60 mt-1">Private</div>
                <div className="text-xs text-white/35">browser-only processing</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-[#E8643A] tracking-tight">
                  +3<span className="text-2xl">×</span>
                </div>
                <div className="text-sm text-white/60 mt-1">Faster reporting</div>
                <div className="text-xs text-white/35">vs manual spreadsheets</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-[#E8643A] tracking-tight">
                  4<span className="text-2xl"> formats</span>
                </div>
                <div className="text-sm text-white/60 mt-1">Auto-detected</div>
                <div className="text-xs text-white/35">M-Pesa Till, Paybill, Shopify &amp; more</div>
              </div>
            </div>
          </div>

          {/* Right — feature card */}
          <div className="lg:w-72 shrink-0 hidden lg:block">
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="h-36 bg-gradient-to-br from-[#E8643A]/20 to-[#1a0a00] flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#E8643A]/20 border border-[#E8643A]/30 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#E8643A]/50" />
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Smart CSV Engine</p>
                  <p className="text-xs text-white/40 mt-0.5">// Latest Release</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#E8643A]" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature grid ──────────────────────────────────────── */}
        <section className="relative z-10 px-8 lg:px-14 pb-24 max-w-[1400px] mx-auto w-full">
          <div className="border-t border-white/8 pt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tag: "01",
                title: "Zero Data Risk",
                body: "Your financial data never leaves your browser. All parsing happens client-side with PapaParse — zero server uploads.",
              },
              {
                tag: "02",
                title: "Instant Intelligence",
                body: "Auto-detects M-Pesa Till, Paybill, Statement, and Shopify formats. Revenue, expenses, and health score in seconds.",
              },
              {
                tag: "03",
                title: "Bank-Ready PDF",
                body: "Generate professional credit reports that prove creditworthiness to Saccos, banks, and investors.",
              },
            ].map((f) => (
              <div
                key={f.tag}
                className="group p-6 rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#E8643A]/30 transition-all duration-300"
              >
                <div className="text-[#E8643A] text-xs font-mono mb-4 opacity-60">{f.tag}</div>
                <h3 className="text-lg font-bold mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="relative z-10 px-8 lg:px-14 py-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-white/30">© 2026 LipaInsight. Built for Kenyan MSMEs.</p>
        <div className="flex gap-6 text-xs text-white/30">
          <Link href="/login" className="hover:text-white/60 transition-colors">Login</Link>
          <Link href="/dashboard" className="hover:text-white/60 transition-colors">Dashboard</Link>
        </div>
      </footer>
    </div>
  );
}
