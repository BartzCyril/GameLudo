import Link from "next/link";
import {ConsentLink} from "@/components/ConsentLink";
import {guidePath, Locale} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";
import {INFO_PAGES, infoPagePath} from "@/lib/pages";

export function SiteFooter({locale}: { locale: Locale }) {
    const {footer} = getDictionary(locale);
    return (
        <footer className="site-footer">
            <div className="container site-footer__inner">
                <span>{footer.tagline}</span>
                <Link href={guidePath(locale)}>{footer.guideLink}</Link>
                <nav className="site-footer__links" aria-label={footer.infoLabel}>
                    {INFO_PAGES.map(id => <Link key={id} href={infoPagePath(locale, id)}>{footer[id]}</Link>)}
                    <ConsentLink/>
                </nav>
            </div>
        </footer>
    );
}
