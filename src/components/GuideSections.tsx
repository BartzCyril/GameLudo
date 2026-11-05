'use client'

import {Fragment, ReactNode, useState} from "react";
import {Article, Category, CATEGORIES} from "@/lib/categories";
import {ArticleCard} from "@/components/ArticleCard";
import {useI18n} from "@/i18n/I18nProvider";

export function GuideSections({articles, filters: showFilters = true, ad}: { articles: Article[], filters?: boolean, ad?: ReactNode }) {
    const {t} = useI18n();
    const [filter, setFilter] = useState<Category | "all">("all");
    const filters = [
        {id: "all" as const, label: t("guide.all"), count: articles.length},
        ...CATEGORIES.map(id => ({id, label: t(`categories.${id}.label`), count: articles.filter(article => article.category === id).length})),
    ];

    return (
        <>
            {showFilters && <div className="filters" role="group" aria-label={t("guide.filterLabel")}>
                {filters.map(({id, label, count}) => (
                    <button key={id} type="button" className="filter" aria-pressed={filter === id} onClick={() => setFilter(id)}>
                        {label}<span className="filter__count">{count}</span>
                    </button>
                ))}
            </div>}
            {/* Filtered sections are hidden, not removed: all 7 cards stay in the generated HTML. */}
            {CATEGORIES.map((category, index) => (
                <Fragment key={category}>
                    {index === 1 && ad && <div hidden={filter !== "all"}>{ad}</div>}
                    <section className="guide-section" id={category} aria-labelledby={`h-${category}`} hidden={filter !== "all" && filter !== category}>
                        <div className="guide-section__head">
                            <span className={`guide-section__mark mark--${category}`} aria-hidden="true"></span>
                            <h2 id={`h-${category}`}>{t(`categories.${category}.title`)}</h2>
                        </div>
                        <div className="article-grid">
                            {articles.filter(article => article.category === category).map(article => <ArticleCard key={article.slug} article={article}/>)}
                        </div>
                    </section>
                </Fragment>
            ))}
        </>
    );
}
