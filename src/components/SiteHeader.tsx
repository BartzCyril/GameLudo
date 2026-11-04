'use client'

import Link from "next/link";
import {usePathname} from "next/navigation";
import {LogoIcon} from "@/components/Icons";

const links = [
    {href: "/", label: "Jouer"},
    {href: "/guide#regles", label: "Règles"},
    {href: "/guide#strategies", label: "Stratégies"},
    {href: "/posts/History", label: "Histoire"},
]

function currentLink(pathname: string) {
    if (pathname === "/")
        return "Jouer";
    if (pathname.startsWith("/posts/History"))
        return "Histoire";
    return pathname.startsWith("/posts/Strategies") ? "Stratégies" : "Règles";
}

export function SiteHeader() {
    const current = currentLink(usePathname());
    return (
        <header className="site-header">
            <div className="container site-header__inner">
                <Link className="logo" href="/" aria-label="Ludo, accueil">
                    <LogoIcon/>
                    <span className="logo__text">Ludo</span>
                </Link>
                <nav className="nav" aria-label="Navigation principale">
                    {links.map(({href, label}) => (
                        <Link key={href} href={href} aria-current={label === current ? "page" : undefined}>{label}</Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}
