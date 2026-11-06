'use client'

import {CSSProperties, KeyboardEvent, ReactNode, useEffect, useState} from "react";
import Link from "next/link";
import {ArrowIcon, CheckIcon, LockIcon} from "@/components/Icons";
import {ConfigShare} from "@/components/config/ConfigShare";
import {ConfigSummary} from "@/components/config/ConfigSummary";
import {pawnStyle, previewCorners, YOUR_SKIN} from "@/components/config/preview";
import {
    DEFAULT_SETTINGS,
    exactEntry,
    loadSettings,
    PawnCount,
    PlayerCount,
    presetOf,
    PresetId,
    PRESETS,
    saveSettings,
    Settings,
    Speed,
    toggleFace
} from "@/game/settings";
import {applyReducedMotion} from "@/game/ui/motion";
import {homePath} from "@/i18n/config";
import {useI18n} from "@/i18n/I18nProvider";

const PRESET_IDS = Object.keys(PRESETS) as PresetId[];
const SPEEDS: Speed[] = ["slow", "normal", "fast"];
const PIPS: Record<number, number[]> = {1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]};
// Arrow keys move and select, as in a native radio group; only the checked radio is in the tab order.
function moveInRadioGroup(event: KeyboardEvent<HTMLElement>) {
    const forward = {ArrowDown: 1, ArrowUp: -1, ArrowRight: 1, ArrowLeft: -1}[event.key];
    if (!forward)
        return;
    event.preventDefault();
    const flip = event.key.match(/Left|Right/) && document.documentElement.dir === "rtl" ? -1 : 1;
    const radios = [...event.currentTarget.querySelectorAll<HTMLElement>("[role=radio]:not(:disabled)")];
    const next = radios[(radios.indexOf(document.activeElement as HTMLElement) + forward * flip + radios.length) % radios.length];
    next.focus();
    next.click();
}

type RadioProps<T> = {
    label: string,
    className: string,
    style?: CSSProperties,
    options: T[],
    value: T,
    onChange: (value: T) => void,
    optionClass: string,
    children: (option: T) => ReactNode
}

function Radios<T>({label, className, style, options, value, onChange, optionClass, children}: RadioProps<T>) {
    return (
        <div role="radiogroup" aria-label={label} className={className} style={style} onKeyDown={moveInRadioGroup}>
            {options.map(option => (
                <button key={String(option)} type="button" role="radio" className={optionClass} aria-checked={option === value} tabIndex={option === value ? 0 : -1} onClick={() => onChange(option)}>
                    {children(option)}
                </button>
            ))}
        </div>
    );
}

function Card({id, title, text, className = "", children}: { id: string, title: string, text: string, className?: string, children: ReactNode }) {
    return (
        <section aria-labelledby={id} className={`config-card ${className}`}>
            <div className="config-card__head">
                <h2 id={id}>{title}</h2>
                <p>{text}</p>
            </div>
            {children}
        </section>
    );
}

