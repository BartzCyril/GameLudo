'use client'

import {ReactNode} from "react";
import Link from "next/link";
import {BoltIcon, GearIcon} from "@/components/Icons";
import {isDefault, presetOf, Settings} from "@/game/settings";
import {configPath} from "@/i18n/config";
import {useI18n} from "@/i18n/I18nProvider";

type BoardBarProps = {
    chip?: string,          // "Tour 12"
    message: string,        // what to do now, read aloud by screen readers
    detail?: string,        // the last move, in smaller print
    tint?: string,          // colour of the player concerned (yellow, green, pink, cyan)
    settings: Settings,     // those of this game: the settings chip tells them
    action?: ReactNode      // the restart icon, top right
}

// The strip at the top of the board: the only text of the game, the settings and the restart icon.
export function BoardBar({chip, message, detail, tint, settings, action}: BoardBarProps) {
    const {t, tp, locale} = useI18n();
    const href = configPath(locale);
    return (
        <div className={`board-bar${tint ? ` board-bar--${tint}` : ""}`}>
            {/* key: a new chip each time the text changes, so its animation plays again. */}
            {chip && <span key={chip} className="chip-turn is-popping">{chip}</span>}
            <div className="board-bar__text" aria-live="polite">
                <p className="board-bar__message">{message}</p>
                {detail && <p className="board-bar__detail">{detail}</p>}
            </div>
            {!isDefault(settings) && (
                <div className="board-bar__settings">
                    <Link className="settings-chip" href={href}>
                        <BoltIcon/>
                        {[
                            t(`config.presets.chip.${presetOf(settings) ?? "custom"}`),
                            tp("config.players.option", settings.players),
                            tp("config.pawns.option", settings.pawns),
                        ].join(" · ")}
                    </Link>
                </div>
            )}
            <div className="board-bar__action">
                <Link className="icon-btn icon-btn--gear" href={href} aria-label={t("game.configButton")} title={t("game.configButton")}><GearIcon/></Link>
                {action}
            </div>
        </div>
    );
}
