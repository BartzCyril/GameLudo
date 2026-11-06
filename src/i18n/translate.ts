import type fr from "../../messages/fr.json";
import type {Locale} from "@/i18n/config";

export type Messages = typeof fr;

type Paths<T, Leaf> = {
    [K in keyof T & string]: T[K] extends Leaf ? K
        : T[K] extends readonly unknown[] ? never
        : T[K] extends object ? `${K}.${Paths<T[K], Leaf>}`
        : never
}[keyof T & string];

export type TextPath = Paths<Messages, string>;
export type PluralPath = Paths<Messages, { one: string, other: string }>;
type Vars = Record<string, string | number>;

const fill = (text: string, vars: Vars = {}) => text.replace(/\{(\w+)\}/g, (match, name) => name in vars ? String(vars[name]) : match);

export function translator(locale: Locale, dict: Messages) {
    const lookup = (path: string) => path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], dict);
    return {
        locale,
        t: (path: TextPath, vars?: Vars) => fill(lookup(path) as string, vars),
        tp(path: PluralPath, count: number, vars?: Vars) {
            const forms = lookup(path) as Record<string, string>;
            return fill(forms[new Intl.PluralRules(locale).select(count)] ?? forms.other, {...vars, count});
        },
        formatDate: (date: Date, options: Intl.DateTimeFormatOptions = {dateStyle: "long", timeZone: "UTC"}) =>
            new Intl.DateTimeFormat(dict.locale.dateLocale, options).format(date),
        formatNumber: (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(dict.locale.dateLocale, options).format(value),
    };
}

export type Translator = ReturnType<typeof translator>;
