import {CSSProperties, Ref, useImperativeHandle, useState} from "react";
import {motion, useWait} from "@/game/ui/motion";
import {useI18n} from "@/i18n/I18nProvider";

// [rotateX, rotateY] that bring each face to the front.
const FACE_ROTATION: Record<number, [number, number]> = {1: [0, 0], 2: [-90, 0], 3: [0, -90], 4: [0, 90], 5: [90, 0], 6: [0, 180]};
const PIPS: Record<number, number[]> = {1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]};
const CONFETTI_COLORS = ["var(--yellow-pawn)", "var(--green-pawn)", "var(--pink-pawn)", "var(--cyan-pawn)", "var(--color-accent)"];
const CONFETTI = Array.from({length: 14}, (_, index) => ({
    "--a": `${Math.round(index / 14 * 360 + (index % 2) * 12)}deg`,
    "--dist": `${64 + (index % 3) * 20}px`,
    "--spin": `${index % 2 ? 220 : -260}deg`,
    "--p": CONFETTI_COLORS[index % 5],
} as CSSProperties));

export type Die3DHandle = {
    roll: (value: number) => Promise<void>
}

type Die3DProps = {
    ref: Ref<Die3DHandle>,
    value: number | null,
    message: string,
    idle: boolean
}

export function Die3D({ref, value, message, idle}: Die3DProps) {
    const {t} = useI18n();
    const wait = useWait();
    const [face, setFace] = useState(value);
    const [rolling, setRolling] = useState(false);
    const [rolled, setRolled] = useState(false);
    // Whole turns only ever grow, so the cube always spins forward.
    const [spin, setSpin] = useState({x: 0, y: 0});

    useImperativeHandle(ref, () => ({
        async roll(next) {
            setFace(next);
            setRolling(true);
            setRolled(true);
            setSpin(({x, y}) => ({x: x + 2 + Math.floor(Math.random() * 2), y: y + 1 + Math.floor(Math.random() * 2)}));
            await wait(motion().toss);
            setRolling(false);
        }
    }), [wait]);

    const [rotateX, rotateY] = FACE_ROTATION[face ?? 1];
    const landed = rolled && !rolling;
    const state = rolling ? " is-rolling" : idle ? " is-idle" : landed && face === 6 ? " is-bursting" : "";
    return (
        <div className="die-row">
            <div className={`die3d${state}`} role="img" aria-label={rolling ? t("die.rolling") : face ? t("die.value", {value: face}) : t("die.notRolled")}>
                <div className="die3d__toss">
                    <div className="die3d__view">
                        <div className="die3d__cube" style={{"--rx": `${spin.x * 360 + rotateX}deg`, "--ry": `${spin.y * 360 + rotateY}deg`} as CSSProperties}>
                            {[1, 2, 3, 4, 5, 6].map(number => (
                                <div className="die3d__face" data-face={number} key={number}>
                                    {Array.from({length: 9}, (_, index) => (
                                        <span key={index} className={`die3d__pip${PIPS[number].includes(index) ? " is-on" : ""}`}></span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="die3d__shadow"></div>
                <div className="die3d__burst">
                    {CONFETTI.map((style, index) => <i key={index} style={style}></i>)}
                </div>
            </div>
            <div className="die-info" aria-live="polite">
                <span className={`die-info__value${landed ? " is-popping" : ""}`}>{rolling ? "" : face ?? "–"}</span>
                <span className="die-info__msg">{rolling ? t("die.rollingMessage") : message}</span>
            </div>
        </div>
    );
}
