"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Download, FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Sector = "Education" | "Health" | "ICT" | "YE&L" | "Disability" | "Climate Change";
type Activity = {
  id: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  sector: Sector;
  title: string;
  plannedUsd: number;
  actualUsd: number;
  reached: number;
  status: "On Track" | "At Risk" | "Complete";
};

const TOTAL_FUNDING_USD = 1_000_000;

function seededRandom(seed: number): () => number {
  let current = seed;
  return () => {
    current = (current * 1664525 + 1013904223) >>> 0;
    return current / 4294967296;
  };
}

function randomBetween(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function generateActivities(seed = 2026): Activity[] {
  const rng = seededRandom(seed);
  const titles = [
    "School fee disbursement",
    "Ward planning meeting",
    "Community health outreach",
    "ICT training day",
    "YE&L mentorship session",
    "Disability inclusion forum",
    "Climate adaptation workshop",
    "Monitoring & evaluation review",
  ];
  const sectors: Sector[] = ["Education", "Health", "ICT", "YE&L", "Disability", "Climate Change"];
  const quarters: Array<"Q1" | "Q2" | "Q3" | "Q4"> = ["Q1", "Q1", "Q2", "Q2", "Q3", "Q3", "Q4", "Q4"];

  return Array.from({ length: 16 }, (_, idx) => {
    const planned = randomBetween(rng, 14_000, 75_000);
    const actual = randomBetween(rng, Math.round(planned * 0.55), planned);
    return {
      id: `ACT-${String(idx + 1).padStart(3, "0")}`,
      quarter: quarters[idx % quarters.length],
      sector: sectors[idx % sectors.length],
      title: titles[idx % titles.length],
      plannedUsd: planned,
      actualUsd: actual,
      reached: randomBetween(rng, 20, 190),
      status: actual >= planned * 0.9 ? "Complete" : actual >= planned * 0.7 ? "On Track" : "At Risk",
    };
  });
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminFinancePage() {
  const [activities] = useState<Activity[]>(() => generateActivities());
  const summary = useMemo(() => {
    const planned = activities.reduce((sum, item) => sum + item.plannedUsd, 0);
    const actual = activities.reduce((sum, item) => sum + item.actualUsd, 0);
    const reached = activities.reduce((sum, item) => sum + item.reached, 0);
    return {
      planned,
      actual,
      reached,
      utilization: (actual / TOTAL_FUNDING_USD) * 100,
      runway: Math.max(TOTAL_FUNDING_USD - actual, 0),
    };
  }, [activities]);

  const byQuarter = useMemo(() => {
    return (["Q1", "Q2", "Q3", "Q4"] as const).map((quarter) => {
      const rows = activities.filter((item) => item.quarter === quarter);
      const planned = rows.reduce((sum, item) => sum + item.plannedUsd, 0);
      const actual = rows.reduce((sum, item) => sum + item.actualUsd, 0);
      return { quarter, planned, actual, utilization: planned ? (actual / planned) * 100 : 0 };
    });
  }, [activities]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to homepage
      </Link>

      <section className="space-y-3 rounded-xl border border-primary/20 bg-background/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Admin Real-Time Funding Intelligence</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const header = "Activity,Quarter,Sector,Planned USD,Actual USD,Reached,Status";
                const rows = activities.map((a) =>
                  [a.title, a.quarter, a.sector, a.plannedUsd, a.actualUsd, a.reached, a.status].join(",")
                );
                triggerDownload([header, ...rows].join("\n"), "admin-funding-report.csv", "text/csv");
              }}
            >
              <Download />
              CSV
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                triggerDownload(
                  `Funding Utilized: $${summary.actual.toLocaleString()} (${summary.utilization.toFixed(1)}%)`,
                  "admin-quarterly-brief.pdf",
                  "application/pdf"
                )
              }
            >
              <FileDown />
              PDF
            </Button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <p className="rounded-lg border p-3 text-sm">Envelope: ${TOTAL_FUNDING_USD.toLocaleString()}</p>
          <p className="rounded-lg border p-3 text-sm">Utilized: ${summary.actual.toLocaleString()}</p>
          <p className="rounded-lg border p-3 text-sm">Runway: ${summary.runway.toLocaleString()}</p>
          <p className="rounded-lg border p-3 text-sm">Reached: {summary.reached.toLocaleString()}</p>
        </div>
        <div className="space-y-2">
          {byQuarter.map((item) => (
            <div key={item.quarter}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{item.quarter}</span>
                <span className="text-muted-foreground">{item.utilization.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(item.utilization, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-primary/20 bg-background/70 p-4">
        <h2 className="mb-3 text-xl font-semibold">Activity Budget Tracker</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Quarter</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Planned</TableHead>
              <TableHead>Actual</TableHead>
              <TableHead>Reached</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.title}</TableCell>
                <TableCell>{a.quarter}</TableCell>
                <TableCell>{a.sector}</TableCell>
                <TableCell>${a.plannedUsd.toLocaleString()}</TableCell>
                <TableCell>${a.actualUsd.toLocaleString()}</TableCell>
                <TableCell>{a.reached}</TableCell>
                <TableCell>{a.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </main>
  );
}
