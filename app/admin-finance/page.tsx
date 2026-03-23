"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, FileDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Sector = "Education" | "Health" | "ICT" | "YE&L" | "Disability" | "Climate Change";
type Activity = {
  id: string;
  year: 2025 | 2026;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  sector: Sector;
  cadence: "Daily" | "Weekly" | "Monthly";
  organizer: string;
  organization: string;
  location: string;
  title: string;
  plannedUsd: number;
  actualUsd: number;
  attendance: number;
  successCriteria: string;
  successRate: number;
  status: "Scheduled" | "In Progress" | "Completed" | "At Risk";
  scheduleLabel: string;
  scheduledAt: string;
  completedAt?: string;
};

const TOTAL_FUNDING_USD = 1_000_000;
const PERIODS = [
  { year: 2025 as const, quarter: "Q1" as const },
  { year: 2025 as const, quarter: "Q2" as const },
  { year: 2025 as const, quarter: "Q3" as const },
  { year: 2026 as const, quarter: "Q1" as const },
];

function quarterToIndex(quarter: "Q1" | "Q2" | "Q3" | "Q4") {
  return (["Q1", "Q2", "Q3", "Q4"] as const).indexOf(quarter);
}

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
  const now = new Date();
  const currentQuarter = "Q1";
  const currentYear = 2026;
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
  const cadences: Array<"Daily" | "Weekly" | "Monthly"> = ["Daily", "Weekly", "Monthly"];
  const organizers = ["Bruno", "Akinyi", "Otieno", "Faith", "Omondi", "Atieno"];
  const organizations = ["Africii Kenya", "Nyalenda CBO Network", "Kisumu Education Desk", "Health Link Trust"];
  const locations = ["Nyalenda A", "Nyalenda B", "Kondele", "Manyatta B", "Kisumu Central", "Kajulu"];
  const successCriteria = [
    "Target attendance achieved",
    "Budget variance under 10%",
    "Follow-up action closure",
    "Beneficiary satisfaction above 80%",
  ];

  return Array.from({ length: 16 }, (_, idx) => {
    const period = PERIODS[idx % PERIODS.length];
    const quarter = period.quarter;
    const year = period.year;
    const quarterIndex = quarterToIndex(quarter);
    const quarterStartMonth = quarterIndex * 3;
    const scheduledAt = new Date(
      year,
      quarterStartMonth + randomBetween(rng, 0, 2),
      randomBetween(rng, 2, 26),
      randomBetween(rng, 8, 16),
      randomBetween(rng, 0, 59)
    );
    const planned = randomBetween(rng, 14_000, 75_000);
    let actual = randomBetween(rng, Math.round(planned * 0.1), Math.round(planned * 0.9));
    const lifecycle = idx % 4; // deterministic split for demo
    let scheduleLabel = "Next month";
    let status: Activity["status"] = "Scheduled";
    let completedAt: string | undefined;

    const isClosedQuarter = year < currentYear || (year === currentYear && quarter !== currentQuarter);
    const isCurrentQuarter = year === currentYear && quarter === currentQuarter;
    const periodScale = year === 2026 && quarter === "Q1" ? 1.25 : year === 2025 && quarter === "Q3" ? 1.05 : 0.9;
    const scaledPlanned = Math.round(planned * periodScale);

    if (isClosedQuarter) {
      // Closed quarters should look final and immutable.
      actual = randomBetween(rng, Math.round(scaledPlanned * 0.82), scaledPlanned);
      status = "Completed";
      scheduleLabel = "Closed quarter";
      const completedDate = new Date(scheduledAt);
      completedDate.setDate(scheduledAt.getDate() + randomBetween(rng, 0, 5));
      completedDate.setHours(randomBetween(rng, 12, 18));
      completedAt = completedDate.toISOString();
    } else if (!isCurrentQuarter) {
      // Future quarter plans stay scheduled with early commitments only.
      actual = randomBetween(rng, Math.round(scaledPlanned * 0.04), Math.round(scaledPlanned * 0.22));
      status = "Scheduled";
      scheduleLabel = scheduledAt.getMonth() === now.getMonth() ? "Later this month" : "Upcoming quarter";
    } else if (lifecycle === 0) {
      scheduledAt.setDate(now.getDate() + randomBetween(rng, 2, 7));
      scheduleLabel = "Next week";
      status = "Scheduled";
    } else if (lifecycle === 1) {
      scheduledAt.setDate(now.getDate() + randomBetween(rng, 12, 28));
      scheduleLabel = "Next month";
      status = "Scheduled";
    } else if (lifecycle === 2) {
      scheduledAt.setHours(now.getHours() - randomBetween(rng, 1, 3));
      scheduleLabel = "Today";
      status = "In Progress";
    } else {
      scheduledAt.setDate(now.getDate() - randomBetween(rng, 1, 4));
      scheduleLabel = "Completed recently";
      status = "Completed";
      const completedDate = new Date(now);
      completedDate.setHours(now.getHours() - randomBetween(rng, 1, 8));
      completedAt = completedDate.toISOString();
    }

    return {
      id: `ACT-${String(idx + 1).padStart(3, "0")}`,
      year,
      quarter,
      sector: sectors[idx % sectors.length],
      cadence: cadences[idx % cadences.length],
      organizer: organizers[idx % organizers.length],
      organization: organizations[idx % organizations.length],
      location: locations[idx % locations.length],
      title: titles[idx % titles.length],
      plannedUsd: scaledPlanned,
      actualUsd: actual,
      attendance: randomBetween(rng, 20, 220),
      successCriteria: successCriteria[idx % successCriteria.length],
      successRate: randomBetween(rng, 55, 96),
      status,
      scheduleLabel,
      scheduledAt: scheduledAt.toISOString(),
      completedAt,
    };
  });
}

