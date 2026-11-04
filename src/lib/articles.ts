import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {Article} from "@/lib/categories";

const FOLDER = path.join(process.cwd(), "content/articles");

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gameludo.app";

// The site exports with trailingSlash, so this is the form that is actually served.
export const pageUrl = (pathname: string) => `${SITE_URL}${pathname.replace(/\/?$/, "/")}`;

export const articleUrl = (slug: string) => pageUrl(`/posts/${slug}`);

export function getArticles(): Article[] {
    return fs.readdirSync(FOLDER)
        .filter(file => file.endsWith(".md"))
        .map(file => matter(fs.readFileSync(path.join(FOLDER, file), "utf8")).data as Article)
        .sort((a, b) => a.order - b.order);
}

export function getArticle(slug: string) {
    const file = path.join(FOLDER, `${slug}.md`);
    if (!getArticles().some(article => article.slug === slug))
        return null;
    const {data, content} = matter(fs.readFileSync(file, "utf8"));
    const [lead, ...body] = content.trim().split(/\n\s*\n/);
    return {article: data as Article, lead, body: body.join("\n\n")};
}
