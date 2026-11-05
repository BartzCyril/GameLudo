const stroke = {fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round"} as const;

type IconProps = { size?: number };

// Same drawing as src/app/icon.svg (the favicon).
export function LogoIcon() {
    return (
        <svg className="logo__mark" aria-hidden="true" viewBox="0 0 512 512" fill="currentColor">
            <rect x="152.454" y="446.586" width="281.238" height="65.414"/>
            <path d="M209.138,277.882L171.242,417.06h241.336c0,0,8.442-121.141,19.004-243.569 c6.908-80.147-61.224-160.438-157.07-149.051c-6.084,0.721-11.855,1.957-17.476,3.428L181.97,0.576 c-3.624-1.318-7.691-0.329-10.305,2.502c-2.615,2.832-3.285,6.949-1.689,10.46l23.39,51.362 c-28.522,27.498-46.601,62.202-58.166,83.029c-15.834,28.496-54.646,106.542-54.646,106.542c-4.89,9.533-1.544,21.218,7.639,26.737 l45.452,27.271c10.563,6.341,23.875,5.848,33.953-1.266L209.138,277.882z M213.441,140.424c11.273,0,20.415,9.132,20.415,20.404 c0,11.263-9.142,20.405-20.415,20.405c-11.263,0-20.405-9.142-20.405-20.405C193.036,149.556,202.178,140.424,213.441,140.424z"/>
        </svg>
    );
}

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
        <svg className="icon-arrow" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2.2" {...stroke}>
            {back ? <><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></> : <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>}
        </svg>
    );
}

export function PlayIcon({size = 40}: IconProps) {
    return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.6v12.8a1 1 0 0 0 1.52.85l10.2-6.4a1 1 0 0 0 0-1.7L9.52 4.75A1 1 0 0 0 8 5.6z"/>
        </svg>
    );
}

export function RestartIcon({size = 20}: IconProps) {
    return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.2" {...stroke}>
            <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/>
            <path d="M3 3.5v5h5"/>
        </svg>
    );
}
