'use client'

import {useState} from "react";
import {Article, Category, CATEGORIES} from "@/lib/categories";
import {ArticleCard} from "@/components/ArticleCard";

const categories = Object.keys(CATEGORIES) as Category[];

export function GuideSections({articles}: { articles: Article[] }) {
    const [filter, setFilter] = useState<Category | "all">("all");
    const filters = [
        {id: "all" as const, label: "Tout", count: articles.length},
        ...categories.map(id => ({id, label: CATEGORIES[id].label, count: articles.filter(article => article.category === id).length})),
    ];

    return (
        <>
            <div className="filters" role="group" aria-label="Filtrer par thème">
                {filters.map(({id, label, count}) => (
                    <button key={id} type="button" className="filter" aria-pressed={filter === id} onClick={() => setFilter(id)}>
                        {label}<span className="filter__count">{count}</span>
                    </button>
                ))}
            </div>
            {/* Filtered sections are hidden, not removed: all 7 cards stay in the generated HTML. */}
            {categories.map(category => (
                <section key={category} className="guide-section" id={category} aria-labelledby={`h-${category}`} hidden={filter !== "all" && filter !== category}>
                    <div className="guide-section__head">
                        <span className={`guide-section__mark mark--${category}`} aria-hidden="true"></span>
                        <h2 id={`h-${category}`}>{CATEGORIES[category].title}</h2>
                    </div>
                    <div className="article-grid">
                        {articles.filter(article => article.category === category).map(article => <ArticleCard key={article.slug} article={article}/>)}
                    </div>
                </section>
            ))}
        </>
    );
}
