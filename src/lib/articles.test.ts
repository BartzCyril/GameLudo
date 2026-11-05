import {getArticles, sitePages, translationsOf} from "@/lib/articles";
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

it("lists the home page, the guide and the 7 articles", () => {
    expect(sitePages()).toHaveLength(9);
});
