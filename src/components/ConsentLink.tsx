'use client'

// Lien « Gérer les cookies » du pied de page : rouvre le message de consentement de Google (Confidentialité et messages).
// Il reste masqué tant que l'API n'est pas prête, sinon le clic ne ferait rien.
import {useEffect, useState} from "react";
import {useI18n} from "@/i18n/I18nProvider";

type GoogleFc = { callbackQueue?: Array<Record<string, () => void>>, showRevocationMessage?: () => void };
declare global {
    interface Window { googlefc?: GoogleFc }
}

export function ConsentLink() {
    const {t} = useI18n();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        window.googlefc = window.googlefc || {};
        window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
        window.googlefc.callbackQueue.push({CONSENT_API_READY: () => setReady(true)});
    }, []);

    if (!ready)
        return null;

    return (
        <button type="button" className="site-footer__link" onClick={() => window.googlefc?.showRevocationMessage?.()}>
            {t("footer.cookies")}
        </button>
    );
}
