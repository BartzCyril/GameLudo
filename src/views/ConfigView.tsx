import {ConfigPage} from "@/components/config/ConfigPage";
import {configPath, Locale, pathsEverywhere} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";
import {pageMetadata} from "@/views/seo";

export function configMetadata(locale: Locale) {
    const {config} = getDictionary(locale);
    return pageMetadata({locale, paths: pathsEverywhere(configPath), title: config.metaTitle, description: config.metaDescription, noindex: true});
}

export function ConfigView() {
    return (
        <main className="container config-main">
            <ConfigPage/>
        </main>
    );
}
