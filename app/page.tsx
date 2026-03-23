"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  HeartHandshake,
  Mail,
  MapPinned,
  Menu,
  MoonStar,
  ShieldCheck,
  Shield,
  X,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import KisumuImpactMap from "@/components/kisumu-impact-map";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Beneficiary = {
  id: string;
  name: string;
  ward: string;
  aidType: AidType;
  impactArea: string;
  aidScore: number;
  amountKsh: number;
  date: string;
  impactNote: string;
  coordinates: [number, number];
};

const WARDS = [
  "Nyalenda A",
  "Nyalenda B",
  "Manyatta B",
  "Kondele",
  "Kajulu",
  "Kolwa East",
  "Kisumu North",
  "Kisumu Central",
] as const;

const WARD_CENTERS: Record<(typeof WARDS)[number], [number, number]> = {
  "Nyalenda A": [34.7568, -0.1121],
  "Nyalenda B": [34.7701, -0.1062],
  "Manyatta B": [34.7438, -0.0987],
  Kondele: [34.7831, -0.0885],
  Kajulu: [34.7184, -0.052],
  "Kolwa East": [34.8367, -0.0957],
  "Kisumu North": [34.7359, -0.0578],
  "Kisumu Central": [34.7684, -0.0913],
};

const WARD_GEOJSON_MATCH: Record<(typeof WARDS)[number], string> = {
  "Nyalenda A": "Nyalenda A Ward",
  "Nyalenda B": "Nyalenda B Ward",
  "Manyatta B": "Manyatta B Ward",
  Kondele: "Kondele Ward",
  Kajulu: "Kajulu Ward",
  "Kolwa East": "Kolwa East Ward",
  "Kisumu North": "North Kisumu Ward",
  "Kisumu Central": "Central Kisumu Ward",
};

const WARD_WEIGHTS: Record<(typeof WARDS)[number], number> = {
  "Nyalenda A": 0.2,
  "Nyalenda B": 0.18,
  "Manyatta B": 0.17,
  Kondele: 0.16,
  "Kisumu Central": 0.14,
  "Kisumu North": 0.1,
  Kajulu: 0.025,
  "Kolwa East": 0.025,
};

const WARD_IMPACT_AREAS: Record<(typeof WARDS)[number], string[]> = {
  "Nyalenda A": ["School Mentorship Hub", "Community Health Link Desk", "Youth Skills Corner"],
  "Nyalenda B": ["ICT Learning Point", "Inclusive Care Outreach", "Climate Awareness Circle"],
  "Manyatta B": ["Bursary Follow-up Desk", "Livelihood Training Cluster", "Digital Basics Lab"],
  Kondele: ["Health Referral Node", "Disability Support Touchpoint", "Enterprise Coaching Point"],
  Kajulu: ["Rural Climate Resilience Site", "Inclusive Education Outreach", "Community Support Desk"],
  "Kolwa East": ["Agri-Resilience Pilot", "Mobile Health Outreach", "Youth Green Skills Spot"],
  "Kisumu North": ["Urban Youth Pathways Center", "ICT Access Kiosk", "Household Follow-up Desk"],
  "Kisumu Central": ["Market Milimani Support Desk", "City Health Connector", "Innovation Help Point"],
};

const LOW_IMPACT_SCORE_THRESHOLD = 40;

const FORCED_LOW_IMPACT_WARDS: Partial<Record<(typeof WARDS)[number], number>> = {
  Kajulu: 28,
  "Kolwa East": 24,
  "Kisumu North": 22,
};

type AidType =
  | "Education"
  | "Health"
  | "ICT"
  | "YE&L"
  | "Disability"
  | "Climate Change";

const AID_TYPES: AidType[] = [
  "Education",
  "Health",
  "ICT",
  "YE&L",
  "Disability",
  "Climate Change",
];

const IMPACT_NOTES = [
  "Improved school attendance through bursary and mentorship support.",
  "Enabled access to treatment, follow-up care, and community health referral.",
  "Expanded digital access through ICT literacy and device support.",
  "Supported youth livelihoods through skills pathways and enterprise guidance.",
  "Increased inclusion outcomes through disability-responsive support plans.",
  "Strengthened household resilience with climate adaptation actions.",
];

