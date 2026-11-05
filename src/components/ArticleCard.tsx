'use client'

import Link from "next/link";
import {Article} from "@/lib/categories";
import {ArrowIcon} from "@/components/Icons";
import {articlePath} from "@/i18n/config";
import {useI18n} from "@/i18n/I18nProvider";

export function Tag({category}: { category: Article["category"] }) {
    const {t} = useI18n();
    return <span className={`tag tag--${category}`}>{t(`categories.${category}.label`)}</span>;
}

export function ArticleCard({article, compact = false}: { article: Article, compact?: boolean }) {
    const {t, locale} = useI18n();
    return (
        <Link className="article-card" href={articlePath(locale, article.slug)}>
            <span className="article-card__top">
                <Tag category={article.category}/>
                <span className="article-card__num" aria-hidden="true">{String(article.order).padStart(2, "0")}</span>
            </span>
            <h3>{article.title}</h3>
            {!compact && <p>{article.excerpt}</p>}
            <span className="article-card__more">{t("article.readMore")} <ArrowIcon/></span>
        </Link>
    );
}
