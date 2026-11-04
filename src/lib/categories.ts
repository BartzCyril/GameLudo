export const CATEGORIES = {
    regles: {label: "Règles", title: "Règles du jeu"},
    strategies: {label: "Stratégies", title: "Stratégies pour gagner"},
    histoire: {label: "Histoire", title: "Histoire du jeu"},
};

export type Category = keyof typeof CATEGORIES;

export type Article = {
    title: string;
    slug: string;
    category: Category;
    order: number;
    metaTitle: string;
    metaDescription: string;
    excerpt: string;
    updated: string;
    related: string[];
    faq: { q: string; a: string }[];
};
