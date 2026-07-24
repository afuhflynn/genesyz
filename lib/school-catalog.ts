export interface Lecture {
  id: string;
  title: string;
  duration: string;
  youtubeId: string;
  description: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lectures: Lecture[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  modules: Module[];
}

export const coursesCatalog: Course[] = [
  {
    id: "how-to-start-a-startup",
    title: "How to Start a Startup",
    description: "Learn the fundamentals of building a successful startup from YC partners and industry experts.",
    category: "Foundations",
    modules: [
      {
        id: "module-1",
        title: "Ideas & Products",
        description: "How to evaluate startup ideas and build things users love.",
        lectures: [
          {
            id: "lecture-1-1",
            title: "How to Evaluate Startup Ideas",
            duration: "22 mins",
            youtubeId: "mN2M9J4JcSU",
            description: "Jared Friedman explains the framework YC uses to evaluate startup ideas, including problem size, founder-market fit, and structural moats."
          },
          {
            id: "lecture-1-2",
            title: "How to Talk to Users",
            duration: "25 mins",
            youtubeId: "MT4Ig2uqjcA",
            description: "Eric Migicovsky, founder of Pebble, gives a practical guide on user interviews, what questions to ask, and how to avoid biased feedback."
          }
        ]
      },
      {
        id: "module-2",
        title: "Launch & Growth",
        description: "How to acquire customers and plan a Minimum Viable Product (MVP).",
        lectures: [
          {
            id: "lecture-2-1",
            title: "How to Get Your First Users",
            duration: "30 mins",
            youtubeId: "V11c_p2776M",
            description: "Gustaf Alstromer shares strategies for getting your first 10, 100, and 1000 users, including unscalable acquisition tricks."
          },
          {
            id: "lecture-2-2",
            title: "How to Plan an MVP",
            duration: "24 mins",
            youtubeId: "ZRgdS_c-V08",
            description: "Michael Seibel talks about how to plan and launch a Minimum Viable Product (MVP) quickly to begin learning from users."
          }
        ]
      }
    ]
  },
  {
    id: "fundraising-101",
    title: "Fundraising Fundamentals",
    description: "The complete playbook on how to pitch, value your company, and close seed funding.",
    category: "Fundraising",
    modules: [
      {
        id: "module-1-fund",
        title: "Pitching & Moats",
        description: "Crafting a compelling narrative for venture capitalists.",
        lectures: [
          {
            id: "lecture-fund-1-1",
            title: "How to Pitch Your Startup",
            duration: "18 mins",
            youtubeId: "T71m17F0Vn4",
            description: "Michael Seibel outlines the components of a winning 2-minute pitch and pitch deck."
          },
          {
            id: "lecture-fund-1-2",
            title: "How to Raise a Seed Round",
            duration: "28 mins",
            youtubeId: "D8V3K2tSypQ",
            description: "Geoff Ralston explains the mechanics of seed round fundraising, convertible notes, SAFEs, and pricing."
          }
        ]
      }
    ]
  }
];
