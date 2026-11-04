import Link from "next/link";

export function Summary() {
    return (
        <div className="px-4 mx-auto max-w-screen-xl text-center mb-16">
            <h2 className="mb-8 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl">Sommaire</h2>
            <ul className="space-y-4 text-gray-500 list-none dark:text-gray-400 ">
                <li className="text-2xl font-extrabold tracking-tight leading-none text-gray-900 md:text-3xl lg:text-4xl">
                    Règles du jeu des petits chevaux
                    <ul className="pl-5 mt-2 space-y-1 list-none">
                        <li>
                            <Link href={`/posts/StartRules`}>
                                <h2 className="text-gray-500 text-xl hover:bg-blue-100 transition-colors ease-in-out inline-block duration-300 py-1 px-2 rounded-sm">Règles du jeu en début de partie</h2>
                            </Link>
                        </li>
                        <li>
                            <Link href={`/posts/GameplayRules`}>
                                <h2 className="text-gray-500 text-xl hover:bg-blue-100 transition-colors ease-in-out inline-block duration-300 py-1 px-2 rounded-sm">Règles du jeu en cours de partie</h2>
                            </Link>
                        </li>
                        <li>
                            <Link href={`/posts/EndRules`}>
                                <h2 className="text-gray-500 text-xl hover:bg-blue-100 transition-colors ease-in-out inline-block duration-300 py-1 px-2 rounded-sm">Règles du jeu en fin de partie</h2>
                            </Link>
                        </li>
                    </ul>
                </li>
                <li className="text-2xl font-extrabold tracking-tight leading-none text-gray-900 md:text-3xl lg:text-4xl">
                    Stratégies du jeu des petits chevaux
                    <ul className="pl-5 mt-2 space-y-1 list-none">
                        <li>
                            <Link href={`/posts/StrategiesOffensive`}>
                                <h2 className="text-gray-500 text-xl hover:bg-blue-100 transition-colors ease-in-out inline-block duration-300 py-1 px-2 rounded-sm">Stratégies offensives</h2>
                            </Link>
                        </li>
                        <li>
                            <Link href={`/posts/StrategiesDefensive`}>
                                <h2 className="text-gray-500 text-xl hover:bg-blue-100 transition-colors ease-in-out inline-block duration-300 py-1 px-2 rounded-sm">Stratégies défensives</h2>
                            </Link>
                        </li>
                        <li>
                            <Link href={`/posts/StrategiesObservationAndAdaptation`}>
                                <h2 className="text-gray-500 text-xl hover:bg-blue-100 transition-colors ease-in-out inline-block duration-300 py-1 px-2 rounded-sm">Stratégies d&apos;observation et d&apos;adaptation</h2>
                            </Link>
                        </li>
                    </ul>
                </li>
                <li className="text-2xl font-extrabold tracking-tight leading-none text-gray-900 md:text-3xl lg:text-4xl">
                    Histoire du jeu des petits chevaux
                    <ul className="pl-5 mt-2 space-y-1 list-none">
                        <li>
                            <Link href={`/posts/History`}>
                                <h2 className="text-gray-500 text-xl hover:bg-blue-100 transition-colors ease-in-out inline-block duration-300 py-1 px-2 rounded-sm">Histoire</h2>
                            </Link>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    )
}