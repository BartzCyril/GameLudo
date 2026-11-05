'use client'

import {useEffect, useRef} from "react";
import {AD_SLOTS, ADSENSE_CLIENT, AdSlotName} from "@/config/ads";
import {useI18n} from "@/i18n/I18nProvider";

declare global {
    interface Window { adsbygoogle?: unknown[] }
}

export function AdSlot({name, className = ""}: { name: AdSlotName, className?: string }) {
    const {t} = useI18n();
    const ref = useRef<HTMLModElement>(null);
    const slot = AD_SLOTS[name];
    const fixed = "width" in slot;

    useEffect(() => {
        const el = ref.current;
        // Google ajoute data-adsbygoogle-status une fois l'emplacement traité : on ne le remplit jamais deux fois.
        // offsetWidth vaut 0 si le CSS masque l'emplacement : une annonce invisible ne doit pas être demandée.
        // shortcut: une colonne masquée au chargement reste vide si la fenêtre s'élargit ensuite, à revoir si cela coûte des revenus.
        if (!el || !slot.id || !el.offsetWidth || el.dataset.adsbygoogleStatus || process.env.NODE_ENV !== "production")
            return;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
            // Bloqueur de publicité, consentement en attente… : l'emplacement reste vide et se replie (voir CSS).
        }
    }, [slot.id]);

    if (!slot.id)
        return null;

    return (
        <aside className={`ad ad--${name} ${className}`} aria-label={t("ads.label")}>
            <span className="ad__label">{t("ads.label")}</span>
            {process.env.NODE_ENV !== "production"
                ? <div className="ad__placeholder" style={fixed ? {width: slot.width, height: slot.height} : undefined}>{name}</div>
                : <ins ref={ref} className="adsbygoogle"
                       style={fixed ? {display: "inline-block", width: slot.width, height: slot.height} : {display: "block"}}
                       data-ad-client={ADSENSE_CLIENT}
                       data-ad-slot={slot.id}
                       {...(fixed ? {} : {"data-ad-format": "auto", "data-full-width-responsive": "true"})}/>}
        </aside>
    );
}
