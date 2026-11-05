import {infoPageMetadata, InfoPageView} from "@/views/InfoPageView";

export const metadata = infoPageMetadata("fr", "legal");

export default function Page() {
    return <InfoPageView locale="fr" id="legal"/>;
}
