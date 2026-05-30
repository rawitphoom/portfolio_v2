export type ProjectTag = "Branding" | "Digital" | "Motion" | "Experiment";

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  tags: ProjectTag[];
  /** placeholder gradient — replaced later with real cover image/video */
  cover: { from: string; to: string };
};

export const PROJECTS: Project[] = [
  {
    slug: "symphony-of-vines",
    title: "The Symphony Of Vines",
    subtitle: "Interactive Cinematic Experience",
    tags: ["Digital", "Experiment"],
    cover: { from: "#0b1a5c", to: "#06060a" },
  },
  {
    slug: "klook",
    title: "Klook",
    subtitle: "Interactive Quiz",
    tags: ["Digital", "Motion"],
    cover: { from: "#3b6dff", to: "#0b1a5c" },
  },
  {
    slug: "rspca-animal-futures",
    title: "RSPCA Animal Futures",
    subtitle: "Interactive Learning Experience",
    tags: ["Digital"],
    cover: { from: "#6c8cff", to: "#0b1a5c" },
  },
  {
    slug: "blueyard",
    title: "BlueYard",
    subtitle: "Portfolio website",
    tags: ["Digital", "Branding"],
    cover: { from: "#0e1020", to: "#3b6dff" },
  },
  {
    slug: "conor",
    title: "Conor",
    subtitle: "Brand Identity",
    tags: ["Branding"],
    cover: { from: "#06060a", to: "#3b6dff" },
  },
  {
    slug: "twenty-five",
    title: "Twenty Five",
    subtitle: "Mobile Product",
    tags: ["Digital", "Motion"],
    cover: { from: "#3b6dff", to: "#06060a" },
  },
];

export const FILTERS = ["All", "Branding", "Digital", "Motion", "Experiment"] as const;
export type Filter = (typeof FILTERS)[number];
