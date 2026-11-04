import Link from "next/link";

const steps = [
    {color: "yellow", title: "Choisissez votre couleur", text: "Jaune, vert, rose ou cyan : les trois autres couleurs sont jouées par des bots."},
    {color: "green", title: "Lancez le dé pour commencer", text: "Le plus grand nombre commence. En cas d'égalité, seuls les ex æquo relancent, jusqu'à ce qu'il reste un gagnant."},
    {color: "pink", title: "Visez le six", text: "Chaque joueur lance le dé trois fois de suite, jusqu'à ce que l'un d'eux obtienne un six."},
    {color: "cyan", title: "C'est parti !", text: "La partie est lancée. Sortez vos pions et ramenez-les tous à l'écurie. Bonne chance !"},
]

export function ProgressGame() {
    return (
        <section className="steps" aria-labelledby="debut">
            <h2 className="steps__title" id="debut">Comment se déroule un début de partie ?</h2>
            <ol>
                {steps.map(({color, title, text}, index) => (
                    <li className="step" key={color}>
                        <span className={`step__badge avatar--${color}`}>{index + 1}</span>
                        <h3>{title}</h3>
                        <p>{text}</p>
                    </li>
                ))}
            </ol>
            <p className="steps__more"><Link href="/posts/StartRules">Lire toutes les règles du début de partie</Link></p>
        </section>
    )
}
