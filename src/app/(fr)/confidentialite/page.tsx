import {infoPageMetadata, InfoPageView} from "@/views/InfoPageView";

export const metadata = infoPageMetadata("fr", "privacy");

export default function Page() {
    return <InfoPageView locale="fr" id="privacy"/>;
}
