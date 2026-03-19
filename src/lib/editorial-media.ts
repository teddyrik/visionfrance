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
    alt: "Etudiante travaillant sur un ordinateur portable",
    title: "Dossiers prepares avec clarte",
    caption:
      "Un parcours plus lisible pour les candidates et candidats internationaux.",
    width: 1280,
    height: 853,
  },
  parisCampus: {
    src: "/editorial/paris-campus.jpg",
    alt: "Batiment de campus universitaire a Paris",
    title: "Campus francais professionnalises",
    caption:
      "Des environnements d'etudes modernes relies aux etablissements partenaires.",
    width: 1280,
    height: 960,
  },
  parisUniversity: {
    src: "/editorial/paris-university.jpg",
    alt: "Facade d'un batiment universitaire a Paris",
    title: "Universites et ecoles visibles",
    caption:
      "Des programmes presentes avec une image plus institutionnelle et plus concrete.",
    width: 1400,
    height: 936,
  },
} satisfies Record<string, EditorialMediaItem>;
