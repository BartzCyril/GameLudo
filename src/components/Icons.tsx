const stroke = {fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round"} as const;

type IconProps = { size?: number };

export function PersonIcon({size = 20}: IconProps) {
    return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...stroke}>
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
        </svg>
    );
}

export function BotIcon({size = 20}: IconProps) {
    return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...stroke}>
            <rect x="4" y="8" width="16" height="12" rx="3"/>
            <path d="M12 8V4"/>
            <circle cx="12" cy="3" r="1"/>
            <circle cx="9" cy="13" r="1" fill="currentColor"/>
            <circle cx="15" cy="13" r="1" fill="currentColor"/>
            <path d="M9.5 17h5"/>
        </svg>
    );
}

export function DiceIcon({size = 20}: IconProps) {
    return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...stroke}>
            <rect x="3" y="3" width="18" height="18" rx="4"/>
            <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/>
            <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/>
            <circle cx="12" cy="12" r="1.2" fill="currentColor"/>
        </svg>
    );
}

export function ArrowIcon({back = false}: { back?: boolean }) {
    return (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2.2" {...stroke}>
            {back ? <><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></> : <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>}
        </svg>
    );
}
