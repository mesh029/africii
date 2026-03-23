"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Mail, Phone, Search, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { generateBeneficiaryProfiles } from "@/lib/beneficiaries";

export default function BeneficiarySearchPage() {
  const [query, setQuery] = useState("");
  const [isAdminView, setIsAdminView] = useState(false);
  const profiles = useMemo(() => generateBeneficiaryProfiles(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles.slice(0, 12);
    return profiles
      .filter((item) => {
        return (
          item.name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          item.ward.toLowerCase().includes(q) ||
          item.enrolledPrograms.join(" ").toLowerCase().includes(q)
        );
      })
      .slice(0, 20);
  }, [profiles, query]);

  return (
    <main className="mx-auto w-full space-y-6 px-4 py-8 md:px-8 xl:px-12 2xl:px-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Beneficiary Search</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search by name, ID, phone, ward, or program. Detailed contact data is admin-only.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdminView((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm"
        >
          <Shield className="size-4" />
          {isAdminView ? "Admin View Enabled" : "Enable Admin View"}
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-background/70 px-3 py-2">
        <Search className="size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search beneficiary..."
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {filtered.map((beneficiary) => (
          <article key={beneficiary.id} className="rounded-xl border border-primary/15 bg-background/70 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/beneficiaries/${beneficiary.id}`}
                  className="text-left text-lg font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {beneficiary.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {beneficiary.id} • {beneficiary.ward}
                </p>
              </div>
              <Badge variant="secondary">Score {beneficiary.appraisalScore}</Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {beneficiary.enrolledPrograms.map((program) => (
                <Badge key={`${beneficiary.id}-${program}`} variant="outline">
                  {program}
                </Badge>
              ))}
            </div>

            <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
              <p className="text-muted-foreground">
                <span className="text-foreground">Amount consumed:</span> ${beneficiary.amountConsumedUsd.toLocaleString()}
              </p>
              <p className="text-muted-foreground">
                <span className="text-foreground">Last support:</span> {beneficiary.lastSupportDate}
              </p>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">{beneficiary.story}</p>

            {isAdminView ? (
              <div className="mt-3 grid gap-2 rounded-lg border border-primary/10 bg-background/60 p-3 text-sm">
                <p className="inline-flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  {beneficiary.phone}
                </p>
                <p className="inline-flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  {beneficiary.email}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Enable Admin View to see private contact details.
              </p>
            )}
          </article>
        ))}
      </section>

    </main>
  );
}