export function ConfigPage() {
    const {t, tp, locale, formatNumber} = useI18n();
    // First render with the defaults, as on the server; the stored settings arrive right after.
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [saved, setSaved] = useState(false);
    const [diceWarning, setDiceWarning] = useState("");
    const [shaking, setShaking] = useState<number | null>(null);
    const [toast, setToast] = useState<{ id: number, text: string } | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettings(loadSettings());
    }, []);

    useEffect(() => {
        if (!toast)
            return
        const timer = setTimeout(() => setToast(null), 2400);
        return () => clearTimeout(timer);
    }, [toast]);

    const notify = (text: string) => setToast(current => ({id: (current?.id ?? 0) + 1, text}));

    const update = (next: Settings) => {
        setSettings(next);
        setSaved(saveSettings(next));
        applyReducedMotion(next.reducedMotion);
        setDiceWarning("");
    };

    const handleFace = (face: number) => {
        const dice = toggleFace(settings.dice, face);
        if (dice) {
            update({...settings, dice});
            return;
        }
        setShaking(face);
        setDiceWarning(t(face === 6 ? "config.dice.sixWarning" : "config.dice.minWarning"));
    };

    const preset = presetOf(settings);
    const average = settings.dice.reduce((sum, value) => sum + value, 0) / settings.dice.length;
    const players: PlayerCount[] = [2, 3, 4];
    const pawns: PawnCount[] = [1, 2, 3, 4];

    return (
        <>
            <div className="config-head">
                <Link className="config-back" href={homePath(locale)}><ArrowIcon back/>{t("config.back")}</Link>
                <h1 className="h1">{t("config.h1")}</h1>
                <p className="lead">{t("config.lead")}</p>
            </div>

            <section className="config-presets" aria-labelledby="config-presets">
                <div className="config-presets__head">
                    <h2 className="panel-title" id="config-presets">{t("config.presets.title")}</h2>
                    {!preset && <span className="config-badge">{t("config.presets.custom")}</span>}
                </div>
                <div className="config-presets__grid">
                    {PRESET_IDS.map(id => (
                        <button key={id} type="button" className="config-option config-preset" aria-pressed={preset === id}
                                onClick={() => update({...settings, ...PRESETS[id], dice: [...PRESETS[id].dice]})}>
                            <span className="config-preset__title">
                                {t(`config.presets.${id}.title`)}
                                {preset === id && <span className="config-preset__check"><CheckIcon/></span>}
                            </span>
                            <span className="config-preset__text">{t(`config.presets.${id}.text`)}</span>
                        </button>
                    ))}
                </div>
            </section>

            <div className="config-layout">
                <div className="config-cards">
                    <Card id="config-players" title={t("config.players.title")} text={t("config.players.text")}>
                        <Radios label={t("config.players.groupLabel")} className="config-choices" style={{"--choices": 3} as CSSProperties} optionClass="config-option config-choice"
                                options={players} value={settings.players} onChange={value => update({...settings, players: value})}>
                            {option => <>
                                <span className="config-corners" aria-hidden="true">
                                    {previewCorners(option).map((corner, index) => (
                                        <span key={index} className={`config-corner${corner ? " is-taken" : ""}${corner?.you ? " is-you" : ""}`} style={corner ? pawnStyle(corner.skin) : undefined}></span>
                                    ))}
                                </span>
                                {tp("config.players.option", option)}
                            </>}
                        </Radios>
                    </Card>

                    <Card id="config-dice" title={t("config.dice.title")} text={t("config.dice.text")}>
                        <div className="config-faces" role="group" aria-label={t("config.dice.groupLabel")}>
                            {[1, 2, 3, 4, 5, 6].map(face => {
                                const on = settings.dice.includes(face);
                                const locked = face === 6;
                                const label = locked ? t("config.dice.faceLocked") : t(on ? "config.dice.faceOn" : "config.dice.faceOff", {n: face});
                                return (
                                    <div key={face} className="config-face-item">
                                        <button type="button" className={`config-face${shaking === face ? " is-shaking" : ""}`} aria-pressed={on} aria-label={label} title={label}
                                                onClick={() => handleFace(face)} onAnimationEnd={() => setShaking(null)}>
                                            <span className="config-face__pips">
                                                {Array.from({length: 9}, (_, index) => <span key={index} className={`config-face__pip${PIPS[face].includes(index) ? " is-on" : ""}`}></span>)}
                                            </span>
                                            {locked && <span className="config-face__mark config-face__mark--lock"><LockIcon/></span>}
                                            {on && !locked && <span className="config-face__mark"><CheckIcon size={13}/></span>}
                                        </button>
                                        <span className={`config-face-item__caption${locked ? " is-locked" : on ? " is-on" : ""}`}>
                                            {t(locked ? "config.dice.locked" : on ? "config.dice.on" : "config.dice.off")}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="config-warning" aria-live="polite">{diceWarning}</p>
                        <div className="config-stats">
                            <span className="config-stat">{t("config.dice.sixChance", {n: settings.dice.length})}</span>
                            <span className="config-stat">{t("config.dice.average", {value: formatNumber(average, {minimumFractionDigits: 1, maximumFractionDigits: 1})})}</span>
                        </div>
                        {!exactEntry(settings.dice) && <p className="config-note">{t("config.dice.lenient")}</p>}
                    </Card>

                    <Card id="config-pawns" title={t("config.pawns.title")} text={t("config.pawns.text")}>
                        <Radios label={t("config.pawns.groupLabel")} className="config-choices" style={{"--choices": 4} as CSSProperties} optionClass="config-option config-choice"
                                options={pawns} value={settings.pawns} onChange={value => update({...settings, pawns: value})}>
                            {option => <>
                                <span className="config-pawns" aria-hidden="true">
                                    {Array.from({length: option}, (_, index) => <span key={index} className="config-pawn" style={pawnStyle(YOUR_SKIN)}></span>)}
                                </span>
                                {tp("config.pawns.option", option)}
                            </>}
                        </Radios>
                    </Card>

                    <Card id="config-rhythm" title={t("config.rhythm.title")} text={t("config.rhythm.text")} className="config-rows">
                        <div className="config-row">
                            <span className="config-row__text">{t("config.rhythm.speed.label")}<small>{t("config.rhythm.speed.text")}</small></span>
                            <Radios label={t("config.rhythm.speed.label")} className="config-segments" optionClass="config-segment"
                                    options={SPEEDS} value={settings.speed} onChange={speed => update({...settings, speed})}>
                                {speed => t(`config.rhythm.speed.${speed}`)}
                            </Radios>
                        </div>
                        {([
                            ["threeTries", settings.rules.threeTries, (on: boolean) => ({...settings, rules: {threeTries: on}})],
                            ["reducedMotion", settings.reducedMotion, (on: boolean) => ({...settings, reducedMotion: on})],
                        ] as const).map(([id, on, change]) => (
                            <div key={id} className="config-row">
                                <span className="config-row__text">{t(`config.rhythm.${id}.label`)}<small>{t(`config.rhythm.${id}.text`)}</small></span>
                                <button type="button" className="config-switch" role="switch" aria-checked={on} aria-label={t(`config.rhythm.${id}.label`)} onClick={() => update(change(!on))}></button>
                            </div>
                        ))}
                    </Card>

                    <ConfigShare settings={settings} saved={saved} onImport={update} notify={notify}/>
                </div>

                <ConfigSummary settings={settings} onReset={() => {
                    update({...DEFAULT_SETTINGS, reducedMotion: settings.reducedMotion});
                    notify(t("config.summary.resetDone"));
                }}/>
            </div>

            <div className="config-toast-region" role="status">
                {toast && <span key={toast.id} className="config-toast"><CheckIcon size={16}/>{toast.text}</span>}
            </div>
        </>
    );
}
