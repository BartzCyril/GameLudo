// Identifiant éditeur AdSense (le même que dans le script du layout et dans public/ads.txt).
export const ADSENSE_CLIENT = "ca-pub-4145165029182891";

// Un bloc d'annonces par emplacement, créé dans AdSense : Annonces → Par bloc d'annonces → Annonces display.
// Laisse `id` vide tant que le bloc n'existe pas : l'emplacement n'est alors pas affiché du tout.
export const AD_SLOTS = {
    homeRailLeft:   {id: "", width: 160, height: 600},   // accueil, à gauche du jeu (écrans ≥ 1872 px)
    homeRailRight:  {id: "", width: 160, height: 600},   // accueil, à droite du jeu (écrans ≥ 1872 px)
    homeBelowGame:  {id: "", responsive: true},          // accueil, après « Comment se déroule un début de partie ? »
    articleTop:     {id: "", responsive: true},          // article, avant le 2e intertitre
    articleMiddle:  {id: "", responsive: true},          // article, avant le 4e intertitre (si l'article en a au moins 5)
    articleBottom:  {id: "", responsive: true},          // article, avant la FAQ
    articleSidebar: {id: "", width: 300, height: 600},   // article, colonne de droite, sous le sommaire (ordinateur)
    guideInline:    {id: "", responsive: true},          // page du guide, entre la 1re et la 2e catégorie
};

export type AdSlotName = keyof typeof AD_SLOTS;
