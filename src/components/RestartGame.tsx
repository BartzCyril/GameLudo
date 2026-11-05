'use client'

import {useState} from "react";
import {Button} from "@/components/Button";
import {useI18n} from "@/i18n/I18nProvider";

// Two steps, so a misclick never erases a game: the first click only asks for confirmation.
export function RestartGame({onConfirm}: { onConfirm: () => void }) {
    const {t} = useI18n()
    const [step, setStep] = useState<"idle" | "confirming" | "cancelled">("idle")

    if (step !== "confirming")
        return <Button variant="link" onClick={() => setStep("confirming")} autoFocus={step === "cancelled"}>{t("game.restart.button")}</Button>

    return (
        <div className="card restart-confirm" role="group" aria-labelledby="restart-title">
            <p id="restart-title" className="restart-confirm__text">{t("game.restart.confirm")}</p>
            <div className="restart-confirm__actions">
                <Button variant="primary" onClick={onConfirm} autoFocus>{t("game.restart.yes")}</Button>
                <Button variant="secondary" onClick={() => setStep("cancelled")}>{t("game.restart.cancel")}</Button>
            </div>
        </div>
    )
}
