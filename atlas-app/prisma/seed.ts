/**
 * Seed data — the same records used throughout the static prototype
 * (Manchester/UCL/Leeds shortlist, Priya/James advisors, service partner
 * counts, community content) so the real app demonstrates identically to
 * what was already built and reviewed.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: (process.env.DATABASE_URL ?? "file:./dev.db").replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding…");

  // ---------- catalogue ----------
  const schools: {
    slug: string;
    name: string;
    city: string;
    aboutCity: string;
    course: {
      tuitionPerYear: number;
      deadline: string;
      rolling: boolean;
      entry: string;
      ielts: string;
      about: string;
    };
  }[] = [
    {
      slug: "manchester",
      name: "University of Manchester",
      city: "Manchester",
      aboutCity:
        "Manchester is one of the UK's largest student cities, with a large Indian and South Asian student community already established near campus. Direct trains to Manchester Airport (25 min) and London (2h10). Typical shared housing near campus runs £550–£750/month.",
      course: {
        tuitionPerYear: 28500,
        deadline: "2026-01-15",
        rolling: false,
        entry: "2:1 Hons",
        ielts: "6.5 overall",
        about:
          "This MSc covers statistical modelling, machine learning and large-scale data engineering, with a final-term industry project run alongside a UK employer partner. Cohorts are small — around 60 students — and the course is accredited by the Royal Statistical Society.",
      },
    },
    {
      slug: "ucl",
      name: "UCL",
      city: "London",
      aboutCity:
        "London is the most expensive option on a typical shortlist — budget £900–£1,300/month for shared housing near most campuses. Unmatched access to internships, events and the largest South Asian community of any UK city.",
      course: {
        tuitionPerYear: 34650,
        deadline: "2025-11-27",
        rolling: false,
        entry: "2:1 Hons",
        ielts: "7.0 overall",
        about:
          "UCL's programme leans heavily on statistical theory and research methods, taught out of the Department of Statistical Science in central London. Central London placement links give strong access to fintech and consulting employers.",
      },
    },
    {
      slug: "leeds",
      name: "University of Leeds",
      city: "Leeds",
      aboutCity:
        "Leeds has one of the UK's lowest costs of living among major student cities — shared housing typically runs £450–£600/month. A 15-minute walk covers most of campus and the city centre.",
      course: {
        tuitionPerYear: 26750,
        deadline: "2026-08-01",
        rolling: true,
        entry: "2:2 Hons",
        ielts: "6.0 overall",
        about:
          "Leeds' MSc focuses on applied data science with modules students can weight toward business analytics or machine learning engineering. Rolling admissions mean offers can arrive within 2–3 weeks of applying.",
      },
    },
    {
      slug: "warwick",
      name: "University of Warwick",
      city: "Coventry",
      aboutCity:
        "Warwick's campus sits between Coventry and Leamington Spa, with most student housing on or immediately around campus. Frequent direct trains to Birmingham (25 min) and London (1h10).",
      course: {
        tuitionPerYear: 29850,
        deadline: "2026-05-15",
        rolling: false,
        entry: "2:1 Hons",
        ielts: "6.5 overall",
        about:
          "Warwick's MSc is run out of one of the UK's top-ranked statistics departments, with strong quantitative finance and consulting recruitment on campus.",
      },
    },
    {
      slug: "birmingham",
      name: "University of Birmingham",
      city: "Birmingham",
      aboutCity:
        "Birmingham is the UK's second-largest city with one of its largest South Asian communities. Lower cost of living than London or Manchester; shared housing typically £500–£650/month.",
      course: {
        tuitionPerYear: 27540,
        deadline: "2026-07-01",
        rolling: true,
        entry: "2:1 Hons",
        ielts: "6.5 overall",
        about:
          "Birmingham's course splits evenly between statistical foundations and applied engineering, with a strong track record placing graduates into the West Midlands' growing fintech sector.",
      },
    },
    {
      slug: "edinburgh",
      name: "University of Edinburgh",
      city: "Edinburgh",
      aboutCity:
        "Edinburgh's student population is smaller and more concentrated than Manchester or Leeds. Higher cost of living than the north of England — budget £650–£850/month for shared housing.",
      course: {
        tuitionPerYear: 31900,
        deadline: "2026-06-30",
        rolling: false,
        entry: "2:1 Hons",
        ielts: "7.0 overall",
        about:
          "Edinburgh's School of Informatics runs this MSc jointly with the Business School, with an optional dissertation track in NLP or computer vision.",
      },
    },
  ];

  for (const s of schools) {
    const uni = await prisma.university.upsert({
      where: { slug: s.slug },
      update: {},
      create: { slug: s.slug, name: s.name, city: s.city, aboutCity: s.aboutCity },
    });
    await prisma.course.upsert({
      where: { id: `${s.slug}-msc-data-science` },
      update: {},
      create: {
        id: `${s.slug}-msc-data-science`,
        universityId: uni.id,
        name: "MSc Data Science",
        level: "MSc",
        durationMonths: 12,
        tuitionPerYear: s.course.tuitionPerYear,
        startDate: "Sept 2026",
        applicationDeadline: new Date(s.course.deadline),
        isRollingDeadline: s.course.rolling,
        entryRequirement: s.course.entry,
        ieltsRequirement: s.course.ielts,
        aboutCourse: s.course.about,
      },
    });
  }
  console.log(`  ${schools.length} universities + courses`);

  // ---------- advisors ----------
  const priya = await prisma.advisor.upsert({
    where: { id: "advisor-priya" },
    update: {},
    create: { id: "advisor-priya", name: "Priya S.", jobTitle: "Application advisor", image: "https://i.pravatar.cc/100?img=32" },
  });
  const james = await prisma.advisor.upsert({
    where: { id: "advisor-james" },
    update: {},
    create: { id: "advisor-james", name: "James O.", jobTitle: "Visa specialist", image: "https://i.pravatar.cc/100?img=12" },
  });
  console.log("  2 advisors");

  // ---------- service partners (counts match the static prototype's svc-tag numbers) ----------
  const partners: {
    category: "BANK" | "SIM" | "HOUSING" | "FOREX" | "INSURANCE" | "LOANS";
    isPriority: boolean;
    priorityWhy?: string;
    rows: { name: string; blurb: string; s1l: string; s1v: string; s2l: string; s2v: string }[];
  }[] = [
    {
      category: "BANK",
      isPriority: false,
      rows: [
        { name: "Monzo", blurb: "App-only account, opens before you land with a valid CAS.", s1l: "Monthly fee", s1v: "£0", s2l: "Setup time", s2v: "15 min" },
        { name: "Barclays", blurb: "Branch network on most UK campuses, in-person account opening.", s1l: "Monthly fee", s1v: "£0", s2l: "Setup time", s2v: "2–3 days" },
        { name: "HSBC", blurb: "Pre-arrival account opening for students with an offer letter.", s1l: "Monthly fee", s1v: "£0", s2l: "Setup time", s2v: "5–7 days" },
        { name: "Revolut", blurb: "Multi-currency account, useful for early INR transfers.", s1l: "Monthly fee", s1v: "£0", s2l: "Setup time", s2v: "10 min" },
      ],
    },
    {
      category: "SIM",
      isPriority: false,
      rows: [
        { name: "giffgaff", blurb: "No-contract SIM, popular starter plan for students.", s1l: "From /mo", s1v: "£10", s2l: "Cancel", s2v: "Any time" },
        { name: "Airalo", blurb: "eSIM you can activate from India before departure.", s1l: "1GB/7 days", s1v: "£4.50", s2l: "Activation", s2v: "Instant" },
        { name: "Three", blurb: "Student SIM-only plans with EU/international roaming.", s1l: "From /mo", s1v: "£12", s2l: "Contract", s2v: "12 mo" },
      ],
    },
    {
      category: "HOUSING",
      isPriority: false,
      rows: [
        { name: "Unite Students", blurb: "Purpose-built student halls, most Manchester campuses.", s1l: "From /wk", s1v: "£185", s2l: "Rating", s2v: "4.3★" },
        { name: "CRM Students", blurb: "Ensuite and studio options, flexible contract lengths.", s1l: "From /wk", s1v: "£165", s2l: "Rating", s2v: "4.1★" },
        { name: "SpareRoom", blurb: "Verified shared houses near campus, no agency fee.", s1l: "From /wk", s1v: "£140", s2l: "Rating", s2v: "3.9★" },
        { name: "Student.com", blurb: "Book a room from India before you land, deposit protected.", s1l: "From /wk", s1v: "£170", s2l: "Rating", s2v: "4.2★" },
        { name: "Homes for Students", blurb: "City-centre studios with bills included.", s1l: "From /wk", s1v: "£195", s2l: "Rating", s2v: "4.0★" },
        { name: "iQ Student Accommodation", blurb: "Larger halls with gym and study space on site.", s1l: "From /wk", s1v: "£210", s2l: "Rating", s2v: "4.4★" },
      ],
    },
    {
      category: "FOREX",
      isPriority: true,
      priorityWhy: "Proves your financial evidence",
      rows: [
        { name: "Wise", blurb: "Mid-market rate, transparent fee shown before you send.", s1l: "Fee", s1v: "0.4%", s2l: "Transfer time", s2v: "1–2 days" },
        { name: "Western Union", blurb: "Large transfer limits, widely accepted for CAS evidence.", s1l: "Fee", s1v: "0.9%", s2l: "Transfer time", s2v: "Same day" },
        { name: "BookMyForex", blurb: "India-based, doorstep documentation pickup available.", s1l: "Fee", s1v: "0.6%", s2l: "Transfer time", s2v: "1 day" },
      ],
    },
    {
      category: "INSURANCE",
      isPriority: true,
      priorityWhy: "Required by your visa conditions",
      rows: [
        { name: "Endsleigh", blurb: "Student-specific travel + contents cover, widely used for UK visas.", s1l: "From /mo", s1v: "£8", s2l: "Rating", s2v: "4.5★" },
        { name: "Aviva", blurb: "Comprehensive travel and belongings cover, annual policy.", s1l: "From /mo", s1v: "£11", s2l: "Rating", s2v: "4.3★" },
      ],
    },
    {
      category: "LOANS",
      isPriority: true,
      priorityWhy: "Accepted as proof of funds",
      rows: [
        { name: "Prodigy Finance", blurb: "Collateral-free, income-share based repayment options.", s1l: "From APR", s1v: "8.9%", s2l: "Max amount", s2v: "£90k" },
        { name: "MPOWER Financing", blurb: "No collateral or Indian co-signer required.", s1l: "From APR", s1v: "9.9%", s2l: "Max amount", s2v: "£75k" },
        { name: "HDFC Credila", blurb: "India-based, collateral options for larger sanction amounts.", s1l: "From APR", s1v: "10.5%", s2l: "Max amount", s2v: "£100k" },
        { name: "Avanse", blurb: "Fast sanction letters, useful ahead of CAS deadlines.", s1l: "From APR", s1v: "10.8%", s2l: "Max amount", s2v: "£85k" },
        { name: "Leap Finance", blurb: "No-collateral loans built specifically for study-abroad students.", s1l: "From APR", s1v: "11.2%", s2l: "Max amount", s2v: "£70k" },
      ],
    },
  ];

  await prisma.servicePartner.deleteMany({});
  for (const cat of partners) {
    for (const r of cat.rows) {
      await prisma.servicePartner.create({
        data: {
          category: cat.category,
          name: r.name,
          blurb: r.blurb,
          stat1Label: r.s1l,
          stat1Value: r.s1v,
          stat2Label: r.s2l,
          stat2Value: r.s2v,
          isPriority: cat.isPriority,
          priorityWhy: cat.priorityWhy,
        },
      });
    }
  }
  console.log(`  ${partners.reduce((n, c) => n + c.rows.length, 0)} service partners`);

  // ---------- community content ----------
  await prisma.communityContent.deleteMany({});
  await prisma.communityContent.createMany({
    data: [
      {
        type: "JOB",
        title: "Library assistant, University of Manchester",
        eyebrow: "Part-time · Manchester",
        body: "The University of Manchester library is hiring part-time student assistants for the autumn term, shelving, circulation-desk support and helping first-years find their way around during the busiest weeks of term.\n\nShifts are scheduled around your timetable and stay within standard Student visa work-hour limits during term time.",
        requirements: "Valid Student visa with work rights\nAvailable at least 2 weekday evenings\nNo prior experience required",
        status: "PUBLISHED",
      },
      {
        type: "JOB",
        title: "Content intern, student-run publication",
        eyebrow: "Part-time · Remote",
        body: "A student-run publication covering UK campus life for international students is looking for a part-time content intern to write and edit short explainer pieces.\n\nFully remote and asynchronous — a portfolio-building role that fits around lectures and coursework.",
        requirements: "Strong written English\nA short writing sample on request\nVisa work-hour limits still apply",
        status: "PUBLISHED",
      },
      {
        type: "JOB",
        title: "Junior analyst, fintech scale-up",
        eyebrow: "Graduate route",
        body: "A London-based fintech scale-up is hiring junior analysts on its graduate route, with sponsorship for the Skilled Worker visa for candidates who need it after graduation.",
        requirements: "Final-year or recent graduate\nComfortable with SQL and Python\nSponsors Skilled Worker visa applicants",
        status: "PUBLISHED",
      },
      {
        type: "EVENT",
        title: "Pre-departure briefing: what to pack",
        eyebrow: "3 Sept · Online",
        body: "A live online session hosted by students already settled in Manchester, covering exactly what to pack and what customs rules apply to Indian students flying into the UK.",
        eventDate: new Date("2026-09-03T18:30:00Z"),
        location: "Online — Zoom",
        capacity: 150,
        going: 112,
        status: "PUBLISHED",
      },
      {
        type: "EVENT",
        title: "New arrivals meetup",
        eyebrow: "10 Sept · Leeds",
        body: "Coffee, SIM cards and a campus walk-through for students who've just landed in Leeds.",
        eventDate: new Date("2026-09-10T15:00:00Z"),
        location: "Leeds Students' Union",
        capacity: 40,
        going: 27,
        status: "PUBLISHED",
      },
      {
        type: "EVENT",
        title: "Opening your bank account, live Q&A",
        eyebrow: "14 Sept · Online",
        body: "A partner bank's student onboarding team answers questions live about opening a UK account before or shortly after you land.",
        eventDate: new Date("2026-09-14T18:00:00Z"),
        location: "Online — Zoom",
        capacity: 200,
        going: 84,
        status: "PUBLISHED",
      },
      {
        type: "GUIDE",
        title: "Registering with a GP in your first week",
        eyebrow: "6 min read",
        body: "Every international student in the UK is entitled to free NHS care once you've paid the Immigration Health Surcharge — but you have to actively register with a local GP practice.\n\nDo this in your first week, even if you're not sick. Bring your BRP or visa decision letter, proof of address, and your passport.",
        authorName: "Nikhil",
        authorRole: "Content team",
        authorImage: "https://i.pravatar.cc/100?img=26",
        readMinutes: 6,
        status: "PUBLISHED",
      },
      {
        type: "GUIDE",
        title: "Council tax exemption for students",
        eyebrow: "4 min read",
        body: "Full-time students in the UK are exempt from council tax — but the exemption isn't automatic. You need a Council Tax Exemption Certificate from your university.\n\nThis one form can save several hundred pounds a year.",
        authorName: "Rohan",
        authorRole: "Content team",
        authorImage: "https://i.pravatar.cc/100?img=15",
        readMinutes: 4,
        status: "PUBLISHED",
      },
      {
        type: "GUIDE",
        title: "Building UK credit history from zero",
        eyebrow: "5 min read",
        body: "You arrive in the UK with no credit history at all. The fastest legitimate way to start building it is a secured or student credit card used lightly and paid off in full every month.\n\nStart this in your first term, not your last.",
        authorName: "Meera",
        authorRole: "Content team",
        authorImage: "https://i.pravatar.cc/100?img=33",
        readMinutes: 5,
        status: "PUBLISHED",
      },
    ],
  });
  console.log("  9 community items");

  // ---------- the demo student (Harman) ----------
  const harman = await prisma.user.upsert({
    where: { email: "harman.sidhu@email.com" },
    update: {},
    create: {
      email: "harman.sidhu@email.com",
      name: "Harman Sidhu",
      phone: "+91 98765 43210",
      image: "https://i.pravatar.cc/100?img=47",
      homeCity: "Chandigarh",
      qualification: "BACHELORS",
      percentage: "82%",
      courseInterest: "Data Science",
      budgetRange: "£25k – £30k",
      preferredCities: "Manchester,Leeds",
      currentStage: "VISA_DOCS",
      onboarded: true,
    },
  });

  await prisma.studentAdvisor.upsert({
    where: { studentId_advisorId: { studentId: harman.id, advisorId: priya.id } },
    update: {},
    create: { studentId: harman.id, advisorId: priya.id },
  });
  await prisma.studentAdvisor.upsert({
    where: { studentId_advisorId: { studentId: harman.id, advisorId: james.id } },
    update: {},
    create: { studentId: harman.id, advisorId: james.id },
  });

  const manchesterCourse = await prisma.course.findUniqueOrThrow({ where: { id: "manchester-msc-data-science" } });
  const uclCourse = await prisma.course.findUniqueOrThrow({ where: { id: "ucl-msc-data-science" } });
  const leedsCourse = await prisma.course.findUniqueOrThrow({ where: { id: "leeds-msc-data-science" } });

  await prisma.application.upsert({
    where: { userId_courseId: { userId: harman.id, courseId: manchesterCourse.id } },
    update: {},
    create: { userId: harman.id, courseId: manchesterCourse.id, status: "ACCEPTED", matchScore: 96, appliedAt: new Date("2026-08-02"), decisionAt: new Date("2026-08-18") },
  });
  await prisma.application.upsert({
    where: { userId_courseId: { userId: harman.id, courseId: uclCourse.id } },
    update: {},
    create: { userId: harman.id, courseId: uclCourse.id, status: "APPLIED", matchScore: 91, appliedAt: new Date("2026-08-05") },
  });
  await prisma.application.upsert({
    where: { userId_courseId: { userId: harman.id, courseId: leedsCourse.id } },
    update: {},
    create: { userId: harman.id, courseId: leedsCourse.id, status: "SHORTLISTED", matchScore: 84 },
  });

  await prisma.task.deleteMany({ where: { userId: harman.id } });
  await prisma.task.createMany({
    data: [
      { userId: harman.id, stage: "SHORTLIST", label: "Shortlist confirmed with advisor", done: true },
      { userId: harman.id, stage: "SHORTLIST", label: "SOP reviewed, ready to submit", done: true },
      { userId: harman.id, stage: "APPLICATIONS", label: "Personal statement submitted", done: true, dueAt: new Date("2026-08-02") },
      { userId: harman.id, stage: "APPLICATIONS", label: "Academic references uploaded", done: true, dueAt: new Date("2026-08-05") },
      { userId: harman.id, stage: "APPLICATIONS", label: "UCAS application fee paid", done: true, dueAt: new Date("2026-08-05") },
      { userId: harman.id, stage: "VISA_DOCS", label: "CAS number requested", done: false, dueAt: new Date("2026-09-02") },
      { userId: harman.id, stage: "VISA_DOCS", label: "Financial evidence check", done: false, dueAt: new Date("2026-09-04") },
      { userId: harman.id, stage: "VISA_DOCS", label: "Visa biometrics appointment", done: false, dueAt: new Date("2026-09-06") },
      { userId: harman.id, stage: "VISA_DOCS", label: "TB test certificate", done: false, dueAt: new Date("2026-09-10") },
      { userId: harman.id, stage: "PRE_DEPARTURE", label: "Housing shortlist", done: false },
      { userId: harman.id, stage: "PRE_DEPARTURE", label: "Bank account setup", done: false },
      { userId: harman.id, stage: "PRE_DEPARTURE", label: "SIM & mobile plan", done: false },
      { userId: harman.id, stage: "PRE_DEPARTURE", label: "Travel insurance", done: false },
    ],
  });

  const thread1 = await prisma.messageThread.upsert({
    where: { userId_advisorId: { userId: harman.id, advisorId: priya.id } },
    update: {},
    create: { userId: harman.id, advisorId: priya.id },
  });
  await prisma.message.deleteMany({ where: { threadId: thread1.id } });
  await prisma.message.createMany({
    data: [
      { threadId: thread1.id, fromAdvisorId: priya.id, body: "Hi Harman! I've reviewed your SOP draft for Manchester — a few small notes inline, but overall it's strong." },
      { threadId: thread1.id, fromUserId: harman.id, body: "Thanks Priya! I'll fix those tonight." },
      { threadId: thread1.id, fromAdvisorId: priya.id, body: "Perfect — once it's in, I'll submit it alongside your academic references." },
      { threadId: thread1.id, fromAdvisorId: priya.id, body: "Your SOP looks ready — go ahead and submit whenever you're set." },
      { threadId: thread1.id, fromUserId: harman.id, body: "Submitted! 🎉" },
    ],
  });

  const thread2 = await prisma.messageThread.upsert({
    where: { userId_advisorId: { userId: harman.id, advisorId: james.id } },
    update: {},
    create: { userId: harman.id, advisorId: james.id },
  });
  await prisma.message.deleteMany({ where: { threadId: thread2.id } });
  await prisma.message.createMany({
    data: [
      { threadId: thread2.id, fromAdvisorId: james.id, body: "Hi Harman, once your CAS number comes through, we'll need to book biometrics within 15 days." },
      { threadId: thread2.id, fromUserId: harman.id, body: "Got it — should I request the CAS number now?" },
      { threadId: thread2.id, fromAdvisorId: james.id, body: "Yes, go ahead and request it. I'll flag the financial evidence deadline once that's in." },
    ],
  });

  await prisma.notification.deleteMany({ where: { userId: harman.id } });
  await prisma.notification.createMany({
    data: [
      { userId: harman.id, kind: "DEADLINE", title: "Visa biometrics appointment", body: "6 days left — book your slot at the Manchester visa centre.", isRead: false },
      { userId: harman.id, kind: "MESSAGE", title: "New message from Priya S.", body: "Your SOP looks ready — go ahead and submit whenever you're set.", isRead: false },
      { userId: harman.id, kind: "OFFER", title: "Offer accepted — University of Manchester", body: "Your deposit has been confirmed. Next: the visa stage.", isRead: false },
      { userId: harman.id, kind: "EVENT", title: "New event: Pre-departure briefing", body: "3 Sept · Online — hosted by students already in Manchester.", isRead: true },
      { userId: harman.id, kind: "DEADLINE", title: "Financial evidence check due", body: "Due 4 September — upload your forex transfer receipt.", isRead: true },
    ],
  });

  await prisma.user.upsert({
    where: { email: "admin@atlas.dev" },
    update: { role: "ADMIN" },
    create: { email: "admin@atlas.dev", name: "Atlas Admin", role: "ADMIN", onboarded: true },
  });
  console.log("  1 admin (admin@atlas.dev)");

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
