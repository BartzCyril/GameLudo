import {articleSections, getArticles, sitePages, translationsOf} from "@/lib/articles";
import {ACTIVE_LOCALES} from "@/i18n/config";

describe.each(ACTIVE_LOCALES)("articles in %s", locale => {
    const articles = getArticles(locale);

    it("gives every article the fields the pages need", () => {
        for (const article of articles)
            for (const field of ["id", "slug", "title", "shortTitle", "metaTitle", "metaDescription", "excerpt", "published", "updated"] as const)
                expect([article.id, field, typeof article[field]]).toEqual([article.id, field, "string"]);
    });

    it("only relates to articles that exist", () => {
        const ids = articles.map(({id}) => id);
        expect(articles.flatMap(({related}) => related).filter(id => !ids.includes(id))).toEqual([]);
    });
});

it("finds an article in each language by its id", () => {
    expect(translationsOf("gameplay")).toMatchObject({fr: "regles-en-cours-de-partie", en: "ludo-rules"});
    expect(translationsOf("nothing")).toEqual({});
});

it("lists the home page, the guide, the 7 articles, the 3 information pages and the configuration", () => {
    expect(sitePages()).toHaveLength(13);
});

describe("articleSections", () => {
    const article = (headings: number) => "Intro\n\n" + Array.from({length: headings}, (_, index) => `## Part ${index + 1}\n\nText\n\n`).join("");
    const ads = (body: string) => articleSections(body).map(({ad}) => ad);

    it("puts an ad before the 2nd and the 4th heading", () => {
        expect(ads(article(5))).toEqual([undefined, undefined, "articleTop", undefined, "articleMiddle", undefined]);
    });

    it("skips the middle ad under 5 headings", () => {
        expect(ads(article(4))).toEqual([undefined, undefined, "articleTop", undefined, undefined]);
    });

    it("counts the headings without an introduction", () => {
        expect(ads("## One\n\n## Two\n")).toEqual([undefined, "articleTop"]);
    });

    it("loses no text and ignores deeper headings", () => {
        const body = article(5) + "### Detail\n";
        expect(articleSections(body).map(({markdown}) => markdown).join("")).toBe(body);
        expect(articleSections(body)).toHaveLength(6);
    });
});
