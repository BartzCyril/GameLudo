import Link from "next/link";
import {guidePath, Locale} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";

export function SiteFooter({locale}: { locale: Locale }) {
    const {footer} = getDictionary(locale);
    return (
        <footer className="site-footer">
            <div className="container site-footer__inner">
                <span>{footer.tagline}</span>
                <Link href={guidePath(locale)}>{footer.guideLink}</Link>
            </div>
        </footer>
    );
}
