import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Tag } from "lucide-react";

type Story = {
  slug: string;
  title: string;
  location: string;
  program: string;
  date: string;
  image: string;
  excerpt: string;
  body: string[];
};

const STORIES: Story[] = [
  {
    slug: "from-need-to-dignity-in-nyalenda",
    title: "From Need to Dignity in Nyalenda",
    location: "Nyalenda, Kisumu",
    program: "Education + Health + YE&L",
    date: "March 2026",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=80",
    excerpt:
      "AFRICII's lifecycle approach in Nyalenda combines education, health, and livelihoods to strengthen long-term household stability.",
    body: [
      "In Nyalenda, AFRICII teams worked closely with households to map urgent needs and define support pathways that did not stop at emergency response. The goal was to restore stability while building future resilience.",
      "Education support reduced school interruptions, while community health follow-ups improved treatment continuity for vulnerable members. Youth and caregivers were linked to practical livelihoods pathways to strengthen household income.",
      "The outcome was a measurable improvement in confidence, attendance, and recovery. The story from Nyalenda continues to guide how AFRICII sequences support: immediate relief, then long-term empowerment.",
    ],
  },
  {
    slug: "kisumu-youth-skills-and-yel-pathways",
    title: "Kisumu Youth, Skills, and YE&L Pathways",
    location: "Kisumu County",
    program: "YE&L + ICT",
    date: "February 2026",
    image:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1800&q=80",
    excerpt:
      "Youth Empowerment & Livelihoods (YE&L) programming is translating skills into stronger self-reliance outcomes.",
    body: [
      "AFRICII's YE&L pathways focus on practical skills, mentorship, and locally relevant opportunities. Youth participants are supported with progression plans that connect learning to real economic participation.",
      "ICT integration has strengthened this model by improving digital access and confidence. Participants can now engage with training resources, communication tools, and micro-opportunity platforms more effectively.",
      "Early results show stronger retention in training cycles and better transition to productive activity. The approach is designed for continuity, not one-off intervention.",
    ],
  },
  {
    slug: "health-and-disability-inclusion-in-practice",
    title: "Health + Disability Inclusion in Practice",
    location: "Kisumu Central and peri-urban wards",
    program: "Health + Disability",
    date: "January 2026",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1800&q=80",
    excerpt:
      "Integrated health and disability support reduced care disruption and improved inclusive service access.",
    body: [
      "AFRICII's teams observed that barriers to care are often compounded for persons with disabilities. Program response therefore combined health referral support with disability-responsive follow-up.",
      "Community workers helped households navigate appointments, continuity plans, and supportive services. This reduced treatment interruptions and improved confidence in seeking care.",
      "The lesson is clear: inclusion is not an add-on. It is a design principle that improves outcomes for everyone when built into core delivery.",
    ],
  },
  {
    slug: "education-support-in-manyatta",
    title: "Education Support in Manyatta",
    location: "Manyatta, Kisumu",
    program: "Education",
    date: "March 2026",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=80",
    excerpt:
      "Bursary and mentoring support are helping learners remain in school and stay on track.",
    body: [
      "Learners in Manyatta received targeted education support that combined bursary relief with mentoring touchpoints. Families reported fewer interruptions in attendance.",
      "Teachers and caregivers were engaged as partners in tracking continuity and wellbeing. The shared accountability model improved follow-through over the term.",
      "AFRICII continues to expand this support model with a focus on equity, retention, and confidence in learning pathways.",
    ],
  },
  {
    slug: "community-health-outreach-in-nyalenda",
    title: "Community Health Outreach in Nyalenda",
    location: "Nyalenda, Kisumu",
    program: "Health",
    date: "February 2026",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1800&q=80",
    excerpt:
      "Referral support and follow-up improved continuity of treatment in high-need households.",
    body: [
      "Health outreach focused on practical continuity: making sure referrals were completed and follow-up did not break after first contact.",
      "Through local coordination and household-level check-ins, AFRICII teams helped reduce care drop-off for vulnerable families.",
      "The program now informs broader health delivery design by prioritizing access, consistency, and inclusive follow-up.",
    ],
  },
  {
    slug: "food-resilience-program-in-kolwa",
    title: "Food Resilience Program in Kolwa",
    location: "Kolwa, Kisumu",
    program: "Climate Change + Livelihoods",
    date: "February 2026",
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1800&q=80",
    excerpt:
      "Household resilience was strengthened through targeted support and climate-aware planning.",
    body: [
      "In Kolwa, AFRICII worked with households facing recurring vulnerability periods linked to climate stress and economic pressure.",
      "Support combined immediate stabilization with practical adaptation guidance designed for local realities.",
      "The program demonstrates how resilience grows when climate action, livelihoods, and community support are delivered together.",
    ],
  },
];

export function generateStaticParams() {
  return STORIES.map((story) => ({ slug: story.slug }));
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = STORIES.find((item) => item.slug === slug);

  if (!story) {
    notFound();
  }

  return (
    <main className="mx-auto w-full px-4 py-10 md:px-8 xl:px-12 2xl:px-16">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <article className="space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{story.title}</h1>
          <p className="text-base text-muted-foreground">{story.excerpt}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" />
              {story.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Tag className="size-4" />
              {story.program}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {story.date}
            </span>
          </div>
        </header>

        <Image
          src={story.image}
          alt={story.title}
          width={1800}
          height={980}
          className="h-[320px] w-full rounded-xl object-cover md:h-[420px]"
        />

        <section className="space-y-4 text-[15px] leading-7 text-foreground/90">
          {story.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      </article>
    </main>
  );
}
