'use client'

import Link from "next/link";
import {PlayIcon} from "@/components/Icons";
import {pawnStyle, previewCorners} from "@/components/config/preview";
import {durationLevel, presetOf, Settings} from "@/game/settings";
import {homePath} from "@/i18n/config";
import {useI18n} from "@/i18n/I18nProvider";

export function ConfigSummary({settings, onReset}: { settings: Settings, onReset: () => void }) {
    const {t, tp, locale} = useI18n();
    const preset = presetOf(settings);
    const level = durationLevel(settings);
    const levelName = t(`config.summary.levels.${level}`);

    return (
        <aside className="config-summary" aria-labelledby="config-summary">
            <div className="config-summary__head">
                <h2 id="config-summary">{t("config.summary.title")}</h2>
                <span className={`config-badge${preset ? " config-badge--preset" : ""}`}>{t(preset ? `config.presets.${preset}.title` : "config.presets.custom")}</span>
            </div>

            <div className="config-mini" aria-hidden="true">
                {previewCorners(settings.players).map((corner, index) => (
                    <span key={index} className={`config-mini__corner${corner ? " is-taken" : ""}${corner?.you ? " is-you" : ""}`} style={corner ? pawnStyle(corner.skin) : undefined}>
                        {corner && <span className="config-mini__pawns">
                            {Array.from({length: settings.pawns}, (_, pawn) => <span key={pawn} className="config-pawn"></span>)}
                        </span>}
                    </span>
                ))}
                <span className="config-mini__center"></span>
            </div>

            <dl className="config-list">
                <dt>{t("config.summary.players")}</dt><dd>{tp("config.players.summary", settings.players - 1)}</dd>
                <dt>{t("config.summary.pawns")}</dt><dd>{tp("config.pawns.summary", settings.pawns)}</dd>
                <dt>{t("config.summary.dice")}</dt><dd>{settings.dice.length === 6 ? t("config.summary.allFaces") : settings.dice.join(" · ")}</dd>
                <dt>{t("config.summary.bots")}</dt><dd>{t(`config.rhythm.speed.${settings.speed}`)}</dd>
            </dl>

            <div className="config-gauge">
                <div className="config-gauge__head">
                    <span>{t("config.summary.duration")}</span>
                    <strong>{levelName}</strong>
                </div>
                <div className="config-gauge__bars" role="img" aria-label={t("config.summary.durationAria", {level: levelName})}>
                    {[1, 2, 3, 4].map(step => <span key={step} className={step <= level ? "is-on" : undefined}></span>)}
                </div>
            </div>

            <Link className="btn btn--primary" href={homePath(locale)}><PlayIcon size={18}/>{t("config.summary.play")}</Link>
            <p className="config-summary__note">{t("config.summary.note")}</p>
            <button type="button" className="config-reset" onClick={onReset}>{t("config.summary.reset")}</button>
        </aside>
    );
}
