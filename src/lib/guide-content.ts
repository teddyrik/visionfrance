export type GuideSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type GuideFaq = {
  question: string;
  answer: string;
};

export type GuideContent = {
  slug: string;
  title: string;
  seoTitle: string;
  eyebrow: string;
  description: string;
  summary: string;
  readingLabel: string;
  publishedAt: string;
  updatedAt: string;
  keywords: string[];
  sections: GuideSection[];
  faq: GuideFaq[];
};

const guideDate = "2026-04-09T08:00:00.000Z";

export const guidePages: GuideContent[] = [
  {
    slug: "campus-france",
    title: "Campus France",
    seoTitle:
      "Campus France : dossier, entretien et procedure Etudes en France",
    eyebrow: "Guide Campus France",
    description:
      "Comprendre Campus France, le dossier Etudes en France, l'entretien et les pieces a preparer avant votre depart pour la France.",
    summary:
      "Ce guide clarifie le role de Campus France, la logique du dossier Etudes en France et les points de controle qui ralentissent le plus souvent une candidature internationale.",
    readingLabel: "Guide pratique",
    publishedAt: guideDate,
    updatedAt: guideDate,
    keywords: [
      "Campus France",
      "Etudes en France",
      "dossier Campus France",
      "entretien Campus France",
      "etudier en France",
    ],
    sections: [
      {
        title: "A quoi sert Campus France ?",
        paragraphs: [
          "Campus France est l'interlocuteur de reference pour de nombreuses procedures de candidature internationale vers la France. Selon votre pays de residence, la plateforme Etudes en France centralise le choix des formations, le depot des pieces, l'echange avec les etablissements et une partie du parcours visa.",
          "Pour un site comme Vision France, viser la requete Campus France ne sert pas a se substituer au dispositif officiel. L'objectif utile est d'expliquer le parcours, d'aider les candidats a eviter les erreurs frequentes et de les orienter ensuite vers les bonnes formations et bourses.",
        ],
        bullets: [
          "Verifier si votre pays releve de la procedure Etudes en France",
          "Constituer un dossier academique coherent et complet",
          "Suivre les calendriers de candidature propres a chaque formation",
          "Preparer l'entretien ou les etapes complementaires demandees localement",
        ],
      },
      {
        title: "Comment monter un dossier Etudes en France solide",
        paragraphs: [
          "Un bon dossier Campus France ne se limite pas a televerser quelques documents. Il faut une trajectoire lisible entre votre parcours, votre projet d'etudes, votre budget et votre objectif professionnel. Quand ces quatre elements se contredisent, la credibilite du dossier chute.",
          "La page d'accueil Vision France doit donc relier naturellement les bourses, les conseils d'orientation et le parcours administratif. C'est cette coherence qui peut amener Google a mieux comprendre votre expertise sur l'ensemble du sujet et pas seulement sur la requete bourses.",
        ],
        bullets: [
          "Diplomes, releves de notes et traductions conformes",
          "Projet d'etudes precis, adapte au niveau vise",
          "Justification des ressources financieres et des frais previsibles",
          "Preuve de niveau de langue quand la formation l'exige",
        ],
      },
      {
        title: "Entretien Campus France : ce qui est verifie",
        paragraphs: [
          "L'entretien verifie surtout la coherence. Le candidat doit pouvoir expliquer pourquoi il choisit la France, pourquoi cette formation, comment il finance son projet et ce qu'il fera a l'issue de ses etudes. Les reponses vagues, les copies de motivation standardisees et les budgets irrealistes fragilisent le dossier.",
          "Un bon contenu SEO sur Campus France doit donc repondre a des questions concretes et non pas recopier des generalites. Les utilisateurs cherchent des etapes, des delais, des pieces et des erreurs a eviter.",
        ],
        bullets: [
          "Projet de formation realiste",
          "Capacite a expliquer le choix de l'etablissement",
          "Connaissance minimale des couts de vie et d'installation",
          "Clarte sur le financement, y compris bourse, apport personnel ou garant",
        ],
      },
      {
        title: "Ce que Vision France apporte dans ce parcours",
        paragraphs: [
          "Vision France renforce la partie orientation et financement avec un catalogue editorialise de bourses d'etudes en France, des fiches verifiees et des liens vers les sources officielles. Cela permet de couvrir une intention de recherche plus large: Campus France, visa etudiant, financement et etudes en France.",
          "Pour gagner des positions sur Google, il faut ensuite faire vivre ces pages avec des mises a jour regulieres, des liens entrants de qualite et un vrai historique de contenu utile. La technique seule ne suffira pas.",
        ],
      },
    ],
    faq: [
      {
        question: "Campus France est-il obligatoire ?",
        answer:
          "Cela depend du pays de residence et du type de procedure. Dans de nombreux pays, le passage par Etudes en France est obligatoire pour candidater ou preparer le visa etudiant.",
      },
      {
        question: "Quand faut-il ouvrir son dossier Campus France ?",
        answer:
          "Le plus tot possible dans la fenetre officielle de votre pays. Cela laisse du temps pour corriger les pieces, finaliser les admissions et preparer le visa.",
      },
      {
        question: "Puis-je chercher une bourse en meme temps ?",
        answer:
          "Oui. C'est meme recommande, car le financement fait partie des points de coherence du projet d'etudes et de votre installation en France.",
      },
    ],
  },
  {
    slug: "visa-etudiant-france",
    title: "Visa etudiant France",
    seoTitle: "Visa etudiant France : documents, demarches et delais",
    eyebrow: "Guide Visa",
    description:
      "Retrouvez les etapes utiles pour preparer un visa etudiant France, les justificatifs financiers et les points de vigilance avant le depot du dossier.",
    summary:
      "Le visa etudiant est souvent le dernier maillon du projet, mais c'est aussi celui qui revele les incoherences du dossier. Ce guide rassemble les pieces a anticiper et l'ordre de travail qui fait gagner du temps.",
    readingLabel: "Visa et installation",
    publishedAt: guideDate,
    updatedAt: guideDate,
    keywords: [
      "visa etudiant France",
      "VLS-TS etudiant",
      "documents visa etudiant",
      "etudier en France",
      "Campus France",
    ],
    sections: [
      {
        title: "Le visa vient apres l'admission, pas avant",
        paragraphs: [
          "La strategie la plus saine consiste a partir d'une admission credible, puis a monter le dossier visa avec tous les justificatifs. Beaucoup de candidats commencent par le visa alors qu'ils n'ont ni admission stabilisee ni financement clarifie. Cela cree du stress et des dossiers faibles.",
          "Dans la pratique, votre admission, votre projet d'etudes, votre hebergement et votre budget doivent raconter la meme histoire. Google attend la meme chose d'un site expert: des contenus complets et bien relies, pas des pages isolees.",
        ],
      },
      {
        title: "Les pieces qui reviennent le plus souvent",
        paragraphs: [
          "La liste exacte depend du pays et du centre de depot, mais certains justificatifs sont presque toujours centraux. Le site doit donc traiter clairement ces notions si vous voulez capter des recherches a forte intention sur visa etudiant France.",
        ],
        bullets: [
          "Passeport valide sur toute la periode utile",
          "Admission ou preinscription dans un etablissement en France",
          "Justificatifs financiers ou attestation de bourse",
          "Preuve d'hebergement ou de solution d'accueil",
          "Attestation Campus France si votre pays est concerne",
          "Assurance ou pieces complementaires demandees localement",
        ],
      },
      {
        title: "Justifier le financement du sejour",
        paragraphs: [
          "C'est l'un des points les plus sensibles. Si vous annoncez un projet ambitieux en France sans pouvoir expliquer comment vous financez les frais de vie, de transport, de visa et parfois de logement, votre dossier devient fragile.",
          "Les bourses publiees sur Vision France peuvent soutenir cette partie, a condition de bien distinguer ce qui est deja acquis, ce qui est en cours et ce qui reste a financer. Une promesse vague ne vaut pas un justificatif clair.",
        ],
      },
      {
        title: "Delais, installation et validation a l'arrivee",
        paragraphs: [
          "Un bon contenu SEO sur le visa ne s'arrete pas au depot du dossier. Les etudiants recherchent aussi les delais, l'arrivee en France, la validation du VLS-TS, l'ouverture d'un compte, l'assurance et les premiers frais d'installation.",
          "Couvrir ce parcours complet donne a Vision France une profondeur editoriale utile. C'est ce type de maillage qui aide a gagner en pertinence sur les requetes etudier en France et etudier a l'etranger.",
        ],
      },
    ],
    faq: [
      {
        question: "Une bourse suffit-elle pour obtenir le visa ?",
        answer:
          "Pas automatiquement. La bourse renforce le dossier, mais il faut aussi une admission valable, un projet coherent et les autres justificatifs exiges par la procedure locale.",
      },
      {
        question: "Combien de temps faut-il pour preparer le visa ?",
        answer:
          "Il faut anticiper plusieurs semaines. Le bon rythme est de commencer des que l'admission et les pieces principales sont stabilisees.",
      },
      {
        question: "Le visa etudiant remplace-t-il Campus France ?",
        answer:
          "Non. Dans les pays concernes, Campus France et la procedure visa sont deux etapes liees mais distinctes.",
      },
    ],
  },
  {
    slug: "etudier-en-france",
    title: "Etudier en France",
    seoTitle:
      "Etudier en France : admission, budget, bourses et vie etudiante",
    eyebrow: "Guide Etudes",
    description:
      "Tout ce qu'il faut cadrer pour etudier en France: admission, budget, logement, bourses, Campus France et visa etudiant.",
    summary:
      "Etudier en France est une intention large. Pour capter cette requete, un site doit aider sur tout le parcours: choix de formation, financement, administration et installation. Ce guide pose ce cadre de bout en bout.",
    readingLabel: "Parcours complet",
    publishedAt: guideDate,
    updatedAt: guideDate,
    keywords: [
      "etudier en France",
      "etudier a l'etranger",
      "bourses d'etudes en France",
      "Campus France",
      "visa etudiant France",
    ],
    sections: [
      {
        title: "Choisir la bonne formation avant de chercher la bonne ville",
        paragraphs: [
          "Beaucoup d'etudiants commencent par chercher Paris, Lyon ou Lille. La meilleure approche consiste d'abord a cibler la formation, le niveau academique et la langue d'enseignement. Ensuite seulement viennent la ville, le budget et les options de logement.",
          "Cette logique doit aussi structurer le SEO de Vision France: une page mere sur etudier en France, reliee a des pages enfants sur Campus France, visa etudiant et bourses d'etudes en France.",
        ],
      },
      {
        title: "Construire un budget realiste",
        paragraphs: [
          "Le budget ne se limite pas aux frais de scolarite. Il faut integrer le logement, la restauration, les transports, l'installation, les frais consulaires, les depenses de sante et parfois les garanties de logement.",
          "Un contenu qui aide vraiment doit montrer comment les bourses et les ressources personnelles se combinent. C'est un bon moyen de couvrir la requete etudier a l'etranger avec un angle beaucoup plus concret.",
        ],
        bullets: [
          "Frais d'inscription ou de dossier",
          "Visa, deplacements et premiere installation",
          "Loyer, caution et assurance habitation",
          "Transport local, alimentation et depenses courantes",
        ],
      },
      {
        title: "Ou trouver des bourses d'etudes en France",
        paragraphs: [
          "Les meilleurs resultats viennent rarement d'une simple recherche generique. Il faut surveiller les universites, les graduate schools, les programmes d'excellence et les pages institutionnelles. Vision France peut se positionner ici avec un catalogue propre, cible et regulierement mis a jour.",
          "Pour chaque programme, il est utile d'afficher le niveau cible, la couverture, la date limite, le lien officiel et un resume editorial. C'est exactement le type de structure qui favorise l'indexation propre et la comprehension du contenu par Google.",
        ],
      },
      {
        title: "Admission, installation et premier mois en France",
        paragraphs: [
          "Le premier mois conditionne la suite. Les candidats doivent en general valider leur installation administrative, ouvrir leurs services du quotidien et comprendre le calendrier universitaire. Un bon site editorial ne s'arrete donc pas a la candidature.",
          "Si vous voulez dominer des requetes larges, il faut couvrir l'avant, le pendant et l'apres. C'est cette profondeur qui transforme un simple catalogue en vrai hub d'information.",
        ],
      },
    ],
    faq: [
      {
        question: "Peut-on etudier en France sans bourse ?",
        answer:
          "Oui, mais il faut alors demontrer un financement coherent. Une bourse facilite le projet mais n'est pas l'unique voie.",
      },
      {
        question: "Quelle est la difference entre Campus France et Vision France ?",
        answer:
          "Campus France couvre la procedure institutionnelle officielle. Vision France agit comme hub d'information editorial sur les bourses, le parcours de candidature et la preparation du projet.",
      },
      {
        question: "Quelle page consulter en premier ?",
        answer:
          "Commencez par clarifier votre objectif d'etudes et votre niveau, puis consultez le catalogue des bourses et les guides Campus France et visa etudiant.",
      },
    ],
  },
];

export function getGuideBySlug(slug: string) {
  return guidePages.find((guide) => guide.slug === slug);
}
