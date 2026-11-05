import {infoPageMetadata, InfoPageView} from "@/views/InfoPageView";

export const metadata = infoPageMetadata("fr", "about");

export default function Page() {
    return <InfoPageView locale="fr" id="about"/>;
}
