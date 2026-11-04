const stroke = {fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round"} as const;

type IconProps = { size?: number };

// Même tracé que src/app/icon.svg (le favicon).
export function LogoIcon() {
    return (
        <svg className="logo__mark" aria-hidden="true" viewBox="0 -0.5 17 17" fill="currentColor">
            <path d="M14.572,12.3606104 C12.683,10.0856104 14.097,7.05061042 12.367,3.91161042 C11.992,3.21161042 11.443,2.65361042 10.803,2.28161042 C10.815,2.27161042 10.825,2.26261042 10.836,2.25261042 C11.752,1.32361042 12.248,0.348610425 11.942,0.0736104247 C11.637,-0.203389575 10.646,0.325610425 9.73,1.25361042 C9.554,1.43161042 9.4,1.60961042 9.258,1.78661042 C8.282,1.70561042 7.255,2.02861042 6.363,2.88161042 C6.363,2.88161042 2.454,6.57861042 1.414,7.57861042 C0.37,8.57661042 1.781,9.11261042 1.781,9.11261042 C1.781,9.11261042 5.784,8.14561042 6.614,8.46761042 C8.059,9.02561042 4.585,11.4596104 4.696,14.6156104 C4.762,16.6596104 9.91,15.8206104 13.258,14.8406104 C15.083,14.3076104 14.928,12.7866104 14.572,12.3606104 L14.572,12.3606104 Z"/>
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
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2.2" {...stroke}>
            {back ? <><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></> : <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>}
        </svg>
    );
}
