import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const days = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function main() {
  // wipe in dependency order
  await db.message.deleteMany();
  await db.task.deleteMany();
  await db.projectItem.deleteMany();
  await db.projectSection.deleteMany();
  await db.project.deleteMany();
  await db.enrollment.deleteMany();
  await db.lesson.deleteMany();
  await db.module.deleteMany();
  await db.course.deleteMany();
  await db.business.deleteMany();
  await db.niche.deleteMany();
  await db.client.deleteMany();
  await db.user.deleteMany();

  // ---------- People ----------
  const michael = await db.user.create({
    data: {
      name: "Michael Quinn",
      email: "michael.quinn0831@gmail.com",
      role: "ADMIN",
      avatarUrl: "https://randomuser.me/api/portraits/men/11.jpg",
    },
  });

  const mkClient = async (name: string, email: string, avatarUrl: string, notes: string) =>
    db.client.create({
      data: {
        notes,
        user: { create: { name, email, role: "CLIENT", avatarUrl } },
      },
      include: { user: true },
    });

  const marcus = await mkClient(
    "Marcus Bell",
    "marcus@bettermancoatings.com",
    "https://randomuser.me/api/portraits/men/32.jpg",
    "Solo epoxy floor coatings operator. Great at the work, zero online presence when we started. Wants to stop relying on word of mouth only."
  );
  const andre = await mkClient(
    "Andre Thompson",
    "andre@fadedistrict.com",
    "https://randomuser.me/api/portraits/men/83.jpg",
    "Owns a 4-chair shop. Chairs half-empty on weekdays. Strong personality on camera — content is the play."
  );
  const deja = await mkClient(
    "Deja Williams",
    "deja@pressplaynails.com",
    "https://randomuser.me/api/portraits/women/65.jpg",
    "Teaches moms & daughters press-on nail sessions. Not a licensed tech and doesn't need to be — she sells the bonding experience, not the manicure."
  );
  const tasha = await mkClient(
    "Tasha Reed",
    "tasha@loudpackstudios.com",
    "https://randomuser.me/api/portraits/women/44.jpg",
    "Home studio engineer. Books sessions by DM only. Needs a booking flow and a way to raise her average ticket."
  );
  const darnell = await mkClient(
    "Darnell Hayes",
    "coachd@fridaynightfilmroom.com",
    "https://randomuser.me/api/portraits/men/51.jpg",
    "High school coach breaking down game film for players chasing scholarships. Parents are the real customer."
  );

  // ---------- Niches ----------
  const nicheData = [
    {
      slug: "barbershops",
      name: "Barbershops",
      emoji: "💈",
      description:
        "Chairs make money when they're full. We help shops fill weekday slots with rebooking systems, Google Business wins, and content that shows off the craft.",
    },
    {
      slug: "coatings-trades",
      name: "Coatings & Trades",
      emoji: "🧰",
      description:
        "Great work, invisible online. We turn finished jobs into proof — before/afters, reviews, and a site that makes the phone ring.",
    },
    {
      slug: "music",
      name: "Music & Studios",
      emoji: "🎵",
      description:
        "From DM bookings to a real business: session booking, offer stacks for artists, and content that turns listeners into clients.",
    },
    {
      slug: "nails-beauty",
      name: "Nails & Beauty",
      emoji: "💅",
      description:
        "You don't need a license to sell an experience. We help beauty entrepreneurs package what they know into offers people book.",
    },
    {
      slug: "game-film",
      name: "Game Film & Sports",
      emoji: "🎬",
      description:
        "Coaches and analysts turning film breakdowns into a service parents happily pay for — recruiting profiles, highlight reels, and more.",
    },
  ];
  const niches: Record<string, { id: string }> = {};
  for (const n of nicheData) niches[n.slug] = await db.niche.create({ data: n });

  // ---------- Businesses (portfolio) ----------
  const betterMan = await db.business.create({
    data: {
      clientId: marcus.id,
      nicheId: niches["coatings-trades"].id,
      slug: "better-man-coatings",
      name: "Better Man Coatings",
      tagline: "Garage floors that outlast the house.",
      logoUrl: "/logos/better-man-coatings.svg",
      location: "Chattanooga, TN",
      story:
        "Marcus spent eight years doing epoxy floors for a franchise before going out on his own. The work sold itself in person — but online he didn't exist, and every slow month meant chasing the next referral.",
      firstWin:
        "His first messy launch win: we posted three before/after jobs to a brand-new Google Business Profile and he booked two garage floors in ten days — without spending a dollar on ads.",
      currentState:
        "Now Better Man Coatings has a one-page site with a quote form, a review-collection habit after every job, and a QR business card that gets scanned at supply houses. Weekends are booked three weeks out.",
      services: "Website, Google Business Profile, Review system, QR business cards",
      isPublished: true,
    },
  });

  const fadeDistrict = await db.business.create({
    data: {
      clientId: andre.id,
      nicheId: niches["barbershops"].id,
      slug: "fade-district",
      name: "Fade District Barbershop",
      tagline: "Walk in rough. Walk out sharp.",
      logoUrl: "/logos/fade-district.svg",
      location: "Huntsville, AL",
      story:
        "Andre's four-chair shop stayed packed on Saturdays and quiet Tuesday through Thursday. He knew content could fix it but every posting streak died after a week.",
      firstWin:
        "First win: a simple rebooking text sequence in GoHighLevel. 40% of Saturday clients rebooked a weekday cut before leaving the chair.",
      currentState:
        "The shop now runs a content day once a month — one afternoon of filming becomes 20 shorts. Weekday chairs are at 80% and he's interviewing for a fifth barber.",
      services: "Rebooking automation, Content system, Booking funnel",
      isPublished: true,
    },
  });

  await db.business.create({
    data: {
      clientId: deja.id,
      nicheId: niches["nails-beauty"].id,
      slug: "press-play-nails",
      name: "Press Play Nails",
      tagline: "Mom & daughter nail nights, minus the salon bill.",
      logoUrl: "/logos/press-play-nails.svg",
      location: "Marietta, GA",
      story:
        "Deja isn't a licensed nail tech and never wanted to be. What she's great at is making press-on sessions a bonding ritual for moms and daughters — the nails are just the excuse.",
      firstWin:
        "First win: we packaged her living-room sessions into a bookable 'Nail Night Kit + Session' offer and she sold out her first month through one mom Facebook group.",
      currentState:
        "She now runs two paid workshops a month, sells kits on the side, and is building a waitlist for a mother-daughter subscription box.",
      services: "Offer design, Community launch, Booking page",
      isPublished: true,
    },
  });

  await db.business.create({
    data: {
      clientId: tasha.id,
      nicheId: niches["music"].id,
      slug: "loud-pack-studios",
      name: "Loud Pack Studios",
      tagline: "Where demos become records.",
      logoUrl: "/logos/loud-pack-studios.svg",
      location: "Memphis, TN",
      story:
        "Tasha engineered out of a converted garage, booking everything through Instagram DMs and losing half her leads in the scroll.",
      firstWin:
        "First win: a booking link with three clear session packages. Her average ticket went from $60 flat-rate hours to a $220 'single-ready' package in the first month.",
      currentState:
        "Sessions now book two weeks out, and she's testing an artist development retainer with two regulars.",
      services: "Offer stack, Booking funnel, Pricing strategy",
      isPublished: true,
    },
  });

  await db.business.create({
    data: {
      clientId: darnell.id,
      nicheId: niches["game-film"].id,
      slug: "friday-night-film-room",
      name: "Friday Night Film Room",
      tagline: "Film don't lie — and it can get you recruited.",
      logoUrl: "/logos/friday-night-film-room.svg",
      location: "Birmingham, AL",
      story:
        "Coach D was already breaking down film for his players for free. Parents kept asking if he could 'do the recruiting stuff' — he just never treated it like a business.",
      firstWin:
        "First win: one flat-rate 'Recruiting Film Package' — highlight reel plus a film-review call — sold five times to parents in his own program before we ever posted publicly.",
      currentState:
        "Booked through the season. Now we're working on the off-season subscription so revenue doesn't stop when the games do.",
      services: "Offer design, Website, Parent referral system",
      isPublished: true,
    },
  });

  // ---------- Course 1: The Messy Launch Framework ----------
  const framework = await db.course.create({
    data: {
      slug: "messy-launch-framework",
      title: "The Messy Launch Framework",
      description:
        "The full path from 'I have an idea' to 'I have customers and I know why' — offer, problem ladder, network, organic content, and launch. This is the system behind every business we help.",
      durationWeeks: 8,
      status: "PUBLISHED",
      modules: {
        create: [
          {
            title: "Module 1 — Get Clear: Your Offer & Your One Person",
            order: 0,
            lessons: {
              create: [
                {
                  title: "Welcome to the mess",
                  type: "OVERVIEW",
                  order: 0,
                  content:
                    "What the messy stage actually is, why it's supposed to feel like this, and the map of the next 8 weeks. By the end you'll have an offer, a funnel, and your first customers — and you'll understand every piece of it.",
                  bunnyVideoId: "sample-video-guid-replace-me",
                },
                {
                  title: "What is your offer, really?",
                  type: "LESSON",
                  order: 1,
                  content:
                    "Your offer isn't your service — it's the change you cause. We break down offer vs. deliverable, and how to say what you do in one sentence a stranger understands.",
                },
                {
                  title: "The car lot and the new mom",
                  type: "SCENARIO",
                  order: 2,
                  content:
                    "Everybody 'needs a car' — but who needs one *today*? Walk through the expanding-family buyer: more space, lower payment, priorities vs. status. Practice finding the one person behind a 'for everyone' business.",
                },
                {
                  title: "Map your resources",
                  type: "BRAINSTORM",
                  order: 3,
                  content:
                    "List every resource you already have to help your customer: skills, tools, people, access, stories. Most owners are richer than they think — they've just never inventoried it.",
                },
                {
                  title: "Write your one-person offer",
                  type: "ASSIGNMENT",
                  order: 4,
                  content:
                    "Turn in one sentence: 'I help [one person] go from [pain] to [result] with [vehicle].' We'll pressure-test it together.",
                },
              ],
            },
          },
          {
            title: "Module 2 — The Offer Stack & The Problem Ladder",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Stacking your offer",
                  type: "LESSON",
                  order: 0,
                  content:
                    "How to build the offer stack: the core result, the speed-ups, the risk-removers, and the bonuses that cost you little but mean a lot to them.",
                },
                {
                  title: "The problem ladder",
                  type: "LESSON",
                  order: 1,
                  content:
                    "Every problem you solve creates the next problem up the ladder. Map your customer's ladder so your deliverables meet them at every rung — and so you always know your next offer.",
                },
                {
                  title: "Press Play Nails: selling the bond, not the manicure",
                  type: "REAL_WORLD",
                  order: 2,
                  content:
                    "How a non-licensed nail entrepreneur packaged a mom-and-daughter bonding experience into a sold-out workshop — proof you need to be the expert at the *problem*, not the profession.",
                },
                {
                  title: "Build your stack",
                  type: "ASSIGNMENT",
                  order: 3,
                  content: "Turn in your offer stack: core result, 2 risk-removers, 2 bonuses, and the price you're scared to charge.",
                },
                {
                  title: "Offer check",
                  type: "KNOWLEDGE_CHECK",
                  order: 4,
                  content:
                    "Quick check: What's the difference between an offer and a deliverable? What rung of the ladder does your offer sit on? Who approves your work — you or the market?",
                },
              ],
            },
          },
          {
            title: "Module 3 — Your Network & Watering Holes",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Where your people already are",
                  type: "LESSON",
                  order: 0,
                  content:
                    "Who can help with this problem, and where does the person who has it hang out? Facebook groups, supply houses, school pickup lines, gyms — the watering holes are already full.",
                },
                {
                  title: "The first-client goldmine",
                  type: "LESSON",
                  order: 1,
                  content:
                    "Most owners take their first client for granted. That client is your case study, your referral engine, and your testimonial — here's how to capitalize on them properly.",
                },
                {
                  title: "Map your watering holes",
                  type: "BRAINSTORM",
                  order: 2,
                  content:
                    "List 10 places (online and in person) where your one person already congregates, and one honest reason you'd show up there that isn't 'to sell.'",
                },
                {
                  title: "Go say hello",
                  type: "ASSIGNMENT",
                  order: 3,
                  content: "Show up in 3 of your watering holes this week and help someone for free. Report back what you learned.",
                },
              ],
            },
          },
          {
            title: "Module 4 — Organic Content & The Funnel",
            order: 3,
            lessons: {
              create: [
                {
                  title: "The organic engine",
                  type: "LESSON",
                  order: 0,
                  content:
                    "Why we go organic before ads: content that talks about your offer, creates urgency without being weird, and shows your customer's pain points (and yours) honestly.",
                },
                {
                  title: "Outlier content that still sells",
                  type: "LESSON",
                  order: 1,
                  content:
                    "How to make fun, outlier content and still connect it back to your funnel — shorts into YouTube videos, YouTube videos into shorts, everything pointing home.",
                },
                {
                  title: "Build your funnel page",
                  type: "TUTORIAL",
                  order: 2,
                  content:
                    "Step-by-step: build your one-page funnel in GoHighLevel — headline, proof, offer, booking calendar, and the follow-up drip that catches the ones who don't book.",
                },
                {
                  title: "Fade District's content day",
                  type: "REAL_WORLD",
                  order: 3,
                  content:
                    "How one barbershop turned a single monthly filming afternoon into 20 shorts and 80% weekday capacity — the exact shot list included.",
                },
                {
                  title: "Funnel check",
                  type: "KNOWLEDGE_CHECK",
                  order: 4,
                  content: "Where does every piece of content point? What happens 5 minutes after someone opts in? What's your follow-up if they don't book?",
                },
              ],
            },
          },
          {
            title: "Module 5 — Launch Week & Beyond",
            order: 4,
            lessons: {
              create: [
                {
                  title: "The three phases",
                  type: "LESSON",
                  order: 0,
                  content:
                    "Phase 1: the true messy launch — getting started. Phase 2: launching for real. Phase 3: making the business sustain itself without you doing every job. Know which phase you're in and what actually matters there.",
                },
                {
                  title: "Work ON it, not just IN it",
                  type: "LESSON",
                  order: 1,
                  content:
                    "You can work for somebody else all day — working for yourself is different. Roles, systems, and how to pull yourself out of the business so it starts working for you.",
                },
                {
                  title: "Your launch plan",
                  type: "BRAINSTORM",
                  order: 2,
                  content: "Draft your launch week: what goes out each day, who you're calling, and what 'win' means by Friday.",
                },
                {
                  title: "You launched. Now what?",
                  type: "CONCLUSION",
                  order: 3,
                  content:
                    "Recap of the framework, the weekly rhythm to keep (content day, follow-up hour, review asks), and the next rung on your own ladder.",
                },
                {
                  title: "Book your launch debrief",
                  type: "BOOK_CALL",
                  order: 4,
                  content: "Book a 45-minute debrief. Bring your numbers — we'll decide the next move together.",
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ---------- Course 2: Website in a Week ----------
  const wiaw = await db.course.create({
    data: {
      slug: "website-in-a-week",
      title: "Website in a Week",
      description:
        "One week, one page, live on the internet with a way to contact you. Built for owners who've been 'about to make a website' for a year.",
      durationWeeks: 1,
      status: "PUBLISHED",
      modules: {
        create: [
          {
            title: "Day 1-2 — Words Before Widgets",
            order: 0,
            lessons: {
              create: [
                {
                  title: "What this week looks like",
                  type: "OVERVIEW",
                  order: 0,
                  content: "The plan: words first, page second, live by Friday. What you need before we start (photos, a logo if you have one, 30 minutes a day).",
                },
                {
                  title: "Say what you do",
                  type: "LESSON",
                  order: 1,
                  content: "Headline, subhead, and the three proof points. If the words don't sell, the design won't save it.",
                },
                {
                  title: "Draft your page copy",
                  type: "ASSIGNMENT",
                  order: 2,
                  content: "Fill in the one-page copy template and submit it.",
                },
              ],
            },
          },
          {
            title: "Day 3-4 — Build It",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Build the page",
                  type: "TUTORIAL",
                  order: 0,
                  content: "Screen-by-screen: drop your copy into the template, swap the photos, connect your domain.",
                },
                {
                  title: "Hook up the contact flow",
                  type: "TUTORIAL",
                  order: 1,
                  content: "Form → your phone. Set up the instant text-back so no lead sits cold overnight.",
                },
              ],
            },
          },
          {
            title: "Day 5 — Launch",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Pre-flight check",
                  type: "KNOWLEDGE_CHECK",
                  order: 0,
                  content: "Does it load on your phone? Does the form hit your inbox? Does the number click-to-call?",
                },
                {
                  title: "You're live",
                  type: "CONCLUSION",
                  order: 1,
                  content: "Post it everywhere once, then put the link in your bio, your card, and your voicemail. The website works when you send people to it.",
                },
                {
                  title: "Stuck? Book a fix-it call",
                  type: "BOOK_CALL",
                  order: 2,
                  content: "15 minutes, screen-share, we get you unstuck.",
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ---------- Enrollments ----------
  await db.enrollment.create({ data: { courseId: framework.id, clientId: marcus.id } });
  await db.enrollment.create({ data: { courseId: framework.id, clientId: tasha.id } });
  await db.enrollment.create({ data: { courseId: wiaw.id, clientId: deja.id } });

  // ---------- Project 1: Better Man Coatings — Website Build ----------
  const websiteBuild = await db.project.create({
    data: {
      businessId: betterMan.id,
      slug: "better-man-website-build",
      title: "Website Build",
      description:
        "One-page site for Better Man Coatings: proof-first layout with before/afters, quote form wired to GoHighLevel, and a QR business card so the site travels with Marcus.",
      status: "ACTIVE",
      dueDate: days(21),
      sections: {
        create: [
          {
            title: "Kickoff",
            order: 0,
            items: {
              create: [
                {
                  title: "What we're building & who owes what",
                  type: "OVERVIEW",
                  order: 0,
                  content:
                    "Goal: a live one-page site that turns job photos into booked quotes. Marcus owns photos + bio + review asks; Michael owns build, copy polish, QR card, and launch.",
                },
                {
                  title: "Why proof beats polish",
                  type: "LESSON",
                  order: 1,
                  content:
                    "For trades, before/after photos and reviews outsell fancy design every time. This page is a proof machine — everything else is decoration.",
                },
              ],
            },
          },
          {
            title: "Brand & Content",
            order: 1,
            items: {
              create: [
                {
                  title: "Shooting job photos that sell",
                  type: "TUTORIAL",
                  order: 0,
                  content:
                    "Phone-only tutorial: same corner before and after, wide shot plus one detail shot, morning light, wipe the floor first. Five jobs shot this way beats fifty random pics.",
                },
                {
                  title: "The garage that booked two more garages",
                  type: "REAL_WORLD",
                  order: 1,
                  content:
                    "The first before/after post pulled two neighbors from the same street. Neighbors see neighbors' garages — that's the whole marketing strategy for month one.",
                },
              ],
            },
          },
          {
            title: "Build & Review",
            order: 2,
            items: {
              create: [
                {
                  title: "Review the draft like a customer",
                  type: "ASSIGNMENT",
                  order: 0,
                  content:
                    "When the draft lands: open it on your phone, pretend you're a homeowner with a flaky garage floor. Would you fill out the form? Note anything confusing — don't be polite.",
                },
                {
                  title: "Making edits yourself",
                  type: "TUTORIAL",
                  order: 1,
                  content: "10-minute walkthrough of the page editor so swapping a photo or price never requires waiting on me.",
                },
              ],
            },
          },
          {
            title: "Launch",
            order: 3,
            items: {
              create: [
                {
                  title: "Launch checklist",
                  type: "CONCLUSION",
                  order: 0,
                  content: "Domain live, form tested, click-to-call works, QR card printed, site link on Google Business Profile. Then we post the first before/after.",
                },
                {
                  title: "Launch call",
                  type: "BOOK_CALL",
                  order: 1,
                  content: "Book 30 minutes launch week — we push it live together and set the weekly rhythm.",
                },
              ],
            },
          },
        ],
      },
    },
  });

  await db.task.createMany({
    data: [
      {
        projectId: websiteBuild.id,
        title: "Pick your domain name",
        details: "Chose from the three options — went with bettermancoatings.com.",
        assignedTo: "CLIENT",
        status: "APPROVED",
        dueDate: days(-10),
        submissionNote: "bettermancoatings.com — let's do it.",
      },
      {
        projectId: websiteBuild.id,
        title: "Send 5 photos of recent jobs",
        details: "Before/after pairs if you have them. Use the photo tutorial in Brand & Content — same corner, morning light.",
        assignedTo: "CLIENT",
        status: "OPEN",
        dueDate: days(3),
      },
      {
        projectId: websiteBuild.id,
        title: "Write your short bio",
        details: "3-4 sentences for the About section: who you are, how long you've been coating floors, why you went out on your own.",
        assignedTo: "CLIENT",
        status: "SUBMITTED",
        dueDate: days(1),
        submissionNote:
          "8 years doing epoxy for a franchise before starting Better Man. I coat garage floors like they're my own — prep right, no shortcuts. Started my own thing because homeowners deserve the guy who actually shows up. That work?",
      },
      {
        projectId: websiteBuild.id,
        title: "First website draft",
        details: "Full one-pager with placeholder photos until Marcus's job photos land. Marcus reviews like a customer (see assignment).",
        assignedTo: "ADMIN",
        status: "SUBMITTED",
        dueDate: days(2),
        submissionNote: "Draft is up at preview link — review on your phone first.",
      },
      {
        projectId: websiteBuild.id,
        title: "QR code business card",
        details: "Print-ready card, QR pointing at the quote form, drop the file in the thread when done.",
        assignedTo: "ADMIN",
        status: "OPEN",
        dueDate: days(7),
      },
      {
        projectId: websiteBuild.id,
        title: "Connect quote form to GoHighLevel",
        details: "Form → pipeline → instant text-back within 5 minutes.",
        assignedTo: "ADMIN",
        status: "OPEN",
        dueDate: days(10),
      },
    ],
  });

  const msg = (authorId: string, body: string) => ({ projectId: websiteBuild.id, authorId, body });
  for (const m of [
    msg(michael.id, "Marcus — kickoff notes are in the Overview section. Two things I need from you this week: 5 job photos and your short bio. Both are in your tasks with due dates."),
    msg(marcus.user.id, "Got it. Doing a garage in Hixson Thursday, I'll shoot the before/after like the tutorial says."),
    msg(michael.id, "Perfect. Same corner both shots — that's the money angle. Bio whenever you get 10 minutes, don't overthink it."),
    msg(marcus.user.id, "Just submitted the bio. Also — do you have that QR card thing moving? Guy at the supply house asked how to find me and I had nothing to hand him."),
    msg(michael.id, "Bio's in review — it's good, might tighten one line. QR card is on my list, due end of next week, and I just put the first site draft up for you. Open it on your phone and review it like a customer, then approve it or tell me what's off."),
    msg(marcus.user.id, "Looking at the draft tonight after my last job. First glance on the phone looks clean 💪"),
  ]) {
    await db.message.create({ data: m });
  }

  // ---------- Project 2: Better Man Coatings — Business Startup ----------
  const startup = await db.project.create({
    data: {
      businessId: betterMan.id,
      slug: "better-man-business-startup",
      title: "Business Startup",
      description:
        "The wrap-around work: learn the website tools, set up the review habit, and get the marketing rhythm going so the site actually gets fed.",
      status: "ACTIVE",
      dueDate: days(45),
      sections: {
        create: [
          {
            title: "Foundations",
            order: 0,
            items: {
              create: [
                {
                  title: "The plan around the website",
                  type: "OVERVIEW",
                  order: 0,
                  content: "A website nobody feeds is a brochure in a drawer. This track sets up the review habit, the weekly post, and the follow-up hour.",
                },
                {
                  title: "The review ask script",
                  type: "LESSON",
                  order: 1,
                  content: "Word-for-word ask at job completion, plus the text that goes out that evening with the direct review link.",
                },
                {
                  title: "Your weekly rhythm",
                  type: "BRAINSTORM",
                  order: 2,
                  content: "Pick your content day, your follow-up hour, and your review-ask trigger. Write them down — we hold you to them.",
                },
              ],
            },
          },
          {
            title: "Marketing Basics",
            order: 1,
            items: {
              create: [
                {
                  title: "Google Business Profile deep dive",
                  type: "TUTORIAL",
                  order: 0,
                  content: "Categories, service areas, photos, posts — the 20% of GBP that drives 80% of the calls.",
                },
                {
                  title: "Knowledge check: the rhythm",
                  type: "KNOWLEDGE_CHECK",
                  order: 1,
                  content: "When does the review text go out? What's your content day? Where does every post point?",
                },
              ],
            },
          },
        ],
      },
    },
  });

  await db.task.createMany({
    data: [
      {
        projectId: startup.id,
        title: "Set up Google Business Profile access",
        details: "Add michael.quinn0831@gmail.com as a manager on your GBP.",
        assignedTo: "CLIENT",
        status: "OPEN",
        dueDate: days(5),
      },
      {
        projectId: startup.id,
        title: "Review ask script + text template",
        details: "Deliver the word-for-word script and load the text template into GHL.",
        assignedTo: "ADMIN",
        status: "OPEN",
        dueDate: days(9),
      },
    ],
  });

  // ---------- Project 3: Fade District — GBP Revamp (complete, for history) ----------
  const gbp = await db.project.create({
    data: {
      businessId: fadeDistrict.id,
      slug: "fade-district-gbp-revamp",
      title: "Google Business Profile Revamp",
      description: "Fill the weekday chairs: GBP overhaul plus the rebooking text sequence.",
      status: "COMPLETE",
      dueDate: days(-30),
      sections: {
        create: [
          {
            title: "Revamp",
            order: 0,
            items: {
              create: [
                {
                  title: "The weekday problem",
                  type: "OVERVIEW",
                  order: 0,
                  content: "Saturdays full, Tuesdays dead. Plan: GBP overhaul + rebook-before-you-leave sequence.",
                },
                {
                  title: "Wrap-up",
                  type: "CONCLUSION",
                  order: 1,
                  content: "40% weekday rebooking rate in month one. Next: the monthly content day (moved to the Content System project).",
                },
              ],
            },
          },
        ],
      },
    },
  });
  await db.task.createMany({
    data: [
      {
        projectId: gbp.id,
        title: "Send 10 shop photos",
        assignedTo: "CLIENT",
        status: "APPROVED",
        dueDate: days(-45),
        submissionNote: "Sent via thread — cuts, chairs, storefront.",
      },
      {
        projectId: gbp.id,
        title: "Rebooking text sequence live in GHL",
        assignedTo: "ADMIN",
        status: "APPROVED",
        dueDate: days(-35),
        submissionNote: "Live. 3-touch sequence: at checkout, +3 days, +10 days.",
      },
    ],
  });
  await db.message.create({
    data: {
      projectId: gbp.id,
      authorId: andre.user.id,
      body: "Bro. Three Tuesday bookings today from the rebooking texts alone. This thing works.",
    },
  });

  // ---------- Progress + notifications so the new features are visible ----------
  const kickoffItems = await db.projectItem.findMany({
    where: { section: { projectId: websiteBuild.id, title: "Kickoff" } },
  });
  for (const item of kickoffItems) {
    await db.projectItem.update({ where: { id: item.id }, data: { completedAt: days(-4) } });
  }

  await db.notification.createMany({
    data: [
      {
        userId: michael.id,
        title: "📥 Ready for review: Write your short bio",
        body: "On Website Build — approve it or request changes.",
        href: "/admin/projects/better-man-website-build",
      },
      {
        userId: michael.id,
        title: "💬 Marcus Bell on Website Build",
        body: "Looking at the draft tonight after my last job. First glance on the phone looks clean 💪",
        href: "/admin/projects/better-man-website-build",
      },
      {
        userId: marcus.user.id,
        title: "📋 New to-do on Website Build",
        body: "Send 5 photos of recent jobs",
        href: `/portal/${marcus.id}/projects/better-man-website-build`,
      },
    ],
  });

  console.log("Seeded ✔");
  console.log(`  Users: ${await db.user.count()}  Businesses: ${await db.business.count()}  Niches: ${await db.niche.count()}`);
  console.log(`  Courses: ${await db.course.count()}  Lessons: ${await db.lesson.count()}`);
  console.log(`  Projects: ${await db.project.count()}  Tasks: ${await db.task.count()}  Messages: ${await db.message.count()}`);
}

main().finally(() => db.$disconnect());
