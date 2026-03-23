export type ProgramType =
  | "Education"
  | "Health"
  | "ICT"
  | "YE&L"
  | "Disability"
  | "Climate Change";

export type BeneficiaryProfile = {
  id: string;
  name: string;
  phone: string;
  email: string;
  ward: string;
  enrolledPrograms: ProgramType[];
  amountConsumedUsd: number;
  appraisalScore: number;
  story: string;
  lastSupportDate: string;
  previousSchool: string;
  currentSchool: string;
  sponsorshipActive: boolean;
  impactDrivers: string[];
  historyTimeline: Array<{ period: string; event: string }>;
};

const PROGRAMS: ProgramType[] = ["Education", "Health", "ICT", "YE&L", "Disability", "Climate Change"];
const WARDS = ["Nyalenda A", "Nyalenda B", "Manyatta B", "Kondele", "Kajulu", "Kolwa East", "Kisumu North", "Kisumu Central"];
const SCHOOLS = [
  "Kisumu Boys High School",
  "Kisumu Girls High School",
  "Manyatta Primary School",
  "Kondele Secondary School",
  "Nyalenda Community School",
  "Miwani Academy",
  "St. Peters Kajulu",
  "Kolwa East Learning Centre",
];

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

export function generateBeneficiaryProfiles(count = 180): BeneficiaryProfile[] {
  const rng = seededRandom(2026);
  const firstNames = ["Achieng", "Otieno", "Akinyi", "Odhiambo", "Atieno", "Omondi", "Anyango", "Okoth", "Auma", "Ouma"];
  const lastNames = ["Oloo", "Were", "Odinga", "Abuya", "Mboya", "Ayieko", "Onyango", "Kiplagat"];
  const today = new Date("2026-03-01T00:00:00.000Z");

  return Array.from({ length: count }, (_, index) => {
    const first = firstNames[randomBetween(rng, 0, firstNames.length - 1)];
    const last = lastNames[randomBetween(rng, 0, lastNames.length - 1)];
    const programCount = randomBetween(rng, 1, 3);
    const selectedPrograms = Array.from(
      new Set(Array.from({ length: programCount }, () => PROGRAMS[randomBetween(rng, 0, PROGRAMS.length - 1)]))
    );
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - randomBetween(rng, 0, 320));
    const idNum = String(index + 1).padStart(4, "0");
    const score = randomBetween(rng, 38, 97);
    const sponsorshipActive = selectedPrograms.includes("Education");
    const previousSchool = SCHOOLS[randomBetween(rng, 0, SCHOOLS.length - 1)];
    const currentSchool = SCHOOLS[randomBetween(rng, 0, SCHOOLS.length - 1)];
    const impactDrivers = [];
    if (score >= 80) impactDrivers.push("High attendance consistency");
    if (selectedPrograms.includes("Education")) impactDrivers.push("School fee sponsorship continuity");
    if (selectedPrograms.includes("Health")) impactDrivers.push("Regular treatment follow-up");
    if (selectedPrograms.includes("YE&L")) impactDrivers.push("Household income pathway support");
    if (!impactDrivers.length) impactDrivers.push("Targeted periodic support");

    return {
      id: `BEN-${idNum}`,
      name: `${first} ${last}`,
      phone: `+254 7${randomBetween(rng, 10_000_000, 99_999_999)}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${index + 1}@africii.org`,
      ward: WARDS[randomBetween(rng, 0, WARDS.length - 1)],
      enrolledPrograms: selectedPrograms,
      amountConsumedUsd: randomBetween(rng, 120, 5800),
      appraisalScore: score,
      story:
        "Household support combined program enrollment, targeted follow-up, and quarterly appraisal to improve resilience and service access.",
      lastSupportDate: date.toISOString().slice(0, 10),
      previousSchool,
      currentSchool,
      sponsorshipActive,
      impactDrivers,
      historyTimeline: [
        { period: "2024 Q3", event: "Initial household intake and vulnerability assessment completed." },
        { period: "2025 Q1", event: "Enrolled into primary support programs and assigned case follow-up." },
        { period: "2025 Q4", event: "Midline appraisal conducted and support package adjusted." },
        { period: "2026 Q1", event: "Recent review indicates improving service outcomes and stability." },
      ],
    };
  });
}
