import {PropsWithChildren, ReactNode} from "react";

type TurnCardProps = PropsWithChildren<{
    avatarClass: string,
    icon: ReactNode,
    label: string,
    name: string,
    chip?: string,
    className?: string
}>

export function TurnCard({avatarClass, icon, label, name, chip, className = "", children}: TurnCardProps) {
    return (
        <section className={`card turn-card ${className}`}>
            <div className="turn-card__head">
                <div className="turn-card__who">
                    <span className={`avatar avatar--md ${avatarClass}`}>{icon}</span>
                    <div>
                        <span className="turn-card__label">{label}</span>
                        <span className="turn-card__name">{name}</span>
                    </div>
                </div>
                {chip && <span className="chip-turn">{chip}</span>}
            </div>
            {children}
        </section>
    );
}
