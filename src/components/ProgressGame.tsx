import Link from "next/link";
import {articlePath, guidePath, Locale} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";
import {getArticleById} from "@/lib/articles";

const STEP_COLORS = ["yellow", "green", "pink", "cyan"];

export function ProgressGame({locale}: { locale: Locale }) {
    const {steps} = getDictionary(locale);
    const start = getArticleById(locale, "start");
    return (
        <section className="steps" aria-labelledby="debut">
            <h2 className="steps__title" id="debut">{steps.title}</h2>
            <ol>
                {steps.items.map(({title, text}, index) => (
                    <li className="step" key={title}>
                        <span className={`step__badge avatar--${STEP_COLORS[index]}`}>{index + 1}</span>
                        <h3>{title}</h3>
                        <p>{text}</p>
                    </li>
                ))}
            </ol>
            <p className="steps__more"><Link href={start ? articlePath(locale, start.article.slug) : guidePath(locale)}>{steps.link}</Link></p>
        </section>
    )
}
