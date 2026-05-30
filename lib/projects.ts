export type ProjectTag = "Branding" | "Digital" | "Motion" | "Experiment";

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  /** SFU course this project was built for */
  course: string;
  tags: ProjectTag[];
  /** path to the cover image, served from /public */
  cover: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "mixtape",
    title: "Mixtape",
    subtitle: "Full-Stack Music App",
    course: "IAT459 — Internet Computing",
    tags: ["Digital", "Experiment"],
    cover: "/projects/mixtape/cover.png",
  },
  {
    slug: "consistency",
    title: "Consistency",
    subtitle: "Habit-Tracking Mobile App",
    course: "IAT359 — Mobile Computing",
    tags: ["Digital"],
    cover: "/projects/consistency/cover.png",
  },
  {
    slug: "nextstep",
    title: "NextStep",
    subtitle: "Job App for International Students",
    course: "IAT334 — Interface Design",
    tags: ["Digital"],
    cover: "/projects/nextstep/cover.png",
  },
  {
    slug: "whimsy-bites",
    title: "Whimsy Bites",
    subtitle: "Dessert Brand Website",
    course: "IAT339 — Web Design & Development",
    tags: ["Branding", "Digital"],
    cover: "/projects/whimsy-bites/cover.png",
  },
  {
    slug: "mage-in-the-maze",
    title: "Mage in the Maze",
    subtitle: "Tile-Based Maze Game",
    course: "IAT167 — Digital Games",
    tags: ["Digital", "Experiment"],
    cover: "/projects/mage-in-the-maze/cover.png",
  },
  {
    slug: "small-but-mighty",
    title: "Small but Mighty",
    subtitle: "Narrative 3D Animation",
    course: "IAT343 — Animation",
    tags: ["Motion"],
    cover: "/projects/small-but-mighty/cover.png",
  },
];

export const FILTERS = ["All", "Branding", "Digital", "Motion", "Experiment"] as const;
export type Filter = (typeof FILTERS)[number];
