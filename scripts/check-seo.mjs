// Vérifie le SEO du site généré (dossier out/) : node scripts/check-seo.mjs [dossier] [url-du-site]
// Aucune dépendance. Code de sortie 1 s'il y a au moins une erreur.
import fs from "node:fs";
import path from "node:path";

const OUT = process.argv[2] ?? "out";
const SITE = (process.argv[3] ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameludo.fr").replace(/\/$/, "");

const pages = [];
(function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!entry.name.startsWith("_")) walk(full);
        } else if (entry.name === "index.html") pages.push(full);
    }
})(OUT);

const decode = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const one = (html, re) => (html.match(re) || [])[1];
const meta = (html, attr, name) => one(html, new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`, "i"))
    ?? one(html, new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${name}"`, "i"));

const errors = [], warnings = [];
const byUrl = new Map();

for (const file of pages) {
    const rel = "/" + path.relative(OUT, path.dirname(file)).split(path.sep).join("/");
    const url = SITE + (rel === "/" ? "/" : rel + "/");
    const html = fs.readFileSync(file, "utf8");
    const err = (m) => errors.push(`${url} — ${m}`);
    const warn = (m) => warnings.push(`${url} — ${m}`);

    const title = decode(one(html, /<title>([\s\S]*?)<\/title>/i) ?? "");
    const description = decode(meta(html, "name", "description") ?? "");
    const lang = one(html, /<html[^>]*\slang="([^"]+)"/i);
    const canonical = one(html, /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i);
    const robots = meta(html, "name", "robots") ?? "";
    const h1 = html.match(/<h1[\s>]/gi) ?? [];
    const alternates = [...html.matchAll(/<link[^>]*rel="alternate"[^>]*hrefLang="([^"]+)"[^>]*href="([^"]+)"/gi)]
        .concat([...html.matchAll(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"[^>]*hrefLang="([^"]+)"/gi)].map(m => [m[0], m[2], m[1]]))
        .map(m => ({lang: m[1], href: m[2]}));

    if (/noindex/i.test(robots)) continue; // pages volontairement exclues (404…)
    // Chinois, japonais et coréen : un caractère occupe environ deux fois la largeur d'une lettre latine dans Google.
    const cjk = /^(zh|ja|ko)\b/i.test(lang ?? "");
    const [titleMax, descMin, descMax] = cjk ? [46, 40, 110] : [66, 70, 165];
    if (!title) err("pas de <title>");
    else if ([...title].length > titleMax) warn(`titre long (${[...title].length} caractères) : ${title}`);
    if (!description) err("pas de meta description");
    else if ([...description].length < descMin || [...description].length > descMax) warn(`description de ${[...description].length} caractères`);
    if (!lang) err("pas d'attribut lang sur <html>");
    const dir = one(html, /<html[^>]*\sdir="([^"]+)"/i);
    if (/^(ar|he|fa|ur)\b/i.test(lang ?? "") && dir !== "rtl") err(`langue ${lang} sans dir="rtl" sur <html>`);
    if (canonical !== url) err(`canonique « ${canonical} » au lieu de « ${url} »`);
    if (h1.length !== 1) err(`${h1.length} balises <h1> (il en faut exactement 1)`);
    if (!meta(html, "property", "og:image")) err("pas d'og:image");
    if (!meta(html, "property", "og:title")) err("pas d'og:title");
    if (meta(html, "name", "twitter:card") !== "summary_large_image") warn("twitter:card devrait valoir summary_large_image");
    for (const [, json] of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
        try { JSON.parse(json); } catch { err("JSON-LD invalide"); }
    }
    if (!html.includes("application/ld+json")) warn("aucune donnée structurée (JSON-LD)");
    if (html.includes("gameludo.app")) err("contient encore gameludo.app");
    const imgsNoAlt = (html.match(/<img(?![^>]*\salt=)[^>]*>/gi) ?? []).length;
    if (imgsNoAlt) err(`${imgsNoAlt} image(s) sans alt`);
    if (!alternates.length) warn("aucune balise hreflang");
    else {
        if (!alternates.some(a => a.lang === "x-default")) err("hreflang x-default manquant");
        if (!alternates.some(a => a.href === url)) err("la page ne se cite pas elle-même dans ses hreflang");
    }
    byUrl.set(url, {alternates, lang});
}

// Réciprocité : si A annonce B dans la langue L, B doit annoncer A en retour.
for (const [url, {alternates}] of byUrl) {
    for (const {lang, href} of alternates) {
        if (lang === "x-default" || href === url) continue;
        const target = byUrl.get(href);
        if (!target) { errors.push(`${url} — hreflang ${lang} vers une page inexistante : ${href}`); continue; }
        if (!target.alternates.some(a => a.href === url)) errors.push(`${url} — hreflang ${lang} non réciproque (${href} ne renvoie pas vers cette page)`);
    }
}

// Sitemap : toutes les pages indexables y figurent, et rien d'autre.
const sitemapFile = path.join(OUT, "sitemap.xml");
if (!fs.existsSync(sitemapFile)) errors.push("sitemap.xml absent");
else {
    const locs = new Set([...fs.readFileSync(sitemapFile, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
    for (const url of byUrl.keys()) if (!locs.has(url)) errors.push(`absente du sitemap : ${url}`);
    for (const loc of locs) if (!byUrl.has(loc)) errors.push(`dans le sitemap mais pas générée (ou noindex) : ${loc}`);
}
const robotsFile = path.join(OUT, "robots.txt");
if (!fs.existsSync(robotsFile) || !fs.readFileSync(robotsFile, "utf8").includes(`${SITE}/sitemap.xml`)) errors.push("robots.txt absent ou sans lien vers le sitemap");
if (!fs.existsSync(path.join(OUT, "404.html"))) errors.push("404.html absent");

console.log(`${byUrl.size} pages indexables vérifiées.`);
for (const w of warnings) console.log("ATTENTION  " + w);
for (const e of errors) console.log("ERREUR     " + e);
console.log(errors.length ? `${errors.length} erreur(s), ${warnings.length} avertissement(s).` : `Aucune erreur, ${warnings.length} avertissement(s).`);
process.exit(errors.length ? 1 : 0);
