import type {Metadata} from "next";
import {PropsWithChildren} from "react";
import {SITE_URL} from "@/i18n/config";
import {RootShell} from "@/views/RootShell";

export const metadata: Metadata = {metadataBase: new URL(SITE_URL)};

export default function FrenchLayout({children}: PropsWithChildren) {
    return <RootShell locale="fr">{children}</RootShell>;
}