const ARTICLES = [
  {
    slug: "from-need-to-dignity-in-nyalenda",
    title: "From Need to Dignity in Nyalenda",
    excerpt:
      "AFRICII's lifecycle approach in Nyalenda combines education, health, and livelihood interventions to improve long-term household stability.",
    href: "/stories/from-need-to-dignity-in-nyalenda",
  },
  {
    slug: "kisumu-youth-skills-and-yel-pathways",
    title: "Kisumu Youth, Skills, and YE&L Pathways",
    excerpt:
      "Youth Empowerment & Livelihoods (YE&L) programming continues to convert skills training into measurable self-reliance outcomes.",
    href: "/stories/kisumu-youth-skills-and-yel-pathways",
  },
  {
    slug: "health-and-disability-inclusion-in-practice",
    title: "Health + Disability Inclusion in Practice",
    excerpt:
      "Integrated health and disability support reduced care disruption and improved inclusive service access in high-need wards.",
    href: "/stories/health-and-disability-inclusion-in-practice",
  },
];

const IMPACT_TIMELINE = [
  {
    phase: "Listen",
    detail: "Community teams map needs across education, health, ICT, YE&L, disability, and climate resilience.",
  },
  {
    phase: "Respond",
    detail: "AFRICII coordinates inclusive interventions through program pillars matched to each household profile.",
  },
  {
    phase: "Track",
    detail: "Impact is tracked over time to refine innovation, inclusion, and sustainable community outcomes.",
  },
];

const PROGRAM_PILLARS: Array<{ name: AidType; description: string }> = [
  { name: "Education", description: "Learning continuity, retention, and student progression support." },
  { name: "Health", description: "Community health linkage, treatment continuity, and wellbeing outcomes." },
  { name: "ICT", description: "Digital literacy and access to technology for opportunity expansion." },
  { name: "YE&L", description: "Youth empowerment and livelihoods through skills and pathways to income." },
  { name: "Disability", description: "Inclusive programming and disability-responsive service design." },
  { name: "Climate Change", description: "Local adaptation actions that improve resilience and preparedness." },
];

const IMPACT_GALLERY = [
  {
    slug: "education-support-in-manyatta",
    title: "Education support in Manyatta",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80",
    note: "Bursary support keeps learners in school and reduces dropout risk.",
    href: "/stories/education-support-in-manyatta",
  },
  {
    slug: "community-health-outreach-in-nyalenda",
    title: "Community health outreach in Nyalenda",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1600&q=80",
    note: "Medical referrals and follow-ups improve continuity of treatment.",
    href: "/stories/community-health-outreach-in-nyalenda",
  },
  {
    slug: "food-resilience-program-in-kolwa",
    title: "Food resilience program in Kolwa",
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1600&q=80",
    note: "Targeted household food support reduces acute vulnerability periods.",
    href: "/stories/food-resilience-program-in-kolwa",
  },
] as const;


