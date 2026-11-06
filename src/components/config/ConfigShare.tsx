'use client'

import {ChangeEvent, FormEvent, useState} from "react";
import {CheckIcon, CopyIcon, DownloadIcon, UploadIcon} from "@/components/Icons";
import {DEFAULT_SETTINGS, encodeSettings, exportSettings, importSettings, PRESETS, Settings} from "@/game/settings";
import {useI18n} from "@/i18n/I18nProvider";

const EXAMPLE = encodeSettings({...DEFAULT_SETTINGS, ...PRESETS.quick});

async function copyText(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // No clipboard API (insecure page, old browser): the old way.
        try {
            const area = document.createElement("textarea");
            area.value = text;
            document.body.appendChild(area);
            area.select();
            const copied = document.execCommand("copy");
            area.remove();
            return copied;
        } catch {
            return false;
        }
    }
}

function download(text: string) {
    const url = URL.createObjectURL(new Blob([text], {type: "application/json"}));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ludo-reglages.json";
    link.click();
    URL.revokeObjectURL(url);
}

type ConfigShareProps = {
    settings: Settings,
    saved: boolean,
    onImport: (settings: Settings) => void,
    notify: (text: string) => void
}

export function ConfigShare({settings, saved, onImport, notify}: ConfigShareProps) {
    const {t} = useI18n();
    const [draft, setDraft] = useState("");
    const [error, setError] = useState("");
    const code = encodeSettings(settings);

    const apply = (text: string, failure: string) => {
        const next = importSettings(text, settings);
        setError(next ? "" : failure);
        if (next) {
            onImport(next);
            setDraft("");
            notify(t("config.share.imported"));
        }
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        apply(draft, t("config.share.invalidCode", {example: EXAMPLE}));
    };

    const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = ""; // the same file can be chosen twice
        if (!file)
            return;
        const failure = t("config.share.invalidFile");
        const reader = new FileReader();
        reader.onload = () => apply(String(reader.result), failure);
        reader.onerror = () => setError(failure);
        reader.readAsText(file);
    };

    return (
        <section aria-labelledby="config-share" className="config-card">
            <div className="config-share__head">
                <div className="config-card__head">
                    <h2 id="config-share">{t("config.share.title")}</h2>
                    <p>{t("config.share.text")}</p>
                </div>
                {saved && <span className="config-saved"><CheckIcon/>{t("config.share.saved")}</span>}
            </div>

            <div className="config-field">
                <span className="config-field__label">{t("config.share.codeLabel")}</span>
                <div className="config-field__row">
                    <code className="config-code">{code}</code>
                    <button type="button" className="btn btn--secondary" onClick={async () => {
                        if (await copyText(code))
                            notify(t("config.share.copied"));
                    }}><CopyIcon/>{t("config.share.copy")}</button>
                    <button type="button" className="btn btn--secondary" onClick={() => {
                        download(exportSettings(settings));
                        notify(t("config.share.exported"));
                    }}><DownloadIcon/>{t("config.share.export")}</button>
                </div>
            </div>

            <form className="config-field" onSubmit={handleSubmit}>
                <label className="config-field__label" htmlFor="config-import">{t("config.share.importLabel")}</label>
                <div className="config-field__row">
                    <input id="config-import" className="config-input" type="text" dir="ltr" autoComplete="off" spellCheck={false} value={draft}
                           placeholder={t("config.share.placeholder", {example: EXAMPLE})} aria-invalid={!!error} aria-describedby={error ? "config-import-error" : undefined}
                           onChange={event => setDraft(event.target.value)}/>
                    <button type="submit" className="btn btn--primary">{t("config.share.apply")}</button>
                    <label className="btn btn--secondary config-file">
                        <UploadIcon/>{t("config.share.importFile")}
                        <input type="file" accept=".json,application/json" onChange={handleFile}/>
                    </label>
                </div>
                {error && <p className="config-error" id="config-import-error" role="alert">{error}</p>}
            </form>
        </section>
    );
}
