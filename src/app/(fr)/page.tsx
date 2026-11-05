import {homeMetadata, HomeView} from "@/views/HomeView";

export const metadata = homeMetadata("fr");

export default function Page() {
    return <HomeView locale="fr"/>;
}
