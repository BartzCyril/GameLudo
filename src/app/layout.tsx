import type {Metadata} from "next";
import Link from "next/link";
import "./globals.css"

export const metadata: Metadata = {
    title: "Jouez maintenant au jeu des petits chevaux en ligne, c'est gratuit !",
    description: "Plongez dans l'univers du jeu des petits chevaux, un classique indémodable ! Notre site offre une expérience captivante de ce jeu de société populaire en version solo contre des bots intelligents. Lancez les dés, déplacez vos pions et stratégisez pour remplir votre écurie le plus rapidement possible. Profitez de graphismes attrayants, de règles fidèles au jeu original et d'une jouabilité immersive. Rejoignez-nous dès maintenant pour vivre des moments de divertissement en solo avec le jeu des petits chevaux.",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {

    const header = (
        <header>
            <Link href="https://www.gameludo.app/">
            <h1 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl">Jouez au <mark
                className="px-2 text-white rounded-sm">Ludo</mark> c&apos;est gratuit !
            </h1>
            </Link>
        </header>
    );

    const footer = (
        <footer>
            <div className="border-t border-slate-400 mt-12 py-6 text-center">
                <h3>Copyright ©  {new Date().getFullYear()} Cyril</h3>
            </div>
        </footer>
    );

    return (
        <html lang="fr">
        <head>
            <link rel="icon" href="./img/horse.svg"/>
            {/* Plain script tag so the AdSense crawler finds it in the static HTML. */}
            <script async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4145165029182891"
                    crossOrigin="anonymous"></script>
        </head>
        <body>
        <div className="div-main">
            {header}
            {children}
            {footer}
        </div>
        </body>
        </html>
    );
}
