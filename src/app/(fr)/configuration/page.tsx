import {configMetadata, ConfigView} from "@/views/ConfigView";

export const metadata = configMetadata("fr");

export default function Page() {
    return <ConfigView/>;
}