function hashStringToSeed(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash || 1;
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

function pickOne<T>(rng: () => number, list: readonly T[]): T {
  return list[randomBetween(rng, 0, list.length - 1)];
}

function pickWeightedWard(rng: () => number): (typeof WARDS)[number] {
  const roll = rng();
  let cumulative = 0;
  for (const ward of WARDS) {
    cumulative += WARD_WEIGHTS[ward];
    if (roll <= cumulative) return ward;
  }
  return WARDS[WARDS.length - 1];
}

function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function generateBeneficiaries(count = 140, seed = 42): Beneficiary[] {
  const firstNames = [
    "Achieng",
    "Otieno",
    "Akinyi",
    "Odhiambo",
    "Atieno",
    "Omondi",
    "Anyango",
    "Okoth",
    "Auma",
    "Ouma",
  ];
  const lastNames = ["Oloo", "Were", "Odinga", "Abuya", "Mboya", "Ayieko", "Onyango", "Kiplagat"];

  const rng = seededRandom(seed);
  const baseDate = new Date("2026-03-01T00:00:00.000Z");

  return Array.from({ length: count }, (_, index) => {
    const daysAgo = randomBetween(rng, 0, 210);
    const date = new Date(baseDate);
    date.setUTCDate(baseDate.getUTCDate() - daysAgo);

    const ward = pickWeightedWard(rng);
    const [lng, lat] = WARD_CENTERS[ward];
    const jitterLng = lng + (rng() - 0.5) * 0.02;
    const jitterLat = lat + (rng() - 0.5) * 0.02;

    return {
      id: `BEN-${String(index + 1).padStart(4, "0")}`,
      name: `${pickOne(rng, firstNames)} ${pickOne(rng, lastNames)}`,
      ward,
      aidType: pickOne(rng, AID_TYPES),
      impactArea: pickOne(rng, WARD_IMPACT_AREAS[ward]),
      aidScore: randomBetween(rng, 45, 98),
      amountKsh: randomBetween(rng, 3000, 55000),
      date: formatDate(date),
      impactNote: pickOne(rng, IMPACT_NOTES),
      coordinates: [jitterLng, jitterLat],
    };
  });
}

export default function Home() {
  const [selectedMapSector, setSelectedMapSector] = useState<string>("all");
  const [adminMode, setAdminMode] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const data = useMemo(() => {
    const seed = hashStringToSeed("africii-kisumu-beneficiary-demo-v1");
    return generateBeneficiaries(140, seed);
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("africii-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const useDark = savedTheme ? savedTheme === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", useDark);
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    window.localStorage.setItem("africii-theme", isDark ? "dark" : "light");
  };

  const filteredData = data;

  const mapFilteredData = useMemo(() => {
    return filteredData.filter((item) => {
      return selectedMapSector === "all" ? true : item.aidType === selectedMapSector;
    });
  }, [filteredData, selectedMapSector]);

  const wardImpactBreakdown = useMemo(() => {
    const byWard = WARDS.map((ward) => {
      const rows = mapFilteredData.filter((item) => item.ward === ward);
      const beneficiaries = rows.length;
      const avgImpact = beneficiaries
        ? rows.reduce((sum, item) => sum + item.aidScore, 0) / beneficiaries
        : 0;
      return { ward, beneficiaries, avgImpact };
    });

    const maxBeneficiaries = Math.max(...byWard.map((item) => item.beneficiaries), 1);

    return byWard.map((item) => {
      const coverageScore = (item.beneficiaries / maxBeneficiaries) * 100;
      const baselineWardScore = item.avgImpact * 0.7 + coverageScore * 0.3;
      const forcedLowCap = FORCED_LOW_IMPACT_WARDS[item.ward];
      const wardImpactScore =
        forcedLowCap !== undefined ? Math.min(baselineWardScore, forcedLowCap) : baselineWardScore;
      const isLowImpact = wardImpactScore < LOW_IMPACT_SCORE_THRESHOLD || item.beneficiaries < 5;
      return {
        ...item,
        wardImpactScore: Number(wardImpactScore.toFixed(1)),
        isLowImpact,
      };
    });
  }, [mapFilteredData]);

  const wardImpactData = useMemo(() => {
    return Object.fromEntries(
      wardImpactBreakdown.map((item) => [WARD_GEOJSON_MATCH[item.ward], item.wardImpactScore])
    ) as Record<string, number>;
  }, [wardImpactBreakdown]);

  const mapBeneficiaryPoints = useMemo(() => {
    return mapFilteredData.map((item) => ({
      id: item.id,
      ward: item.ward,
      sector: item.aidType,
      impactArea: item.impactArea,
      coordinates: item.coordinates,
      impactScore: item.aidScore,
    }));
  }, [mapFilteredData]);

  const overallImpactScore = useMemo(() => {
    if (!wardImpactBreakdown.length) return 0;
    const total = wardImpactBreakdown.reduce((sum, item) => sum + item.wardImpactScore, 0);
    return Number((total / wardImpactBreakdown.length).toFixed(1));
  }, [wardImpactBreakdown]);

  const summary = useMemo(() => {
    const total = filteredData.length;
    const averageAidScore = total
      ? filteredData.reduce((sum, item) => sum + item.aidScore, 0) / total
      : 0;

    const wardCounts = filteredData.reduce<Record<string, number>>((acc, item) => {
      acc[item.ward] = (acc[item.ward] ?? 0) + 1;
      return acc;
    }, {});

    const topWards = Object.entries(wardCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return { total, averageAidScore, topWards };
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-4 md:px-8 xl:px-12 2xl:px-16">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
              A
            </span>
            <div>
              <p className="text-sm font-semibold leading-none">Africii</p>
              <p className="text-xs text-muted-foreground">Impact & Transparency</p>
            </div>
          </div>
          <nav className="hidden items-center gap-4 text-sm text-muted-foreground lg:flex">
            <a href="#impact" className="hover:text-foreground">
              Impact
            </a>
            <a href="#stories" className="hover:text-foreground">
              Stories
            </a>
            <Link href="/dashboard-controls" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/beneficiaries" className="hover:text-foreground">
              Beneficiaries
            </Link>
            <Link href="/admin-finance" className="hover:text-foreground">
              Admin Finance
            </Link>
            <a href="#public-data" className="hover:text-foreground">
              Insights
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={toggleTheme} aria-label="Toggle dark mode">
              <MoonStar />
              <span className="hidden sm:inline">Theme</span>
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setMobileNavOpen((value) => !value)}
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {mobileNavOpen ? (
          <div className="border-t bg-background/95 px-4 py-3 text-sm md:px-8 xl:px-12 2xl:px-16 lg:hidden">
            <nav className="grid gap-2 text-muted-foreground">
              <a href="#impact" className="hover:text-foreground" onClick={() => setMobileNavOpen(false)}>
                Impact
              </a>
              <a href="#stories" className="hover:text-foreground" onClick={() => setMobileNavOpen(false)}>
                Stories
              </a>
              <Link href="/dashboard-controls" className="hover:text-foreground" onClick={() => setMobileNavOpen(false)}>
                Dashboard
              </Link>
              <Link href="/beneficiaries" className="hover:text-foreground" onClick={() => setMobileNavOpen(false)}>
                Beneficiaries
              </Link>
              <Link href="/admin-finance" className="hover:text-foreground" onClick={() => setMobileNavOpen(false)}>
                Admin Finance
              </Link>
              <a href="#public-data" className="hover:text-foreground" onClick={() => setMobileNavOpen(false)}>
                Insights
              </a>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="mx-auto flex w-full flex-col gap-8 px-4 py-8 md:px-8 xl:px-12 2xl:px-16">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-background to-accent/20 px-6 py-12 md:px-10">
          <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-20 left-20 h-44 w-44 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <Badge variant="secondary">Africii Impact in Kisumu</Badge>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                Supporting people, restoring dignity, and tracking real change.
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                This is not just a dashboard. It is the story of households reached, students kept in
                school, patients supported, and communities becoming more resilient ward by ward.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-background/80 px-3 py-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Public data is privacy protected
            </div>
          </div>

          <div className="relative z-10 mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-primary/20 bg-background/70 p-4 backdrop-blur">
              <p className="text-sm text-muted-foreground">Families Reached</p>
              <p className="mt-1 text-2xl font-semibold">{summary.total.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-background/70 p-4 backdrop-blur">
              <p className="text-sm text-muted-foreground">Average Impact Score</p>
              <p className="mt-1 text-2xl font-semibold">{summary.averageAidScore.toFixed(1)} / 100</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-background/70 p-4 backdrop-blur">
              <p className="text-sm text-muted-foreground">Top Wards by Reach</p>
              <p className="mt-1 text-lg font-semibold">
                {summary.topWards.length ? summary.topWards.map(([ward]) => ward).join(", ") : "N/A"}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-primary/20 bg-background/60 p-4 md:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Kisumu ward impact heat map</h2>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                Overall impact score is computed per ward as 70% average beneficiary impact score + 30%
                coverage score (beneficiary reach). Sector slicer updates the heat map in real time.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={selectedMapSector}
                onValueChange={(value) => setSelectedMapSector(value ?? "all")}
              >
                <SelectTrigger className="w-[210px]">
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {AID_TYPES.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant={adminMode ? "default" : "outline"} onClick={() => setAdminMode((v) => !v)}>
                <Shield className="size-4" />
                {adminMode ? "Admin: Dots Visible" : "Enable Admin Dots"}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-primary/15 bg-background/70 p-3">
              <p className="text-xs text-muted-foreground">Sector View</p>
              <p className="mt-1 text-lg font-semibold">
                {selectedMapSector === "all" ? "All programs" : selectedMapSector}
              </p>
            </div>
            <div className="rounded-lg border border-primary/15 bg-background/70 p-3">
              <p className="text-xs text-muted-foreground">Overall Impact Score</p>
              <p className="mt-1 text-lg font-semibold">{overallImpactScore} / 100</p>
            </div>
            <div className="rounded-lg border border-primary/15 bg-background/70 p-3">
              <p className="text-xs text-muted-foreground">Beneficiary Dots</p>
              <p className="mt-1 text-lg font-semibold">{adminMode ? "Visible to admin" : "Hidden in public"}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Low-impact areas are flagged where a ward has fewer than 5 beneficiaries in the current
            sector selection or ward score is below {LOW_IMPACT_SCORE_THRESHOLD}.
          </p>

          <KisumuImpactMap
            wardImpactData={wardImpactData}
            beneficiaryPoints={mapBeneficiaryPoints}
            showBeneficiaryDots={adminMode}
          />

          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {wardImpactBreakdown.map((ward) => (
              <div key={ward.ward} className="rounded-md border border-primary/10 bg-background/50 p-2.5">
                <p className="text-xs text-muted-foreground">{ward.ward}</p>
                <p className="text-sm font-medium">Score: {ward.wardImpactScore}</p>
                <p className="text-xs text-muted-foreground">
                  {ward.beneficiaries} beneficiaries | Avg {ward.avgImpact.toFixed(1)}
                </p>
                {ward.isLowImpact ? (
                  <p className="mt-1 text-[11px] font-medium text-amber-500">Low impact area</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Program tracks</h2>
          <div className="grid gap-2">
            {PROGRAM_PILLARS.map((pillar, index) => (
              <article
                key={pillar.name}
                className="flex items-center justify-between rounded-lg border border-primary/10 bg-gradient-to-r from-primary/5 to-transparent px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs text-primary">
                    {index + 1}
                  </span>
                  <p className="font-medium">{pillar.name}</p>
                </div>
                <p className="max-w-xl text-right text-sm text-muted-foreground">{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="stories" className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Stories of impact</h2>
            <p className="mt-2 text-muted-foreground">
              Behind every entry is a person and a turning point. Africii tracks both the numbers and
              the narrative to understand what support creates lasting change.
            </p>
            <div className="mt-4 space-y-3">
              {ARTICLES.map((article) => (
                <a
                  key={article.slug}
                  href={article.href}
                  className="group block border-l-2 border-primary/40 pl-4 transition-colors hover:border-primary"
                >
                  <h3 className="font-medium group-hover:text-primary">{article.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{article.excerpt}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                    Read article <ArrowUpRight className="size-3.5" />
                  </p>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight">How Africii works</h2>
            <div className="mt-4 space-y-3">
              {IMPACT_TIMELINE.map((step, index) => (
                <div key={step.phase} className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{step.phase}</p>
                    <p className="text-sm text-muted-foreground">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Users className="size-4" /> Beneficiary-centered planning
              </p>
              <p className="flex items-center gap-2">
                <HeartHandshake className="size-4" /> Outcome-focused interventions
              </p>
              <p className="flex items-center gap-2">
                <MapPinned className="size-4" /> Ward-level accountability
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {IMPACT_GALLERY.map((item) => (
            <a
              key={item.slug}
              href={item.href}
              className="group overflow-hidden rounded-xl border border-primary/15"
            >
              <Image
                src={item.image}
                alt={item.title}
                width={960}
                height={640}
                className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                unoptimized={false}
              />
              <div className="p-3">
                <h3 className="font-medium group-hover:text-primary">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                  Open story <ArrowUpRight className="size-3.5" />
                </p>
              </div>
            </a>
          ))}
        </section>

        <section id="public-data" className="rounded-xl border border-primary/15 bg-background/60 p-4">
          <h2 className="text-xl font-semibold tracking-tight">Quick insights</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep the homepage focused. Open detailed analytics and records from these shortcuts.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <Link href="/beneficiaries" className="rounded-lg border border-primary/15 p-3 hover:bg-muted/40">
              <p className="font-medium">Beneficiary profiles</p>
              <p className="mt-1 text-sm text-muted-foreground">Search, history, schools, appraisal.</p>
            </Link>
            <Link href="/admin-finance" className="rounded-lg border border-primary/15 p-3 hover:bg-muted/40">
              <p className="font-medium">Funding intelligence</p>
              <p className="mt-1 text-sm text-muted-foreground">Quarterly utilization and admin tracking.</p>
            </Link>
            <Link href="/dashboard-controls" className="rounded-lg border border-primary/15 p-3 hover:bg-muted/40">
              <p className="font-medium">Impact filters</p>
              <p className="mt-1 text-sm text-muted-foreground">Refine map and export reports quickly.</p>
            </Link>
          </div>
        </section>
      </main>

      <footer id="impact" className="border-t bg-muted/30">
        <div className="mx-auto grid w-full gap-6 px-4 py-10 md:grid-cols-3 md:px-8 xl:px-12 2xl:px-16">
          <div>
            <p className="text-base font-semibold">Africii</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We partner with communities in Kisumu to deliver transparent, measurable, and dignified
              support for vulnerable households.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Transparency</p>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4" />
                Public dashboards show anonymized beneficiary data
              </li>
              <li className="flex items-center gap-2">
                <ArrowUpRight className="size-4" />
                Donor reports available on request
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Contact</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4" />
              partnerships@africii.org
            </p>
            <p className="mt-2 text-xs text-muted-foreground">© 2026 Africii. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
