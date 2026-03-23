"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Download, FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const WARDS = ["Nyalenda A", "Nyalenda B", "Manyatta B", "Kondele", "Kajulu", "Kolwa East", "Kisumu North", "Kisumu Central"];
const PROGRAMS = ["Education", "Health", "ICT", "YE&L", "Disability", "Climate Change"];

type Row = { id: string; ward: string; program: string; score: number; date: string };

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

function buildRows(count = 160): Row[] {
  const rng = seededRandom(77);
  const base = new Date("2026-03-01T00:00:00.000Z");
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() - randomBetween(rng, 0, 300));
    return {
      id: `BEN-${String(i + 1).padStart(4, "0")}`,
      ward: WARDS[randomBetween(rng, 0, WARDS.length - 1)],
      program: PROGRAMS[randomBetween(rng, 0, PROGRAMS.length - 1)],
      score: randomBetween(rng, 38, 97),
      date: d.toISOString().slice(0, 10),
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

export default function DashboardControlsPage() {
  const [ward, setWard] = useState("all");
  const [program, setProgram] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const rows = useMemo(() => buildRows(), []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const wardPass = ward === "all" || r.ward === ward;
      const programPass = program === "all" || r.program === program;
      const startPass = !startDate || r.date >= startDate;
      const endPass = !endDate || r.date <= endDate;
      return wardPass && programPass && startPass && endPass;
    });
  }, [rows, ward, program, startDate, endDate]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to homepage
      </Link>
      <section className="rounded-xl border border-primary/20 bg-background/70 p-4">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard Controls</h1>
        <p className="mt-1 text-sm text-muted-foreground">Filter records and export operational reports.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Select value={ward} onValueChange={(value) => setWard(value ?? "all")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ward" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All wards</SelectItem>
              {WARDS.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={program} onValueChange={(value) => setProgram(value ?? "all")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All programs</SelectItem>
              {PROGRAMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              const header = "ID,Ward,Program,Score,Date";
              const body = filtered.map((r) => [r.id, r.ward, r.program, r.score, r.date].join(","));
              triggerDownload([header, ...body].join("\n"), "dashboard-report.csv", "text/csv");
            }}
          >
            <Download />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              triggerDownload(`Filtered records: ${filtered.length}`, "dashboard-report.pdf", "application/pdf")
            }
          >
            <FileDown />
            Export PDF
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-primary/20 bg-background/70 p-4">
        <h2 className="mb-3 text-xl font-semibold">Filtered Records ({filtered.length})</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Impact Score</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 40).map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.ward}</TableCell>
                <TableCell>{r.program}</TableCell>
                <TableCell>{r.score}</TableCell>
                <TableCell>{r.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </main>
  );
}
