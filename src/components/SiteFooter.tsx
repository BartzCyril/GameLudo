import Link from "next/link";

export function SiteFooter() {
    return (
        <footer className="site-footer">
            <div className="container site-footer__inner">
                <span>Ludo · le jeu des petits chevaux, gratuit et en ligne</span>
                <Link href="/guide">Règles, stratégies et histoire du jeu</Link>
            </div>
        </footer>
    );
}
