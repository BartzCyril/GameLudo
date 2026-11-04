import Link from "next/link";
import {Article, CATEGORIES} from "@/lib/categories";
import {ArrowIcon} from "@/components/Icons";

export function Tag({category}: { category: Article["category"] }) {
    return <span className={`tag tag--${category}`}>{CATEGORIES[category].label}</span>;
}

export function ArticleCard({article, compact = false}: { article: Article, compact?: boolean }) {
    return (
        <Link className="article-card" href={`/posts/${article.slug}`}>
            <span className="article-card__top">
                <Tag category={article.category}/>
                <span className="article-card__num" aria-hidden="true">{String(article.order).padStart(2, "0")}</span>
            </span>
            <h3>{article.title}</h3>
            {!compact && <p>{article.excerpt}</p>}
            <span className="article-card__more">Lire l&apos;article <ArrowIcon/></span>
        </Link>
    );
}
