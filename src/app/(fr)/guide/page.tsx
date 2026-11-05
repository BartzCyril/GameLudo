import {guideMetadata, GuideView} from "@/views/GuideView";

export const metadata = guideMetadata("fr");

export default function Page() {
    return <GuideView locale="fr"/>;
}
