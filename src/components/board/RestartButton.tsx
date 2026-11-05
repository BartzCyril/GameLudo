'use client'

import {useEffect, useRef, useState} from "react";
import {RestartIcon} from "@/components/Icons";
import {useI18n} from "@/i18n/I18nProvider";

type RestartButtonProps = {
    label: string,          // what the icon does: "Recommencer la partie", "Nouvelle partie"…
    onConfirm: () => void
}

// Icon in the top right-hand corner of the board. Two steps, so a misclick never erases a game.
export function RestartButton({label, onConfirm}: RestartButtonProps) {
    const {t} = useI18n();
    const [confirming, setConfirming] = useState(false);
    const iconRef = useRef<HTMLButtonElement>(null);
    const wasConfirming = useRef(false);

    // Focus goes back to the icon once the question is answered with "Cancel" or Escape.
    useEffect(() => {
        if (wasConfirming.current && !confirming)
            iconRef.current?.focus();
        wasConfirming.current = confirming;
    }, [confirming]);

    if (!confirming)
        return (
            <button ref={iconRef} type="button" className="icon-btn" aria-label={label} title={label} onClick={() => setConfirming(true)}>
                <RestartIcon/>
            </button>
        );

    return (
        <div className="restart-pop" role="alertdialog" aria-labelledby="restart-pop-text" onKeyDown={event => event.key === "Escape" && setConfirming(false)}>
            <p id="restart-pop-text" className="restart-pop__text">{t("game.restart.confirm")}</p>
            <div className="restart-pop__actions">
                <button type="button" className="btn btn--primary" onClick={onConfirm} autoFocus>{t("game.restart.yes")}</button>
                <button type="button" className="btn btn--secondary" onClick={() => setConfirming(false)}>{t("game.restart.cancel")}</button>
            </div>
        </div>
    );
}
