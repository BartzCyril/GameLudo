'use client'

import {useState} from "react";
import {Button} from "@/components/Button";

// Two steps, so a misclick never erases a game: the first click only asks for confirmation.
export function RestartGame({onConfirm}: { onConfirm: () => void }) {
    const [step, setStep] = useState<"idle" | "confirming" | "cancelled">("idle")

    if (step !== "confirming")
        return <Button variant="secondary" onClick={() => setStep("confirming")} autoFocus={step === "cancelled"}>Recommencer la partie</Button>

    return (
        <div className="card restart-confirm" role="group" aria-labelledby="restart-title">
            <p id="restart-title" className="restart-confirm__text">Recommencer ? La partie en cours sera perdue.</p>
            <div className="restart-confirm__actions">
                <Button variant="primary" onClick={onConfirm} autoFocus>Oui, recommencer</Button>
                <Button variant="secondary" onClick={() => setStep("cancelled")}>Annuler</Button>
            </div>
        </div>
    )
}
