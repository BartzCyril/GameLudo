export const CATEGORIES = ["regles", "strategies", "histoire"] as const;

export type Category = typeof CATEGORIES[number];

export type Article = {
    id: string;
    slug: string;
    title: string;
    shortTitle: string;
    category: Category;
    order: number;
    metaTitle: string;
    metaDescription: string;
    excerpt: string;
    published: string;
    updated: string;
    related: string[];
    faq: { q: string; a: string }[];
};
