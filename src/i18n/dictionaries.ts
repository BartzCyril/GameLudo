import fs from "fs";
import path from "path";
import type {Locale} from "@/i18n/config";
import type {Messages} from "@/i18n/translate";

// Read from disk rather than imported, so a new language needs no code change; messages.test.ts checks every catalogue against fr.json.
export function getDictionary(locale: Locale): Messages {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "messages", `${locale}.json`), "utf8"));
}
