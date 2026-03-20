export type EditorialMediaItem = {
  src: string;
  alt: string;
  title: string;
  caption: string;
  width: number;
  height: number;
};

export const editorialMedia = {
  studentFocus: {
    src: "/editorial/student-laptop.jpg",
    alt: "Étudiante travaillant sur un ordinateur portable",
    title: "Dossiers préparés avec clarté",
    caption:
      "Un parcours plus lisible pour les candidates et candidats internationaux.",
    width: 1280,
    height: 853,
  },
  parisCampus: {
    src: "/editorial/paris-campus.jpg",
    alt: "Bâtiment de campus universitaire à Paris",
    title: "Campus français professionnalisés",
    caption:
      "Des environnements d'études modernes reliés aux établissements partenaires.",
    width: 1280,
    height: 960,
  },
  parisUniversity: {
    src: "/editorial/paris-university.jpg",
    alt: "Façade d'un bâtiment universitaire à Paris",
    title: "Universités et écoles visibles",
    caption:
      "Des programmes présentés avec une image plus institutionnelle et plus concrète.",
    width: 1400,
    height: 936,
  },
} satisfies Record<string, EditorialMediaItem>;
