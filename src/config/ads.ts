// Identifiant éditeur AdSense (le même que dans le script du layout et dans public/ads.txt).
export const ADSENSE_CLIENT = "ca-pub-4145165029182891";

// Un bloc d'annonces par emplacement, créé dans AdSense : Annonces → Par bloc d'annonces → Annonces display.
// Laisse `id` vide tant que le bloc n'existe pas : l'emplacement n'est alors pas affiché du tout.
export const AD_SLOTS = {
    homeRailLeft:   {id: "9837344950", width: 160, height: 600},   // accueil, à 150 px à gauche du plateau (écrans ≥ 1456 px)
    homeRailRight:  {id: "4393446589", width: 160, height: 600},   // accueil, à 150 px à droite du plateau (écrans ≥ 1456 px)
    homeBelowGame:  {id: "5891370244", responsive: true},          // accueil, après « Comment se déroule un début de partie ? »
    articleTop:     {id: "3408677137", responsive: true},          // article, avant le 2e intertitre
    articleMiddle:  {id: "8018218012", responsive: true},          // article, avant le 4e intertitre (si l'article en a au moins 5)
    articleBottom:  {id: "2227669432", responsive: true},          // article, avant la FAQ
    articleSidebar: {id: "8601506099", width: 300, height: 600},   // article, colonne de droite, sous le sommaire (ordinateur)
    guideInline:    {id: "7288424423", responsive: true},          // page du guide, entre la 1re et la 2e catégorie
};

export type AdSlotName = keyof typeof AD_SLOTS;
