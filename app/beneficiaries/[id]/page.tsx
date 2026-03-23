import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { generateBeneficiaryProfiles } from "@/lib/beneficiaries";

export default async function BeneficiaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const beneficiary = generateBeneficiaryProfiles().find((item) => item.id === id);

  if (!beneficiary) notFound();

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 md:px-8">
      <Link href="/beneficiaries" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to beneficiary search
      </Link>

      <section className="rounded-xl border border-primary/20 bg-background/70 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{beneficiary.name}</h1>
            <p className="text-sm text-muted-foreground">
              {beneficiary.id} • {beneficiary.ward}
            </p>
          </div>
          <Badge variant={beneficiary.appraisalScore >= 80 ? "default" : "secondary"}>
            Appraisal {beneficiary.appraisalScore}
          </Badge>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2 text-sm">
            <p className="inline-flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" />
              {beneficiary.phone}
            </p>
            <p className="inline-flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              {beneficiary.email}
            </p>
            <p>
              <span className="font-medium">Sponsorship status:</span>{" "}
              {beneficiary.sponsorshipActive ? "Active education sponsorship" : "No active school-fee sponsorship"}
            </p>
            <p>
              <span className="font-medium">Previous school:</span> {beneficiary.previousSchool}
            </p>
            <p>
              <span className="font-medium">Current school:</span> {beneficiary.currentSchool}
            </p>
            <p>
              <span className="font-medium">Amount consumed:</span> ${beneficiary.amountConsumedUsd.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">Enrolled programs</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {beneficiary.enrolledPrograms.map((program) => (
                <Badge key={`${beneficiary.id}-${program}`} variant="outline">
                  {program}
                </Badge>
              ))}
            </div>

            <p className="mt-4 text-sm font-medium">
              {beneficiary.appraisalScore >= 80 ? "What created high impact" : "What created current impact"}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {beneficiary.impactDrivers.map((driver) => (
                <li key={driver}>- {driver}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium">Beneficiary story</p>
          <p className="mt-1 text-sm text-muted-foreground">{beneficiary.story}</p>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium">Support history timeline</p>
          <div className="mt-2 space-y-2">
            {beneficiary.historyTimeline.map((item) => (
              <div key={`${beneficiary.id}-${item.period}`} className="rounded-md border border-primary/10 p-2.5">
                <p className="text-xs text-muted-foreground">{item.period}</p>
                <p className="text-sm">{item.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