function timeFromNow(value: string) {
  const target = new Date(value).getTime();
  const now = Date.now();
  const diff = target - now;
  const hours = Math.round(Math.abs(diff) / (1000 * 60 * 60));
  if (diff > 0) {
    return hours < 24 ? `in ${hours}h` : `in ${Math.round(hours / 24)} days`;
  }
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)} days ago`;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  triggerBlobDownload(new Blob([content], { type: mimeType }), filename);
}

function escapePdfText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createSimplePdf(lines: string[]) {
  const header = "%PDF-1.4\n";
  const textLines = lines.map((line, idx) => {
    const y = 770 - idx * 18;
    return `BT /F1 11 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
  });
  const streamContent = `${textLines.join("\n")}\n`;

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}endstream\nendobj\n`,
  ];

  let body = "";
  const offsets = [0];
  let cursor = header.length;
  for (const obj of objects) {
    offsets.push(cursor);
    body += obj;
    cursor += obj.length;
  }
  const xrefOffset = cursor;
  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
  ].join("\n");
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([header, body, `${xref}\n`, trailer], { type: "application/pdf" });
}

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

export default function AdminFinancePage() {
  const [activities, setActivities] = useState<Activity[]>(() => generateActivities());
  const router = useRouter();
  const pathname = usePathname();
  const [selectedPeriod, setSelectedPeriod] = useState<"all" | "2025-Q1" | "2025-Q2" | "2025-Q3" | "2026-Q1">(() => {
    if (typeof window === "undefined") return "all";
    const period = new URLSearchParams(window.location.search).get("period");
    return period === "2025-Q1" || period === "2025-Q2" || period === "2025-Q3" || period === "2026-Q1"
      ? period
      : "all";
  });

  useEffect(() => {
    const currentQuarter = "Q1";
    const currentYear = 2026;
    const timer = window.setInterval(() => {
      setActivities((previous) =>
        previous.map((activity, idx) => {
          if (activity.quarter !== currentQuarter || activity.year !== currentYear) return activity;
          if (activity.status === "Completed") return activity;
          const increment = ((idx % 4) + 1) * 140;
          const nextActual = Math.min(activity.plannedUsd, activity.actualUsd + increment);
          const nextAttendance = activity.attendance + Math.round(increment / 300);
          const progressedToComplete = nextActual >= activity.plannedUsd;
          const nextStatus: Activity["status"] =
            progressedToComplete ? "Completed" : nextActual >= activity.plannedUsd * 0.7 ? "In Progress" : "At Risk";
          return {
            ...activity,
            actualUsd: nextActual,
            attendance: nextAttendance,
            successRate: Math.min(100, activity.successRate + (progressedToComplete ? 3 : 1)),
            status: nextStatus,
            scheduleLabel: progressedToComplete ? "Completed recently" : activity.scheduleLabel,
            completedAt: progressedToComplete ? new Date().toISOString() : activity.completedAt,
          };
        })
      );
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredActivities = useMemo(() => {
    if (selectedPeriod === "all") return activities;
    const [year, quarter] = selectedPeriod.split("-") as ["2025" | "2026", "Q1" | "Q2" | "Q3" | "Q4"];
    return activities.filter((activity) => String(activity.year) === year && activity.quarter === quarter);
  }, [activities, selectedPeriod]);

  const summary = useMemo(() => {
    const planned = filteredActivities.reduce((sum, item) => sum + item.plannedUsd, 0);
    const actual = filteredActivities.reduce((sum, item) => sum + item.actualUsd, 0);
    const reached = filteredActivities.reduce((sum, item) => sum + item.attendance, 0);
    return {
      planned,
      actual,
      reached,
      utilization: (actual / TOTAL_FUNDING_USD) * 100,
      runway: Math.max(TOTAL_FUNDING_USD - actual, 0),
    };
  }, [filteredActivities]);

  const cadenceCounts = useMemo(() => {
    return {
      Daily: filteredActivities.filter((item) => item.cadence === "Daily").length,
      Weekly: filteredActivities.filter((item) => item.cadence === "Weekly").length,
      Monthly: filteredActivities.filter((item) => item.cadence === "Monthly").length,
    };
  }, [filteredActivities]);

  const byQuarter = useMemo(() => {
    return PERIODS.map((period) => {
      const rows = activities.filter((item) => item.quarter === period.quarter && item.year === period.year);
      const planned = rows.reduce((sum, item) => sum + item.plannedUsd, 0);
      const actual = rows.reduce((sum, item) => sum + item.actualUsd, 0);
      return {
        period: `${period.year} ${period.quarter}`,
        planned,
        actual,
        utilization: planned ? (actual / planned) * 100 : 0,
      };
    });
  }, [activities]);

  const trendPoints = useMemo(() => {
    return byQuarter.map((item) => ({
      key: item.period,
      label: item.period,
      planned: item.planned,
      actual: item.actual,
    }));
  }, [byQuarter]);

  const trendPolyline = useMemo(() => {
    const values = trendPoints.map((p) => p.actual);
    const max = Math.max(...values, 0);
    const ratioBase = max === 0 ? 0.2 : 1;
    return trendPoints
      .map((point, idx) => {
        const x = 8 + (idx / Math.max(trendPoints.length - 1, 1)) * 84;
        const ratio = max === 0 ? ratioBase : point.actual / max;
        const y = 92 - ratio * 78;
        return `${x},${y}`;
      })
      .join(" ");
  }, [trendPoints]);

  const bySector = useMemo(() => {
    const sectors: Sector[] = ["Education", "Health", "ICT", "YE&L", "Disability", "Climate Change"];
    const stats = sectors.map((sector) => {
      const rows = filteredActivities.filter((item) => item.sector === sector);
      const planned = rows.reduce((sum, item) => sum + item.plannedUsd, 0);
      const actual = rows.reduce((sum, item) => sum + item.actualUsd, 0);
      return {
        sector,
        planned,
        actual,
        utilization: planned ? (actual / planned) * 100 : 0,
      };
    });
    const maxActual = Math.max(...stats.map((item) => item.actual), 1);
    return stats.map((item) => ({ ...item, width: (item.actual / maxActual) * 100 }));
  }, [filteredActivities]);

  const performanceGauge = useMemo(() => {
    const circumference = 2 * Math.PI * 48;
    const utilization = Math.min(Math.max(summary.utilization, 0), 100);
    const offset = circumference * (1 - utilization / 100);
    return { circumference, offset, utilization };
  }, [summary.utilization]);

  return (
    <main className="mx-auto w-full space-y-6 px-4 py-8 md:px-8 xl:px-12 2xl:px-16">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to homepage
      </Link>

      <section className="space-y-3 rounded-xl border border-primary/20 bg-background/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Admin Real-Time Funding Intelligence</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedPeriod}
              onValueChange={(value) => {
                const selected =
                  value === "2025-Q1" || value === "2025-Q2" || value === "2025-Q3" || value === "2026-Q1"
                    ? value
                    : "all";
                const params = new URLSearchParams(window.location.search);
                if (selected === "all") {
                  params.delete("period");
                } else {
                  params.set("period", selected);
                }
                const query = params.toString();
                router.replace(query ? `${pathname}?${query}` : pathname);
                setSelectedPeriod(selected);
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="2025-Q1">2025 Q1</SelectItem>
                <SelectItem value="2025-Q2">2025 Q2</SelectItem>
                <SelectItem value="2025-Q3">2025 Q3</SelectItem>
                <SelectItem value="2026-Q1">2026 Q1</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                const header =
                  "Activity,Year,Quarter,Cadence,Sector,Organizer,Organization,Location,Planned USD,Actual USD,Attendance,Success Criteria,Success Rate,Status,Scheduled,Completed";
                const rows = filteredActivities.map((a) =>
                  [
                    a.title,
                    a.year,
                    a.quarter,
                    a.cadence,
                    a.sector,
                    a.organizer,
                    a.organization,
                    a.location,
                    a.plannedUsd,
                    a.actualUsd,
                    a.attendance,
                    a.successCriteria,
                    a.successRate,
                    a.status,
                    a.scheduledAt,
                    a.completedAt ?? "",
                  ].join(",")
                );
                triggerDownload([header, ...rows].join("\n"), "admin-funding-report.csv", "text/csv");
              }}
            >
              <Download />
              CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const reportLines = [
                  "AFRICII ADMIN FUNDING BRIEF",
                  `Generated: ${new Date().toLocaleString()}`,
                  `Period filter: ${selectedPeriod.toUpperCase()}`,
                  "",
                  `Funding envelope: ${formatMoney(TOTAL_FUNDING_USD)}`,
                  `Planned: ${formatMoney(summary.planned)}`,
                  `Utilized: ${formatMoney(summary.actual)} (${summary.utilization.toFixed(1)}%)`,
                  `Runway: ${formatMoney(summary.runway)}`,
                  `Attendance reached: ${summary.reached.toLocaleString()}`,
                  "",
                  "Top activities:",
                  ...filteredActivities.slice(0, 6).map(
                    (activity) =>
                      `- ${activity.title} | ${activity.quarter} | ${activity.location} | ${formatMoney(activity.actualUsd)}`
                  ),
                ];
                triggerBlobDownload(createSimplePdf(reportLines), "admin-quarterly-brief.pdf");
              }}
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
        <div className="grid gap-3 md:grid-cols-3">
          <p className="rounded-lg border p-3 text-sm">Daily activities: {cadenceCounts.Daily}</p>
          <p className="rounded-lg border p-3 text-sm">Weekly activities: {cadenceCounts.Weekly}</p>
          <p className="rounded-lg border p-3 text-sm">Monthly activities: {cadenceCounts.Monthly}</p>
        </div>
        <div className="space-y-2">
          {byQuarter.map((item) => (
            <div key={item.period}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{item.period}</span>
                <span className="text-muted-foreground">{item.utilization.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(item.utilization, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-primary/20 bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">Finance trend (by quarter)</p>
          <p className="mt-1 text-2xl font-semibold">{formatMoney(summary.actual)}</p>
          <p className="text-xs text-muted-foreground">Utilized in selected window</p>
          <div className="mt-4 rounded-lg border border-primary/15 bg-gradient-to-b from-primary/5 to-transparent p-3">
            <svg viewBox="0 0 100 100" className="h-28 w-full">
              <line x1="8" y1="92" x2="92" y2="92" stroke="hsl(var(--border))" strokeWidth="1" />
              <polyline
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={trendPolyline}
              />
              {trendPoints.map((point, idx) => {
                const max = Math.max(...trendPoints.map((p) => p.actual), 0);
                const x = 8 + (idx / Math.max(trendPoints.length - 1, 1)) * 84;
                const ratio = max === 0 ? 0.2 : point.actual / max;
                const y = 92 - ratio * 78;
                return <circle key={point.key} cx={x} cy={y} r="1.8" fill="hsl(var(--primary))" />;
              })}
            </svg>
            <div className="mt-2 grid grid-cols-4 text-[11px] text-muted-foreground">
              {trendPoints.map((point) => (
                <span key={point.key}>{point.label}</span>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-primary/20 bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">Sector budget comparison</p>
          <p className="mt-1 text-2xl font-semibold">{formatMoney(summary.planned)}</p>
          <p className="text-xs text-muted-foreground">Planned budget for filtered activities</p>
          <div className="mt-4 space-y-2">
            {bySector.map((item) => (
              <div key={item.sector}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span>{item.sector}</span>
                  <span className="text-muted-foreground">
                    {formatMoney(item.actual)} / {formatMoney(item.planned)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary/90" style={{ width: `${item.width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-primary/20 bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">Utilization performance</p>
          <div className="mt-4 flex items-center gap-5">
            <svg viewBox="0 0 120 120" className="h-28 w-28">
              <circle cx="60" cy="60" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={performanceGauge.circumference}
                strokeDashoffset={performanceGauge.offset}
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="66" textAnchor="middle" className="fill-foreground text-sm font-semibold">
                {performanceGauge.utilization.toFixed(0)}%
              </text>
            </svg>
            <div className="space-y-2 text-sm">
              <p className="rounded-md border px-2 py-1">Attendance: {summary.reached.toLocaleString()}</p>
              <p className="rounded-md border px-2 py-1">Daily: {cadenceCounts.Daily}</p>
              <p className="rounded-md border px-2 py-1">Weekly: {cadenceCounts.Weekly}</p>
              <p className="rounded-md border px-2 py-1">Monthly: {cadenceCounts.Monthly}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-primary/20 bg-background/70 p-4">
        <h2 className="mb-3 text-xl font-semibold">Activity Budget Tracker</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Cadence</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Quarter</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Planned</TableHead>
              <TableHead>Utilized</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Success</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.title}</TableCell>
                <TableCell>
                  <p>{a.scheduleLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.status === "Completed" && a.completedAt
                      ? `Completed ${timeFromNow(a.completedAt)}`
                      : `Scheduled ${timeFromNow(a.scheduledAt)}`}
                  </p>
                </TableCell>
                <TableCell>{a.cadence}</TableCell>
                <TableCell>
                  <p>{a.organizer}</p>
                  <p className="text-xs text-muted-foreground">{a.organization}</p>
                </TableCell>
                <TableCell>{a.location}</TableCell>
                <TableCell>{a.year}</TableCell>
                <TableCell>{a.quarter}</TableCell>
                <TableCell>{a.sector}</TableCell>
                <TableCell>${a.plannedUsd.toLocaleString()}</TableCell>
                <TableCell>${a.actualUsd.toLocaleString()}</TableCell>
                <TableCell>{a.attendance}</TableCell>
                <TableCell>
                  <p>{a.successRate}%</p>
                  <p className="text-xs text-muted-foreground">{a.successCriteria}</p>
                </TableCell>
                <TableCell>{a.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </main>
  );
}
